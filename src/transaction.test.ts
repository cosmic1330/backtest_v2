import Transaction from "./transaction";

describe("Transaction", () => {
  let transaction: Transaction;

  beforeEach(() => {
    transaction = new Transaction({});
  });

  describe("constructor", () => {
    it("應該使用默認值初始化", () => {
      expect(transaction.handlingFeeRebate).toBe(0.65);
      expect(transaction.limitHandlingFee).toBe(20);
    });

    it("應該使用提供的值初始化", () => {
      const customTransaction = new Transaction({
        handlingFeeRebate: 0.5,
        limitHandlingFee: 30,
      });
      expect(customTransaction.handlingFeeRebate).toBe(0.5);
      expect(customTransaction.limitHandlingFee).toBe(30);
    });
  });

  describe("getBuyPrice", () => {
    it("當手續費小於最低限額時應正確計算買入價格", () => {
      const buyPrice = transaction.getBuyPrice(10);
      expect(buyPrice).toBe(10020); // 10000 + 20(最低手續費)
    });

    it("當手續費大於最低限額時應正確計算買入價格", () => {
      const buyPrice = transaction.getBuyPrice(100);
      expect(buyPrice).toBe(100093); // 100000 + 92.625(手續費)
    });
  });

  describe("getSellPrice", () => {
    it("當手續費小於最低限額時應正確計算賣出價格", () => {
      const sellPrice = transaction.getSellPrice(10);
      expect(sellPrice).toBe(10050); // 10000 + 20(最低手續費) + 30(交易稅)
    });

    it("當手續費大於最低限額時應正確計算賣出價格", () => {
      const sellPrice = transaction.getSellPrice(100);
      expect(sellPrice).toBe(100393); // 100000 + 92.625(手續費) + 300(交易稅)
    });
  });
});
