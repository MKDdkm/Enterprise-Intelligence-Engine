import { Phone, Shield, Moon, Swords, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNav";
import { motion } from "framer-motion";

const guides = [
  {
    icon: Phone,
    title: "Emergency Helpline Numbers",
    color: "text-destructive bg-destructive/10",
    items: ["Police: 100", "Women Helpline: 1091", "Ambulance: 102", "Child Helpline: 1098", "National Emergency: 112"],
  },
  {
    icon: Shield,
    title: "Women Safety Tips",
    color: "text-primary bg-primary/10",
    items: ["Always share your live location with trusted contacts", "Avoid isolated areas, especially after dark", "Keep emergency numbers on speed dial", "Trust your instincts — if something feels wrong, leave"],
  },
  {
    icon: Moon,
    title: "Night Travel Safety",
    color: "text-secondary bg-secondary/10",
    items: ["Use verified ride-hailing services only", "Share ride details with a trusted person", "Sit behind the driver in cabs", "Keep your phone charged and accessible"],
  },
  {
    icon: Swords,
    title: "Quick Self-Defense Tips",
    color: "text-accent bg-accent/10",
    items: ["Target vulnerable areas: eyes, nose, throat, groin", "Use everyday items as tools: keys, umbrella, bag", "Make noise — scream, use a whistle", "Practice basic self-defense moves regularly"],
  },
  {
    icon: MapPin,
    title: "Nearby Police Stations",
    color: "text-success bg-success/10",
    items: ["Central Police Station — MG Road (1.2 km)", "Women's Helpdesk — Civil Lines (2.5 km)", "Cyber Crime Cell — IT Park (4.1 km)"],
  },
];

const SafetyGuide = () => (
  <div className="min-h-screen pb-24 md:pb-8">
    <Navbar />
    <div className="container py-6 max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-extrabold text-foreground">Safety Guide</h1>
        <p className="text-sm text-muted-foreground">Essential safety information at your fingertips</p>
      </div>
      <div className="space-y-5">
        {guides.map((g, i) => (
          <motion.div
            key={g.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-card rounded-2xl p-5 shadow-card border border-border/50"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${g.color}`}>
                <g.icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-foreground">{g.title}</h3>
            </div>
            <ul className="space-y-2">
              {g.items.map((item) => (
                <li key={item} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
    <BottomNav />
  </div>
);

export default SafetyGuide;
