import { MapPin, Phone, Clock, Instagram, Facebook } from "lucide-react";
import logo from "@/assets/logo.png";
export function Footer() {
  return <footer id="contato" className="bg-foreground text-primary-foreground py-12">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Logo & About */}
        <div>
          <img src={logo} alt="Tavares Pizzaria" className="h-20 w-auto mb-4" />
          <p className="text-primary-foreground/80 text-sm leading-relaxed">Desde 2025 servindo as melhores pizzas da cidade. Tradição familiar que atravessa gerações.</p>
          <div className="flex gap-4 mt-4">
            <a href="#" className="text-primary-foreground/70 hover:text-primary transition-colors" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" className="text-primary-foreground/70 hover:text-primary transition-colors" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-serif text-lg font-semibold mb-4">Contato</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <MapPin className="h-4 w-4 mt-0.5 text-primary" />
              <span className="text-primary-foreground/80">
                R. Delmiro Rocha, 268<br />
                Alto de São Manoel, Mossoró - RN, 59625-170
              </span>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-primary" />
              <span className="text-primary-foreground/80"> (84) 9929-9186</span>
            </li>
          </ul>
        </div>

        {/* Hours */}
        <div>
          <h3 className="font-serif text-lg font-semibold mb-4">Horário</h3>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-primary" />
              <div className="text-primary-foreground/80">
                <p>sábado e Domingo</p>
                <p className="font-medium">18:00 - 23:00</p>
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
        <p>© {new Date().getFullYear()} Tavares Pizzaria. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>;
}