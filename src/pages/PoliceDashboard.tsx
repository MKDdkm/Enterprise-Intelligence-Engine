import { useEffect, useState } from "react";
import { Eye, CheckCircle, Clock, MapPin, Link as LinkIcon, Copy, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import GradientButton from "@/components/GradientButton";
import { motion } from "framer-motion";
import { listEvidenceRecords, saveEvidenceTxHash, type EvidenceRecord } from "@/lib/evidenceApi";
import { toast } from "sonner";
import { connectWallet, storeEvidenceCidOnChain } from "@/lib/wallet";

const explorerBaseUrl = (import.meta.env.VITE_BLOCK_EXPLORER_URL || "https://sepolia.etherscan.io/tx/").trim();
const txHashRetryQueueKey = "soschain.pendingTxHashSaves.v1";

type PendingTxHashSave = {
  recordId: string;
  txHash: string;
  attempts: number;
  queuedAt: string;
  lastError: string;
};

const statusConfig = {
  pending: { label: "Uploaded only", icon: Clock, className: "bg-amber-100 text-amber-700" },
  verified: { label: "On-chain", icon: CheckCircle, className: "bg-success/15 text-success" },
};

const PoliceDashboard = () => {
  const [records, setRecords] = useState<EvidenceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [walletAddress, setWalletAddress] = useState("");
  const [writingRecordId, setWritingRecordId] = useState("");
  const [pendingTxHashSaves, setPendingTxHashSaves] = useState<PendingTxHashSave[]>([]);

  const hasContractAddress = Boolean((import.meta.env.NEXT_PUBLIC_CONTRACT_ADDRESS || import.meta.env.VITE_CONTRACT_ADDRESS || "").trim());

  const saveQueueToStorage = (items: PendingTxHashSave[]) => {
    setPendingTxHashSaves(items);
    localStorage.setItem(txHashRetryQueueKey, JSON.stringify(items));
  };

  const loadRecords = async () => {
    try {
      const response = await listEvidenceRecords(120);
      setRecords(response.records);
    } catch {
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const enqueueTxHashSave = (recordId: string, txHash: string, lastError: string) => {
    setPendingTxHashSaves((previous) => {
      const deduped = previous.filter((item) => item.recordId !== recordId || item.txHash !== txHash);
      const next = [
        ...deduped,
        {
          recordId,
          txHash,
          attempts: 0,
          queuedAt: new Date().toISOString(),
          lastError,
        },
      ];
      localStorage.setItem(txHashRetryQueueKey, JSON.stringify(next));
      return next;
    });
  };

  const flushPendingTxHashSaves = async () => {
    if (pendingTxHashSaves.length === 0) {
      return;
    }

    const survivors: PendingTxHashSave[] = [];
    let persistedCount = 0;

    for (const item of pendingTxHashSaves) {
      try {
        await saveEvidenceTxHash(item.recordId, item.txHash);
        persistedCount += 1;
      } catch (error) {
        survivors.push({
          ...item,
          attempts: item.attempts + 1,
          lastError: error instanceof Error ? error.message : "Unknown queue retry failure",
        });
      }
    }

    if (persistedCount > 0) {
      await loadRecords();
      toast.success(`Recovered ${persistedCount} queued tx hash update${persistedCount > 1 ? "s" : ""}.`);
    }

    saveQueueToStorage(survivors);
  };

  useEffect(() => {
    const existing = localStorage.getItem(txHashRetryQueueKey);
    if (existing) {
      try {
        const parsed = JSON.parse(existing) as PendingTxHashSave[];
        setPendingTxHashSaves(Array.isArray(parsed) ? parsed : []);
      } catch {
        setPendingTxHashSaves([]);
      }
    }

    void loadRecords();
  }, []);

  useEffect(() => {
    const refreshTimer = window.setInterval(() => {
      void loadRecords();
    }, 10000);

    return () => {
      window.clearInterval(refreshTimer);
    };
  }, []);

  useEffect(() => {
    if (pendingTxHashSaves.length === 0) {
      return;
    }

    const retryTimer = window.setInterval(() => {
      void flushPendingTxHashSaves();
    }, 15000);

    return () => {
      window.clearInterval(retryTimer);
    };
  }, [pendingTxHashSaves]);

  const copyTxHash = async (txHash: string) => {
    await navigator.clipboard.writeText(txHash);
    toast.success("Transaction hash copied.");
  };

  const copyEtherscanLink = async (txHash: string) => {
    const url = `${explorerBaseUrl}${txHash}`;
    await navigator.clipboard.writeText(url);
    toast.success("Etherscan link copied.");
  };

  const handleConnectWallet = async () => {
    try {
      const result = await connectWallet();
      setWalletAddress(result.account);
      toast.success("Wallet connected for blockchain verification.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to connect wallet.";
      toast.error(message);
    }
  };

  const handleWriteOnChain = async (record: EvidenceRecord) => {
    if (!hasContractAddress) {
      toast.error("Set NEXT_PUBLIC_CONTRACT_ADDRESS to write CID on-chain.");
      return;
    }

    if (!walletAddress) {
      toast.error("Connect wallet first.");
      return;
    }

    try {
      setWritingRecordId(record.id);
      console.log(`[Police] Writing CID on-chain for record ${record.id}: ${record.cid}`);
      
      const txHash = await storeEvidenceCidOnChain(record.cid);

      if (!txHash) {
        throw new Error("No transaction hash returned by contract.");
      }

      console.log(`[Police] Got TX hash: ${txHash}, now saving to backend...`);

      try {
        await saveEvidenceTxHash(record.id, txHash);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to persist tx hash";
        enqueueTxHashSave(record.id, txHash, message);
        toast.warning("On-chain write succeeded. Backend save queued for retry.");
      }

      setRecords((previous) =>
        previous.map((item) => (item.id === record.id ? { ...item, txHash, updatedAt: new Date().toISOString() } : item)),
      );

      await loadRecords();

      toast.success(`CID written on-chain. TX: ${txHash.slice(0, 10)}...`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to write CID on-chain.";
      console.error(`[Police] Write failed:`, message);
      toast.error(message);
    } finally {
      setWritingRecordId("");
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <Navbar />
      <div className="container py-6 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-foreground">Police Dashboard</h1>
          <p className="text-sm text-muted-foreground">Backend evidence records with tx hash and blockchain status</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            <GradientButton size="sm" onClick={handleConnectWallet}>
              <Wallet className="w-4 h-4" /> {walletAddress ? "Wallet Connected" : "Connect Wallet"}
            </GradientButton>
            {walletAddress && <p className="text-xs text-muted-foreground break-all">{walletAddress}</p>}
          </div>
          {!hasContractAddress && (
            <p className="mt-3 text-xs text-amber-700 bg-amber-100 px-3 py-2 rounded-lg inline-block">
              Contract address is missing. Set NEXT_PUBLIC_CONTRACT_ADDRESS to generate tx hash.
            </p>
          )}
          <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted-foreground px-3 py-1.5 rounded-full bg-muted/60">Auto-refresh: 10s</span>
            {pendingTxHashSaves.length > 0 && (
              <GradientButton size="sm" variant="outline" onClick={flushPendingTxHashSaves}>
                <Clock className="w-4 h-4" /> Retry queued saves ({pendingTxHashSaves.length})
              </GradientButton>
            )}
          </div>
        </div>

        {loading ? (
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 text-sm text-muted-foreground">Loading evidence records...</div>
        ) : records.length === 0 ? (
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 text-sm text-muted-foreground">
            No evidence records found yet.
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((record, index) => {
              const onChain = Boolean(record.txHash);
              const cfg = onChain ? statusConfig.verified : statusConfig.pending;
              const location = record.metadata.latitude && record.metadata.longitude
                ? `${record.metadata.latitude}, ${record.metadata.longitude}`
                : "Location not provided";

              return (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.06 }}
                  className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
                >
                  <div className="flex items-center justify-between mb-3 gap-3">
                    <h3 className="font-bold text-foreground break-all">{record.id}</h3>
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
                      <cfg.icon className="w-3.5 h-3.5" />
                      {cfg.label}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="w-4 h-4 shrink-0" />
                      <span>{location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="w-4 h-4 shrink-0" />
                      <span>{new Date(record.createdAt).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-sm">
                    <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">CID</p>
                      <p className="text-sm font-mono font-semibold text-foreground break-all">{record.cid}</p>
                    </div>
                    <div className="rounded-xl border border-border/60 bg-background/50 p-3">
                      <p className="text-xs text-muted-foreground mb-1">Transaction Hash</p>
                      <p className="text-sm font-mono font-semibold text-foreground break-all">
                        {record.txHash || "Pending. Not written on-chain yet."}
                      </p>
                      {record.txHash && (
                        <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-full bg-success/15 text-success">
                          <CheckCircle className="w-3.5 h-3.5" /> Verified Badge: Etherscan-checkable
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 p-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wider text-primary">Blockchain Proof</p>
                      <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${onChain ? "bg-success/15 text-success" : "bg-amber-100 text-amber-700"}`}>
                        {onChain ? "Visible on Sepolia" : "Waiting for blockchain write"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">Tx Hash</p>
                    <p className="text-sm font-mono font-semibold text-foreground break-all">
                      {record.txHash || "No hash yet. Upload was only stored in Pinata."}
                    </p>
                  </div>

                  <div className="mb-4 text-sm">
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground leading-relaxed">{record.metadata.description || "No description provided."}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <GradientButton size="sm" variant="outline" onClick={() => window.open(record.gatewayUrl, "_blank", "noreferrer")}>
                      <Eye className="w-4 h-4" /> View Evidence
                    </GradientButton>

                    {record.txHash && (
                      <>
                        <GradientButton size="sm" variant="outline" onClick={() => copyTxHash(record.txHash || "") }>
                          <Copy className="w-4 h-4" /> Copy TX
                        </GradientButton>
                        <GradientButton size="sm" variant="outline" onClick={() => copyEtherscanLink(record.txHash || "") }>
                          <Copy className="w-4 h-4" /> Copy Etherscan Link
                        </GradientButton>
                        <GradientButton size="sm" onClick={() => window.open(`${explorerBaseUrl}${record.txHash}`, "_blank", "noreferrer")}>
                          <LinkIcon className="w-4 h-4" /> Open Etherscan
                        </GradientButton>
                      </>
                    )}

                    {!record.txHash && (
                      <>
                        <div className="text-xs text-muted-foreground px-3 py-2 rounded-lg bg-muted/60">
                          Uploaded to Pinata only. No blockchain tx yet, so police cannot verify on Etherscan until it is written on-chain.
                        </div>
                        <GradientButton
                          size="sm"
                          onClick={() => handleWriteOnChain(record)}
                          disabled={writingRecordId === record.id}
                        >
                          <LinkIcon className="w-4 h-4" /> {writingRecordId === record.id ? "Writing..." : "Write CID On-Chain"}
                        </GradientButton>
                      </>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default PoliceDashboard;
