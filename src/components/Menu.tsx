import { pizzas } from "@/data/pizzas";
import { PizzaCard } from "./PizzaCard";

export function Menu() {
  return (
    <section id="cardapio" className="py-16 bg-paper">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
            Nosso Cardápio
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pizzas artesanais preparadas com ingredientes frescos e massa feita
            diariamente, assadas em forno a lenha.
          </p>
          <div className="w-24 h-1 bg-primary mx-auto mt-6 rounded-full" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pizzas.map((pizza, index) => (
            <div
              key={pizza.id}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <PizzaCard pizza={pizza} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
