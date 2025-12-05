import { pizzas } from "@/data/pizzas";
import { PizzaCard } from "./PizzaCard";
export function Menu() {
  return <section id="cardapio" className="py-16 md:py-20 gradient-paper bg-paper-texture">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <span className="inline-block text-primary font-medium text-sm uppercase tracking-widest mb-3">
            Feito com amor
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-foreground mb-4">
            Nosso Cardápio
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base md:text-lg">Pizzas artesanais preparadas com ingredientes frescos e massa feita diariamente.</p>
          <div className="flex items-center justify-center gap-2 mt-6">
            <div className="w-12 h-0.5 bg-primary/30 rounded-full" />
            <div className="w-24 h-1 bg-primary rounded-full" />
            <div className="w-12 h-0.5 bg-primary/30 rounded-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {pizzas.map((pizza, index) => <div key={pizza.id} className="animate-fade-in" style={{
          animationDelay: `${index * 0.1}s`
        }}>
              <PizzaCard pizza={pizza} />
            </div>)}
        </div>
      </div>
    </section>;
}