import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail } from "lucide-react";
import logo from "@/assets/logo.png";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Se já existir uma sessão, redirecione IMEDIATAMENTE para /admin
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/admin", { replace: true });
      }
    };
    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      // Após signInWithPassword dar sucesso -> Forçe a navegação
      const from = location.state?.from?.pathname || "/admin";
      navigate(from, { replace: true });

    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message === "Invalid login credentials" ? "E-mail ou senha incorretos" : err.message);
      toast({
        variant: "destructive",
        title: "Erro ao entrar",
        description: err.message === "Invalid login credentials" ? "Verifique suas credenciais e tente novamente." : "Ocorreu um erro ao tentar fazer login.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-2xl shadow-elegant p-8 border border-border">
          <div className="flex flex-col items-center mb-8">
            <img src={logo} alt="Tavares Pizzaria" className="h-16 mb-4" />
            <h1 className="font-heading text-2xl text-foreground">Acesso Restrito</h1>
            <p className="text-muted-foreground text-sm mt-1">Área exclusiva para funcionários</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                E-mail
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@tavares.com"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-foreground font-medium">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Digite a senha"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-destructive text-sm font-medium text-center animate-fade-in">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Voltar ao site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
