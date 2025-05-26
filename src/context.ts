import type { StockType } from "@ch20026103/anysis/dist/esm/stockSkills/types";
import DateSequence from "./dateSequence";
import Record from "./record";
import Transaction from "./transaction";

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

export type Options = {
  handlingFeeRebate?: number;
  limitHandlingFee?: number;
  capital?: number;
  hightStockPrice?: number;
  lowStockPrice?: number;
  hightLoss?: number;
  buyPrice?: BuyPrice;
  sellPrice?: SellPrice;
};

export type StrategyMethod = (
  stockId: string,
  date: number,
  bypassCondition: boolean | undefined
) => Promise<StockType | null>;

export default class Context {
  dateSequence: DateSequence; // 日期模組
  transaction: Transaction; // 交易模組
  record: Record; // 紀錄模組
  capital: number; // 本金
  hightLoss?: number; // 虧損上限(%)
  unSoldProfit: number; // 未實現損益
  hightStockPrice?: number; // 買入股價上限
  lowStockPrice?: number; // 買入股價下限
  buyPrice: BuyPrice; // 買入價格位置
  sellPrice: SellPrice; // 賣出價格位置
  sellMethod: StrategyMethod[]; // 賣出條件
  buyMethod: StrategyMethod[]; // 買入條件
  stocks: { id: string; name: string }[]; // 股票清單

  constructor({
    dates,
    sell,
    buy,
    stocks,
    options,
  }: {
    dates: number[];
    sell: StrategyMethod[];
    buy: StrategyMethod[];
    options?: Options;
    stocks?: { id: string; name: string }[];
  }) {
    this.unSoldProfit = 0;
    this.capital = options?.capital ? options.capital : 300000;
    this.hightStockPrice = options?.hightStockPrice;
    this.lowStockPrice = options?.lowStockPrice;
    this.hightLoss = options?.hightLoss; // 10 = 10%
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

  async buyFlow(stockId: string, stockName: string, date: number) {
    const inInventory = this.record.getInventoryStockId(stockId);
    const inWaitPurchased = this.record.getWaitPurchasedStockId(stockId);
    // 在庫存中 跳過
    if (inInventory) return;

    // 在待購清單中但過期
    if (
      inWaitPurchased &&
      this.record.waitPurchased[stockId] <
        this.dateSequence.historyDates[
          this.dateSequence.historyDates.length - 2
        ]
    ) {
      this.record.removeWaitPurchased(stockId);
      return;
    }

    // 取待買或驗證通過的資料
    let data: StockType | null = null;
    if (inWaitPurchased) {
      data = await this.buyMethod[0](stockId, date, inWaitPurchased);
    } else {
      for (let index = 0; index < this.buyMethod.length; index++) {
        const buyMethod = this.buyMethod[index];
        data = await buyMethod(stockId, date, inWaitPurchased);
        if (data) break; // 找到符合條件的資料就跳出
      }
    }

    // 如果回傳空值 跳過
    if (!data) return;

    // 如果高過或低於股價設定區間 跳過
    if (
      (this.hightStockPrice && data.l > this.hightStockPrice) ||
      (this.lowStockPrice && data.l < this.lowStockPrice)
    ) {
      if (inWaitPurchased) {
        this.record.removeWaitPurchased(stockId);
      }
      return;
    }

    // 買入價格
    const buyPrice = this.transaction.getBuyPrice(data[this.buyPrice]);
    // 如果買入價格超過資金上限 跳過
    if (buyPrice > this.capital) {
      // 如果在待購清單內移除
      if (inWaitPurchased) {
        this.record.removeWaitPurchased(stockId);
      }
      return;
    }
    // 在待購清單內 買入
    if (inWaitPurchased) {
      this.record.save({
        id: stockId,
        name: stockName,
        buyData: data,
        buyPrice,
        buyDate: date,
      });
      this.capital -= buyPrice; // 扣錢
      return;
    }
    // 達到買入條件加入待購清單
    this.record.saveWaitPurchased({
      id: stockId,
      name: stockName,
      data,
      date,
    });
  }

  async sellFlow(stockId: string, stockName: string, date: number) {
    // 如果不在庫存 跳過
    const inInventory = this.record.getInventoryStockId(stockId);
    if (!inInventory) return;

    // 在庫存中但當日買進 跳過
    if (this.record.getInventoryStockIdData(stockId).buyDate === date) return;

    // 取得資料
    const inWaitSale = this.record.getWaitSaleStockId(stockId);
    let data: StockType | null = null;
    if (inWaitSale) {
      data = await this.sellMethod[0](stockId, date, inWaitSale);
    } else {
      for (let index = 0; index < this.sellMethod.length; index++) {
        const sellMethod = this.sellMethod[index];
        data = await sellMethod(stockId, date, inWaitSale);
        if (data) break; // 找到符合條件的資料就跳出
      }
    }
    // 如果回傳空值 跳過
    if (!data) return;

    // 賣出價格
    const sellPrice = this.transaction.getSellPrice(data[this.sellPrice]);

    // 在待售清單內賣出
    if (inWaitSale) {
      this.record.remove({
        id: stockId,
        name: stockName,
        sellData: data,
        sellPrice,
        sellDate: date,
      });
      this.capital += sellPrice;
      return;
    }

    // 超過設定虧損加入待售清單
    const buyData = this.record.getInventoryStockIdData(stockId);
    if (
      this.hightLoss &&
      buyData.buyPrice - buyData.buyPrice * (this.hightLoss / 100) >
        1000 * data.l
    ) {
      this.record.saveWaitSale({
        id: stockId,
        name: stockName,
        data,
        date,
      });
      return;
    }

    // 達到賣出條件加入待售清單
    this.record.saveWaitSale({
      id: stockId,
      name: stockName,
      data,
      date,
    });
  }

  async update(date: number) {
    try {
      for (let index = 0; index < this.stocks.length; index++) {
        const element = this.stocks[index];
        const stockId = element.id;
        const stockName = element.name;
        await this.buyFlow(stockId, stockName, date);
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
