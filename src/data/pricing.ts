export type PricingTier = {
  clients: number;
  wispro: number;
  acs: number;
  holaBasic: number;
  total: number;
};

export const pricingTiers: PricingTier[] = [
  { clients: 500, wispro: 130, acs: 90, holaBasic: 90, total: 310 },
  { clients: 600, wispro: 140, acs: 90, holaBasic: 90, total: 320 },
  { clients: 700, wispro: 150, acs: 90, holaBasic: 90, total: 330 },
  { clients: 800, wispro: 155, acs: 90, holaBasic: 90, total: 335 },
  { clients: 900, wispro: 160, acs: 90, holaBasic: 90, total: 340 },
  { clients: 1000, wispro: 180, acs: 90, holaBasic: 90, total: 360 },
  { clients: 1200, wispro: 195, acs: 97.5, holaBasic: 97.5, total: 390 },
  { clients: 1400, wispro: 210, acs: 105, holaBasic: 105, total: 420 },
  { clients: 1600, wispro: 225, acs: 112.5, holaBasic: 112.5, total: 450 },
  { clients: 1800, wispro: 240, acs: 120, holaBasic: 120, total: 480 },
  { clients: 2000, wispro: 255, acs: 127.5, holaBasic: 127.5, total: 510 },
  { clients: 2300, wispro: 270, acs: 135, holaBasic: 135, total: 540 },
  { clients: 2600, wispro: 285, acs: 142.5, holaBasic: 142.5, total: 570 },
  { clients: 2900, wispro: 300, acs: 150, holaBasic: 150, total: 600 },
  { clients: 3200, wispro: 315, acs: 157.5, holaBasic: 157.5, total: 630 },
  { clients: 3500, wispro: 330, acs: 165, holaBasic: 165, total: 660 },
  { clients: 4000, wispro: 340, acs: 170, holaBasic: 170, total: 680 },
  { clients: 4500, wispro: 345, acs: 172.5, holaBasic: 172.5, total: 690 },
  { clients: 5000, wispro: 350, acs: 175, holaBasic: 175, total: 700 },
  { clients: 5500, wispro: 360, acs: 180, holaBasic: 180, total: 720 },
  { clients: 6000, wispro: 370, acs: 185, holaBasic: 185, total: 740 },
  { clients: 6500, wispro: 380, acs: 190, holaBasic: 190, total: 760 },
  { clients: 7000, wispro: 390, acs: 195, holaBasic: 195, total: 780 },
  { clients: 7500, wispro: 400, acs: 200, holaBasic: 200, total: 800 },
  { clients: 8000, wispro: 410, acs: 205, holaBasic: 205, total: 820 },
  { clients: 8500, wispro: 420, acs: 210, holaBasic: 210, total: 840 },
  { clients: 9000, wispro: 430, acs: 215, holaBasic: 215, total: 860 },
  { clients: 9500, wispro: 440, acs: 220, holaBasic: 220, total: 880 },
  { clients: 10000, wispro: 450, acs: 225, holaBasic: 225, total: 900 },
  { clients: 11000, wispro: 460, acs: 230, holaBasic: 230, total: 920 },
  { clients: 12000, wispro: 470, acs: 235, holaBasic: 235, total: 940 },
  { clients: 13000, wispro: 480, acs: 240, holaBasic: 240, total: 960 },
  { clients: 14000, wispro: 490, acs: 245, holaBasic: 245, total: 980 },
  { clients: 15000, wispro: 500, acs: 250, holaBasic: 250, total: 1000 },
  { clients: 20000, wispro: 550, acs: 275, holaBasic: 275, total: 1100 },
  { clients: 30000, wispro: 650, acs: 325, holaBasic: 325, total: 1300 },
  { clients: 40000, wispro: 750, acs: 375, holaBasic: 375, total: 1500 },
  { clients: 50000, wispro: 850, acs: 425, holaBasic: 425, total: 1700 },
  { clients: 60000, wispro: 950, acs: 475, holaBasic: 475, total: 1900 },
  { clients: 70000, wispro: 1050, acs: 525, holaBasic: 525, total: 2100 },
  { clients: 80000, wispro: 1150, acs: 575, holaBasic: 575, total: 2300 },
  { clients: 90000, wispro: 1250, acs: 625, holaBasic: 625, total: 2500 },
  { clients: 100000, wispro: 1350, acs: 675, holaBasic: 675, total: 2700 },
];

export type Addon = {
  name: string;
  unitPrice: number;
};

export const addons: Addon[] = [
  { name: "Accesos extra", unitPrice: 5 },
  { name: "WhatsApp extra", unitPrice: 23 },
  { name: "Instagram", unitPrice: 23 },
  { name: "Messenger", unitPrice: 23 },
  { name: "Telegram", unitPrice: 23 },
  { name: "Chat web", unitPrice: 23 },
  { name: "Telefonía PBX", unitPrice: 78 },
  { name: "Página web", unitPrice: 20 },
];

export type HolaCloudPlan = {
  name: string;
  price: number;
};

export const holaCloudPlans: HolaCloudPlan[] = [
  { name: "Hola Cloud 2.000", price: 20 },
  { name: "Hola Cloud 5.000", price: 45 },
  { name: "Hola Cloud 10.000", price: 90 },
  { name: "Hola Cloud 20.000", price: 115 },
  { name: "Hola Cloud 40.000", price: 230 },
  { name: "Hola Cloud 60.000", price: 355 },
  { name: "Hola Cloud 100.000", price: 460 },
];

export function findTier(clientCount: number): PricingTier | null {
  // Find the tier that matches or the next one up
  for (let i = 0; i < pricingTiers.length; i++) {
    if (clientCount <= pricingTiers[i].clients) {
      return pricingTiers[i];
    }
  }
  return pricingTiers[pricingTiers.length - 1];
}
