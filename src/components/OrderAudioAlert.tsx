import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import alertSound from "../assets/alert.mp3";

export function OrderAudioAlert() {
    const [audioAllowed, setAudioAllowed] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const hasNotifiedRef = useRef(false);

    useEffect(() => {
        // Initialize audio object
        audioRef.current = new Audio(alertSound);

        // Try to play silent audio to check/request permission
        // or just check if we can autoplay.
        // Browsers block autoplay unless interaction happened.
        // We'll rely on a user interaction button if needed.
    }, []);

    useEffect(() => {
        const channel = supabase
            .channel("global-order-alert")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "orders" },
                (payload) => {
                    if (payload.new.status === "pending" || payload.new.status === "aguardando") {
                        playAlert();
                        toast.info("🔔 Novo Pedido Chegou!", {
                            description: `Pedido #${payload.new.id.slice(0, 8)}`,
                            duration: 5000,
                        });
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const playAlert = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch((error) => {
                console.warn("Audio autoplay blocked:", error);
                setAudioAllowed(false);
            });
        }
    };

    const enableAudio = () => {
        setAudioAllowed(true);
        if (audioRef.current) {
            audioRef.current.play().then(() => {
                audioRef.current!.pause();
                audioRef.current!.currentTime = 0;
            }).catch((err) => {
                console.error("Could not enable audio on button click:", err);
                setAudioAllowed(false); // Fallback se realmente for bloqueado
            });
        }
    };

    useEffect(() => {
        const handleGlobalInteraction = () => {
            if (!audioAllowed && !hasNotifiedRef.current) {
                hasNotifiedRef.current = true;
                setAudioAllowed(true);

                if (audioRef.current) {
                    audioRef.current.play().then(() => {
                        audioRef.current!.pause();
                        audioRef.current!.currentTime = 0;
                    }).catch((err) => {
                        console.warn("Global audio activation failed:", err);
                    });
                }

                window.removeEventListener('click', handleGlobalInteraction, { capture: true });
                window.removeEventListener('touchstart', handleGlobalInteraction, { capture: true });
            }
        };

        if (!audioAllowed) {
            window.addEventListener('click', handleGlobalInteraction, { capture: true });
            window.addEventListener('touchstart', handleGlobalInteraction, { capture: true });
        }

        return () => {
            window.removeEventListener('click', handleGlobalInteraction, { capture: true });
            window.removeEventListener('touchstart', handleGlobalInteraction, { capture: true });
        };
    }, [audioAllowed]);

    // If we think audio is allowed (or we want to be unobtrusive), return null.
    // Unless we specifically detected a block. 
    // For now, let's show a small button if we suspect we need interaction, 
    // or just show it always until clicked? 
    // Let's rely on the catch block setting audioAllowed to false to show the button.

    if (audioAllowed) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            <Button
                onClick={enableAudio}
                variant="destructive"
                size="sm"
                className="shadow-lg animate-bounce"
            >
                <VolumeX className="mr-2 h-4 w-4" />
                Ativar Som de Pedidos
            </Button>
        </div>
    );
}
