import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { Menu } from "@/components/Menu";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
const Index = () => {
  const [cartOpen, setCartOpen] = useState(false);
  return <div className="min-h-screen bg-background">
      <Header onCartClick={() => setCartOpen(true)} />
      <main>
        <Hero />
        <Menu />
        <section id="sobre" className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-6">
                Nossa História
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">A Tavares Pizzaria nasceu em 2025. Desde então, mantemos viva a tradição de preparar cada pizza com ingredientes frescos selecionados.</p>
              <p className="text-muted-foreground leading-relaxed">Nossa massa, preparada diariamente com todo cuidado, é o coração da nossa cozinha, garantindo uma pizza leve, crocante e com sabor inconfundível.</p>
              <div className="w-24 h-1 bg-primary mx-auto mt-8 rounded-full" />
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </div>;
};
export default Index;