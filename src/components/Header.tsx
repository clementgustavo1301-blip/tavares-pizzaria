import { ShoppingCart, Menu, X, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/context/OrderContext";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { cartItemsCount, isStoreOpen } = useOrder();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 bg-background border-b",
        scrolled && "shadow-sm"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="Tavares Pizzaria" className="h-10 w-auto rounded-full" />
          </a>

          <nav className="hidden md:flex items-center gap-6">
            <a href="/#cardapio" className="text-sm text-foreground/70 hover:text-foreground">
              Cardápio
            </a>
            <a href="/#sobre" className="text-sm text-foreground/70 hover:text-foreground">
              Sobre Nós
            </a>
            <a href="/#contato" className="text-sm text-foreground/70 hover:text-foreground">
              Contato
            </a>
            <Link to="/meus-pedidos" className="text-sm text-foreground/70 hover:text-foreground">
              Meus Pedidos
            </Link>
            <Link to="/login" className="text-sm text-foreground/70 hover:text-foreground">
              Área Restrita
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={onCartClick}
              className="relative"
            >
              <ShoppingCart className="h-4 w-4" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </Button>

            {!isStoreOpen && (
              <div className="hidden md:flex items-center gap-1.5 bg-red-50 text-red-600 px-2 py-1 rounded text-xs">
                <Lock className="h-3 w-3" />
                <span>Fechado</span>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div
          className={cn(
            "md:hidden overflow-hidden",
            mobileMenuOpen ? "max-h-64 mt-3" : "max-h-0"
          )}
        >
          <nav className="flex flex-col gap-1 pb-3 border-t pt-3">
            <a href="#cardapio" className="text-sm py-2 px-3 hover:bg-muted rounded" onClick={() => setMobileMenuOpen(false)}>
              Cardápio
            </a>
            <a href="#sobre" className="text-sm py-2 px-3 hover:bg-muted rounded" onClick={() => setMobileMenuOpen(false)}>
              Sobre Nós
            </a>
            <a href="#contato" className="text-sm py-2 px-3 hover:bg-muted rounded" onClick={() => setMobileMenuOpen(false)}>
              Contato
            </a>
            <Link to="/meus-pedidos" className="text-sm py-2 px-3 hover:bg-muted rounded" onClick={() => setMobileMenuOpen(false)}>
              Meus Pedidos
            </Link>
            <Link to="/login" className="text-sm py-2 px-3 hover:bg-muted rounded flex items-center gap-2" onClick={() => setMobileMenuOpen(false)}>
              <Lock className="h-3 w-3" />
              Área Restrita
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
