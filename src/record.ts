import type { StockType } from "@ch20026103/anysis/dist/esm/stockSkills/types";

enum TimelineType {
  BUY = "BUY",
  SELL = "SELL",
  WAIT_BUY = "WAIT_BUY",
  WAIT_SELL = "WAIT_SELL",
}

type InventoryItem = {
  data: StockType;
  buyPrice: number;
};

export default class Record {
  timeline: {
    [time: number]: {
      type: TimelineType;
      name: string;
      id: string;
      data: StockType;
    }[];
  };
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
    this.timeline = {};
    this.inventory = {};
    this.history = [];
    this.win = 0;
    this.lose = 0;
    this.profit = 0;
    this.waitSale = {};
    this.waitPurchased = {};
  }

  addTimeline(
    time: number,
    data: {
      type: TimelineType;
      name: string;
      id: string;
      data: StockType;
    }
  ) {
    if (!this.timeline[time]) {
      this.timeline[time] = [];
    }
    this.timeline[time].push(data);
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

  save(id: string, data: StockType, buyPrice: number, date: number) {
    this.inventory[id] = { data, buyPrice };
    // add timeline
    this.addTimeline(date, {
      type: TimelineType.BUY,
      name: id,
      id,
      data,
    });
    // clear
    delete this.waitPurchased[id];

  }

  remove(id: string, name: string, data: StockType, sellPrice: number, date: number) {
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
    // add timeline
    this.addTimeline(date, {
      type: TimelineType.SELL,
      name,
      id,
      data,
    });
    // clear
    delete this.inventory[id];
    delete this.waitSale[id];
  }

  saveWaitPurchased(key: string, value: StockType, date: number) {
    this.waitPurchased[key] = value;
    this.addTimeline(date, {
      type: TimelineType.WAIT_BUY,
      name: key,
      id: key,
      data: value,
    });
  }

  saveWaitSale(key: string, value: StockType, date: number) {
    this.waitSale[key] = value;
    this.addTimeline(date, {
      type: TimelineType.WAIT_SELL,
      name: key,
      id: key,
      data: value,
    });
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
