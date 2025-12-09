export interface Pizza {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  image: string;
  isVegetarian?: boolean;
  category?: string;
}

export const pizzas: Pizza[] = [
  {
    id: "calabresa",
    name: "Calabresa",
    description: "O clássico brasileiro com linguiça calabresa defumada e cebola caramelizada",
    ingredients: ["Molho de tomate", "Mussarela", "Calabresa fatiada", "Cebola"],
    price: 45.90,
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=600&h=400&fit=crop&q=80",
  },
  {
    id: "portuguesa",
    name: "Portuguesa",
    description: "Receita tradicional com ingredientes selecionados e ovo de codorna",
    ingredients: ["Molho de tomate", "Mussarela", "Presunto", "Ovo", "Cebola", "Ervilha", "Azeitona"],
    price: 49.90,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop&q=80",
  },
  {
    id: "marguerita",
    name: "Marguerita",
    description: "Simplicidade italiana com manjericão fresco colhido na hora",
    ingredients: ["Molho de tomate San Marzano", "Mussarela de búfala", "Tomate", "Manjericão fresco"],
    price: 42.90,
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=600&h=400&fit=crop&q=80",
    isVegetarian: true,
  },
  {
    id: "frango-catupiry",
    name: "Frango c/ Catupiry",
    description: "Combinação cremosa e irresistível com frango desfiado artesanal",
    ingredients: ["Molho de tomate", "Mussarela", "Frango desfiado", "Catupiry original", "Milho"],
    price: 52.90,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&q=80",
  },
];
