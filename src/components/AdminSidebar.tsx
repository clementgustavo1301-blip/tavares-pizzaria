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
      "flex items-center gap-3 px-3 py-2 rounded text-sm",
      isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted",
      isCollapsed && "justify-center px-2"
    );

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
        "bg-card border-r min-h-screen flex flex-col",
        isCollapsed ? "w-16" : "w-56"
      )}
    >
      <div className={cn("p-3 border-b flex items-center", isCollapsed ? "justify-center" : "justify-between")}>
        {!isCollapsed && <img src={logo} alt="Tavares Pizzaria" className="h-8" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-7 w-7"
        >
          {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </Button>
      </div>

      <div className={cn("px-3 py-3 border-b", isCollapsed ? "flex justify-center" : "")}>
        <div className={cn("flex items-center gap-2", isCollapsed ? "flex-col" : "justify-between")}>
          <div className={cn("flex items-center gap-2 text-sm", isCollapsed && "hidden")}>
            <div className={cn("w-2 h-2 rounded-full", isStoreOpen ? "bg-green-500" : "bg-red-500")} />
            <span>{isStoreOpen ? "Aberto" : "Fechado"}</span>
          </div>
          <Switch
            checked={isStoreOpen}
            onCheckedChange={handleToggle}
            disabled={toggling}
            className={isCollapsed ? "scale-75" : ""}
          />
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 mt-2">
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

      <div className="p-3 border-t">
        <Button
          variant="ghost"
          className={cn("w-full text-sm", isCollapsed ? "justify-center px-0" : "justify-start gap-2")}
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
