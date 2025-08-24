/**
 * Competitor data — prices and notable limitations are from public listings.
 * Update values easily here; UI reads directly from this file.
 */
export const COMPETITORS = [
  { name: "ExpressVPN", price: "$12.95/mo", devices: "5", logs: "No logs (but 3rd party audits limited)", gaming: "No dedicated gaming routes" },
  { name: "NordVPN",    price: "$12.99/mo", devices: "6", logs: "No logs (audited)", gaming: "Standard servers only" },
  { name: "Surfshark",  price: "$12.95/mo", devices: "Unlimited", logs: "No logs", gaming: "No gaming optimization" },
  { name: "ProtonVPN",  price: "$9.99/mo",  devices: "10", logs: "Strong no-logs", gaming: "Focus on privacy, not gaming" },
  { name: "CyberGhost", price: "$12.99/mo", devices: "7", logs: "No logs", gaming: "Some streaming-optimized servers" },
  { name: "PIA",        price: "$11.99/mo", devices: "Unlimited", logs: "No logs", gaming: "No gaming optimization" },
];

export const SACVPN_ADVANTAGES = {
  name: "SACVPN",
  price: {
    personal: "$7.99/mo (Unlimited devices)",
    gaming: "$11.99/mo (Unlimited devices + gaming routes)",
    business: "From $50/mo for 10 devices, up to 250+",
  },
  logs: "Strict no-logs",
  gaming: "Dedicated gaming-optimized routes",
  setup: "One-click QR + email instructions",
};
