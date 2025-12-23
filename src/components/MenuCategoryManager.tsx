import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";
import { getPizzaImageByName } from "@/utils/imageHelper";

interface MenuItem {
    id: string;
    name: string;
    price: number;
    description: string | null;
    image_url: string | null;
    available: boolean;
    category: string;
}

interface MenuCategoryManagerProps {
    title: string;
    categories: string[]; // Categories to fetch/display
    categoryOptions: string[]; // Categories available in dropdown for Add/Edit
}

export function MenuCategoryManager({ title, categories, categoryOptions }: MenuCategoryManagerProps) {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        category: categoryOptions[0] || "",
        price: "",
        description: "",
        image_url: "",
    });
    const [saving, setSaving] = useState(false);
    const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);

    useEffect(() => {
        fetchItems();
    }, [categories]); // Re-fetch if categories prop changes

    const fetchItems = async () => {
        setLoading(true);
        try {
            // We fetch all and filter client-side or use .in() query
            // Using .in() is better for performance if list is small, but strings might vary (legacy data).
            // Let's fetch all active categories we care about.
            const { data, error } = await supabase
                .from("menu_items")
                .select("*")
                .in('category', categories) // This assumes strict matching. If legacy data uses different names, we might miss them.
                .order("name");

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error("Error fetching items:", error);
            toast.error("Erro ao carregar itens");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (item?: MenuItem) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                category: item.category,
                price: item.price.toFixed(2).replace(".", ","),
                description: item.description || "",
                image_url: item.image_url || "",
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: "",
                category: categoryOptions[0] || "",
                price: "",
                description: "",
                image_url: "",
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price || !formData.category) {
            toast.error("Preencha os campos obrigatórios (Nome, Preço, Categoria)");
            return;
        }

        const priceNum = parseFloat(formData.price.replace(",", "."));
        if (isNaN(priceNum) || priceNum <= 0) {
            toast.error("Preço inválido");
            return;
        }

        setSaving(true);
        try {
            let finalImageUrl = formData.image_url;
            if (!finalImageUrl && formData.name) {
                // Try to auto-generate image url if empty
                const autoImage = getPizzaImageByName(formData.name);
                if (typeof autoImage === 'string' && autoImage.trim() !== '') {
                    finalImageUrl = autoImage;
                }
            }

            const itemData = {
                name: formData.name,
                category: formData.category,
                price: priceNum,
                description: formData.description,
                image_url: finalImageUrl,
            };

            if (editingItem) {
                // Update
                const { error } = await supabase
                    .from("menu_items")
                    .update(itemData)
                    .eq("id", editingItem.id);

                if (error) throw error;
                toast.success("Item atualizado!");
                // Update local state to avoid full refetch if possible, or just refetch
                fetchItems();
            } else {
                // Create
                const { error } = await supabase
                    .from("menu_items")
                    .insert([{ ...itemData, available: true }]);

                if (error) throw error;
                toast.success("Novo item adicionado!");
                fetchItems();
            }

            setIsModalOpen(false);
        } catch (error: any) {
            console.error("Error saving item:", error);
            if (error.code === "401" || error.status === 401) {
                toast.error("Erro de Permissão: Verifique as políticas do Supabase.");
            } else {
                toast.error("Erro ao salvar item");
            }
        } finally {
            setSaving(false);
        }
    };

    const handleToggleAvailability = async (item: MenuItem) => {
        const newAvailable = !item.available;
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
        } catch (error) {
            console.error("Error toggling availability:", error);
            toast.error("Erro ao atualizar disponibilidade");
        }
    };

    const handleDelete = async () => {
        if (!deletingItem) return;

        try {
            const { error } = await supabase
                .from("menu_items")
                .delete()
                .eq("id", deletingItem.id);

            if (error) throw error;

            setItems((prev) => prev.filter((i) => i.id !== deletingItem.id));
            toast.success("Item removido");
        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error("Erro ao remover item");
        } finally {
            setDeletingItem(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">{title}</h2>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Item
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-20">Imagem</TableHead>
                            <TableHead>Nome</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead className="w-[100px] text-center">Disponível</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : items.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    Nenhum item encontrado nesta categoria.
                                </TableCell>
                            </TableRow>
                        ) : (
                            items.map((item) => (
                                <TableRow key={item.id} className={!item.available ? "opacity-60 bg-muted/30" : ""}>
                                    <TableCell>
                                        <img
                                            src={item.image_url || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=100&h=100&fit=crop"}
                                            alt={item.name}
                                            className={`w-12 h-12 object-cover rounded-md ${!item.available ? "grayscale" : ""}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        <div className="flex flex-col">
                                            <span>{item.name}</span>
                                            {item.description && (
                                                <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                                    {item.description}
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {item.category}
                                    </TableCell>
                                    <TableCell>
                                        R$ {item.price.toFixed(2).replace(".", ",")}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={item.available}
                                            onCheckedChange={() => handleToggleAvailability(item)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(item)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive hover:bg-destructive/10"
                                            onClick={() => setDeletingItem(item)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? "Editar Item" : "Novo Item"}</DialogTitle>
                        <DialogDescription>
                            Preencha os dados do item.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome *</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Calabresa"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="category">Categoria *</Label>
                                <Select
                                    value={formData.category}
                                    onValueChange={(val) => setFormData({ ...formData, category: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categoryOptions.map((opt) => (
                                            <SelectItem key={opt} value={opt}>
                                                {opt}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="price">Preço (R$) *</Label>
                                <Input
                                    id="price"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0,00"
                                    type="number" // Note: Input with type="number" doesn't work well with commas in standard HTML, but let's stick to text or handle simple logic
                                // Keeping it "text" to allow commas is safer given previous code used replace(",", ".") on string
                                />
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Descrição</Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Ingredientes, detalhes..."
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="image_url">URL da Imagem</Label>
                            <Input
                                id="image_url"
                                value={formData.image_url}
                                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                                placeholder="https://..."
                            />
                            <p className="text-xs text-muted-foreground">
                                Deixe em branco para tentar imagem automática.
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving}>
                            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Item?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita.
                            {deletingItem && ` Isso removerá permanentemente "${deletingItem.name}".`}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
