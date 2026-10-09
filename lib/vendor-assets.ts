import { ImageSourcePropType } from "react-native";

type Kind = "logo" | "campaign" | "product";

const assets: Record<string, Record<Kind, ImageSourcePropType>> = {
  bolapsd: {
    logo: require("@/assets/brands/bolapsd.png"),
    campaign: require("@/assets/brands/bolacampaign.jpg"),
    product: require("@/assets/brands/bolapsdpolo.png"),
  },
  "iyoo-cartel": {
    logo: require("@/assets/brands/iyoocartel.png"),
    campaign: require("@/assets/brands/iyoocampaign.jpg"),
    product: require("@/assets/brands/iyoocartel.png"),
  },
  bonfo: {
    logo: require("@/assets/brands/bonfo.png"),
    campaign: require("@/assets/brands/bonfocampaign.jpg"),
    product: require("@/assets/brands/bonfotrouser.png"),
  },
  "the-chrome-pilgrim": {
    logo: require("@/assets/brands/TCP.png"),
    campaign: require("@/assets/brands/tcpcampaign.png"),
    product: require("@/assets/brands/TCP.png"),
  },
  greaterthan00: {
    logo: require("@/assets/brands/ssx_logo.png"),
    campaign: require("@/assets/brands/iyoocampaign.jpg"),
    product: require("@/assets/brands/ssx_logo.png"),
  },
};

const placeholder: ImageSourcePropType = require("@/assets/images/sslogo.png");

export function vendorImage(
  slug: string,
  kind: Kind,
  url?: string | null,
): ImageSourcePropType {
  if (url) return { uri: url };
  return assets[slug]?.[kind] ?? placeholder;
}
const scheduleFallbacks: Record<string, ImageSourcePropType> = {
  DROP: require("@/assets/brands/iyoocampaign.jpg"),
  STAGE: require("@/assets/brands/bolacampaign.jpg"),
  DJ: require("@/assets/brands/bonfocampaign.jpg"),
};

export function scheduleImage(
  category: string,
  url?: string | null,
): ImageSourcePropType {
  if (url) return { uri: url };
  return scheduleFallbacks[category] ?? placeholder;
}