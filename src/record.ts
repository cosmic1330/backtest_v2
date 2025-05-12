import type { StockType } from "@ch20026103/anysis/dist/esm/stockSkills/types";
type InventoryItem = {
  data: StockType;
  buyPrice: number;
};

export default class Record {
  win: number;
  lose: number;
  profit: number;
  inventory: { [stockId: string]: InventoryItem };
  history: unknown[];
  waitPurchased: {
    [stockId: string]: StockType;
  };
  waitSale: {
    [stockId: string]: StockType;
  };

  constructor() {
    this.inventory = {};
    this.history = [];
    this.win = 0;
    this.lose = 0;
    this.profit = 0;
    this.waitSale = {};
    this.waitPurchased = {};
  }

  init() {
    this.inventory = {};
    this.history = [];
    this.win = 0;
    this.lose = 0;
    this.profit = 0;
    this.waitSale = {};
    this.waitPurchased = {};
  }

  save(id: string, data: StockType, buyPrice: number) {
    this.inventory[id] = { data, buyPrice };
    // clear
    delete this.waitPurchased[id];
  }

  remove(id: string, name: string, data: StockType, sellPrice: number) {
    const res = {
      id,
      name,
      buy: this.inventory[id],
      sell: {
        data,
        sellPrice,
      },
    };
    this.history.push(res);
    // calculate
    const profit = sellPrice - this.inventory[id].buyPrice;
    if (profit > 0) {
      this.win += 1;
      this.profit += profit;
    } else {
      this.lose += 1;
      this.profit += profit;
    }
    // clear
    delete this.inventory[id];
    delete this.waitSale[id];
  }

  saveWaitPurchased(key: string, value: StockType) {
    this.waitPurchased[key] = value;
  }

  saveWaitSale(key: string, value: StockType) {
    this.waitSale[key] = value;
  }

  getInventoryStockId(stockId: string) {
    const inventories = Object.keys(this.inventory);
    return inventories.includes(stockId);
  }

  getInventoryStockIdData(stockId: string) {
    return this.inventory[stockId];
  }

  getWaitSaleStockId(stockId: string) {
    const waitSales = Object.keys(this.waitSale);
    return waitSales.includes(stockId);
  }

  getWaitPurchasedStockId(stockId: string) {
    const waitPurchaseds = Object.keys(this.waitPurchased);
    return waitPurchaseds.includes(stockId);
  }

  removeWaitPurchased(stockId: string) {
    delete this.waitPurchased[stockId];
  }

  removeWaitSale(stockId: string) {
    delete this.waitSale[stockId];
  }
}
