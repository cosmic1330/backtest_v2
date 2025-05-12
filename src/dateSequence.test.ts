import DateSequence from "./dateSequence";

describe("DateSequence", () => {
  let testData: number[] = [];
  beforeEach(() => {
    testData = [20200729, 20200730, 20200731];
  });

  it("應該正確初始化 DateSequence", () => {
    const dateSequence = new DateSequence({ data: testData });

    expect(dateSequence.currentDate).toBe(undefined);
    expect(dateSequence.futureDates).toEqual([20200729, 20200730, 20200731]);
    expect(dateSequence.historyDates).toEqual([]);
  });

  it("應該正確設置下一個日期", () => {
    const dateSequence = new DateSequence({ data: testData });
    dateSequence.next();

    expect(dateSequence.currentDate).toBe(20200729);
    expect(dateSequence.futureDates).toEqual([20200730, 20200731]);
    expect(dateSequence.historyDates).toEqual([20200729]);
  });

  it("應該在到達最後一個日期後停止", () => {
    const dateSequence = new DateSequence({ data: testData });
    const status1 = dateSequence.next();
    const status2 = dateSequence.next();
    const status3 = dateSequence.next();
    const status4 = dateSequence.next(); // 應該沒有效果
    expect(status1).toBeTruthy();
    expect(status2).toBeTruthy();
    expect(status3).toBeTruthy();
    expect(status4).toBeFalsy();

    expect(dateSequence.currentDate).toBe(20200731);
    expect(dateSequence.futureDates).toEqual([]);
    expect(dateSequence.historyDates).toEqual([20200729, 20200730, 20200731]);
  });

  it("應該在到達 stopDate 後停止", () => {
    const dateSequence = new DateSequence({
      data: testData,
    });
    const status1 = dateSequence.next();
    const status2 = dateSequence.next();
    const status3 = dateSequence.next(); // 應該沒有效果
    expect(status1).toBeTruthy();
    expect(status2).toBeTruthy();
    expect(status3).toBeFalsy();

    expect(dateSequence.currentDate).toBe(20200730);
    expect(dateSequence.futureDates).toEqual([20200731]);
    expect(dateSequence.historyDates).toEqual([20200729, 20200730]);
  });

  it("應該正確通知觀察者", () => {
    const dateSequence = new DateSequence({ data: testData });
    const mockObserver1 = { update: vi.fn() };
    const mockObserver2 = { update: vi.fn() };
    dateSequence.attach(mockObserver1);
    dateSequence.attach(mockObserver2);
    dateSequence.next();

    expect(mockObserver1.update).toHaveBeenCalledTimes(1);
    expect(mockObserver2.update).toHaveBeenCalledTimes(1);
  });

  it("應該正確使用bind方法添加觀察者並優先通知", () => {
    const dateSequence = new DateSequence({ data: testData });
    const mockObserver1 = { update: vi.fn() };
    const mockObserver2 = { update: vi.fn() };
    const mockObserver3 = { update: vi.fn() };

    dateSequence.attach(mockObserver1);
    dateSequence.bind(mockObserver2);
    dateSequence.attach(mockObserver3);

    dateSequence.next();

    // 檢查是否所有觀察者都被通知
    expect(mockObserver1.update).toHaveBeenCalledTimes(1);
    expect(mockObserver2.update).toHaveBeenCalledTimes(1);
    expect(mockObserver3.update).toHaveBeenCalledTimes(1);
  });

  // 添加新的測試用例
  it("應該正確執行初始化方法", () => {
    const dateSequence = new DateSequence({ data: testData });
    dateSequence.next(); // 移動到第一個日期
    dateSequence.next(); // 移動到第二個日期

    expect(dateSequence.currentDate).toBe(20200730);
    expect(dateSequence.futureDates).toEqual([20200731]);
    expect(dateSequence.historyDates).toEqual([20200729, 20200730]);

    dateSequence.init(); // 執行初始化方法

    expect(dateSequence.currentDate).toBe(undefined);
    expect(dateSequence.futureDates).toEqual([20200729, 20200730, 20200731]);
    expect(dateSequence.historyDates).toEqual([]);
  });
});
