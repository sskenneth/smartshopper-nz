import React, { useEffect, useState } from "react";
import "./styles.css";

export default function App() {
  const [items, setItems] = useState("Milk, bread, cheese, chicken, eggs");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1600);
    return () => clearTimeout(timer);
  }, []);

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
        <div className="brand">
          <div className="logoMark">🛒</div>
          <div>
            <h1>SmartShopper™</h1>
            <p>Compare. Save. Shop smarter.</p>
          </div>
        </div>

        <nav>
          <a>Features</a>
          <a>How it works</a>
          <a>Retailers</a>
        </nav>

        <button className="navButton">Try Demo</button>
      </header>

      <main>
        <section className="hero">
          <div className="heroCopy">
            <div className="pill">
              🇳🇿 Built for New Zealand grocery shoppers
            </div>

            <h2>Find the cheapest grocery shop before you leave home.</h2>

            <p className="heroSub">
              SmartShopper compares your full grocery list across major
              supermarkets and shows where your basket is cheapest overall.
            </p>

            <div className="heroButtons">
              <button className="primaryBtn">Start Comparing</button>
              <button className="secondaryBtn">See How It Works</button>
            </div>

            <div className="stats">
              <div>
                <strong>4+</strong>
                <span>Retailers</span>
              </div>
              <div>
                <strong>Live</strong>
                <span>Price checks</span>
              </div>
              <div>
                <strong>$</strong>
                <span>Basket savings</span>
              </div>
            </div>
          </div>

          <div className="visualArea">
            <div className="floatingCard savingCard">
              <span>Estimated saving</span>
              <strong>$11.90</strong>
            </div>

            <div className="phoneShell">
              <div className="phoneNotch"></div>

              <div className="phoneScreen">
                <div className="appHeader">
                  <div className="miniLogo">🛒</div>
                  <div>
                    <strong>SmartShopper</strong>
                    <span>Dunedin basket comparison</span>
                  </div>
                </div>

                <div className="searchBox">
                  <span>Grocery list</span>
                  <textarea
                    value={items}
                    onChange={(e) => setItems(e.target.value)}
                  />
                </div>

                <button className="compareButton">Compare My Shop</button>

                <div className="resultsTitle">
                  <span>Best result</span>
                  <strong>Today</strong>
                </div>

                <StoreResult
                  name="Pak’nSave Dunedin"
                  price="$72.40"
                  saving="Best overall price"
                  best
                />
                <StoreResult
                  name="Woolworths"
                  price="$81.10"
                  saving="+$8.70 more"
                />
                <StoreResult
                  name="New World"
                  price="$84.30"
                  saving="+$11.90 more"
                />
              </div>
            </div>

            <div className="floatingCard dataCard">
              <span>Price database</span>
              <strong>Updated regularly</strong>
            </div>
          </div>
        </section>

        <section className="section white">
          <div className="sectionIntro">
            <span className="eyebrow">Why it matters</span>
            <h2>Grocery decisions made simple</h2>
            <p>
              Instead of checking multiple supermarket websites, SmartShopper
              brings prices together and compares the total basket for you.
            </p>
          </div>

          <div className="featureGrid">
            <Feature
              icon="📉"
              title="Find the lowest basket"
              text="Compare the total price of your grocery list, not just one item at a time."
            />
            <Feature
              icon="⚡"
              title="Instant comparisons"
              text="Quickly check common products, specials, discounts, and store differences."
            />
            <Feature
              icon="📍"
              title="Local store results"
              text="Designed for New Zealand shoppers using nearby supermarket options."
            />
          </div>
        </section>

        <section className="section data">
          <div className="dataText">
            <span className="eyebrow">Behind the app</span>
            <h2>How SmartShopper gathers price data</h2>
            <p>
              SmartShopper gathers publicly available pricing information from
              supermarket websites and online catalogues. It checks product
              prices, specials, and discounts, then stores them in one central
              database. When a shopper enters a list, the app matches similar
              products across stores and calculates the cheapest full shop.
            </p>

            <div className="checkList">
              <p>✓ Collects public supermarket pricing data</p>
              <p>✓ Tracks specials, discounts, and product changes</p>
              <p>✓ Matches similar products across retailers</p>
              <p>✓ Calculates the cheapest total basket</p>
            </div>
          </div>

          <div className="retailerCard">
            <div className="databaseIcon">🗄️</div>
            <h3>One smart price database</h3>
            <p>
              SmartShopper connects supermarket price information into one
              simple platform for faster grocery comparison.
            </p>

            <div className="retailerGrid">
              <div>Woolworths</div>
              <div>New World</div>
              <div>Pak’nSave</div>
              <div>Four Square</div>
            </div>
          </div>
        </section>

        <section className="cta">
          <h2>One list. Every supermarket. Lowest price.</h2>
          <p>
            SmartShopper makes grocery shopping clearer, faster, and cheaper.
          </p>
          <button className="primaryBtn">Join the Waitlist</button>
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
