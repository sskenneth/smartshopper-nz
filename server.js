import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";
import { stores } from "./stores.js";

const app = express();
app.use(cors());
app.use(express.json());

const cache = new Map();

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
        "User-Agent": "Mozilla/5.0 SmartShopper Research Bot"
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

      const text = $(element).text().replace(/\s+/g, " ").trim();

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
      productName: bestMatch?.name || `${item} unavailable`,
      price: bestMatch?.price ?? null,
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
      productName: "Unavailable",
      price: null,
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
        items.map((item) => scrapeStoreProduct(store, item))
      );

      const validPrices = basket.filter((p) => typeof p.price === "number");

      const total = validPrices.reduce((sum, p) => sum + p.price, 0);

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
  console.log(`SmartShopper backend running on port ${PORT}`);
});
