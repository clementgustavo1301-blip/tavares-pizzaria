import { ShoppingCart, Menu, X, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/context/OrderContext";
import { useState, useEffect } from "react";
import logo from "@/assets/logo.png";
import { cn } from "@/lib/utils";

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { cartItemsCount } = useOrder();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on resize
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
        "sticky top-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-md"
          : "bg-background/80 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="Tavares Pizzaria" className="h-10 md:h-12 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#cardapio"
              className="text-foreground/80 hover:text-primary transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Cardápio
            </a>
            <a
              href="#sobre"
              className="text-foreground/80 hover:text-primary transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Sobre Nós
            </a>
            <a
              href="#contato"
              className="text-foreground/80 hover:text-primary transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Contato
            </a>
            <a
              href="/meus-pedidos"
              className="text-foreground/80 hover:text-primary transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Meus Pedidos
            </a>
            <a
              href="/login"
              className="text-foreground/80 hover:text-primary transition-colors font-medium relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-300"
            >
              Área Restrita
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={onCartClick}
              className="relative hover:border-primary"
              aria-label="Carrinho de compras"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in shadow-lg">
                  {cartItemsCount}
                </span>
              )}
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
            mobileMenuOpen ? "max-h-[400px] opacity-100 mt-4" : "max-h-0 opacity-0"
          )}
        >
          <nav className="flex flex-col gap-1 pb-4 border-t pt-4">
            <a
              href="#cardapio"
              className="text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors font-medium py-3 px-4 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cardápio
            </a>
            <a
              href="#sobre"
              className="text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors font-medium py-3 px-4 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sobre Nós
            </a>
            <a
              href="#contato"
              className="text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors font-medium py-3 px-4 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contato
            </a>
            <a
              href="/meus-pedidos"
              className="text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors font-medium py-3 px-4 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              Meus Pedidos
            </a>
            <a
              href="/login"
              className="flex items-center gap-2 text-foreground/80 hover:text-primary hover:bg-primary/5 transition-colors font-medium py-3 px-4 rounded-lg"
              onClick={() => setMobileMenuOpen(false)} // Certifique-se de que, ao clicar, o menu feche automaticamente
            >
              <Lock className="h-4 w-4" /> {/* Ícone: Use um ícone de cadeado (Lock). */}
              Área Restrita
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
