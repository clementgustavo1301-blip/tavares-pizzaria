import { MapPin, Phone, Clock, Instagram, Facebook } from "lucide-react";
import logo from "@/assets/logo.png";

export function Footer() {
  return <footer id="contato" className="bg-foreground text-primary-foreground py-8">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <img src={logo} alt="Tavares Pizzaria" className="h-12 w-auto mb-3" />
          <p className="text-primary-foreground/70 text-xs">Desde 2025 servindo as melhores pizzas da cidade.</p>
          <div className="flex gap-3 mt-3">
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-primary-foreground">
              <Facebook className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Contato</h3>
          <ul className="space-y-2 text-xs">
            <li className="flex items-start gap-2">
              <MapPin className="h-3 w-3 mt-0.5 text-primary-foreground/60" />
              <span className="text-primary-foreground/70">
                R. Delmiro Rocha, 268<br />
                Alto de São Manoel, Mossoró - RN
              </span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="h-3 w-3 text-primary-foreground/60" />
              <span className="text-primary-foreground/70">(84) 9929-9186</span>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold mb-3">Horário</h3>
          <div className="flex items-start gap-2 text-xs">
            <Clock className="h-3 w-3 mt-0.5 text-primary-foreground/60" />
            <div className="text-primary-foreground/70">
              <p>Sábado e Domingo</p>
              <p className="font-medium">18:00 - 23:00</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 mt-6 pt-6 text-center text-xs text-primary-foreground/50">
        <p>© {new Date().getFullYear()} Tavares Pizzaria</p>
      </div>
    </div>
  </footer>;
}