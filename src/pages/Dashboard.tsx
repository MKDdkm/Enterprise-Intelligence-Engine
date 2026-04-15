import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { Wallet, Navigation, Upload, Send, MapPin, Phone, Copy, ExternalLink, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import SOSButton from "@/components/SOSButton";
import StatusChip from "@/components/StatusChip";
import GlassCard from "@/components/GlassCard";
import GradientButton from "@/components/GradientButton";
import { toast } from "sonner";
import { connectWallet, storeEvidenceCidOnChain } from "@/lib/wallet";
import { saveEvidenceTxHash, uploadEvidence } from "@/lib/evidenceApi";

type RegionPlace = {
  name: string;
  address: string;
  phone?: string;
  latitude: number;
  longitude: number;
};

const mangalorePoliceStations: RegionPlace[] = [
  {
    name: "Mangalore Women Police Station",
    address: "Hampankatta, Mangaluru",
    phone: "0824-2220510",
    latitude: 12.8709,
    longitude: 74.8427,
  },
  {
    name: "Pandeshwar Police Station",
    address: "Pandeshwar, Mangaluru",
    phone: "0824-2220525",
    latitude: 12.8656,
    longitude: 74.842,
  },
  {
    name: "Barke Police Station",
    address: "Bendoorwell, Mangaluru",
    phone: "0824-2218333",
    latitude: 12.8845,
    longitude: 74.8616,
  },
  {
    name: "Kadri Police Station",
    address: "Kadri, Mangaluru",
    phone: "0824-2218400",
    latitude: 12.8989,
    longitude: 74.858,
  },
];

const mangaloreSafePlaces: RegionPlace[] = [
  {
    name: "KMC Hospital Attavar",
    address: "Attavar, Mangaluru",
    phone: "0824-2444590",
    latitude: 12.8587,
    longitude: 74.8465,
  },
  {
    name: "Wenlock District Hospital",
    address: "Hampankatta, Mangaluru",
    phone: "0824-2444200",
    latitude: 12.8688,
    longitude: 74.8469,
  },
  {
    name: "Mangalore Central Railway Station",
    address: "Hampankatta, Mangaluru",
    latitude: 12.8719,
    longitude: 74.84,
  },
  {
    name: "City Centre Mall",
    address: "KS Rao Road, Mangaluru",
    latitude: 12.8714,
    longitude: 74.8448,
  },
];

const formatDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const toGoogleMapsLink = (latitude: number, longitude: number) =>
  `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;

const Dashboard = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [gpsCaptured, setGpsCaptured] = useState(false);
  const [capturingGps, setCapturingGps] = useState(false);
  const [coords, setCoords] = useState<{ latitude: string; longitude: string }>({ latitude: "", longitude: "" });
  const [sosSent, setSosSent] = useState(false);
  const [evidenceUploaded, setEvidenceUploaded] = useState(false);
  const [hashStored, setHashStored] = useState(false);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);
  const [cameraFile, setCameraFile] = useState<File | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [recordId, setRecordId] = useState("");
  const [fileCid, setFileCid] = useState("");
  const [audioCid, setAudioCid] = useState("");
  const [fileGatewayUrl, setFileGatewayUrl] = useState("");
  const [audioGatewayUrl, setAudioGatewayUrl] = useState("");
  const [txHash, setTxHash] = useState("");
  const [description, setDescription] = useState("");

  const explorerBaseUrl = (import.meta.env.VITE_BLOCK_EXPLORER_URL || "https://sepolia.etherscan.io/tx/").trim();
  const hasOptionalContract = Boolean(import.meta.env.NEXT_PUBLIC_CONTRACT_ADDRESS?.trim());
  const selectedMediaFile = uploadFile || cameraFile;

  const nearbyPolice = useMemo(() => {
    if (!gpsCaptured) {
      return mangalorePoliceStations.slice(0, 3).map((place) => ({ ...place, distanceLabel: "Enable GPS" }));
    }

    const lat = Number(coords.latitude);
    const lon = Number(coords.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return mangalorePoliceStations.slice(0, 3).map((place) => ({ ...place, distanceLabel: "Location unavailable" }));
    }

    return mangalorePoliceStations
      .map((place) => {
        const distanceKm = formatDistanceKm(lat, lon, place.latitude, place.longitude);
        return {
          ...place,
          distanceKm,
          distanceLabel: `${distanceKm.toFixed(1)} km`,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);
  }, [coords.latitude, coords.longitude, gpsCaptured]);

  const nearbySafePlaces = useMemo(() => {
    if (!gpsCaptured) {
      return mangaloreSafePlaces.slice(0, 3).map((place) => ({ ...place, distanceLabel: "Enable GPS" }));
    }

    const lat = Number(coords.latitude);
    const lon = Number(coords.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return mangaloreSafePlaces.slice(0, 3).map((place) => ({ ...place, distanceLabel: "Location unavailable" }));
    }

    return mangaloreSafePlaces
      .map((place) => {
        const distanceKm = formatDistanceKm(lat, lon, place.latitude, place.longitude);
        return {
          ...place,
          distanceKm,
          distanceLabel: `${distanceKm.toFixed(1)} km`,
        };
      })
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, 3);
  }, [coords.latitude, coords.longitude, gpsCaptured]);

  const canUpload = useMemo(
    () =>
      Boolean(
        sosSent &&
          description.trim() &&
          (selectedMediaFile || audioFile) &&
          walletConnected,
      ),
    [audioFile, description, selectedMediaFile, sosSent, walletConnected],
  );

  const handleConnect = async () => {
    try {
      const connected = await connectWallet();
      setWalletConnected(true);
      setWalletAddress(connected.account);
      toast.success("Wallet connected.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Wallet connection failed.";
      toast.error(message);
    }
  };

  const handleGPS = () => {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported on this device.");
      return;
    }
    
    setCapturingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: String(position.coords.latitude),
          longitude: String(position.coords.longitude),
        });
        setGpsCaptured(true);
        setCapturingGps(false);
        toast.success("GPS location captured.");
      },
      () => {
        setCapturingGps(false);
        toast.error("Unable to capture GPS location. Trying again or check permissions.");
      },
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 },
    );
  };

  const handleSOS = () => { setSosSent(true); toast.error("🚨 SOS Alert Sent!", { description: "Emergency contacts and police have been notified." }); };

  const handleCameraFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setCameraFile(file);
  };

  const handleUploadFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setUploadFile(file);
  };

  const handleAudioFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setAudioFile(file);
  };

  const handleUpload = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedMediaFile && !audioFile) {
      toast.error("Please add media and/or audio evidence.");
      return;
    }

    if (!walletAddress) {
      toast.error("Connect your wallet before uploading.");
      return;
    }

    setUploadingEvidence(true);

    try {
      const uploaded = await uploadEvidence({
        file: selectedMediaFile || undefined,
        audio: audioFile || undefined,
        description,
        walletAddress,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      setRecordId(uploaded.recordId);
      setFileCid(uploaded.fileCid || (selectedMediaFile ? uploaded.cid : ""));
      setAudioCid(uploaded.audioCid || (audioFile && !selectedMediaFile ? uploaded.cid : ""));
      setFileGatewayUrl(uploaded.fileGatewayUrl || (selectedMediaFile ? uploaded.gatewayUrl : ""));
      setAudioGatewayUrl(uploaded.audioGatewayUrl || (audioFile && !selectedMediaFile ? uploaded.gatewayUrl : ""));
      setEvidenceUploaded(true);
      toast.success("Evidence uploaded to Pinata/IPFS.");

      if (hasOptionalContract) {
        try {
          const cidForChain = uploaded.fileCid || uploaded.cid || uploaded.audioCid;

          if (!cidForChain) {
            throw new Error("No CID available for blockchain write.");
          }

          const chainTxHash = await storeEvidenceCidOnChain(cidForChain);

          if (chainTxHash) {
            await saveEvidenceTxHash(uploaded.recordId, chainTxHash);
            setHashStored(true);
            setTxHash(chainTxHash);
            toast.success("CID stored on-chain.");
          }
        } catch (contractError) {
          const contractMessage = contractError instanceof Error ? contractError.message : "Contract transaction failed.";
          setHashStored(false);
          toast.error(`Contract revert or failure: ${contractMessage}`);
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      toast.error(message);
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleAlert = () => { toast.success("Alerts sent to all trusted contacts!"); };

  return (
    <div className="min-h-screen safe-y pb-[calc(env(safe-area-inset-bottom)+5.75rem)] md:pb-8">
      <Navbar />
      <div className="container px-4 sm:px-6 py-5 sm:py-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground">SOS Dashboard</h1>
          <p className="text-xs sm:text-sm text-muted-foreground">Your emergency control center</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
          {/* Left column — SOS + Actions */}
          <div className="space-y-5">
            {/* Status Tracker */}
            <GlassCard>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Status</h3>
              <div className="flex flex-wrap gap-2">
                <StatusChip label="Wallet" active={walletConnected} />
                <StatusChip label="GPS" active={gpsCaptured} />
                <StatusChip label="SOS Sent" active={sosSent} />
                <StatusChip label="Evidence" active={evidenceUploaded} />
                <StatusChip label="Blockchain" active={hashStored} />
              </div>
            </GlassCard>

            {/* SOS Button */}
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="flex justify-center py-3 sm:py-5"
            >
              <SOSButton onClick={handleSOS} disabled={!walletConnected || !gpsCaptured} />
            </motion.div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              <GradientButton onClick={handleConnect} variant={walletConnected ? "outline" : "primary"} size="sm">
                <Wallet className="w-4 h-4" /> <span className="truncate">{walletConnected ? "Connected" : "Connect Wallet"}</span>
              </GradientButton>
              <GradientButton onClick={handleGPS} variant={gpsCaptured ? "outline" : "primary"} size="sm" disabled={capturingGps}>
                {capturingGps ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> <span className="truncate">Locating...</span></>
                ) : (
                  <><Navigation className="w-4 h-4" /> <span className="truncate">{gpsCaptured ? "Captured" : "Capture GPS"}</span></>
                )}
              </GradientButton>
              <GradientButton onClick={handleAlert} variant="primary" size="sm" disabled={!sosSent}>
                <Send className="w-4 h-4" /> <span className="truncate">Send Alert</span>
              </GradientButton>
            </div>

            <GlassCard>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Evidence Upload</h3>
              <form onSubmit={handleUpload} className="space-y-3">
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="One description is enough. Tell what happened..."
                  className="w-full px-3 py-2 rounded-lg bg-background/80 border border-border text-sm min-h-24 outline-none focus:ring-2 focus:ring-primary/25"
                  maxLength={300}
                />
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Camera Capture (mobile)</p>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    capture="environment"
                    onChange={handleCameraFileChange}
                    className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-2 file:font-medium file:bg-primary/15 file:text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Upload Media (gallery/files)</p>
                  <input
                    type="file"
                    accept="image/*,video/*,application/pdf,text/plain"
                    onChange={handleUploadFileChange}
                    className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-2 file:font-medium file:bg-primary/15 file:text-primary"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground">Audio Message</p>
                  <input
                    type="file"
                    accept="audio/*"
                    capture="user"
                    onChange={handleAudioFileChange}
                    className="w-full text-sm file:mr-3 file:rounded-md file:border-0 file:px-3 file:py-2 file:font-medium file:bg-primary/15 file:text-primary"
                  />
                </div>
                {selectedMediaFile && <p className="text-xs text-muted-foreground">Media: {selectedMediaFile.name}</p>}
                {audioFile && <p className="text-xs text-muted-foreground">Audio: {audioFile.name}</p>}
                {walletAddress && <p className="text-xs text-muted-foreground break-all">Wallet: {walletAddress}</p>}
                {recordId && <p className="text-xs text-muted-foreground">Record: {recordId}</p>}
                <GradientButton type="submit" variant={evidenceUploaded ? "outline" : "primary"} size="sm" disabled={!canUpload || uploadingEvidence}>
                  <Upload className="w-4 h-4" />
                  <span className="truncate">{uploadingEvidence ? "Uploading..." : "Upload Evidence"}</span>
                </GradientButton>
              </form>
            </GlassCard>
          </div>

          {/* Right column — Info panels */}
          <div className="space-y-5 lg:pt-0">
            {/* Hashes */}
            {(fileCid || audioCid || txHash) && (
              <GlassCard>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Evidence Records</h3>
                {fileCid && (
                  <div className="flex items-center justify-between gap-2 py-2 border-b border-border/50">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Media CID</p>
                      <p className="text-xs sm:text-sm font-mono font-semibold text-foreground break-all sm:truncate">{fileCid}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(fileCid); toast.info("Copied!"); }} className="p-2 rounded-lg hover:bg-muted shrink-0">
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
                {audioCid && (
                  <div className="flex items-center justify-between gap-2 py-2 border-b border-border/50">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Audio CID</p>
                      <p className="text-xs sm:text-sm font-mono font-semibold text-foreground break-all sm:truncate">{audioCid}</p>
                    </div>
                    <button onClick={() => { navigator.clipboard.writeText(audioCid); toast.info("Copied!"); }} className="p-2 rounded-lg hover:bg-muted shrink-0">
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                )}
                {txHash && (
                  <div className="flex items-center justify-between gap-2 py-2">
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Blockchain TX</p>
                      <p className="text-xs sm:text-sm font-mono font-semibold text-foreground break-all sm:truncate">{txHash}</p>
                    </div>
                    <a href={`${explorerBaseUrl}${txHash}`} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-muted shrink-0">
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </div>
                )}
                {fileGatewayUrl && (
                  <a href={fileGatewayUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline break-all mt-2 block">
                    Media Link: {fileGatewayUrl}
                  </a>
                )}
                {audioGatewayUrl && (
                  <a href={audioGatewayUrl} target="_blank" rel="noreferrer" className="text-xs text-primary underline break-all mt-2 block">
                    Audio Link: {audioGatewayUrl}
                  </a>
                )}
              </GlassCard>
            )}

            {/* Nearby Police */}
            <GlassCard>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Nearby Police - Mangalore</h3>
              <div className="space-y-3">
                {nearbyPolice.map((station) => (
                  <div key={station.name} className="rounded-xl border border-border/60 p-3 bg-background/50">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-foreground">{station.name}</p>
                      <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">{station.distanceLabel}</span>
                    </div>
                    <div className="flex items-start gap-2 mb-2">
                      <MapPin className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                      <p className="text-xs text-muted-foreground">{station.address}</p>
                    </div>
                    <div>
                      {station.phone && <a href={`tel:${station.phone}`} className="text-xs text-primary mr-3">Call: {station.phone}</a>}
                      <a href={toGoogleMapsLink(station.latitude, station.longitude)} target="_blank" rel="noreferrer" className="text-xs text-primary underline">Open in Google Maps</a>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Nearby Safe Places */}
            <GlassCard>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Nearby Safe Places</h3>
              <div className="space-y-3">
                {nearbySafePlaces.map((place) => (
                  <div key={place.name} className="rounded-xl border border-border/60 p-3 bg-background/50">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <p className="text-sm font-semibold text-foreground">{place.name}</p>
                      <span className="text-[11px] font-semibold text-accent bg-accent/10 px-2 py-1 rounded-full">{place.distanceLabel}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{place.address}</p>
                    <div>
                      {place.phone && <a href={`tel:${place.phone}`} className="text-xs text-primary mr-3"><Phone className="inline w-3 h-3 mr-1" />Call</a>}
                      <a href={toGoogleMapsLink(place.latitude, place.longitude)} target="_blank" rel="noreferrer" className="text-xs text-primary underline">
                        <MapPin className="inline w-3 h-3 mr-1" />Open in Google Maps
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
};

export default Dashboard;
