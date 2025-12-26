import { useRef, useEffect } from "react";
import { Order } from "@/context/OrderContext";

interface OrderPrinterProps {
    order: Order | null;
}

export function OrderPrinter({ order }: OrderPrinterProps) {
    if (!order) return null;

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
