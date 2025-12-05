export interface Pizza {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  price: number;
  image: string;
  isVegetarian?: boolean;
}

export const pizzas: Pizza[] = [
  {
    id: "calabresa",
    name: "Calabresa",
    description: "O clássico brasileiro com linguiça calabresa defumada",
    ingredients: ["Molho de tomate", "Mussarela", "Calabresa", "Cebola"],
    price: 45.90,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
  },
  {
    id: "portuguesa",
    name: "Portuguesa",
    description: "Receita tradicional com ingredientes selecionados",
    ingredients: ["Molho de tomate", "Mussarela", "Presunto", "Ovo", "Cebola", "Ervilha", "Azeitona"],
    price: 49.90,
    image: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&h=300&fit=crop",
  },
  {
    id: "marguerita",
    name: "Marguerita",
    description: "Simplicidade italiana com manjericão fresco",
    ingredients: ["Molho de tomate", "Mussarela de búfala", "Tomate", "Manjericão fresco"],
    price: 42.90,
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=400&h=300&fit=crop",
    isVegetarian: true,
  },
  {
    id: "frango-catupiry",
    name: "Frango c/ Catupiry",
    description: "Combinação cremosa e irresistível",
    ingredients: ["Molho de tomate", "Mussarela", "Frango desfiado", "Catupiry", "Milho"],
    price: 52.90,
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop",
  },
];
