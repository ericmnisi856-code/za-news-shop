import type { Category } from "./types";

export const FEEDS: Record<Category, { name: string; url: string }[]> = {
  Politics: [
    { name: "Mail & Guardian", url: "https://mg.co.za/section/politics/feed/" },
    { name: "The South African", url: "https://thesouthafrican.com/news/politics/feed/" },
    { name: "The Citizen", url: "https://thecitizen.co.za/news/south-africa/politics/feed/" },
    { name: "Polity SA", url: "https://polity.org.za/page/rss-feed/feed:news" },
    { name: "Daily Maverick", url: "https://www.dailymaverick.co.za/feed/" },
    { name: "News24", url: "http://feeds.news24.com/articles/news24/TopStories/rss" },
  ],
  Sports: [
    { name: "SuperSport", url: "https://supersport.com/rss/" },
    { name: "SA Rugby Magazine", url: "https://www.sarugbymag.co.za/feed/" },
    { name: "Soccer Laduma", url: "https://www.soccerladuma.co.za/rss/" },
    { name: "The South African", url: "https://thesouthafrican.com/sport/feed/" },
    { name: "Mail & Guardian", url: "https://mg.co.za/section/sport/feed/" },
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
