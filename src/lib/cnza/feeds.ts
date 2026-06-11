import type { Category } from "./types";

export const FEEDS: Record<Category, { name: string; url: string }[]> = {
  Politics: [
    { name: "Daily Maverick", url: "https://www.dailymaverick.co.za/feed/" },
    { name: "News24", url: "http://feeds.news24.com/articles/news24/TopStories/rss" },
  ],
  Sports: [
    { name: "SuperSport", url: "https://supersport.com/rss/" },
    { name: "Sport24", url: "http://feeds.news24.com/articles/sport/featured/rss" },
  ],
  Technology: [
    { name: "MyBroadband", url: "https://mybroadband.co.za/news/feed/" },
    { name: "TechCentral", url: "https://techcentral.co.za/feed/" },
  ],
  Business: [
    { name: "BusinessTech", url: "https://businesstech.co.za/news/feed/" },
    { name: "Moneyweb", url: "https://www.moneyweb.co.za/feed/" },
  ],
  Leisure: [
    { name: "Food24", url: "http://feeds.news24.com/articles/Food24/Home/rss" },
    { name: "The Inside Guide", url: "https://insideguide.co.za/feed/" },
  ],
};
