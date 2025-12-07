import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import logo from "@/assets/logo.png";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password === "admin123") {
      navigate("/cozinha");
    } else {
      setError("Senha incorreta");
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

            <Button type="submit" className="w-full" size="lg">
              Entrar
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              ← Voltar ao site
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
