type TransactionConstructorType = {
  handlingFeeRebate?: number;
  limitHandlingFee?: number;
};

export default class Transaction {
  handlingFeeRebate: number;
  limitHandlingFee: number;
  constructor({
    handlingFeeRebate,
    limitHandlingFee,
  }: TransactionConstructorType) {
    this.handlingFeeRebate = canUsed(handlingFeeRebate, 0.65);
    this.limitHandlingFee = canUsed(limitHandlingFee, 20);
  }
  getBuyPrice(price: number, stockCount = 1000) {
    let buyPrice = price * stockCount; // 股價
    const handlingFee = buyPrice * 0.001425 * this.handlingFeeRebate; // 手續費
    if (handlingFee < this.limitHandlingFee) {
      buyPrice += 20;
    } else {
      buyPrice += handlingFee;
    }
    return Math.round(buyPrice);
  }
  getSellPrice(price: number, stockCount = 1000) {
    let sellPrice = price * stockCount; // 股價
    const handlingFee = sellPrice * 0.001425 * this.handlingFeeRebate; // 手續費
    if (handlingFee < this.limitHandlingFee) {
      sellPrice += 20;
    } else {
      sellPrice += handlingFee;
    }
    sellPrice += sellPrice * 0.003; // 交易稅
    return Math.round(sellPrice);
  }
}

function canUsed(input: number | undefined, defaultValue: number): number {
  if (!Number.isNaN(input) && input) {
    return input;
  } else {
    return defaultValue;
  }
}
