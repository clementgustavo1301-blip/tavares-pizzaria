import { useRef, useEffect, useState } from "react";
import { Order } from "@/context/OrderContext";
import { supabase } from "@/integrations/supabase/client";
import { formatOrderNumber } from "@/lib/formatOrderNumber";

interface OrderPrinterProps {
    order: Order | null;
}

export function OrderPrinter({ order }: OrderPrinterProps) {
    const [crustPrices, setCrustPrices] = useState<Record<string, number>>({});

    // Fetch crust prices
    useEffect(() => {
        const fetchCrustPrices = async () => {
            try {
                const { data, error } = await supabase
                    .from("crust_options")
                    .select("name, price");

                if (error) throw error;

                const pricesMap: Record<string, number> = {};
                data?.forEach((crust) => {
                    pricesMap[crust.name] = crust.price || 0;
                });
                setCrustPrices(pricesMap);
            } catch (error) {
                console.error("Error fetching crust prices:", error);
            }
        };

        fetchCrustPrices();
    }, []);

    if (!order) return null;

    // Calculate crust total from observations
    const crustTotal = order.items.reduce((sum, item) => {
        const observation = item.observation || "";
        const crustMatch = observation.match(/Borda:\s*([^.]+)/);
        if (crustMatch) {
            const crustName = crustMatch[1].trim();
            const crustPrice = crustPrices[crustName] || 0;
            return sum + (crustPrice * item.quantity);
        }
        return sum;
    }, 0);

    return (
        <div className="hidden print:block text-black bg-white p-0 m-0 font-mono text-xs leading-tight">
            <style>{`
        @media print {
            @page { margin: 0; size: 80mm auto; }
            body * { visibility: hidden; }
            #printable-content, #printable-content * { visibility: visible; }
            #printable-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 80mm;
                padding: 5px;
                background: white;
            }
        }
      `}</style>

            <div id="printable-content">
                <div className="text-center font-bold text-sm mb-1 uppercase">
                    TAVARES PIZZARIA
                </div>
                <div className="text-center font-bold text-base mb-1">
                    PEDIDO: {formatOrderNumber(order.displayId, order.id)}
                </div>
                <div className="text-center text-[10px] mb-1">
                    {new Date(order.createdAt).toLocaleDateString("pt-BR")} - {new Date(order.createdAt).toLocaleTimeString("pt-BR")}
                </div>

                <div className="text-center my-1 select-none">
                    --------------------------------
                </div>

                <div className="mb-2">
                    <p className="font-bold">CLIENTE:</p>
                    <p className="uppercase">{order.customerName}</p>
                    <p>{order.customerAddress}</p>
                    <p>Tel: (XX) XXXXX-XXXX</p>
                </div>

                <div className="text-center my-1 select-none">
                    --------------------------------
                </div>

                <div className="mb-2 space-y-2">
                    {order.items.map((item, index) => (
                        <div key={index}>
                            <div className="flex justify-between">
                                <span>{item.quantity}x {item.pizza.name}</span>
                                <span>{item.pizza.price.toFixed(2).replace(".", ",")}</span>
                            </div>
                            {item.observation && (
                                <div className="font-bold ml-4 mt-0.5 uppercase">
                                    ** {item.observation} **
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="text-center my-1 select-none">
                    --------------------------------
                </div>

                {/* Detalhamento dos valores */}
                <div className="space-y-1 text-[10px]">
                    <div className="flex justify-between">
                        <span>Subtotal (Pizzas):</span>
                        <span>R$ {(order.total - crustTotal).toFixed(2).replace(".", ",")}</span>
                    </div>
                    {crustTotal > 0 && (
                        <div className="flex justify-between">
                            <span>Bordas:</span>
                            <span>R$ {crustTotal.toFixed(2).replace(".", ",")}</span>
                        </div>
                    )}
                </div>

                <div className="flex justify-between font-bold text-sm mt-2">
                    <span>TOTAL:</span>
                    <span>R$ {order.total.toFixed(2).replace(".", ",")}</span>
                </div>
                <div className="text-xs mt-1">
                    Pagamento: <span className="font-bold uppercase">{order.paymentMethod}</span>
                </div>
            </div>
        </div>
    );
}
