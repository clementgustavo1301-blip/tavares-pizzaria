import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { ChefHat, BarChart3, LogOut, UtensilsCrossed, ChevronLeft, ChevronRight, Package, TicketPercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useOrder } from "@/context/OrderContext";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);

  const handleLogout = () => {
    navigate("/");
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-medium",
      isActive
        ? "bg-primary text-primary-foreground"
        : "text-foreground hover:bg-muted",
      isCollapsed && "justify-center px-2"
    );

  /* STORE TOGGLE */
  const { isStoreOpen, toggleStoreStatus } = useOrder();
  const [toggling, setToggling] = useState(false);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await toggleStoreStatus();
    } finally {
      setToggling(false);
    }
  };

  return (
    <aside
      className={cn(
        "bg-card border-r border-border min-h-screen flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo & Toggle */}
      <div className={cn("p-4 border-b border-border flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && <img src={logo} alt="Tavares Pizzaria" className="h-10" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 text-muted-foreground"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Store Status Toggle */}
      <div className={cn("px-4 py-4 border-b border-border transition-all", isCollapsed ? "flex justify-center" : "")}>
        <div className={cn("flex items-center gap-3", isCollapsed ? "flex-col" : "justify-between")}>
          <div className={cn("flex items-center gap-2", isCollapsed ? "hidden" : "flex")}>
            <div className={cn("w-2 h-2 rounded-full animate-pulse", isStoreOpen ? "bg-green-500" : "bg-red-500")} />
            <span className="text-sm font-medium">{isStoreOpen ? "Aberto" : "Fechado"}</span>
          </div>

          <Switch
            checked={isStoreOpen}
            onCheckedChange={handleToggle}
            disabled={toggling}
            className={isCollapsed ? "scale-75" : ""}
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-2 mt-4">
        <NavLink to="/cozinha" className={linkClass} title={isCollapsed ? "Cozinha" : undefined}>
          <ChefHat className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Cozinha</span>}
        </NavLink>
        <NavLink to="/admin/cardapio" className={linkClass} title={isCollapsed ? "Cardápio" : undefined}>
          <UtensilsCrossed className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Cardápio</span>}
        </NavLink>
        <NavLink to="/admin/relatorios" className={linkClass} title={isCollapsed ? "Relatórios" : undefined}>
          <BarChart3 className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Relatórios</span>}
        </NavLink>
        <NavLink to="/admin/estoque" className={linkClass} title={isCollapsed ? "Estoque" : undefined}>
          <Package className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Estoque</span>}
        </NavLink>
        <NavLink to="/admin/promocoes" className={linkClass} title={isCollapsed ? "Promoções" : undefined}>
          <TicketPercent className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Promoções</span>}
        </NavLink>
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          className={cn("w-full text-muted-foreground hover:text-foreground", isCollapsed ? "justify-center px-0" : "justify-start gap-3")}
          onClick={handleLogout}
          title={isCollapsed ? "Sair" : undefined}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!isCollapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
