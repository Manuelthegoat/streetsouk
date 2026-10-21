// "Bola PSD" and "BOLAPSD." both become "bolapsd", so Zappie brands and your brand pages match up
export const brandKey = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]/g, "");