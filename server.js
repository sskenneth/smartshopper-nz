import express from "express";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SmartShopper backend is running");
});

app.get("/api/compare", (req, res) => {
  res.json([
    {
      store: "Pak'nSave Dunedin",
      total: 72.4,
      basket: [
        { item: "milk", price: 4.89 },
        { item: "bread", price: 2.99 }
      ]
    },
    {
      store: "New World Gardens",
      total: 81.1,
      basket: [
        { item: "milk", price: 5.39 },
        { item: "bread", price: 3.49 }
      ]
    }
  ]);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`SmartShopper backend running on port ${PORT}`);
});
