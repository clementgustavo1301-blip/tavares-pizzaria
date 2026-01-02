import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AdminLayout from "@/components/AdminLayout";

interface UnavailableIngredient {
    id: string;
    name: string;
}

export default function StockControl() {
    const [ingredients, setIngredients] = useState<UnavailableIngredient[]>([]);
    const [newIngredient, setNewIngredient] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchIngredients();
    }, []);

    const fetchIngredients = async () => {
        try {
            const { data, error } = await supabase
                .from("unavailable_ingredients")
                .select("*")
                .order("created_at", { ascending: false });

            if (error) throw error;
            setIngredients(data || []);
        } catch (error) {
            console.error("Error fetching ingredients:", error);
            toast.error("Erro ao carregar estoque.");
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!newIngredient.trim()) return;

        try {
            const { error } = await supabase
                .from("unavailable_ingredients")
                .insert([{ name: newIngredient.trim().toLowerCase() }]);

            if (error) throw error;

            toast.success(`"${newIngredient}" bloqueado com sucesso!`);
            setNewIngredient("");
            fetchIngredients();
        } catch (error: unknown) {
            const err = error as { code?: string };
            if (err.code === "23505") {
                toast.error("Este ingrediente já está na lista.");
            } else {
                toast.error("Erro ao bloquear ingrediente.");
            }
        }
    };

    const handleRemove = async (id: string, name: string) => {
        try {
            const { error } = await supabase
                .from("unavailable_ingredients")
                .delete()
                .eq("id", id);

            if (error) throw error;

            toast.success(`"${name}" desbloqueado!`);
            fetchIngredients();
        } catch (error) {
            toast.error("Erro ao desbloquear ingrediente.");
        }
    };

    return (
        <AdminLayout>
            <div className="container mx-auto p-6 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">Controle de Estoque</h1>
                    <p className="text-muted-foreground">
                        Adicione ingredientes que estão em falta. Qualquer pizza que contenha estes ingredientes
                        (no nome ou descrição) ficará indisponível automaticamente.
                    </p>
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                    {/* Add Form */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-orange-500" />
                                Bloquear Ingrediente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Ex: Bacon, Catupiry..."
                                    value={newIngredient}
                                    onChange={(e) => setNewIngredient(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                                />
                                <Button onClick={handleAdd} disabled={!newIngredient.trim()}>
                                    <Plus className="h-4 w-4 md:mr-2" />
                                    <span className="hidden md:inline">Bloquear</span>
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                * O sistema salvará em minúsculas e comparará automaticamente.
                            </p>
                        </CardContent>
                    </Card>

                    {/* List */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Ingredientes em Falta</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="text-center py-4 text-muted-foreground">Carregando...</div>
                            ) : ingredients.length === 0 ? (
                                <div className="text-center py-8 border-2 border-dashed rounded-lg text-muted-foreground">
                                    Nenhum ingrediente em falta. <br /> Tudo certo no estoque! 🎉
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {ingredients.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center justify-between p-3 bg-destructive/10 border border-destructive/20 rounded-lg"
                                        >
                                            <span className="font-medium text-destructive">{item.name}</span>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleRemove(item.id, item.name)}
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AdminLayout>
    );
}
