import { motion } from "framer-motion";

interface SOSButtonProps {
  onClick?: () => void;
  disabled?: boolean;
}

const SOSButton = ({ onClick, disabled }: SOSButtonProps) => (
  <div className="relative flex items-center justify-center">
    {/* Outer pulse rings */}
    <div className="absolute w-48 h-48 rounded-full bg-destructive/5 animate-ping" style={{ animationDuration: "3s" }} />
    <div className="absolute w-40 h-40 rounded-full bg-destructive/10 animate-ping" style={{ animationDuration: "2.5s" }} />

    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className="relative z-10 w-36 h-36 rounded-full bg-destructive text-destructive-foreground font-extrabold text-3xl tracking-wider shadow-sos animate-pulse-sos disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
    >
      SOS
    </motion.button>
  </div>
);

export default SOSButton;
