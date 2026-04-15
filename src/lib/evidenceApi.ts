export type EvidenceUploadRequest = {
  file?: File;
  audio?: File;
  description: string;
  walletAddress: string;
  latitude?: string;
  longitude?: string;
};

export type EvidenceUploadResponse = {
  recordId: string;
  cid: string;
  gatewayUrl: string;
  fileCid?: string | null;
  fileGatewayUrl?: string | null;
  audioCid?: string | null;
  audioGatewayUrl?: string | null;
  metadata: {
    description: string;
    walletAddress: string;
    latitude: string;
    longitude: string;
    uploadedAt: string;
  };
};

export type EvidenceRecord = {
  id: string;
  cid: string;
  gatewayUrl: string;
  txHash: string | null;
  fileCid?: string | null;
  fileGatewayUrl?: string | null;
  audioCid?: string | null;
  audioGatewayUrl?: string | null;
  metadata: {
    description: string;
    walletAddress: string;
    latitude: string;
    longitude: string;
    uploadedAt: string;
    evidenceType?: string;
  };
  createdAt: string;
  updatedAt: string;
};

function getApiBase() {
  return (import.meta.env.VITE_API_BASE_URL || "").trim();
}

export async function uploadEvidence(payload: EvidenceUploadRequest): Promise<EvidenceUploadResponse> {
  const form = new FormData();

  if (payload.file) {
    form.append("file", payload.file);
  }

  if (payload.audio) {
    form.append("audio", payload.audio);
  }

  form.append("description", payload.description);
  form.append("walletAddress", payload.walletAddress);
  form.append("latitude", payload.latitude || "");
  form.append("longitude", payload.longitude || "");
  form.append("clientTimestamp", new Date().toISOString());

  const response = await fetch(`${getApiBase()}/api/evidence/upload`, {
    method: "POST",
    body: form,
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error || "Evidence upload failed.");
  }

  return json as EvidenceUploadResponse;
}

export async function saveEvidenceTxHash(recordId: string, txHash: string) {
  const response = await fetch(`${getApiBase()}/api/evidence/${encodeURIComponent(recordId)}/tx-hash`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ txHash }),
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(json?.error || "Failed to save tx hash.");
  }

  return json as { recordId: string; txHash: string };
}

export async function listEvidenceRecords(limit?: number) {
  const query = Number.isFinite(limit) && (limit || 0) > 0 ? `?limit=${Math.floor(limit || 0)}` : "";
  const response = await fetch(`${getApiBase()}/api/evidence${query}`);
  const json = await response.json();

  if (!response.ok) {
    throw new Error(json?.error || "Failed to fetch evidence records.");
  }

  return json as { records: EvidenceRecord[]; total?: number; limit?: number | null };
}
