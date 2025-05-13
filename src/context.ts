import DateSequence from "./dateSequence";
import Record from "./record";
import Transaction from "./transaction";
import type { StockType } from "@ch20026103/anysis/dist/esm/stockSkills/types";

export enum BuyPrice {
  OPEN = "o",
  CLOSE = "c",
  HIGHT = "h",
  LOW = "l",
}
export enum SellPrice {
  OPEN = "o",
  CLOSE = "c",
  HIGHT = "h",
  LOW = "l",
}

type Options = {
  handlingFeeRebate?: number;
  limitHandlingFee?: number;
  capital?: number;
  hightStockPrice?: number;
  lowStockPrice?: number;
  hightLoss?: number;
  finalizePendingPurchases?: [string | number, string | number][];
  finalizePendingSales?: [string | number, string | number][];
  buyPrice?: BuyPrice;
  sellPrice?: SellPrice;
};
export default class Context {
  dateSequence: DateSequence; // 日期模組
  transaction: Transaction; // 交易模組
  record: Record; // 紀錄模組
  capital: number; // 本金
  hightLoss?: number; // 虧損上限
  unSoldProfit: number; // 未實現損益
  hightStockPrice?: number; // 買入股價上限
  lowStockPrice?: number; // 買入股價下限
  buyPrice: BuyPrice; // 買入價格位置
  sellPrice: SellPrice; // 賣出價格位置
  sellMethod: (stockId: string, date: number) => Promise<StockType | null>; // 賣出條件
  buyMethod: (stockId: string, date: number) => Promise<StockType | null>; // 買入條件
  stocks: { id: string; name: string }[]; // 股票清單

  constructor({
    dates,
    sell,
    buy,
    stocks,
    options,
  }: {
    dates: number[];
    sell: (stockId: string, date: number) =>  Promise<StockType | null>;
    buy: (stockId: string, date: number) =>  Promise<StockType | null>;
    options?: Options;
    stocks?: { id: string; name: string }[];
  }) {
    this.unSoldProfit = 0;
    this.capital = options?.capital ? options.capital : 300000;
    this.hightStockPrice = options?.hightStockPrice;
    this.lowStockPrice = options?.lowStockPrice;
    this.hightLoss = options?.hightLoss; // 0.1 = 10%
    this.buyPrice = options?.buyPrice || BuyPrice.OPEN;
    this.sellPrice = options?.sellPrice || SellPrice.LOW;
    this.sellMethod = sell;
    this.buyMethod = buy;
    this.transaction = new Transaction({
      handlingFeeRebate: options?.handlingFeeRebate,
      limitHandlingFee: options?.limitHandlingFee,
    });
    this.record = new Record();
    this.dateSequence = new DateSequence({
      data: dates,
    });
    this.dateSequence.attach(this);
    this.stocks = stocks || [];
  }

  async buyFlow(stockId: string, date: number) {
    // 在庫存中 跳過
    if (this.record.getInventoryStockId(stockId)) return;

    // 達到買入條件加入待購清單
    const data = await this.buyMethod(stockId, date);

    // 如果回傳空值 跳過
    if (!data) return;


    // 如果高過或低於股價設定區間 跳過
    if (
      (this.hightStockPrice && data.l > this.hightStockPrice) ||
      (this.lowStockPrice && data.l < this.lowStockPrice)
    )
      return;
    // 買入價格
    const buyPrice = this.transaction.getBuyPrice(data[this.buyPrice]);

    // 如果最高價超過資金上限 跳過
    if (buyPrice > this.capital) return;

    // 在待購清單內 買入
    if (this.record.getWaitPurchasedStockId(stockId)) {
      this.record.save(stockId, data, buyPrice, date);
      this.capital -= buyPrice; // 扣錢
      return;
    }

    this.record.saveWaitPurchased(stockId, data, date);
  }

  async sellFlow(stockId: string, stockName: string, date: number) {
    // 如果不在庫存 跳過
    if (!this.record.getInventoryStockId(stockId)) return;

    const data = await this.sellMethod(stockId, date);

    // 如果回傳空值 跳過
    if (!data) return;

    // 賣出價格
    const sellPrice = this.transaction.getSellPrice(data[this.sellPrice]);

    // 在待售清單內 買入
    if (this.record.getWaitSaleStockId(stockId)) {
      this.record.remove(stockId, stockName, data, sellPrice, date);
      this.capital += sellPrice;
      return;
    }

    // 超過設定虧損加入待售清單
    const buyData = this.record.getInventoryStockIdData(stockId);
    if (
      this.hightLoss &&
      buyData.buyPrice - buyData.buyPrice * this.hightLoss > 1000 * data.l
    ) {
      this.record.saveWaitSale(stockId, data, date);
      return;
    }

    // 達到賣出條件加入待售清單
    this.record.saveWaitSale(stockId, data, date);
  }

  async update(date: number) {
    try {
      for (const stock in this.stocks) {
        const stockId = this.stocks[stock].id;
        const stockName = this.stocks[stock].name;
        if (!date) return;
        await this.buyFlow(stockId, date);
        await this.sellFlow(stockId, stockName, date);
      }
    } catch (error) {
      console.log("update error:", error);
    }
    return true;
  }

  async run() {
    return await this.dateSequence.next();
  }
}
