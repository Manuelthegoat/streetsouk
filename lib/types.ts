export type Vendor = {
  id: string;
  slug: string;
  name: string;
  category: string;
  booth: string | null;
  detail: string | null;
  about: string | null;
  logo_url: string | null;
  campaign_url: string | null;
  is_sponsor: boolean;
  sort_order: number;
};

export type Product = {
  id: string;
  vendor_id: string;
  name: string;
  price_ngn: number;
  image_url: string | null;
  is_featured: boolean;
  department: "MENS" | "WOMENS" | "UNISEX";
  created_at: string;
};

export type ScheduleItem = {
  id: string;
  title: string;
  place: string;
  category: "DROP" | "STAGE" | "DJ";
  day_number: number;
  day_label: string | null;
  start_time: string;
  end_time: string | null;
  image_url: string | null;
  is_live: boolean;
};

export type FeedPost = {
  id: string;
  category: "DROPS" | "SCHEDULE" | "CROWD" | "INFO";
  title: string;
  detail: string;
  is_urgent: boolean;
  is_live: boolean;
  is_sold_out: boolean;
  published_at: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};