export type AdFormat = "portrait" | "square";
export const adClients = [
  { id: "dax", label: "Eyewear" },
  { id: "nathaniels", label: "Food & beverage" },
  { id: "bedding", label: "Bedding" },
  { id: "pet-fountain", label: "Pet fountain" },
  { id: "health", label: "Health & wellness" },
  { id: "travel-bags", label: "Travel bags" },
] as const;
export type AdClient = (typeof adClients)[number]["id"];
export type Ad = { id: string; title: string; image: string; client: AdClient };

// Client work supplied by Leila: keep originals uncropped and unmodified.
export const adGalleries: Record<AdFormat, Ad[]> = {
  portrait: [
    {
      id: "bedding-rest",
      client: "bedding",
      title: "Rest & recovery",
      image: "/images/ads/bedding-rest.png",
    },
    {
      id: "bedding-support",
      client: "bedding",
      title: "Pillow support",
      image: "/images/ads/bedding-support.png",
    },
    {
      id: "dax-products",
      client: "dax",
      title: "Polarized collection",
      image: "/images/ads/dax-eyewear-products.png",
    },
    {
      id: "dax-upgrade",
      client: "dax",
      title: "Sunglasses upgrade",
      image: "/images/ads/dax-eyewear-upgrade.png",
    },
    {
      id: "dax-fashion",
      client: "dax",
      title: "Fashion collection",
      image: "/images/ads/dax-eyewear-fashion.png",
    },
    {
      id: "dax-value",
      client: "dax",
      title: "$85 comparison",
      image: "/images/ads/dax-eyewear-value.png",
    },
    {
      id: "dax-lux",
      client: "dax",
      title: "LUX collection",
      image: "/images/ads/dax-eyewear-lux.png",
    },
    {
      id: "dax-hair-tangle",
      client: "dax",
      title: "Hair-tangle solution",
      image: "/images/ads/dax-eyewear-hair-tangle.png",
    },
    {
      id: "nathaniels-world-food-day",
      client: "nathaniels",
      title: "World Food Day",
      image: "/images/ads/nathaniels-world-food-day.png",
    },
    {
      id: "nathaniels-juice-collection",
      client: "nathaniels",
      title: "Juice collection",
      image: "/images/ads/nathaniels-juice-collection.png",
    },
    {
      id: "nathaniels-menu",
      client: "nathaniels",
      title: "Menu design",
      image: "/images/ads/nathaniels-menu.png",
    },
  ],
  square: [
    {
      id: "travel-bags-colour-comparison",
      client: "travel-bags",
      title: "Packing cube colour comparison",
      image: "/images/ads/travel-bags-colour-comparison.png",
    },
    {
      id: "travel-bags-packing-cubes",
      client: "travel-bags",
      title: "Packing cubes product campaign",
      image: "/images/ads/travel-bags-packing-cubes.png",
    },
    {
      id: "health-gummies-benefits",
      client: "health",
      title: "Gummy supplement product layout",
      image: "/images/ads/health-gummies-benefits.png",
    },
    {
      id: "health-gummies-comparison",
      client: "health",
      title: "Gummies & capsules comparison",
      image: "/images/ads/health-gummies-comparison.png",
    },
    {
      id: "pet-fountain-features",
      client: "pet-fountain",
      title: "Water fountain features",
      image: "/images/ads/pet-fountain-features.png",
    },
    {
      id: "pet-fountain-clean-water",
      client: "pet-fountain",
      title: "Clean water for pets",
      image: "/images/ads/pet-fountain-clean-water.png",
    },
    {
      id: "bedding-gift",
      client: "bedding",
      title: "Comfort gift",
      image: "/images/ads/bedding-gift.png",
    },
    {
      id: "nathaniels-snack-time",
      client: "nathaniels",
      title: "Snack time",
      image: "/images/ads/nathaniels-snack-time.png",
    },
    {
      id: "nathaniels-avocado",
      client: "nathaniels",
      title: "Avocado ice cream",
      image: "/images/ads/nathaniels-avocado-ice-cream.png",
    },
    {
      id: "nathaniels-buko-pandan",
      client: "nathaniels",
      title: "Buko pandan juice",
      image: "/images/ads/nathaniels-buko-pandan.png",
    },
    {
      id: "nathaniels-care",
      client: "nathaniels",
      title: "Care reaction",
      image: "/images/ads/nathaniels-care-reaction.png",
    },
    {
      id: "nathaniels-dare-drink",
      client: "nathaniels",
      title: "Dare or drink",
      image: "/images/ads/nathaniels-dare-or-drink.png",
    },
    {
      id: "nathaniels-cheese",
      client: "nathaniels",
      title: "Cheese mamon & cupcakes",
      image: "/images/ads/nathaniels-cheese-bakes.png",
    },
  ],
};
