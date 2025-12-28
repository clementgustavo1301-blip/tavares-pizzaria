import { useState, useEffect } from "react";
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
import AdminLayout from "@/components/AdminLayout";

interface Promotion {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    image_url: string | null;
    active: boolean;
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

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("promotions")
                .select("*")
                .order("active", { ascending: false });

            if (error) throw error;
            setPromotions(data || []);
        } catch (error) {
            console.error("Error fetching promotions:", error);
            toast.error("Erro ao carregar promoções.");
        } finally {
            setLoading(false);
        }
    };

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
                    .insert([{ ...payload, active: true }]);
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
                .update({ active: !promo.active })
                .eq("id", promo.id);

            if (error) throw error;

            setPromotions(prev => prev.map(p => p.id === promo.id ? { ...p, active: !p.active } : p));
            toast.success(`Promoção ${!promo.active ? "ativada" : "desativada"}.`);
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
        <AdminLayout>
            <div className="space-y-6 container mx-auto p-4 md:p-8 pt-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Promoções Diárias</h2>
                        <p className="text-muted-foreground">Gerencie as ofertas automáticas por dia da semana.</p>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="mr-2 h-4 w-4" /> Nova Promoção
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : promotions.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-muted/20 rounded-lg">
                            <p className="text-muted-foreground">Nenhuma promoção cadastrada.</p>
                        </div>
                    ) : (
                        promotions.map(promo => (
                            <Card key={promo.id} className={!promo.active ? "opacity-60 grayscale" : ""}>
                                <div className="aspect-video w-full overflow-hidden relative group">
                                    <img
                                        src={promo.image_url || "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop"}
                                        alt={promo.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute top-2 right-2">
                                        <Switch
                                            checked={promo.active}
                                            onCheckedChange={() => handleToggleStatus(promo)}
                                        />
                                    </div>
                                </div>
                                <CardHeader className="p-4">
                                    <CardTitle className="flex justify-between items-start gap-2 text-lg">
                                        <span className="line-clamp-1">{promo.title}</span>
                                        {promo.price && <span className="text-primary whitespace-nowrap">R$ {promo.price.toFixed(2).replace(".", ",")}</span>}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground line-clamp-2 h-10">{promo.description}</p>

                                    <div className="flex flex-wrap gap-1 mt-3">
                                        {DAYS.map(day => (
                                            <span
                                                key={day.id}
                                                className={`text-[10px] px-1.5 py-0.5 rounded-sm uppercase font-bold ${promo.days_of_week.includes(day.id) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
                                            >
                                                {day.label.slice(0, 3)}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 mt-4 pt-2 border-t">
                                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleOpenModal(promo)}>
                                            <Edit className="h-4 w-4 mr-2" /> Editar
                                        </Button>
                                        <Button variant="outline" size="sm" className="flex-1 hover:bg-destructive/10 hover:text-destructive border-transparent" onClick={() => setDeletingId(promo.id)}>
                                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                                        </Button>
                                    </div>
                                </CardHeader>
                            </Card>
                        ))
                    )}
                </div>

                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingPromo ? "Editar Promoção" : "Nova Promoção"}</DialogTitle>
                        </DialogHeader>

                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Título *</Label>
                                <Input
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="Ex: Terça Maluca"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Preço (Opcional)</Label>
                                <Input
                                    value={formData.price}
                                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="0,00"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Descrição</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Detalhes da promoção..."
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label>Dias da Semana *</Label>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(day => (
                                        <div key={day.id} className="flex items-center space-x-2 border p-2 rounded-md cursor-pointer hover:bg-muted/50" onClick={() => toggleDay(day.id)}>
                                            <Checkbox
                                                id={`day-${day.id}`}
                                                checked={formData.days_of_week.includes(day.id)}
                                                onCheckedChange={() => toggleDay(day.id)}
                                            />
                                            <label htmlFor={`day-${day.id}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
                                                {day.label}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label>Imagem</Label>
                                <div className="flex items-center gap-4">
                                    {formData.image_url && (
                                        <img src={formData.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-md border" />
                                    )}
                                    <label className="flex-1 cursor-pointer">
                                        <div className="flex items-center justify-center w-full h-9 px-4 py-2 text-sm font-medium transition-colors border rounded-md hover:bg-accent hover:text-accent-foreground">
                                            {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                                            {uploading ? "Enviando..." : "Carregar Imagem"}
                                        </div>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
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

                <AlertDialog open={!!deletingId} onOpenChange={o => !o && setDeletingId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Excluir Promoção?</AlertDialogTitle>
                            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AdminLayout>
    );
}
