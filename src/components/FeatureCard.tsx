import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  color?: string;
}

const FeatureCard = ({ icon: Icon, title, description, color = "text-primary" }: FeatureCardProps) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="bg-card rounded-2xl p-6 shadow-card border border-border/50 hover:shadow-elevated transition-shadow"
  >
    <div className={`w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <h3 className="font-bold text-foreground mb-1">{title}</h3>
    <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
  </motion.div>
);

export default FeatureCard;
