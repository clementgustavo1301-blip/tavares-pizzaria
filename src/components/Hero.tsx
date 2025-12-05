import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import logo from "@/assets/logo.png";

export function Hero() {
  return (
    <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-foreground/70 via-foreground/50 to-foreground/80" />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <img
            src={logo}
            alt="Tavares Pizzaria"
            className="mx-auto h-40 md:h-56 w-auto mb-6 drop-shadow-2xl rounded-2xl bg-background/90 p-4"
          />
        </div>

        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-primary-foreground mb-4 animate-fade-in drop-shadow-lg"
          style={{ animationDelay: "0.4s" }}
        >
          Tradição em cada fatia
        </h1>

        <p
          className="text-lg md:text-xl text-primary-foreground/90 mb-8 max-w-2xl mx-auto animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          Pizzas artesanais feitas com ingredientes selecionados e muito amor,
          seguindo receitas que atravessam gerações.
        </p>

        <div
          className="animate-fade-in"
          style={{ animationDelay: "0.8s" }}
        >
          <Button
            variant="hero"
            size="xl"
            asChild
          >
            <a href="#cardapio">
              Ver Cardápio
              <ChevronDown className="ml-2 h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronDown className="h-8 w-8 text-primary-foreground/70" />
      </div>
    </section>
  );
}
