export type ZMoney = { amount_minor: number; currency: string };

export type ZChoice = {
  id: string;
  name: string;
  price: ZMoney;
  available: boolean;
};

export type ZOptionGroup = {
  id: string;
  name: string;
  kind: "attribute" | "choice" | "text";
  required: boolean;
  min: number;
  max: number;
  choices: ZChoice[];
  help_text?: string;
  placeholder?: string;
};

export type ZVariant = {
  id: string;
  choice_ids: string[];
  price: ZMoney;
  available: boolean;
  low_stock: boolean;
};

export type ZItem = {
  id: string;
  name: string;
  description?: string;
  images: string[];
  price: ZMoney;
  previous_price?: ZMoney;
  available: boolean;
  stock_label?: string;
  fulfilment: string[];
  variants: ZVariant[];
  option_groups: ZOptionGroup[];
  min_quantity?: number;
  max_quantity?: number;
};

export type ZCategory = { id: string; name: string; item_ids: string[] };

export type ZMenu = {
  id: string;
  name: string;
  layout: string;
  is_active: boolean;
  fulfilment: string[];
  categories: ZCategory[];
};

export type ZMenus = {
  menu_version: string;
  completeness: "complete" | "partial";
  menus: ZMenu[];
  items: Record<string, ZItem>;
};

export type ZBranch = {
  id: string;
  name: string;
  slug: string;
  is_default: boolean;
  is_open: boolean;
  currency: string;
  fulfilment: {
    pickup: boolean;
    delivery: boolean;
    scheduled: boolean;
    dine_in: boolean;
  };
};

export type ZStore = {
  id: string;
  slug: string;
  name: string;
  currency: string;
  branches: ZBranch[];
  payment_methods: string[];
};
export type ZIssue = {
  code: string;
  severity: "blocking" | "warning" | "info";
  message: string;
  line_id?: string;
};

export type ZQuoteLine = {
  line_id: string;
  item_id: string;
  name: string;
  quantity: number;
  unit_price: ZMoney | null;
  line_total: ZMoney | null;
  status: "ok" | "invalid";
};

export type ZQuoteCharge = { code: string; label: string; amount: ZMoney };

export type ZQuote = {
  currency: string;
  lines: ZQuoteLine[];
  subtotal: ZMoney;
  charges: ZQuoteCharge[];
  discounts: ZQuoteCharge[];
  total: ZMoney;
  issues: ZIssue[];
  can_checkout: boolean;
};