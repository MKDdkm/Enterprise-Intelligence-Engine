import { Shield, ArrowRight, Zap, MapPin, Users, Lock, AlertTriangle, Wallet, Navigation, CircleDot, Upload, Database, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-illustration.jpg";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import FeatureCard from "@/components/FeatureCard";
import PoliceStationCard from "@/components/PoliceStationCard";
import GradientButton from "@/components/GradientButton";

const steps = [
  { icon: Wallet, label: "Connect Wallet" },
  { icon: Navigation, label: "Capture Location" },
  { icon: CircleDot, label: "Press SOS" },
  { icon: Upload, label: "Upload Evidence" },
  { icon: Database, label: "Store on Blockchain" },
  { icon: ShieldCheck, label: "Police Verify" },
];

const stations = [
  { name: "Central Police Station", address: "MG Road, Sector 12", phone: "100", distance: "1.2 km" },
  { name: "Women's Helpdesk", address: "Civil Lines, Block A", phone: "1091", distance: "2.5 km" },
  { name: "Cyber Crime Cell", address: "IT Park, Tower B", phone: "1930", distance: "4.1 km" },
];

const Index = () => (
  <div className="min-h-screen pb-20 md:pb-0">
    <Navbar />

    {/* Hero */}
    <section className="relative overflow-hidden min-h-[400px] sm:min-h-[480px] md:min-h-[600px]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="" className="w-full h-full object-cover object-center" width={1280} height={800} />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/50 md:bg-gradient-to-r md:from-background/95 md:via-background/80 md:to-background/30" />
      </div>

      <div className="container px-4 sm:px-6 py-10 sm:py-14 md:py-24 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-lg md:max-w-xl"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 backdrop-blur-sm">
            <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            Blockchain-Powered Safety
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-foreground mb-3 sm:mb-4 leading-tight">
            Her<span className="text-gradient">Shield</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-3 sm:mb-4 font-medium">
            Because Safety Can't Wait.
          </p>
          <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-10 max-w-lg leading-relaxed">
            One-tap SOS alerts, tamper-proof evidence on blockchain, real-time police notifications — all in a single app designed for your safety.
          </p>
          <Link to="/dashboard">
            <GradientButton size="lg" className="w-full sm:w-auto">
              Get Started <ArrowRight className="w-5 h-5" />
            </GradientButton>
          </Link>
        </motion.div>
      </div>
    </section>

    {/* Features */}
    <section className="container px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-center mb-6 sm:mb-10">
        Everything You Need to <span className="text-gradient">Stay Safe</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        <FeatureCard icon={Zap} title="One-Tap SOS" description="Send emergency alerts instantly with a single button press." />
        <FeatureCard icon={MapPin} title="Live GPS Tracking" description="Automatically capture and share your real-time location." color="text-secondary" />
        <FeatureCard icon={Users} title="Trusted Contacts Alert" description="Notify your emergency contacts immediately when SOS is triggered." color="text-accent" />
        <FeatureCard icon={Lock} title="Blockchain Evidence Locker" description="Store tamper-proof evidence on IPFS with blockchain verification." />
        <FeatureCard icon={AlertTriangle} title="Police Alert System" description="Directly notify nearby police stations with incident details." color="text-destructive" />
        <FeatureCard icon={ShieldCheck} title="Evidence Verification" description="Anyone can verify evidence authenticity on the public verification page." color="text-success" />
      </div>
    </section>

    {/* How It Works */}
    <section className="container px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-center mb-8 sm:mb-12">
        How It <span className="text-gradient">Works</span>
      </h2>
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {steps.map((step, i) => (
          <motion.div
            key={step.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl gradient-primary flex items-center justify-center mb-2 sm:mb-3 text-primary-foreground">
              <step.icon className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-foreground leading-tight">{step.label}</span>
            <span className="text-[9px] sm:text-[10px] text-muted-foreground mt-0.5">Step {i + 1}</span>
          </motion.div>
        ))}
      </div>
    </section>

    {/* Nearby Police Stations */}
    <section className="container px-4 sm:px-6 py-10 sm:py-16">
      <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-center mb-6 sm:mb-10">
        Nearby <span className="text-gradient">Police Stations</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 max-w-4xl mx-auto">
        {stations.map((s) => (
          <PoliceStationCard key={s.name} {...s} />
        ))}
      </div>
    </section>

    {/* Footer */}
    <footer className="border-t border-border/50 py-8 pb-10">
      <div className="container text-center max-w-2xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-bold text-gradient">HerShield</span>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Because Safety Can't Wait. Powered by Blockchain.</p>
        <div className="space-y-1 text-xs text-muted-foreground/80">
          <p>Developed by: Mourya K Dinesh, Praneeth MB, Anilakumar, Rahul R</p>
          <p>&copy; {new Date().getFullYear()} HerShield. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <BottomNav />
  </div>
);

export default Index;
