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
import { Save, Loader2, Plus, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getPizzaImageByName } from "@/utils/imageHelper";

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
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "Tradicionais",
    price: "",
    description: "",
    image_url: "",
  });

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

  const handleAddItem = async () => {
    if (!newItem.name || !newItem.price) {
      toast.error("Nome e preço são obrigatórios");
      return;
    }

    // Handle price input allowing comma
    const priceNum = parseFloat(newItem.price.replace(",", "."));
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Preço inválido");
      return;
    }

    setIsAdding(true);
    try {
      let finalImageUrl = newItem.image_url;
      if (!finalImageUrl) {
        finalImageUrl = getPizzaImageByName(newItem.name);
      }

      // Check if image is just empty whitespace
      if (typeof finalImageUrl === 'string' && finalImageUrl.trim() === '') {
        finalImageUrl = getPizzaImageByName(newItem.name);
      }

      const { data, error } = await supabase
        .from("menu_items")
        .insert([
          {
            name: newItem.name,
            category: newItem.category,
            price: priceNum,
            description: newItem.description,
            image_url: finalImageUrl,
            available: true,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      toast.success("Pizza adicionada com sucesso!");

      if (data) {
        setItems((prev) => [data, ...prev]);
        setEditedPrices((prev) => ({
          ...prev,
          [data.id]: data.price.toFixed(2).replace(".", ","),
        }));
      }

      setIsAddModalOpen(false);
      setNewItem({
        name: "",
        category: "Tradicionais",
        price: "",
        description: "",
        image_url: "",
      });
    } catch (err: any) {
      console.error("Error adding item:", err);
      if (err.code === "401" || err.status === 401) {
        toast.error("Erro de Permissão: Você precisa configurar as Policies do Supabase para permitir criar itens.");
      } else {
        toast.error("Erro ao adicionar pizza: " + (err.message || "Erro desconhecido"));
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteItem = async () => {
    if (!itemToDelete) return;

    setIsDeleting(true);
    try {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemToDelete.id);

      if (error) throw error;

      setItems((prev) => prev.filter((item) => item.id !== itemToDelete.id));
      toast.success(`"${itemToDelete.name}" foi removido do cardápio.`);
      setItemToDelete(null);
    } catch (err: any) {
      console.error("Error deleting item:", err);
      if (err.code === "401" || err.status === 401) {
        toast.error("Erro de Permissão: Você precisa configurar as Policies do Supabase para permitir criar itens.");
      } else {
        toast.error("Erro ao excluir item");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
              Gerenciar Cardápio
            </h1>
            <p className="text-muted-foreground">
              Atualize preços e disponibilidade dos itens do cardápio.
            </p>
          </div>

          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Pizza
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Pizza</DialogTitle>
                <DialogDescription>
                  Preencha os dados abaixo para adicionar um novo item ao cardápio.
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome *</Label>
                  <Input
                    id="name"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                    placeholder="Ex: Calabresa"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="category">Categoria</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(val) =>
                        setNewItem({ ...newItem, category: val })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tradicionais">
                          Tradicionais
                        </SelectItem>
                        <SelectItem value="Doces">Doces</SelectItem>
                        <SelectItem value="Especiais">Especiais</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="price">Preço (R$) *</Label>
                    <Input
                      id="price"
                      value={newItem.price}
                      onChange={(e) =>
                        setNewItem({ ...newItem, price: e.target.value })
                      }
                      placeholder="0,00"
                      type="number" // Changing to number as requested, but keeping text handling in logic
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição (Ingredientes)</Label>
                  <Textarea
                    id="description"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    placeholder="Ex: Molho de tomate, mussarela..."
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="image_url">URL da Imagem</Label>
                  <Input
                    id="image_url"
                    value={newItem.image_url}
                    onChange={(e) =>
                      setNewItem({ ...newItem, image_url: e.target.value })
                    }
                    placeholder="https://..."
                  />
                  <p className="text-xs text-muted-foreground">
                    Deixe em branco para usar imagem automática.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsAddModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button onClick={handleAddItem} disabled={isAdding}>
                  {isAdding && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                        className={`w-14 h-14 object-cover rounded-lg ${!item.available ? "grayscale" : ""
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
                      <div className="flex items-center justify-center gap-2">
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
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setItemToDelete(item)}
                          disabled={savingId === item.id || togglingId === item.id}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <AlertDialog
          open={!!itemToDelete}
          onOpenChange={(open) => !open && setItemToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente a
                pizza "{itemToDelete?.name}" do cardápio.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  handleDeleteItem();
                }}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
