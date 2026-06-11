export type Category = "Politics" | "Sports" | "Technology" | "Business" | "Leisure";

// Active news categories shown across the app. Business & Leisure are excluded
// from headlines and post feeds per editorial direction (kept in the Category
// type so existing store/product data remains valid).
export const CATEGORIES: Category[] = ["Politics", "Sports", "Technology"];

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  image?: string;
  source: string;
  link: string;
  category: Category;
  author: string;
  publishedAt: string;
  truncated?: boolean;
  custom?: boolean;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  description: string;
  category: Category;
  cover?: string;
  stock: number;
}

export interface CartItem {
  productId: string;
  quantity: number;
}
