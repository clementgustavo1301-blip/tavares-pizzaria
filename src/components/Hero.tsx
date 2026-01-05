import { Button } from "@/components/ui/button";
import heroBg from "@/assets/hero-bg.jpg";

export function Hero() {
  return <section className="relative min-h-[70vh] flex items-center justify-center">
    <div className="absolute inset-0 bg-cover bg-center" style={{
      backgroundImage: `url(${heroBg})`
    }} />
    <div className="absolute inset-0 bg-foreground/60" />

    <div className="relative z-10 container mx-auto px-4 text-center">
      <img
        alt="Tavares Pizzaria"
        src="/lovable-uploads/5f90581f-0c87-4f5b-9f44-6a29e1493657.png"
        className="mx-auto h-32 w-auto mb-4 rounded-full"
      />
      <h1 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-3">
        Tradição em cada fatia
      </h1>
      <p className="text-sm md:text-base text-primary-foreground/80 mb-6 max-w-xl mx-auto">
        Pizzas artesanais com ingredientes selecionados
      </p>
      <Button variant="hero" size="default" asChild>
        <a href="#cardapio">Ver Cardápio</a>
      </Button>
    </div>
  </section>;
}