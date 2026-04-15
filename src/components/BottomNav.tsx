import { Home, LayoutDashboard, BookOpen, ShieldCheck, Search } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const items = [
  { icon: Home, label: "Home", path: "/" },
  { icon: LayoutDashboard, label: "SOS", path: "/dashboard" },
  { icon: BookOpen, label: "Guide", path: "/safety-guide" },
  { icon: ShieldCheck, label: "Police", path: "/police" },
  { icon: Search, label: "Verify", path: "/verify" },
];

const BottomNav = () => {
  const location = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-border/50 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around py-2 px-2">
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
