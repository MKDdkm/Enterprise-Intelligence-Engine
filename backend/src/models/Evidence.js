import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    cid: { type: String, required: true },
    gatewayUrl: { type: String, required: true },
    metadata: {
      description: { type: String, required: true },
      walletAddress: { type: String, required: true },
      latitude: { type: String },
      longitude: { type: String },
      clientTimestamp: { type: String },
      evidenceType: { type: String },
    },
    walletAddress: { type: String },
    fileName: { type: String },
    fileType: { type: String },
    fileSizeBytes: { type: Number },
    mediaCid: { type: String },
    mediaGatewayUrl: { type: String },
    audioCid: { type: String },
    audioGatewayUrl: { type: String },
    txHash: { type: String },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
  }
);

const Evidence = mongoose.model("Evidence", evidenceSchema);

export default Evidence;
