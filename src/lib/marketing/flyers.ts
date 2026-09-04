export type FlyerTemplate = {
  key: string;
  src: string;
  name: string;
  tag: string;
  agent: "Nehemias Maldonado" | "Tyler Standish" | "Team";
  address?: string;
};

// The team's real flyer designs (uploaded as PDFs, converted to images).
// These are finished raster artwork — per the design's own finding, they
// can't be text-edited, only downloaded, tinted, and sent as-is.
export const FLYERS: FlyerTemplate[] = [
  {
    key: "open-house-tropical-blue",
    src: "/marketing/flyers/open-house-tropical-blue.jpg",
    name: "Open House — Tropical Blue",
    tag: "Open house",
    agent: "Nehemias Maldonado",
    address: "3854 Buttercup Circle S, Palm Beach Gardens, FL",
  },
  {
    key: "open-house-game-day",
    src: "/marketing/flyers/open-house-game-day.jpg",
    name: "Open House — Game Day",
    tag: "Open house",
    agent: "Nehemias Maldonado",
    address: "3854 Buttercup Circle S, Palm Beach Gardens, FL",
  },
  {
    key: "new-listing-bold-red",
    src: "/marketing/flyers/new-listing-bold-red.jpg",
    name: "New Listing & Open House — Bold Red",
    tag: "New listing",
    agent: "Tyler Standish",
    address: "3854 Buttercup Circle S, Palm Beach Gardens, FL",
  },
  {
    key: "price-improvement-red",
    src: "/marketing/flyers/price-improvement-red.jpg",
    name: "Open House — Price Improvement",
    tag: "Price change",
    agent: "Nehemias Maldonado",
    address: "415 SW 61st Terrace, Margate, FL",
  },
  {
    key: "open-house-gold-statement",
    src: "/marketing/flyers/open-house-gold-statement.jpg",
    name: "Open House — Gold Statement",
    tag: "Open house",
    agent: "Team",
    address: "3854 Buttercup Circle S, Palm Beach Gardens, FL",
  },
  {
    key: "just-price-improvement",
    src: "/marketing/flyers/just-price-improvement.jpg",
    name: "Just Price Improvement",
    tag: "Price change",
    agent: "Nehemias Maldonado",
    address: "10339 Daphne Avenue, Palm Beach Gardens, FL",
  },
  {
    key: "under-contract-yellow",
    src: "/marketing/flyers/under-contract-yellow.jpg",
    name: "Under Contract — Yellow Bold",
    tag: "Sold / under contract",
    agent: "Nehemias Maldonado",
    address: "10339 Daphne Avenue, Palm Beach Gardens, FL",
  },
  {
    key: "open-house-pink-yellow",
    src: "/marketing/flyers/open-house-pink-yellow.jpg",
    name: "Open House — Pink & Yellow Pop",
    tag: "Open house",
    agent: "Nehemias Maldonado",
    address: "10339 Daphne Avenue, Palm Beach Gardens, FL",
  },
  {
    key: "open-house-coastal-teal",
    src: "/marketing/flyers/open-house-coastal-teal.jpg",
    name: "Open House — Coastal Teal",
    tag: "Open house",
    agent: "Tyler Standish",
    address: "3958 SW Brunswick Street, Port St. Lucie, FL",
  },
  {
    key: "open-house-yellow-classic",
    src: "/marketing/flyers/open-house-yellow-classic.jpg",
    name: "Open House — Yellow Classic",
    tag: "Open house",
    agent: "Nehemias Maldonado",
    address: "10339 Daphne Avenue, Palm Beach Gardens, FL",
  },
  {
    key: "price-improvement-bold-yellow",
    src: "/marketing/flyers/price-improvement-bold-yellow.jpg",
    name: "Price Improvement — Bold Yellow",
    tag: "Price change",
    agent: "Nehemias Maldonado",
    address: "10339 Daphne Avenue, Palm Beach Gardens, FL",
  },
  {
    key: "coming-soon-golden-hour",
    src: "/marketing/flyers/coming-soon-golden-hour.jpg",
    name: "Coming Soon — Golden Hour Rental",
    tag: "Coming soon",
    agent: "Team",
  },
  {
    key: "open-house-crimson-editorial",
    src: "/marketing/flyers/open-house-crimson-editorial.jpg",
    name: "Open House — Crimson Editorial",
    tag: "Open house",
    agent: "Tyler Standish",
    address: "3854 Buttercup Circle S, Palm Beach Gardens, FL",
  },
];

export function getFlyer(key: string): FlyerTemplate | undefined {
  return FLYERS.find((f) => f.key === key);
}
