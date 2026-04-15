import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import fs from "node:fs/promises";
import path from "node:path";
import { uploadToPinata, sanitizeText } from "./services/pinataService.js";
import { createEvidenceRecord, getEvidenceRecords, updateEvidenceTxHash } from "./services/evidenceStore.js";
import { connectDB } from "./config/db.js";
import { triggerEmergencyNotifications } from "./services/notificationService.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const maxFileSizeBytes = Number(process.env.MAX_UPLOAD_BYTES || 15 * 1024 * 1024);
const policeDashboardToken = process.env.POLICE_DASHBOARD_TOKEN?.trim() || "";
const evidenceDataDir = path.resolve(process.cwd(), "backend", "data");
const auditLogPath = path.join(evidenceDataDir, "audit-log.jsonl");

function createInMemoryRateLimiter({ max, windowMs, message }) {
  const hits = new Map();

  return (req, res, next) => {
    const key = `${req.ip}:${req.path}`;
    const now = Date.now();
    const previous = hits.get(key) || [];
    const recentHits = previous.filter((timestamp) => now - timestamp < windowMs);

    recentHits.push(now);
    hits.set(key, recentHits);

    if (recentHits.length > max) {
      return res.status(429).json({ error: message });
    }

    return next();
  };
}

async function appendAuditEvent(event) {
  try {
    const safeEvent = {
      ...event,
      at: new Date().toISOString(),
    };

    await fs.mkdir(evidenceDataDir, { recursive: true });
    await fs.appendFile(auditLogPath, `${JSON.stringify(safeEvent)}\n`, "utf-8");
  } catch (error) {
    console.log("[audit] Unable to write audit event:", error instanceof Error ? error.message : "unknown");
  }
}

function requirePoliceAuth(req, res, next) {
  if (!policeDashboardToken) {
    return next();
  }

  const providedToken = sanitizeText(req.header("x-police-token"), 200);
  if (!providedToken || providedToken !== policeDashboardToken) {
    return res.status(401).json({ error: "Unauthorized police access." });
  }

  return next();
}

const uploadLimiter = createInMemoryRateLimiter({
  max: 25,
  windowMs: 5 * 60 * 1000,
  message: "Too many upload attempts. Please retry in a few minutes.",
});

const evidenceReadLimiter = createInMemoryRateLimiter({
  max: 120,
  windowMs: 60 * 1000,
  message: "Too many dashboard requests. Please slow down.",
});

const txUpdateLimiter = createInMemoryRateLimiter({
  max: 30,
  windowMs: 60 * 1000,
  message: "Too many transaction updates. Please retry shortly.",
});

const allowedMimeTypes = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/webm",
  "audio/mp4",
  "audio/m4a",
  "audio/aac",
  "audio/ogg",
  "application/pdf",
  "text/plain",
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: maxFileSizeBytes,
  },
  fileFilter: (_req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
      cb(null, true);
      return;
    }

    cb(new Error(`Unsupported file type: ${file.mimetype}`));
  },
});

const configuredFrontendOrigin = process.env.FRONTEND_ORIGIN?.trim() || "";

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      if (!configuredFrontendOrigin || configuredFrontendOrigin === "*") {
        callback(null, true);
        return;
      }

      const allowedOrigins = configuredFrontendOrigin
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      // Allow localhost dev servers on any port for Vite during development.
      if (/^https?:\/\/localhost:\d+$/.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/evidence", evidenceReadLimiter, requirePoliceAuth, async (req, res) => {
  try {
    const records = await getEvidenceRecords();
    const requestedLimit = Number.parseInt(String(req.query.limit || ""), 10);
    const limit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, 500) : null;
    const output = limit ? records.slice(0, limit) : records;
    await appendAuditEvent({
      action: "evidence.list",
      ip: req.ip,
      count: output.length,
      totalAvailable: records.length,
      limit: limit || "all",
    });
    return res.status(200).json({
      records: output,
      total: records.length,
      limit: limit || null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load evidence records.";
    return res.status(500).json({ error: message });
  }
});

app.post("/api/evidence/upload", uploadLimiter, upload.fields([{ name: "file", maxCount: 1 }, { name: "audio", maxCount: 1 }]), async (req, res) => {
  try {
    const uploadFields = req.files || {};
    const mediaFile = uploadFields.file?.[0] || null;
    const audioFile = uploadFields.audio?.[0] || null;

    if (!mediaFile && !audioFile) {
      return res.status(400).json({ error: "At least one media or audio file is required." });
    }

    const metadata = {
      description: sanitizeText(req.body.description, 300),
      walletAddress: sanitizeText(req.body.walletAddress, 80),
      latitude: sanitizeText(req.body.latitude, 40),
      longitude: sanitizeText(req.body.longitude, 40),
      clientTimestamp: sanitizeText(req.body.clientTimestamp, 80),
    };

    if (!metadata.description) {
      return res.status(400).json({ error: "Description is required." });
    }

    const mediaUpload = mediaFile
      ? await uploadToPinata(mediaFile, {
          ...metadata,
          evidenceType: "media",
        })
      : null;

    const audioUpload = audioFile
      ? await uploadToPinata(audioFile, {
          ...metadata,
          evidenceType: "audio",
        })
      : null;

    const primaryUpload = mediaUpload || audioUpload;

    if (!primaryUpload) {
      return res.status(400).json({ error: "Evidence upload failed. No valid file provided." });
    }

    const record = await createEvidenceRecord({
      cid: primaryUpload.cid,
      gatewayUrl: primaryUpload.gatewayUrl,
      metadata: {
        ...primaryUpload.metadata,
        evidenceType: audioUpload && mediaUpload ? "media+audio" : mediaUpload ? "media" : "audio",
      },
      walletAddress: metadata.walletAddress,
      fileName: mediaFile?.originalname || audioFile?.originalname || "unknown",
      fileType: mediaFile?.mimetype || audioFile?.mimetype || "unknown",
      fileSizeBytes: mediaFile?.size || audioFile?.size || 0,
      mediaCid: mediaUpload?.cid || null,
      mediaGatewayUrl: mediaUpload?.gatewayUrl || null,
      audioCid: audioUpload?.cid || null,
      audioGatewayUrl: audioUpload?.gatewayUrl || null,
      txHash: null,
    });

    await appendAuditEvent({
      action: "evidence.uploaded",
      ip: req.ip,
      recordId: record.id,
      cid: record.cid,
      hasAudio: Boolean(audioFile),
      hasMedia: Boolean(mediaFile),
    });

    // 🚨 Fire and forget the emergency notifications! (No await to prevent blocking API response)
    triggerEmergencyNotifications(record, metadata);

    return res.status(201).json({
      recordId: record.id,
      cid: primaryUpload.cid,
      gatewayUrl: primaryUpload.gatewayUrl,
      fileCid: mediaUpload?.cid || null,
      fileGatewayUrl: mediaUpload?.gatewayUrl || null,
      audioCid: audioUpload?.cid || null,
      audioGatewayUrl: audioUpload?.gatewayUrl || null,
      metadata: primaryUpload.metadata,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown upload failure.";
    return res.status(500).json({ error: message });
  }
});

app.patch("/api/evidence/:id/tx-hash", txUpdateLimiter, requirePoliceAuth, async (req, res) => {
  try {
    const id = sanitizeText(req.params.id, 100);
    const txHash = sanitizeText(req.body?.txHash, 100);

    console.log(`[PATCH /api/evidence/:id/tx-hash] Received: id=${id}, txHash=${txHash}`);

    if (!id || !txHash) {
      console.log(`[PATCH /api/evidence/:id/tx-hash] FAILED: Missing id or txHash`);
      await appendAuditEvent({
        action: "evidence.txHash.update.failed",
        ip: req.ip,
        reason: "missing-fields",
      });
      return res.status(400).json({ error: "id and txHash are required." });
    }

    const updated = await updateEvidenceTxHash(id, txHash);

    if (!updated) {
      console.log(`[PATCH /api/evidence/:id/tx-hash] FAILED: Record not found for id=${id}`);
      await appendAuditEvent({
        action: "evidence.txHash.update.failed",
        ip: req.ip,
        recordId: id,
        reason: "record-not-found",
      });
      return res.status(404).json({ error: "Evidence record not found." });
    }

    console.log(`[PATCH /api/evidence/:id/tx-hash] SUCCESS: Updated record id=${id} with txHash=${updated.txHash}`);
    await appendAuditEvent({
      action: "evidence.txHash.updated",
      ip: req.ip,
      recordId: updated.id,
      txHash: updated.txHash,
    });
    return res.status(200).json({
      recordId: updated.id,
      txHash: updated.txHash,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown tx update failure.";
    console.log(`[PATCH /api/evidence/:id/tx-hash] ERROR:`, message);
    return res.status(500).json({ error: message });
  }
});

app.use((error, _req, res, _next) => {
  if (error instanceof multer.MulterError) {
    const details = error.code === "LIMIT_FILE_SIZE" ? `File exceeds ${maxFileSizeBytes} bytes.` : error.message;
    return res.status(400).json({ error: details });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error.";
  return res.status(400).json({ error: message });
});

app.listen(port, "0.0.0.0", async () => {
  await connectDB();
  console.log(`Backend API listening on 0.0.0.0:${port}`);
});
