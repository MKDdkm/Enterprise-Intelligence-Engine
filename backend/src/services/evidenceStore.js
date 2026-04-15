import Evidence from "../models/Evidence.js";

// Optional: you can implement a script to manually transfer old records from evidence-records.json if needed,
// but all new data will be read from and written to MongoDB.

export async function createEvidenceRecord(recordInput) {
  // Use the same id generation for backwards compatibility or simply let MongoDB _id handle it, 
  // but we'll stick to 'id' string field as defined in the original logic.
  const id = `${Date.now()}-${Math.floor(Math.random() * 1000000)}`;

  const newRecord = new Evidence({
    id,
    ...recordInput,
  });

  const savedRecord = await newRecord.save();
  return savedRecord;
}

export async function getEvidenceRecords() {
  // Fetch all, sorted by createdAt descending
  const records = await Evidence.find().sort({ createdAt: -1 });
  return records;
}

export async function updateEvidenceTxHash(id, txHash) {
  const record = await Evidence.findOneAndUpdate(
    { id },
    { $set: { txHash } },
    { new: true } // returns the updated document
  );

  return record;
}
