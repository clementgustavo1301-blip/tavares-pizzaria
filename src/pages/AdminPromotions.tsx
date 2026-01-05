import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Plus, Trash2, Edit, Loader2, ImagePlus, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Promotion {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    image_url: string | null;
    is_active: boolean;
    days_of_week: number[]; // 0=Sun, 1=Mon, ...
}

const DAYS = [
    { id: 0, label: "Domingo" },
    { id: 1, label: "Segunda" },
    { id: 2, label: "Terça" },
    { id: 3, label: "Quarta" },
    { id: 4, label: "Quinta" },
    { id: 5, label: "Sexta" },
    { id: 6, label: "Sábado" },
];

export default function AdminPromotions() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
    const [formData, setFormData] = useState<{
        title: string;
        description: string;
        price: string;
        image_url: string;
        days_of_week: number[];
    }>({
        title: "",
        description: "",
        price: "",
        image_url: "",
        days_of_week: [],
    });
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);

    const fetchPromotions = useCallback(async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("promotions")
                .select("*")
                .order("is_active", { ascending: false });

            if (error) throw error;
            setPromotions(data || []);
        } catch (error) {
            console.error("Error fetching promotions:", error);
            toast.error("Erro ao carregar promoções.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPromotions();
    }, [fetchPromotions]);

    const handleOpenModal = (promo?: Promotion) => {
        if (promo) {
            setEditingPromo(promo);
            setFormData({
                title: promo.title,
                description: promo.description || "",
                price: promo.price ? promo.price.toFixed(2).replace(".", ",") : "",
                image_url: promo.image_url || "",
                days_of_week: promo.days_of_week || [],
            });
        } else {
            setEditingPromo(null);
            setFormData({
                title: "",
                description: "",
                price: "",
                image_url: "",
                days_of_week: [],
            });
        }
        setIsModalOpen(true);
    };

    const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!event.target.files || event.target.files.length === 0) return;

            const file = event.target.files[0];
            const fileExt = file.name.split(".").pop();
            const fileName = `promo-${Date.now()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from("menu-images")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("menu-images").getPublicUrl(filePath);
            setFormData({ ...formData, image_url: data.publicUrl });
            toast.success("Imagem enviada!");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Erro ao enviar imagem.");
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!formData.title || formData.days_of_week.length === 0) {
            toast.error("Preencha o título e selecione pelo menos um dia.");
            return;
        }

        setSaving(true);
        try {
            const priceNum = formData.price ? parseFloat(formData.price.replace(",", ".")) : null;

            const payload = {
                title: formData.title,
                description: formData.description,
                price: priceNum,
                image_url: formData.image_url,
                days_of_week: formData.days_of_week,
            };

            if (editingPromo) {
                const { error } = await supabase
                    .from("promotions")
                    .update(payload)
                    .eq("id", editingPromo.id);
                if (error) throw error;
                toast.success("Promoção atualizada!");
            } else {
                const { error } = await supabase
                    .from("promotions")
                    .insert([{ ...payload, is_active: true }]);
                if (error) throw error;
                toast.success("Promoção criada!");
            }
            setIsModalOpen(false);
            fetchPromotions();
        } catch (error) {
            console.error("Save error:", error);
            toast.error("Erro ao salvar promoção.");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (promo: Promotion) => {
        try {
            const { error } = await supabase
                .from("promotions")
                .update({ is_active: !promo.is_active })
                .eq("id", promo.id);

            if (error) throw error;

            setPromotions(prev => prev.map(p => p.id === promo.id ? { ...p, is_active: !p.is_active } : p));
            toast.success(`Promoção ${!promo.is_active ? "ativada" : "desativada"}.`);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao atualizar status.");
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        try {
            const { error } = await supabase.from("promotions").delete().eq("id", deletingId);
            if (error) throw error;
            setPromotions(prev => prev.filter(p => p.id !== deletingId));
            toast.success("Promoção removida.");
        } catch (error) {
            console.error(error);
            toast.error("Erro ao remover promoção.");
        } finally {
            setDeletingId(null);
        }
    };

    const toggleDay = (dayId: number) => {
        setFormData(prev => {
            const exists = prev.days_of_week.includes(dayId);
            if (exists) {
                return { ...prev, days_of_week: prev.days_of_week.filter(d => d !== dayId) };
            } else {
                return { ...prev, days_of_week: [...prev.days_of_week, dayId].sort() };
            }
        });
    };

    return (
        <div className="container mx-auto p-4 max-w-6xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Promoções</h2>
                <Button onClick={() => handleOpenModal()} size="sm">
                    <Plus className="mr-1 h-4 w-4" /> Nova
                </Button>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                </div>
            ) : promotions.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                    Nenhuma promoção cadastrada.
                </div>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16"></TableHead>
                            <TableHead>Título</TableHead>
                            <TableHead className="w-24">Preço</TableHead>
                            <TableHead className="w-48">Dias</TableHead>
                            <TableHead className="w-20 text-center">Status</TableHead>
                            <TableHead className="w-32 text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {promotions.map(promo => (
                            <TableRow key={promo.id} className={!promo.is_active ? "opacity-50" : ""}>
                                <TableCell>
                                    <img
                                        src={promo.image_url || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=80&h=80&fit=crop"}
                                        alt={promo.title}
                                        className="w-12 h-12 object-cover rounded"
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="font-medium">{promo.title}</div>
                                    {promo.description && (
                                        <div className="text-xs text-muted-foreground line-clamp-1">{promo.description}</div>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {promo.price ? `R$ ${promo.price.toFixed(2).replace(".", ",")}` : "-"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-wrap gap-1">
                                        {DAYS.map(day => (
                                            <span
                                                key={day.id}
                                                className={`text-[9px] px-1 py-0.5 rounded ${promo.days_of_week.includes(day.id) ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}
                                            >
                                                {day.label.slice(0, 3)}
                                            </span>
                                        ))}
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <Switch
                                        checked={promo.is_active}
                                        onCheckedChange={() => handleToggleStatus(promo)}
                                    />
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex gap-1 justify-end">
                                        <Button variant="ghost" size="sm" onClick={() => handleOpenModal(promo)}>
                                            <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={() => setDeletingId(promo.id)}>
                                            <Trash2 className="h-3 w-3 text-destructive" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base">{editingPromo ? "Editar" : "Nova Promoção"}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-3 py-2">
                        <div className="grid gap-1.5">
                            <Label className="text-xs">Título *</Label>
                            <Input
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                                placeholder="Ex: Terça Maluca"
                                className="h-8 text-sm"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-xs">Preço</Label>
                            <Input
                                value={formData.price}
                                onChange={e => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0,00"
                                className="h-8 text-sm"
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-xs">Descrição</Label>
                            <Textarea
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Detalhes..."
                                className="text-sm resize-none"
                                rows={2}
                            />
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-xs">Dias *</Label>
                            <div className="flex flex-wrap gap-1.5">
                                {DAYS.map(day => (
                                    <div key={day.id} className="flex items-center space-x-1.5 border px-2 py-1 rounded text-xs cursor-pointer" onClick={() => toggleDay(day.id)}>
                                        <Checkbox
                                            id={`day-${day.id}`}
                                            checked={formData.days_of_week.includes(day.id)}
                                            onCheckedChange={() => toggleDay(day.id)}
                                            className="h-3 w-3"
                                        />
                                        <label htmlFor={`day-${day.id}`} className="cursor-pointer">
                                            {day.label}
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="grid gap-1.5">
                            <Label className="text-xs">Imagem</Label>
                            <div className="flex items-center gap-2">
                                {formData.image_url && (
                                    <img src={formData.image_url} alt="Preview" className="w-12 h-12 object-cover rounded border" />
                                )}
                                <label className="flex-1 cursor-pointer">
                                    <div className="flex items-center justify-center h-8 px-3 text-xs border rounded">
                                        {uploading ? <Loader2 className="mr-1.5 h-3 w-3 animate-spin" /> : <ImagePlus className="mr-1.5 h-3 w-3" />}
                                        {uploading ? "Enviando..." : "Carregar"}
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} size="sm">Cancelar</Button>
                        <Button onClick={handleSave} disabled={saving} size="sm">
                            {saving && <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />}
                            Salvar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <AlertDialog open={!!deletingId} onOpenChange={o => !o && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base">Excluir?</AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">Esta ação não pode ser desfeita.</AlertDialogDescription>
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
