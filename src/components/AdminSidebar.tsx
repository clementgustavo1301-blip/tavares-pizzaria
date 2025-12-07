import { NavLink, useNavigate } from "react-router-dom";
import { ChefHat, BarChart3, LogOut, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-muted"
    );

  return (
    <aside className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <img src={logo} alt="Tavares Pizzaria" className="h-12" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink to="/cozinha" className={linkClass}>
          <ChefHat className="h-5 w-5" />
          Cozinha
        </NavLink>
        <NavLink to="/admin/cardapio" className={linkClass}>
          <UtensilsCrossed className="h-5 w-5" />
          Cardápio
        </NavLink>
        <NavLink to="/admin/relatorios" className={linkClass}>
          <BarChart3 className="h-5 w-5" />
          Relatórios
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          Sair
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
