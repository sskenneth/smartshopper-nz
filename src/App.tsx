import React, { useEffect, useMemo, useState } from "react";
import "./styles.css";

const stores = [
  "Pak'nSave Dunedin",
  "New World Centre City",
  "New World Gardens",
  "The Warehouse",
  "Countdown South Dunedin",
  "Fresh Choice Roslyn",
  "Countdown Dunedin Central",
  "Woolworths Mornington",
  "Fresh Choice Green Island",
  "Four Square Caversham",
  "Four Square Brockville",
  "Foodlands Four Square",
  "New World Mosgiel",
  "Woolworths Mosgiel",
];

function fakePrice(store: string, product: string) {
  let seed = 0;

  const combined = store + product;

  for (let i = 0; i < combined.length; i++) {
    seed += combined.charCodeAt(i);
  }

  return Number(((seed % 650) / 100 + 2.49).toFixed(2));
}

export default function App() {
  const [loading, setLoading] = useState(true);

  const [items, setItems] = useState("milk, bread, cheese, chicken, eggs");

  const [results, setResults] = useState<any[]>([]);

  const [selectedStore, setSelectedStore] = useState("All stores");

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const itemList = useMemo(() => {
    return items
      .split(",")
      .map((x) => x.trim().toLowerCase())
      .filter(Boolean);
  }, [items]);

  function comparePrices() {
    const storeList =
      selectedStore === "All stores"
        ? stores
        : stores.filter((s) => s === selectedStore);

    const compared = storeList.map((store) => {
      const basket = itemList.map((item) => ({
        item,
        price: fakePrice(store, item),
      }));

      const total = basket.reduce((sum, product) => sum + product.price, 0);

      return {
        store,
        basket,
        total: Number(total.toFixed(2)),
      };
    });

    setResults(compared.sort((a, b) => a.total - b.total));

    document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
  }

  function scrollTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="loadingScreen">
        <div className="loadingLogo">🛒</div>

        <h1>SmartShopper™</h1>

        <p>Finding the best grocery prices...</p>

        <div className="loadingBar">
          <div></div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="backgroundGlow"></div>

      <header className="navbar">
        <div className="brand" onClick={() => scrollTo("home")}>
          <div className="logoMark">🛒</div>

          <div>
            <h1>SmartShopper™</h1>

            <p>Compare. Save. Shop smarter.</p>
          </div>
        </div>

        <nav>
          <button onClick={() => scrollTo("features")}>Features</button>

          <button onClick={() => scrollTo("how")}>How it works</button>

          <button onClick={() => scrollTo("stores")}>Stores</button>
        </nav>

        <button className="navButton" onClick={comparePrices}>
          Try Demo
        </button>
      </header>

      <main id="home">
        <section className="hero">
          <div className="heroCopy">
            <div className="pill">📍 Dunedin grocery comparison demo</div>

            <h2>Find the cheapest grocery shop before you leave home.</h2>

            <p className="heroSub">
              Compare your grocery basket across Pak'nSave, New World,
              Woolworths, Fresh Choice, Four Square, and more.
            </p>

            <div className="heroButtons">
              <button className="primaryBtn" onClick={comparePrices}>
                Start Comparing
              </button>

              <button className="secondaryBtn" onClick={() => scrollTo("how")}>
                See How It Works
              </button>
            </div>

            <div className="stats">
              <div>
                <strong>{stores.length}</strong>
                <span>Dunedin stores</span>
              </div>

              <div>
                <strong>Live</strong>
                <span>Basket totals</span>
              </div>

              <div>
                <strong>$</strong>
                <span>Potential savings</span>
              </div>
            </div>
          </div>

          <div className="visualArea">
            <div className="floatingCard savingCard">
              <span>Estimated savings</span>

              <strong>
                {results[1]
                  ? `$${(results[1].total - results[0].total).toFixed(2)}`
                  : "$11.90"}
              </strong>
            </div>

            <div className="phoneShell">
              <div className="phoneNotch"></div>

              <div className="phoneScreen">
                <div className="appHeader">
                  <div className="miniLogo">🛒</div>

                  <div>
                    <strong>SmartShopper</strong>

                    <span>Dunedin supermarket comparison</span>
                  </div>
                </div>

                <div className="searchBox">
                  <span>Your grocery list</span>

                  <textarea
                    value={items}
                    onChange={(e) => setItems(e.target.value)}
                  />
                </div>

                <select
                  className="storeSelect"
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                >
                  <option>All stores</option>

                  {stores.map((store) => (
                    <option key={store}>{store}</option>
                  ))}
                </select>

                <button className="compareButton" onClick={comparePrices}>
                  Compare My Shop
                </button>

                {(results.length
                  ? results.slice(0, 3)
                  : [
                      {
                        store: "Pak'nSave Dunedin",
                        total: 72.4,
                      },
                      {
                        store: "Woolworths Mosgiel",
                        total: 81.1,
                      },
                      {
                        store: "New World Gardens",
                        total: 84.3,
                      },
                    ]
                ).map((r, i) => (
                  <StoreResult
                    key={r.store}
                    name={r.store}
                    price={`$${r.total.toFixed(2)}`}
                    saving={
                      i === 0
                        ? "Best price"
                        : `+$${(r.total - (results[0]?.total || 72.4)).toFixed(
                            2
                          )}`
                    }
                    best={i === 0}
                  />
                ))}
              </div>
            </div>

            <div className="floatingCard dataCard">
              <span>Price tracking</span>

              <strong>Dunedin demo active</strong>
            </div>
          </div>
        </section>

        <section className="section white" id="features">
          <div className="sectionIntro">
            <span className="eyebrow">Features</span>

            <h2>Grocery comparison made simple</h2>

            <p>
              SmartShopper compares total basket costs across Dunedin
              supermarkets.
            </p>
          </div>

          <div className="featureGrid">
            <Feature
              icon="📉"
              title="Basket comparison"
              text="Compare the full cost of your grocery list across supermarkets."
            />

            <Feature
              icon="⚡"
              title="Fast results"
              text="Generate instant supermarket rankings using your shopping list."
            />

            <Feature
              icon="🏪"
              title="Dunedin stores"
              text="Includes Pak'nSave, New World, Woolworths, Fresh Choice, and Four Square."
            />
          </div>
        </section>

        <section className="section data" id="how">
          <div className="dataText">
            <span className="eyebrow">How it works</span>

            <h2>SmartShopper comparison engine</h2>

            <p>
              Enter your grocery list and SmartShopper compares basket totals
              across participating Dunedin stores, ranking them from cheapest to
              most expensive.
            </p>

            <div className="checkList">
              <p>✓ Enter products into your grocery list</p>

              <p>✓ Compare across multiple supermarkets</p>

              <p>✓ View ranked basket totals</p>

              <p>✓ Find the cheapest overall shop</p>
            </div>
          </div>

          <div className="retailerCard" id="stores">
            <div className="databaseIcon">🏪</div>

            <h3>Participating stores</h3>

            <p>
              SmartShopper currently compares major Dunedin supermarkets and
              local grocery retailers.
            </p>

            <div className="retailerGrid">
              {stores.map((store) => (
                <div key={store}>{store}</div>
              ))}
            </div>
          </div>
        </section>

        <section className="section white" id="results">
          <div className="sectionIntro">
            <span className="eyebrow">Results</span>

            <h2>Live comparison results</h2>

            <p>
              Press “Compare My Shop” to rank supermarkets by total basket cost.
            </p>
          </div>

          <div className="resultsTable">
            {(results.length ? results : []).map((result, index) => (
              <div
                className={index === 0 ? "resultRow winner" : "resultRow"}
                key={result.store}
              >
                <div>
                  <strong>
                    {index + 1}. {result.store}
                  </strong>

                  <span>
                    {index === 0 ? "Cheapest basket" : "Compared basket"}
                  </span>
                </div>

                <div className="basketItems">
                  {result.basket.map((p: any) => (
                    <small key={p.item}>
                      {p.item}: ${p.price.toFixed(2)}
                    </small>
                  ))}
                </div>

                <b>${result.total.toFixed(2)}</b>
              </div>
            ))}

            {!results.length && (
              <p className="emptyState">
                Press “Start Comparing” or “Try Demo” to generate results.
              </p>
            )}
          </div>
        </section>

        <section className="cta">
          <h2>One list. Every supermarket. Lowest price.</h2>

          <p>
            SmartShopper helps Dunedin shoppers compare grocery prices faster.
          </p>

          <button className="primaryBtn" onClick={comparePrices}>
            Run Demo Again
          </button>
        </section>
      </main>
    </div>
  );
}

function StoreResult({ name, price, saving, best }: any) {
  return (
    <div className={best ? "storeResult bestStore" : "storeResult"}>
      <div>
        <strong>{name}</strong>

        <span>{saving}</span>
      </div>

      <b>{price}</b>
    </div>
  );
}

function Feature({ icon, title, text }: any) {
  return (
    <div className="featureCard">
      <div className="iconBubble">{icon}</div>

      <h3>{title}</h3>

      <p>{text}</p>
    </div>
  );
}

