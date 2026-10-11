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

export type SizeStock = { size: string; stock: number };

export type Product = {
  id: string;
  vendor_id: string;
  name: string;
  price_ngn: number;
  image_url: string | null;
  is_featured: boolean;
  department: "MENS" | "WOMENS" | "UNISEX";
  topic_id: string | null;
  description: string | null;
  gallery: string[];
  stock: number;
  size_stock: SizeStock[];
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
export type LineupArtist = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
};
export type FestivalEvent = {
  id: string;
  slug: string;
  title: string;
  badge: string | null;
  location: string | null;
  date_label: string | null;
  description: string | null;
  cover_url: string | null;
  sort_order: number;
  starts_on: string | null;
  ends_on: string | null;
};
export type Topic = {
  id: string;
  label: string;
  sort_order: number;
};

export type NewsPost = {
  id: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  cover_url: string | null;
  video_url: string | null;
  topic_id: string | null;
  published_at: string;
};
