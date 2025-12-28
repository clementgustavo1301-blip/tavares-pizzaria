import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Flame, ShoppingCart } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { toast } from "sonner";
import Autoplay from "embla-carousel-autoplay";

interface Promotion {
    id: string;
    title: string;
    description: string | null;
    price: number | null;
    image_url: string | null;
    active: boolean;
    days_of_week: number[];
}

export function PromotionsBanner() {
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [loading, setLoading] = useState(true);
    const { addToCart, isStoreOpen } = useOrder();

    useEffect(() => {
        fetchPromotions();
    }, []);

    const fetchPromotions = async () => {
        try {
            const today = new Date().getDay(); // 0-6

            const { data, error } = await supabase
                .from("promotions")
                .select("*")
                .eq("active", true);

            if (error) throw error;

            // Filter client-side for days_of_week array containment
            const todaysPromos = (data || []).filter((p: Promotion) =>
                p.days_of_week && p.days_of_week.includes(today)
            );

            setPromotions(todaysPromos);
        } catch (error) {
            console.error("Error fetching promotions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = (promo: Promotion) => {
        // Logic to add a "generic" promo item or just navigate?
        // For now, let's treat it as a generic item or just show a toast if it's complex.
        // Ideally, a promotion might map to a specific pizza, but here it's generic.
        // We will add it as a custom item to the cart if it has a price.

        if (!promo.price) return;

        addToCart({
            id: `promo-${promo.id}`,
            name: promo.title,
            description: promo.description || "Promoção do dia",
            price: promo.price,
            image: promo.image_url || "/placeholder.svg",
            category: "Promoção",
            ingredients: [],
            isVegetarian: false
        });
        toast.success("Promoção adicionada ao carrinho!");
    };

    if (loading) return null; // Don't show loader to avoid layout shift, just render nothing until loaded
    if (promotions.length === 0) return null;

    return (
        <div className="w-full mb-8">
            <div className="flex items-center gap-2 mb-4 px-1">
                <Flame className="h-5 w-5 text-orange-500 fill-orange-500 animate-pulse" />
                <h2 className="text-xl font-bold text-foreground">Ofertas de Hoje</h2>
            </div>

            <Carousel
                opts={{
                    align: "start",
                    loop: true,

                }}
                plugins={[
                    Autoplay({
                        delay: 4000,
                    }),
                ]}
                className="w-full"
            >
                <CarouselContent className="-ml-2 md:-ml-4">
                    {promotions.map((promo) => (
                        <CarouselItem key={promo.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                            <Card className="border-none shadow-md bg-card overflow-hidden h-full flex flex-col group">
                                <div className="relative aspect-[16/9] overflow-hidden">
                                    <img
                                        src={promo.image_url || "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=800&h=400&fit=crop"}
                                        alt={promo.title}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <div>
                                            <h3 className="text-white font-bold text-lg leading-tight text-shadow">{promo.title}</h3>
                                            {promo.price && (
                                                <Badge className="mt-1 bg-yellow-400 text-yellow-900 border-yellow-500 hover:bg-yellow-500">
                                                    R$ {promo.price.toFixed(2).replace(".", ",")}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="p-4 flex-1 flex flex-col justify-between">
                                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {promo.description}
                                    </p>
                                    {promo.price ? (
                                        <Button
                                            className="w-full font-semibold"
                                            size="sm"
                                            onClick={() => handleAddToCart(promo)}
                                            disabled={!isStoreOpen}
                                        >
                                            <ShoppingCart className="mr-2 h-4 w-4" />
                                            Adicionar
                                        </Button>
                                    ) : (
                                        <Button variant="secondary" className="w-full" disabled>
                                            Apenas Presencial / Telefone
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}
