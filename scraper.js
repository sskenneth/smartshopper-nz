import * as cheerio from "cheerio";

const cache = new Map();

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractPrice(text) {
  const match = text.match(/\$\s?(\d+(?:\.\d{2})?)/);
  return match ? Number(match[1]) : null;
}

export async function scrapeStoreProduct(store, item) {
  const cacheKey = `${store.name}-${item}`.toLowerCase();

  if (cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);

    if (Date.now() - cached.time < 1000 * 60 * 30) {
      return cached.data;
    }
  }

  await sleep(800);

  const url = store.searchUrl + encodeURIComponent(item);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "SmartShopperPriceResearchBot/1.0 permission-based"
      }
    });

    const html = await response.text();
    const $ = cheerio.load(html);

    const possibleProducts = [];

    $("body *").each((_, element) => {
      const text = $(element).text().replace(/\s+/g, " ").trim();

      if (
        text.toLowerCase().includes(item.toLowerCase()) &&
        text.includes("$")
      ) {
        const price = extractPrice(text);

        if (price) {
          possibleProducts.push({
            name: text.slice(0, 90),
            price,
            source: url
          });
        }
      }
    });

    const bestMatch = possibleProducts[0] || {
      name: "Not found",
      price: null,
      source: url
    };

    const data = {
      store: store.name,
      item,
      productName: bestMatch.name,
      price: bestMatch.price,
      source: bestMatch.source,
      updated: new Date().toISOString()
    };

    cache.set(cacheKey, {
      time: Date.now(),
      data
    });

    return data;
  } catch (error) {
    return {
      store: store.name,
      item,
      productName: "Error fetching price",
      price: null,
      source: url,
      updated: new Date().toISOString()
    };
  }
}
