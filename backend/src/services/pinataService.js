const PINATA_FILE_ENDPOINT = "https://api.pinata.cloud/pinning/pinFileToIPFS";

const MAX_TEXT_LENGTH = 300;

function getPinataHeaders() {
  const pinataJwt = process.env.PINATA_JWT?.trim();
  const pinataApiKey = process.env.PINATA_API_KEY?.trim();
  const pinataApiSecret = process.env.PINATA_API_SECRET?.trim();

  if (pinataJwt) {
    return {
      Authorization: `Bearer ${pinataJwt}`,
    };
  }

  if (pinataApiKey && pinataApiSecret) {
    return {
      pinata_api_key: pinataApiKey,
      pinata_secret_api_key: pinataApiSecret,
    };
  }

  throw new Error("Missing Pinata credentials. Set PINATA_JWT or PINATA_API_KEY and PINATA_API_SECRET.");
}

export function sanitizeText(value, maxLength = MAX_TEXT_LENGTH) {
  if (!value) {
    return "";
  }

  return String(value)
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

export async function uploadToPinata(file, metadata = {}) {
  if (!file?.buffer) {
    throw new Error("No file buffer received for Pinata upload.");
  }

  const headers = getPinataHeaders();
  const formData = new FormData();

  const blob = new Blob([file.buffer], { type: file.mimetype || "application/octet-stream" });
  formData.append("file", blob, file.originalname || "evidence.bin");

  const safeMetadata = {
    title: sanitizeText(metadata.title, 120),
    description: sanitizeText(metadata.description, 300),
    incidentType: sanitizeText(metadata.incidentType, 80),
    walletAddress: sanitizeText(metadata.walletAddress, 80),
    latitude: sanitizeText(metadata.latitude, 40),
    longitude: sanitizeText(metadata.longitude, 40),
    uploadedAt: new Date().toISOString(),
  };

  formData.append(
    "pinataMetadata",
    JSON.stringify({
      name: safeMetadata.title || file.originalname || "evidence-file",
      keyvalues: safeMetadata,
    }),
  );

  const pinataOptions = { cidVersion: 1 };
  formData.append("pinataOptions", JSON.stringify(pinataOptions));

  const response = await fetch(PINATA_FILE_ENDPOINT, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata upload failed (${response.status}): ${errorText}`);
  }

  const payload = await response.json();
  const cid = payload?.IpfsHash;

  if (!cid) {
    throw new Error("Pinata response did not include IpfsHash.");
  }

  return {
    cid,
    pinSize: payload?.PinSize,
    timestamp: payload?.Timestamp,
    gatewayUrl: `https://gateway.pinata.cloud/ipfs/${cid}`,
    metadata: safeMetadata,
  };
}
