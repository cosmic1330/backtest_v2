// index.js
import express from "express";
import axios from "axios";
import cors from "cors";

const app = express();
const PORT = 3001;

// 啟用 CORS，允許所有來源
app.use(cors());

// Yahoo Finance Proxy API
app.get("/api/yahoo", async (req, res) => {
  try {
    const { symbol = "2330" } = req.query;

    const url = `https://tw.quote.finance.yahoo.net/quote/q?type=ta&perd=d&mkt=10&sym=${symbol}&v=1&callback=`;

    const response = await axios.get(url);
    res.send(response.data);
  } catch (error) {
    console.error("Yahoo Proxy Error:", error.message);
    res.status(500).send("Error fetching data from Yahoo");
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
