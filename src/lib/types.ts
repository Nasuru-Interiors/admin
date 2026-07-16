export interface ArticleListItem {
  id: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  featured: boolean;
  published_at: string | null;
  updated_at: string;
  cover_image_url: string | null;
}

export interface ArticleFull extends ArticleListItem {
  excerpt: string;
  content_html: string;
  cover_public_id: string | null;
  meta_title: string;
  meta_description: string;
  keywords: string[];
  author: string;
  article_categories?: { category_id: string }[];
}

export interface Hero {
  heading: string;
  subheading: string;
  cta_label: string;
  cta_href: string;
  secondary_cta_label: string;
  secondary_cta_href: string;
  background_type: 'image' | 'color';
  background_color: string;
  text_color: string;
  overlay_opacity: number;
  image_url: string | null;
  image_public_id: string | null;
}

export interface SiteSettings {
  business_name: string;
  tagline: string;
  logo_url: string | null;
  logo_public_id: string | null;
  primary_color: string;
  secondary_color: string;
  default_hero_color: string;
  phone: string;
  whatsapp: string;
  whatsapp_greeting: string;
  email: string;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number | null;
  lng: number | null;
  facebook_url: string;
  instagram_url: string;
  twitter_url: string;
  linkedin_url: string;
  default_meta_title: string;
  default_meta_description: string;
}

export interface CarouselItem {
  id: string;
  image_url: string;
  public_id: string | null;
  alt: string;
  caption: string;
  sort_order: number;
  active: boolean;
}

export interface AboutContent {
  headline: string;
  subheading: string;
  body_html: string;
  image_url: string | null;
  image_public_id: string | null;
  stats: { label: string; value: string }[];
  team: { name: string; role: string; image_url?: string }[];
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface Stats {
  articles: number;
  published: number;
  drafts: number;
  carousel: number;
  categories: number;
}
