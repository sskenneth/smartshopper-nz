import express from "express";
import cors from "cors";
import { stores } from "./stores.js";
import { scrapeStoreProduct } from "./scraper.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/search", async (req, res) => {
  const item = String(req.query.item || "").trim();

  if (!item) {
    return res.status(400).json({ error: "Missing item query" });
  }

  const results = [];

  for (const store of stores) {
    const result = await scrapeStoreProduct(store, item);
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
    return res.status(400).json({ error: "Missing grocery items" });
  }

  const comparison = [];

  for (const store of stores) {
    const basket = [];

    for (const item of items) {
      const result = await scrapeStoreProduct(store, item);

      basket.push({
        item,
        productName: result.productName,
        price: result.price,
        source: result.source,
        updated: result.updated
      });
    }

    const validPrices = basket.filter((p) => typeof p.price === "number");

    const total = validPrices.reduce((sum, p) => sum + p.price, 0);

    comparison.push({
      store: store.name,
      basket,
      total: Number(total.toFixed(2)),
      missingItems: basket.filter((p) => p.price === null).map((p) => p.item)
    });
  }

  comparison.sort((a, b) => a.total - b.total);

  res.json(comparison);
});

app.listen(4000, () => {
  console.log("SmartShopper scraper API running on http://localhost:4000");
});
