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
import { toast } from "sonner";
import { Plus, Trash2, Edit, Loader2 } from "lucide-react";

interface CrustOption {
    id: string;
    name: string;
    price: number;
    is_active: boolean;
}

export function CrustManager() {
    const [crusts, setCrusts] = useState<CrustOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCrust, setEditingCrust] = useState<CrustOption | null>(null);
    const [formData, setFormData] = useState({ name: "", price: "" });
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    useEffect(() => {
        fetchCrusts();
    }, []);

    const fetchCrusts = async () => {
        try {
            console.log("Fetching crusts...");
            const { data, error } = await supabase
                .from("crust_options")
                .select("*")
                .order("name", { ascending: true });

            if (error) throw error;
            console.log("Crusts fetched:", data);
            setCrusts(data || []);
        } catch (error) {
            console.error("Error fetching crusts:", error);
            toast.error("Erro ao carregar bordas");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (crust?: CrustOption) => {
        if (crust) {
            setEditingCrust(crust);
            setFormData({
                name: crust.name,
                price: crust.price.toFixed(2).replace(".", ",")
            });
        } else {
            setEditingCrust(null);
            setFormData({ name: "", price: "" });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price) {
            toast.error("Preencha todos os campos");
            return;
        }

        const priceNum = parseFloat(formData.price.replace(",", "."));
        if (isNaN(priceNum)) {
            toast.error("Preço inválido");
            return;
        }

        setSaving(true);
        try {
            if (editingCrust) {
                // Update
                const { error } = await supabase
                    .from("crust_options")
                    .update({ name: formData.name, price: priceNum })
                    .eq("id", editingCrust.id);

                if (error) throw error;
                toast.success("Borda atualizada!");
            } else {
                // Create
                const { error } = await supabase
                    .from("crust_options")
                    .insert([{ name: formData.name, price: priceNum, is_active: true }]);

                if (error) throw error;
                toast.success("Nova borda adicionada!");
            }

            fetchCrusts();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving crust:", error);
            toast.error("Erro ao salvar borda");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (crust: CrustOption) => {
        const newStatus = !crust.is_active;
        console.log(`Toggling status for ${crust.name} to ${newStatus}`);

        try {
            const { error } = await supabase
                .from("crust_options")
                .update({ is_active: newStatus })
                .eq("id", crust.id);

            if (error) throw error;

            console.log("Status updated via Supabase");

            setCrusts(prev => prev.map(c =>
                c.id === crust.id ? { ...c, is_active: newStatus } : c
            ));
            toast.success(`Status de "${crust.name}" alterado para ${newStatus ? 'Ativo' : 'Inativo'}`);
        } catch (error) {
            console.error("Error toggling status:", error);
            toast.error("Erro ao atualizar status");
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;

        try {
            const { error } = await supabase
                .from("crust_options")
                .delete()
                .eq("id", deletingId);

            if (error) throw error;

            setCrusts(prev => prev.filter(c => c.id !== deletingId));
            toast.success("Borda removida");
        } catch (error) {
            console.error("Error deleting crust:", error);
            toast.error("Erro ao remover borda");
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Opções de Borda</h2>
                <Button onClick={() => handleOpenModal()}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Borda
                </Button>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Preço</TableHead>
                            <TableHead className="w-[100px] text-center">Status</TableHead>
                            <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : crusts.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                    Nenhuma borda cadastrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            crusts.map((crust) => (
                                <TableRow key={crust.id} className={!crust.is_active ? "opacity-60 bg-muted/30" : ""}>
                                    <TableCell className="font-medium">{crust.name}</TableCell>
                                    <TableCell>
                                        {crust.price === 0 ? <span className="text-green-600 font-medium">Grátis</span> : `+ R$ ${crust.price.toFixed(2).replace(".", ",")}`}
                                    </TableCell>
                                    <TableCell className="text-center">
                                        <Switch
                                            checked={crust.is_active}
                                            onCheckedChange={() => handleToggleStatus(crust)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(crust)}>
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => setDeletingId(crust.id)}>
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
                        <DialogTitle>{editingCrust ? "Editar Borda" : "Nova Borda"}</DialogTitle>
                        <DialogDescription>
                            Preencha os dados da borda. O preço será somado ao valor da pizza.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Nome</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ex: Catupiry"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="price">Preço (R$)</Label>
                            <Input
                                id="price"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                placeholder="0,00"
                            />
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

            <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Excluir Borda?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Isso removerá permanentemente a opção de borda.
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
