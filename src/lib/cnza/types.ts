export type Category = "Politics" | "Sports" | "Technology" | "Business" | "Leisure";

export const CATEGORIES: Category[] = ["Politics", "Sports", "Technology", "Business", "Leisure"];

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
