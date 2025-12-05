import { ShoppingCart, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOrder } from "@/context/OrderContext";
import { useState } from "react";
import logo from "@/assets/logo.png";

interface HeaderProps {
  onCartClick: () => void;
}

export function Header({ onCartClick }: HeaderProps) {
  const { cartItemsCount } = useOrder();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <img src={logo} alt="Tavares Pizzaria" className="h-12 w-auto" />
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#cardapio"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Cardápio
            </a>
            <a
              href="#sobre"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Sobre Nós
            </a>
            <a
              href="#contato"
              className="text-foreground/80 hover:text-primary transition-colors font-medium"
            >
              Contato
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={onCartClick}
              className="relative"
              aria-label="Carrinho de compras"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-scale-in">
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
        {mobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col gap-4 animate-fade-in">
            <a
              href="#cardapio"
              className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Cardápio
            </a>
            <a
              href="#sobre"
              className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Sobre Nós
            </a>
            <a
              href="#contato"
              className="text-foreground/80 hover:text-primary transition-colors font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contato
            </a>
          </nav>
        )}
      </div>
    </header>
  );
}
