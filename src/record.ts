import type { StockType } from "@ch20026103/anysis/dist/esm/stockSkills/types";

type RecordDate = number;
enum TimelineType {
  BUY = "BUY",
  SELL = "SELL",
  WAIT_BUY = "WAIT_BUY",
  WAIT_SELL = "WAIT_SELL",
}

type InventoryItem = {
  id: string;
  name: string;
  buyData: StockType;
  buyPrice: number;
  buyDate: RecordDate;
};

type HistoryItem = InventoryItem & {
  sellData: StockType;
  sellPrice: number;
  sellDate: RecordDate;
};

type TimeLineItem = {
  type: TimelineType;
  name: string;
  id: string;
  data: StockType;
};

export default class Record {
  timeline: { [time: number]: TimeLineItem[] };
  win: number;
  lose: number;
  profit: number;
  inventory: { [stockId: string]: InventoryItem };
  history: HistoryItem[];
  waitPurchased: {
    [stockId: string]: RecordDate;
  };
  waitSale: {
    [stockId: string]: RecordDate;
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

  addTimeline(time: number, data: TimeLineItem) {
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

  save(props: InventoryItem) {
    this.inventory[props.id] = props;
    // add timeline
    this.addTimeline(props.buyDate, {
      type: TimelineType.BUY,
      name: props.name,
      id: props.id,
      data: props.buyData,
    });
    // clear
    delete this.waitPurchased[props.id];
  }

  remove(props: Omit<HistoryItem, "buyData" | "buyPrice" | "buyDate">) {
    const { buyData, buyPrice, buyDate } = this.inventory[props.id];
    const res: HistoryItem = {
      ...props,
      buyData,
      buyPrice,
      buyDate,
    };
    this.history.push(res);
    // calculate
    const profit = props.sellPrice - this.inventory[props.id].buyPrice;
    if (profit > 0) {
      this.win += 1;
      this.profit += profit;
    } else {
      this.lose += 1;
      this.profit += profit;
    }
    // add timeline
    this.addTimeline(props.sellDate, {
      type: TimelineType.SELL,
      name: props.name,
      id: props.id,
      data: props.sellData,
    });
    // clear
    delete this.inventory[props.id];
    delete this.waitSale[props.id];
  }

  saveWaitPurchased({
    id,
    name,
    data,
    date,
  }: {
    id: string;
    name: string;
    data: StockType;
    date: number;
  }) {
    this.waitPurchased[id] = date;
    this.addTimeline(date, {
      type: TimelineType.WAIT_BUY,
      name,
      id,
      data,
    });
  }

  saveWaitSale({
    id,
    name,
    data,
    date,
  }: {
    id: string;
    name: string;
    data: StockType;
    date: number;
  }) {
    this.waitSale[id] = date;
    this.addTimeline(date, {
      type: TimelineType.WAIT_SELL,
      name,
      id,
      data,
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
