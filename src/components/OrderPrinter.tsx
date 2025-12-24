import { useRef, useEffect } from "react";
import { Order } from "@/context/OrderContext";

interface OrderPrinterProps {
    order: Order | null;
}

export function OrderPrinter({ order }: OrderPrinterProps) {
    if (!order) return null;

    return (
        <div className="hidden print:block print:w-[80mm] print:overflow-hidden print:font-mono print:text-xs text-black bg-white p-0 m-0">
            <style>{`
        @media print {
            body * {
                visibility: hidden;
            }
            #printable-content, #printable-content * {
                visibility: visible;
            }
            #printable-content {
                position: absolute;
                left: 0;
                top: 0;
                width: 80mm;
            }
            @page {
                size: 80mm auto;
                margin: 0;
            }
        }
      `}</style>

            <div id="printable-content" className="p-2">
                {/* Header */}
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold uppercase mb-1">Tavares Pizzaria</h1>
                    <p className="text-[10px]">
                        {new Date(order.createdAt).toLocaleDateString("pt-BR")} - {new Date(order.createdAt).toLocaleTimeString("pt-BR")}
                    </p>
                    <p className="text-sm font-bold mt-2">
                        PEDIDO: {order.displayId || `#${order.id.slice(0, 8)}`}
                    </p>
                </div>

                <div className="border-b-2 border-dashed border-black my-2"></div>

                {/* Client Info */}
                <div className="mb-4">
                    <p className="font-bold text-sm truncate">{order.customerName}</p>
                    <p className="text-[10px] break-words">{order.customerAddress}</p>
                    <p className="text-[10px]">Tel: (XX) XXXXX-XXXX</p> {/* Placeholder if phone is not in Order type yet */}
                </div>

                <div className="border-b-2 border-dashed border-black my-2"></div>

                {/* Items */}
                <div className="space-y-2">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex flex-col">
                            <div className="flex justify-between items-start">
                                <span className="font-bold w-6">{item.quantity}x</span>
                                <span className="flex-1 font-bold">{item.pizza.name}</span>
                                <span className="text-right ml-2 min-w-[50px]">
                                    {item.pizza.price.toFixed(2).replace(".", ",")}
                                </span>
                            </div>
                            {item.observation && (
                                <p className="text-[10px] ml-6 font-bold uppercase mt-0.5">
                                    *** {item.observation} ***
                                </p>
                            )}
                        </div>
                    ))}
                </div>

                <div className="border-b-2 border-dashed border-black my-2"></div>

                {/* Totals */}
                <div className="flex justify-between items-center text-sm font-bold mt-2">
                    <span>TOTAL:</span>
                    <span className="text-lg">R$ {order.total.toFixed(2).replace(".", ",")}</span>
                </div>

                <div className="mt-4 text-[10px]">
                    <p>Pagamento: <span className="font-bold uppercase">{order.paymentMethod}</span></p>
                </div>

                <div className="text-center mt-8 text-[10px]">
                    <p>Obrigado pela preferência!</p>
                    <p>www.tavarespizzaria.com</p>
                </div>
            </div>
        </div>
    );
}
