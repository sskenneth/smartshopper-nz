const express = require("express");
const cors = require("cors");
const cheerio = require("cheerio");
const { stores } = require("./stores");

const app = express();

app.use(cors());
app.use(express.json());

const cache = new Map();

const basePrices = {
  milk: 5.2,
  bread: 3.4,
  butter: 6.8,
  cheese: 8.9,
  eggs: 7.2,
  chicken: 13.5,
  beef: 14.9,
  mince: 11.5,
  sausages: 7.8,
  bacon: 8.4,
  ham: 6.9,
  yogurt: 5.4,
  cream: 4.3,
  icecream: 7.9,
  rice: 4.5,
  pasta: 2.9,
  noodles: 1.8,
  flour: 3.5,
  sugar: 3.2,
  salt: 1.7,
  pepper: 3.8,
  cereal: 7.4,
  oats: 4.6,
  weetbix: 8.2,
  coffee: 8.7,
  tea: 5.1,
  milo: 6.4,
  juice: 4.8,
  coke: 4.5,
  pepsi: 4.4,
  sprite: 4.3,
  water: 2.4,
  bananas: 3.1,
  apples: 4.2,
  oranges: 4.9,
  grapes: 7.6,
  strawberries: 5.8,
  blueberries: 6.9,
  avocado: 2.5,
  tomato: 5.1,
  potatoes: 6.5,
  onions: 3.7,
  carrots: 3.2,
  broccoli: 4.4,
  lettuce: 3.5,
  cucumber: 2.9,
  spinach: 4.6,
  mushrooms: 5.7,
  capsicum: 4.9,
  chips: 3.8,
  crackers: 3.4,
  biscuits: 4.2,
  chocolate: 3.7,
  lollies: 3.1,
  tuna: 3.9,
  salmon: 8.9,
  bakedbeans: 2.4,
  spaghetti: 2.3,
  soup: 3.5,
  pizza: 8.2,
  fries: 5.6,
  nuggets: 7.9,
  fish: 12.4,
  prawns: 15.8,
  lamb: 16.7,
  pork: 11.9,
  mayonnaise: 5.2,
  ketchup: 4.7,
  mustard: 3.9,
  vinegar: 3.4,
  oil: 6.5,
  oliveoil: 9.8,
  detergent: 8.5,
  shampoo: 7.2,
  conditioner: 7.1,
  soap: 2.8,
  toothpaste: 4.5,
  toothbrush: 3.6,
  toiletpaper: 11.4,
  tissues: 3.2,
  deodorant: 6.9,
  razors: 9.7,
  batteries: 8.8,
  dogfood: 14.2,
  catfood: 11.6,
  diapers: 18.9,
  garlic: 1.9,
  ginger: 2.3,
  lemons: 4.1,
  wraps: 4.7,
  burgerbuns: 4.5,
  sourcream: 4.6,
  cottagecheese: 5.1,
  sparklingwater: 3.6,
  popcorn: 3.3
};

function fallbackPrice(storeName, item) {
  const normalized = item
    .toLowerCase()
    .replace(/\s+/g, "");

  const base =
    basePrices[normalized] ||
    basePrices[item.toLowerCase()] ||
    5.99;

  let seed = 0;

  const combined = storeName + item;

  for (let i = 0; i < combined.length; i++) {
    seed += combined.charCodeAt(i);
  }

  let storeAdjustment = 0;

  if (storeName.includes("Pak")) storeAdjustment = -0.6;
  if (storeName.includes("Woolworths")) storeAdjustment = 0.4;
  if (storeName.includes("Countdown")) storeAdjustment = 0.4;
  if (storeName.includes("New World")) storeAdjustment = 0.7;
  if (storeName.includes("Fresh Choice")) storeAdjustment = 0.9;
  if (storeName.includes("Warehouse")) storeAdjustment = -0.2;

  const variation = ((seed % 90) - 45) / 100;

  return Number(
    (base + variation + storeAdjustment).toFixed(2)
  );
}

function extractPrice(text) {
  const match = text.match(/\$?\s?(\d+(?:\.\d{2})?)/);

  return match ? Number(match[1]) : null;
}

async function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();

  const timer = setTimeout(() => {
    controller.abort();
  }, timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 SmartShopper Research Bot"
      }
    });

    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function scrapeStoreProduct(store, item) {
  const cacheKey = `${store.name}-${item}`.toLowerCase();

  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);

    if (Date.now() - cached.time < 1000 * 60 * 15) {
      return cached.data;
    }
  }

  const url =
    store.searchUrl +
    encodeURIComponent(item) +
    (store.searchSuffix || "");

  try {
    const response = await fetchWithTimeout(url, 5000);

    const html = await response.text();

    const $ = cheerio.load(html);

    let bestMatch = null;

    $("body *").each((_, element) => {
      if (bestMatch) return;

      const text = $(element)
        .text()
        .replace(/\s+/g, " ")
        .trim();

      if (
        text.toLowerCase().includes(item.toLowerCase()) &&
        text.includes("$")
      ) {
        const price = extractPrice(text);

        if (price && price > 0 && price < 100) {
          bestMatch = {
            name: text.slice(0, 120),
            price
          };
        }
      }
    });

    const result = {
      store: store.name,
      item,
      productName:
        bestMatch?.name || `${item} estimated price`,
      price:
        bestMatch?.price ??
        fallbackPrice(store.name, item),
      url
    };

    cache.set(cacheKey, {
      time: Date.now(),
      data: result
    });

    return result;
  } catch {
    return {
      store: store.name,
      item,
      productName: `${item} estimated price`,
      price: fallbackPrice(store.name, item),
      url
    };
  }
}

app.get("/", (req, res) => {
  res.send("SmartShopper backend is running");
});

app.get("/api/compare", async (req, res) => {
  const items = String(req.query.items || "")
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

  if (!items.length) {
    return res.status(400).json({
      error: "No grocery items provided"
    });
  }

  const comparison = await Promise.all(
    stores.map(async (store) => {
      const basket = await Promise.all(
        items.map((item) =>
          scrapeStoreProduct(store, item)
        )
      );

      const validPrices = basket.filter(
        (p) => typeof p.price === "number"
      );

      const total = validPrices.reduce(
        (sum, p) => sum + p.price,
        0
      );

      return {
        store: store.name,
        basket,
        total: Number(total.toFixed(2))
      };
    })
  );

  comparison.sort((a, b) => a.total - b.total);

  res.json(comparison);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `SmartShopper backend running on port ${PORT}`
  );
});
