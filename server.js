import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";
import { stores } from "./stores.js";

const app = express();

app.use(cors());
app.use(express.json());

const cache = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractPrice(text) {
  const match = text.match(/\$?\s?(\d+(?:\.\d{2})?)/);

  return match ? Number(match[1]) : null;
}

async function scrapeStoreProduct(store, item) {
  const cacheKey = `${store.name}-${item}`.toLowerCase();

  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);

    if (Date.now() - cached.time < 1000 * 60 * 15) {
      return cached.data;
    }
  }

  await sleep(500);

  const url =
    store.searchUrl +
    encodeURIComponent(item) +
    (store.searchSuffix || "");

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 SmartShopper Research Bot"
      }
    });

    const html = await response.text();

    const $ = cheerio.load(html);

    const products = [];

    $("body *").each((_, element) => {
      const text = $(element)
        .text()
        .replace(/\s+/g, " ")
        .trim();

      if (
        text.toLowerCase().includes(item.toLowerCase()) &&
        text.includes("$")
      ) {
        const price = extractPrice(text);

        if (
          price &&
          price > 0 &&
          price < 100
        ) {
          products.push({
            name: text.slice(0, 120),
            price
          });
        }
      }
    });

    const bestMatch = products[0] || {
      name: `${item} unavailable`,
      price: null
    };

    const result = {
      store: store.name,
      item,
      productName: bestMatch.name,
      price: bestMatch.price,
      url
    };

    cache.set(cacheKey, {
      time: Date.now(),
      data: result
    });

    return result;
  } catch (error) {
    return {
      store: store.name,
      item,
      productName: "Fetch failed",
      price: null,
      url
    };
  }
}

app.get("/", (req, res) => {
  res.send("SmartShopper backend is running");
});

app.get("/api/search", async (req, res) => {
  const item = String(req.query.item || "").trim();

  if (!item) {
    return res.status(400).json({
      error: "Missing item"
    });
  }

  const results = [];

  for (const store of stores) {
    const result = await scrapeStoreProduct(
      store,
      item
    );

    results.push(result);
  }

  res.json(results);
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

  const comparison = [];

  for (const store of stores) {
    const basket = [];

    for (const item of items) {
      const result = await scrapeStoreProduct(
        store,
        item
      );

      basket.push({
        item,
        productName: result.productName,
        price: result.price
      });
    }

    const validPrices = basket.filter(
      (p) => typeof p.price === "number"
    );

    const total = validPrices.reduce(
      (sum, p) => sum + p.price,
      0
    );

    comparison.push({
      store: store.name,
      basket,
      total: Number(total.toFixed(2))
    });
  }

  comparison.sort((a, b) => a.total - b.total);

  res.json(comparison);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `SmartShopper backend running on port ${PORT}`
  );
});
