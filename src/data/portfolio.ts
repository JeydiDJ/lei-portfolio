import { adGalleries } from "./ads";

export type Section =
  | "work"
  | "about"
  | "experience"
  | "music"
  | "contact"
  | "tv"
  | "ads-portrait"
  | "ads-square";
export type Category =
  "All work" | "Advertising" | "Animation" | "Games" | "Overlays";
export const categories: Category[] = [
  "All work",
  "Advertising",
  "Animation",
  "Games",
  "Overlays",
];
// Portfolio content supplied by the client; keep collaborative roles accurately described.
export const profile = {
  name: "Lei",
  fullName: "Leila Rose Parungo",
  portrait: "/images/leila-parungo.png",
  tabletPortrait: "/images/leila-tablet-portrait.png",
  idPortrait: "/images/leila-id-portrait.png",
  introduction:
    "Creative all-rounder across design, ads, video, social media, and games.",
  bio: "Creative all-rounder working across graphic design, DTC ads, video editing, social media marketing, and game testing. I’ve been part of indie game projects like Quick Quack and enjoy building ideas into impactful experiences.",
  location: "Lubao, Pampanga",
  phone: "09776341153",
  website: "https://leilaparungo.my.canva.site/",
  email: "leilaparungo@gmail.com",
  linkedIn: "https://www.linkedin.com/in/leila-parungo-bb309231a/",
};
export const skills = [
  "Graphic design",
  "DTC ad creatives",
  "Video editing",
  "Social media marketing",
  "Game testing",
  "Basic 3D modeling",
];
export const tools = ["Canva", "Figma", "Adobe Audition", "ChatGPT", "Gemini"];
export const education = {
  degree: "BS Entertainment and Multimedia Computing",
  school: "Holy Angel University",
  period: "2021 – 2025",
};
export const learning = [
  {
    title: "Walk The Talk: Drafting The First Steps Into The Creative Industry",
    type: "Seminar",
    period: "2024",
  },
  {
    title: "Animation studio off-campus tour",
    type: "Studio visit",
    period: "2024",
  },
  {
    title: "On-The-Job Training Certificate of Completion",
    type: "Creative studio · Certification",
    period: "2024",
  },
];
export type Project = {
  id: string;
  title: string;
  category: Exclude<Category, "All work">;
  type: string;
  color: string;
  graphic: string;
  description: string;
  images?: string[];
};
export const projects: Project[] = [
  {
    id: "dax-eyewear",
    title: "Eyewear campaign",
    category: "Advertising",
    type: "Freelance client · Advertising design",
    color: "#781b20",
    graphic: "dax",
    description:
      "Advertising designs for a freelance sunglasses client, including product collections, comparison ads, and lifestyle promotions.",
    images: adGalleries.portrait
      .filter((ad) => ad.client === "dax")
      .map((ad) => ad.image),
  },
  {
    id: "nathaniels",
    title: "Food & beverage campaign",
    category: "Advertising",
    type: "Food & beverage · Advertising design",
    color: "#781b20",
    graphic: "nathaniels",
    description:
      "A collection of food and beverage advertising designs, from product promotions and seasonal posts to menu layouts.",
    images: [...adGalleries.portrait, ...adGalleries.square]
      .filter((ad) => ad.client === "nathaniels")
      .map((ad) => ad.image),
  },
  {
    id: "quick-quack",
    title: "Quick, Quack",
    category: "Games",
    type: "Collaborative game project",
    color: "#781b20",
    graphic: "quack",
    description:
      "A collaborative game project Leila helped create. The duck displayed on her PC is inspired by its character artwork.",
    images: ["/images/quick-quack-poster.png"],
  },
  {
    id: "bedding",
    title: "Bedding campaign",
    category: "Advertising",
    type: "Bedding · Advertising design",
    color: "#781b20",
    graphic: "bedding",
    description:
      "Pillow advertising designs in portrait and square formats, combining product imagery and Dutch-language campaign layouts.",
    images: [...adGalleries.square, ...adGalleries.portrait]
      .filter((ad) => ad.client === "bedding")
      .map((ad) => ad.image),
  },
  {
    id: "pet-fountain",
    title: "Pet fountain campaign",
    category: "Advertising",
    type: "Freelance client · Advertising design",
    color: "#781b20",
    graphic: "pet-fountain",
    description:
      "Square-format advertising designs for a freelance pet fountain client, featuring product benefits and pet-focused promotional layouts.",
    images: adGalleries.square
      .filter((ad) => ad.client === "pet-fountain")
      .map((ad) => ad.image),
  },
  {
    id: "health",
    title: "Health & wellness campaign",
    category: "Advertising",
    type: "Freelance client · Advertising design",
    color: "#781b20",
    graphic: "health",
    description:
      "Square-format advertising designs for a freelance health and wellness client, including a supplement product layout and a gummies-versus-capsules comparison.",
    images: adGalleries.square
      .filter((ad) => ad.client === "health")
      .map((ad) => ad.image),
  },
  {
    id: "travel-bags",
    title: "Travel bags campaign",
    category: "Advertising",
    type: "Freelance client · Advertising design",
    color: "#781b20",
    graphic: "travel-bags",
    description:
      "Square-format advertising designs for a freelance travel bag client, featuring packing cube colour options and a product-focused campaign layout.",
    images: adGalleries.square
      .filter((ad) => ad.client === "travel-bags")
      .map((ad) => ad.image),
  },
];
// Public industry labels respect the client's preference to omit employer names.
// Dates follow the seven role/date pairs in the supplied résumé.
export const experiences = [
  {
    id: "sound-internship",
    title: "Sound Design",
    role: "Internship",
    organization: "Game studio · Pampanga, Philippines",
    period: "Jun 2024 – Oct 2024",
    description:
      "Created sound effects and background music for games, modeled and textured 3D assets, and playtested for bugs.",
  },
  {
    id: "game-developer",
    title: "Game Developer",
    role: "Freelance",
    organization: "Indie games · Pampanga, Philippines",
    period: "Jun 2024 – Present",
    description:
      "Sound designer for Quick Quack. Created and textured basic 3D assets and handled the studio’s social media marketing and accounts.",
  },
  {
    id: "ads-designer",
    title: "Ads Graphic Designer",
    role: "Freelance",
    organization: "Advertising · Remote",
    period: "Mar 2025 – Present",
    description:
      "Created advertising graphics using Canva and ChatGPT for Facebook Ads.",
  },
  {
    id: "canva-designer",
    title: "Canva Designer",
    role: "Freelance",
    organization: "Education client · Remote",
    period: "Jun 2025 – Present",
    description: "Created graphic designs using Canva.",
  },
  {
    id: "content-creator",
    title: "Content Creator",
    role: "Freelance",
    organization: "Regional esports · Philippines",
    period: "Jun 2025 – Present",
    description: "Created gaming content for a regional esports community.",
  },
  {
    id: "marketing-admin",
    title: "Marketing Admin Assistant",
    role: "Contractual",
    organization: "Food & beverage",
    period: "Sep 2025 – Nov 2025",
    description: "Handled social media posting and packaging design.",
  },
  {
    id: "assistant-ads",
    title: "Assistant Ads Graphic Designer",
    role: "Freelance",
    organization: "Advertising · Remote",
    period: "Nov 2025 – Present",
    description: "Supported advertising graphic design using Figma.",
  },
];
export const experienceGroups = [
  { title: "Design & ads", entries: [2, 3, 6] },
  { title: "Games & sound", entries: [0, 1] },
  { title: "Marketing & content", entries: [4, 5] },
];
