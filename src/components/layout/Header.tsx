import { Menu, Bell, User } from "lucide-react";
import { Button } from "@/components/ui";
import { Link } from "react-router";
import { AppRoutes } from "@/constants";

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  return (
    <header className="bg-white shadow h-16 flex items-center px-4">
      <Button variant="ghost" size="icon" className="md:hidden mr-2" onClick={onMenuClick}>
        <Menu size={20} />
      </Button>

      <h1 className="text-xl font-semibold md:ml-4">PrayerBox</h1>

      <div className="ml-auto flex items-center space-x-2">
        <Button variant="ghost" size="icon" className="text-slate-600">
          <Bell size={20} />
        </Button>
        <Link to={AppRoutes.UpdateUser}>
          <Button variant="ghost" size="icon" className="text-slate-600">
            <User size={20} />
          </Button>
        </Link>
      </div>
    </header>
  );
}
