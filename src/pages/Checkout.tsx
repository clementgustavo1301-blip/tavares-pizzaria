import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CreditCard, Banknote, QrCode, Loader2, Bike, Store, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useOrder } from "@/context/OrderContext";
import { toast } from "sonner";
import { formatCPF, formatCEP, cleanCEP, fetchAddressByCEP } from "@/utils/formatters";
import logo from "@/assets/logo.png";

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, cartTotal, placeOrder } = useOrder();
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cep, setCep] = useState("");

  // Refined Address States
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");

  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingCEP, setIsFetchingCEP] = useState(false);

  const PICKUP_ADDRESS = "R. Delmiro Rocha, 268 - Alto de São Manoel, Mossoró - RN, 59625-170";

  // Auto-fetch address when CEP is complete
  useEffect(() => {
    const cleanedCEP = cleanCEP(cep);

    if (cleanedCEP.length === 8) {
      setIsFetchingCEP(true);
      fetchAddressByCEP(cleanedCEP).then((data) => {
        if (data) {
          // Format address without number
          const formattedAddress = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          setAddress(formattedAddress);
          toast.success("Endereço encontrado!");
        } else {
          toast.error("CEP não encontrado. Preencha manualmente.");
        }
        setIsFetchingCEP(false);
      });
    }
  }, [cep]);

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatCPF(e.target.value));
  };

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCep(formatCEP(e.target.value));
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6">
            <img src={logo} alt="Tavares Pizzaria" className="h-20 mx-auto mb-4" />
            <h2 className="text-xl font-serif font-bold mb-2">Carrinho Vazio</h2>
            <p className="text-muted-foreground mb-4">
              Adicione pizzas ao carrinho para continuar.
            </p>
            <Button onClick={() => navigate("/")}>
              Ver Cardápio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedCPF = cpf.replace(/\D/g, "");

    // Validation depends on delivery type
    if (!name.trim() || cleanedCPF.length !== 11) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (deliveryType === "delivery") {
      if (!address.trim() || !number.trim()) {
        toast.error("Por favor, preencha o endereço e o número.");
        return;
      }
    }

    // Construct final address string
    let finalAddress = "Retirada na Loja";

    if (deliveryType === "delivery") {
      finalAddress = `${address}, Nº ${number}`;
      if (complement.trim()) {
        finalAddress += ` - ${complement}`;
      }
    }

    setIsSubmitting(true);

    try {
      const order = await placeOrder(name, finalAddress, paymentMethod, cleanedCPF, deliveryType);
      toast.success("Pedido realizado com sucesso!", {
        description: `Pedido #${order.id.slice(0, 8)}`,
      });
      navigate(`/pedido/${order.id}`);
    } catch (error) {
      toast.error("Erro ao realizar pedido. Tente novamente.");
      console.error("Order error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar ao Cardápio
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Resumo do Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cart.map((item) => (
                <div key={item.pizza.id} className="flex gap-4">
                  <img
                    src={item.pizza.image}
                    alt={item.pizza.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.pizza.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qtd: {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium">
                    R$ {(item.pizza.price * item.quantity).toFixed(2).replace(".", ",")}
                  </p>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Subtotal</span>
                <span>R$ {cartTotal.toFixed(2).replace(".", ",")}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">
                  {deliveryType === "delivery" ? "Entrega" : "Retirada"}
                </span>
                <span className="font-medium">
                  {deliveryType === "pickup" ? "Grátis" : "A combinar"}
                </span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total</span>
                <span className="text-xl font-bold text-primary">
                  R$ {cartTotal.toFixed(2).replace(".", ",")}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Checkout Form */}
          <Card>
            <CardHeader>
              <CardTitle className="font-serif">Dados da Entrega</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Info */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo *</Label>
                    <Input
                      id="name"
                      placeholder="Seu nome"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpf">CPF *</Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={cpf}
                      onChange={handleCPFChange}
                      required
                    />
                  </div>
                </div>

                <Separator />

                {/* Delivery Type Toggle */}
                <div className="space-y-3">
                  <Label>Tipo de Entrega</Label>
                  <RadioGroup
                    value={deliveryType}
                    onValueChange={(value) => setDeliveryType(value as "delivery" | "pickup")}
                    className="grid grid-cols-2 gap-3"
                  >
                    <div
                      className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${deliveryType === "delivery"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                        }`}
                      onClick={() => setDeliveryType("delivery")}
                    >
                      <RadioGroupItem value="delivery" id="delivery" className="sr-only" />
                      <Bike className={`h-5 w-5 ${deliveryType === "delivery" ? "text-primary" : "text-muted-foreground"}`} />
                      <Label htmlFor="delivery" className="cursor-pointer font-medium">
                        Entrega
                      </Label>
                    </div>
                    <div
                      className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-all ${deliveryType === "pickup"
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                        }`}
                      onClick={() => setDeliveryType("pickup")}
                    >
                      <RadioGroupItem value="pickup" id="pickup" className="sr-only" />
                      <Store className={`h-5 w-5 ${deliveryType === "pickup" ? "text-primary" : "text-muted-foreground"}`} />
                      <Label htmlFor="pickup" className="cursor-pointer font-medium">
                        Retirada
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Conditional Address Section */}
                {deliveryType === "delivery" ? (
                  <div className="space-y-4">
                    <h3 className="font-medium">Endereço de Entrega</h3>

                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <div className="relative">
                        <Input
                          id="cep"
                          placeholder="00000-000"
                          value={cep}
                          onChange={handleCEPChange}
                        />
                        {isFetchingCEP && (
                          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {/* Main Address Field - Simplified (No Textarea) */}
                      <Label htmlFor="address">Endereço (Rua, Bairro, Cidade)</Label>
                      <Input
                        id="address"
                        placeholder="Rua das Flores, Centro..."
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="bg-muted/30"
                      />
                    </div>

                    {/* Number and Complement Side-by-Side */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-1 space-y-2">
                        <Label htmlFor="number">Número *</Label>
                        <Input
                          id="number"
                          placeholder="123"
                          value={number}
                          onChange={(e) => setNumber(e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="complement">Complemento <span className="text-muted-foreground font-normal">(Opcional)</span></Label>
                        <Input
                          id="complement"
                          placeholder="Apto, Bloco, Ao lado de..."
                          value={complement}
                          onChange={(e) => setComplement(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-secondary/10 border border-secondary/30 rounded-lg">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-secondary mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-secondary">Retirar em:</p>
                        <p className="text-foreground">{PICKUP_ADDRESS}</p>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label>Forma de Pagamento</Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                        <QrCode className="h-5 w-5 text-secondary" />
                        PIX
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="credit" id="credit" />
                      <Label htmlFor="credit" className="flex items-center gap-2 cursor-pointer flex-1">
                        <CreditCard className="h-5 w-5 text-primary" />
                        Cartão (na entrega)
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer flex-1">
                        <Banknote className="h-5 w-5 text-accent" />
                        Dinheiro
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Processando..." : "Confirmar Pedido"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
