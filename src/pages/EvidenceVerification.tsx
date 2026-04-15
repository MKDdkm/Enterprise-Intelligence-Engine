import { useState } from "react";
import { Search, CheckCircle, XCircle, Clock, FileText, Wallet } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import GlassCard from "@/components/GlassCard";
import GradientButton from "@/components/GradientButton";
import { motion } from "framer-motion";

const EvidenceVerification = () => {
  const [hash, setHash] = useState("");
  const [result, setResult] = useState<null | {
    timestamp: string;
    ipfsLink: string;
    wallet: string;
    verified: boolean;
  }>(null);

  const handleFetch = () => {
    if (!hash.trim()) return;
    // Mock result — real logic would query blockchain
    setResult({
      timestamp: "2024-12-15 22:34:12 UTC",
      ipfsLink: "https://gateway.pinata.cloud/ipfs/" + hash,
      wallet: "0x742d...F872e",
      verified: true,
    });
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8">
      <Navbar />
      <div className="container py-6 max-w-lg mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-foreground">Evidence Verification</h1>
          <p className="text-sm text-muted-foreground">Verify evidence authenticity on the blockchain</p>
        </div>

        <GlassCard className="mb-6">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
            Evidence Hash
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              placeholder="Enter IPFS or blockchain hash..."
              className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <GradientButton onClick={handleFetch} size="sm">
              <Search className="w-4 h-4" />
            </GradientButton>
          </div>
        </GlassCard>

        {result && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50 space-y-4">
              {/* Status */}
              <div className="flex items-center justify-center">
                {result.verified ? (
                  <div className="flex items-center gap-2 bg-success/15 text-success px-4 py-2 rounded-full font-semibold text-sm">
                    <CheckCircle className="w-5 h-5" /> Verified
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-destructive/15 text-destructive px-4 py-2 rounded-full font-semibold text-sm">
                    <XCircle className="w-5 h-5" /> Not Verified
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                  <Clock className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Timestamp</p>
                    <p className="text-sm font-semibold text-foreground">{result.timestamp}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                  <FileText className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">IPFS Evidence</p>
                    <a href={result.ipfsLink} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary underline break-all">
                      {result.ipfsLink}
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl">
                  <Wallet className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground">Wallet Address</p>
                    <p className="text-sm font-mono font-semibold text-foreground">{result.wallet}</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};

export default EvidenceVerification;
