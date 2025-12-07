/**
 * Normalize a string by converting to lowercase and removing accents
 */
function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Image mapping for pizza keywords
 */
const pizzaImageMap: { keywords: string[]; url: string }[] = [
  {
    keywords: ["calabresa", "pepperoni"],
    url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=800&q=60",
  },
  {
    keywords: ["marguerita", "margherita"],
    url: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=60",
  },
  {
    keywords: ["portuguesa"],
    url: "https://images.unsplash.com/photo-1528137894217-fa3a0275670a?w=800&q=60",
  },
  {
    keywords: ["frango"],
    url: "https://images.unsplash.com/photo-1506354666786-959d6d497f1a?w=800&q=60",
  },
  {
    keywords: ["queijo", "mussarela", "quatro queijos"],
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=60",
  },
  {
    keywords: ["nordestina", "carne", "bacon"],
    url: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=60",
  },
  {
    keywords: ["chocolate", "doce", "brigadeiro", "nutella", "morango"],
    url: "https://images.unsplash.com/photo-1606349370958-228724c5f440?w=800&q=60",
  },
];

const DEFAULT_PIZZA_IMAGE =
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=60";

/**
 * Get a pizza image URL based on the pizza name.
 * Matches keywords in the name to return an appropriate image.
 * Falls back to a default pizza image if no keywords match.
 */
export function getPizzaImageByName(name: string): string {
  const normalizedName = normalizeString(name);

  for (const mapping of pizzaImageMap) {
    for (const keyword of mapping.keywords) {
      if (normalizedName.includes(keyword)) {
        return mapping.url;
      }
    }
  }

  return DEFAULT_PIZZA_IMAGE;
}

/**
 * Get a pizza image with database priority.
 * Uses the database image if available, otherwise falls back to keyword-based image.
 */
export function getPizzaImage(
  databaseImage: string | null | undefined,
  pizzaName: string
): string {
  if (databaseImage && databaseImage.trim() !== "") {
    return databaseImage;
  }
  return getPizzaImageByName(pizzaName);
}
