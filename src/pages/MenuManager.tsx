import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  available: boolean;
}

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop";

export default function MenuManager() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedPrices, setEditedPrices] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("id, name, price, image_url, available")
        .order("name");

      if (error) throw error;

      setItems(data || []);
      // Initialize edited prices with current values
      const prices: Record<string, string> = {};
      data?.forEach((item) => {
        prices[item.id] = item.price.toFixed(2).replace(".", ",");
      });
      setEditedPrices(prices);
    } catch (err) {
      console.error("Error fetching menu items:", err);
      toast.error("Erro ao carregar cardápio");
    } finally {
      setLoading(false);
    }
  };

  const handlePriceChange = (id: string, value: string) => {
    // Allow only numbers and comma
    const formatted = value.replace(/[^0-9,]/g, "");
    setEditedPrices((prev) => ({ ...prev, [id]: formatted }));
  };

  const handleSavePrice = async (item: MenuItem) => {
    const priceStr = editedPrices[item.id];
    const priceNum = parseFloat(priceStr.replace(",", "."));

    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Preço inválido");
      return;
    }

    setSavingId(item.id);
    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ price: priceNum })
        .eq("id", item.id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, price: priceNum } : i))
      );
      toast.success(`Preço de "${item.name}" atualizado!`);
    } catch (err) {
      console.error("Error updating price:", err);
      toast.error("Erro ao atualizar preço");
    } finally {
      setSavingId(null);
    }
  };

  const handleToggleAvailability = async (item: MenuItem) => {
    const newAvailable = !item.available;
    setTogglingId(item.id);

    try {
      const { error } = await supabase
        .from("menu_items")
        .update({ available: newAvailable })
        .eq("id", item.id);

      if (error) throw error;

      setItems((prev) =>
        prev.map((i) => (i.id === item.id ? { ...i, available: newAvailable } : i))
      );
      toast.success(
        newAvailable
          ? `"${item.name}" agora está disponível`
          : `"${item.name}" marcado como esgotado`
      );
    } catch (err) {
      console.error("Error toggling availability:", err);
      toast.error("Erro ao atualizar disponibilidade");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Gerenciar Cardápio
          </h1>
          <p className="text-muted-foreground">
            Atualize preços e disponibilidade dos itens do cardápio.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            Nenhum item no cardápio.
          </p>
        ) : (
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-20">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead className="w-36">Preço (R$)</TableHead>
                  <TableHead className="w-32 text-center">Disponível</TableHead>
                  <TableHead className="w-32 text-center">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow
                    key={item.id}
                    className={!item.available ? "opacity-60 bg-muted/30" : ""}
                  >
                    <TableCell>
                      <img
                        src={item.image_url || PLACEHOLDER_IMAGE}
                        alt={item.name}
                        className={`w-14 h-14 object-cover rounded-lg ${
                          !item.available ? "grayscale" : ""
                        }`}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">R$</span>
                        <Input
                          value={editedPrices[item.id] || ""}
                          onChange={(e) =>
                            handlePriceChange(item.id, e.target.value)
                          }
                          className="w-24"
                          placeholder="0,00"
                        />
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Switch
                          checked={item.available}
                          onCheckedChange={() => handleToggleAvailability(item)}
                          disabled={togglingId === item.id}
                        />
                        <span className="text-sm text-muted-foreground w-20">
                          {item.available ? "Disponível" : "Esgotado"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        onClick={() => handleSavePrice(item)}
                        disabled={savingId === item.id}
                      >
                        {savingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-1" />
                            Salvar
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
