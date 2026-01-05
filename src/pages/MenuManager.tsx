import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CrustManager } from "@/components/CrustManager";
import { MenuCategoryManager } from "@/components/MenuCategoryManager";

export default function MenuManager() {
  return (
    <>
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Gerenciar Cardápio
            </h1>
            <p className="text-muted-foreground">
              Gerencie seus produtos e opções do sistema.
            </p>
          </div>
        </div>

        <Tabs defaultValue="pizzas" className="w-full space-y-6">
          <TabsList>
            <TabsTrigger value="pizzas">Pizzas</TabsTrigger>
            <TabsTrigger value="drinks">Bebidas</TabsTrigger>
            <TabsTrigger value="desserts">Sobremesas</TabsTrigger>
            <TabsTrigger value="crusts">Bordas</TabsTrigger>
          </TabsList>

          <TabsContent value="pizzas">
            <MenuCategoryManager
              title="Pizzas"
              categories={[
                "Pizzas Tradicionais",
                "Pizzas Especiais",
                "Pizzas Doces",
                "Tradicionais",
                "Especiais",
                "Doces"
              ]}
              categoryOptions={[
                "Pizzas Tradicionais",
                "Pizzas Especiais",
                "Pizzas Doces"
              ]}
            />
          </TabsContent>

          <TabsContent value="drinks">
            <MenuCategoryManager
              title="Bebidas"
              categories={["Bebidas"]}
              categoryOptions={["Bebidas"]}
            />
          </TabsContent>

          <TabsContent value="desserts">
            <MenuCategoryManager
              title="Sobremesas"
              categories={["Sobremesas"]}
              categoryOptions={["Sobremesas"]}
            />
          </TabsContent>

          <TabsContent value="crusts">
            <CrustManager />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
