import { MapPin, Phone } from "lucide-react";

interface PoliceStationCardProps {
  name: string;
  address: string;
  phone: string;
  distance: string;
}

const PoliceStationCard = ({ name, address, phone, distance }: PoliceStationCardProps) => (
  <div className="bg-card rounded-2xl p-5 shadow-card border border-border/50">
    <div className="flex items-start justify-between mb-3">
      <h4 className="font-bold text-foreground">{name}</h4>
      <span className="text-xs font-medium text-accent bg-accent/10 px-2 py-1 rounded-full">{distance}</span>
    </div>
    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
      <MapPin className="w-4 h-4 shrink-0" />
      <span>{address}</span>
    </div>
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Phone className="w-4 h-4 shrink-0" />
      <span>{phone}</span>
    </div>
  </div>
);

export default PoliceStationCard;
