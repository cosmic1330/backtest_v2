interface DateSequenceConstructorType {
  data: number[];
}

interface Observer {
  update(currentDate: number): void;
}

export default class DateSequence {
  // types
  futureDates: number[];
  historyDates: number[];
  currentDate: number | undefined;
  observers: Observer[];

  constructor({ data }: DateSequenceConstructorType) {
    this.futureDates = data;
    this.historyDates = [];
    this.currentDate = undefined;
    this.observers = [];
  }

  init() {
    this.currentDate = undefined;
    this.futureDates.unshift(...this.historyDates);
    this.historyDates = [];
  }

  bind(observer: Observer) {
    this.observers.unshift(observer);
  }

  attach(observer: Observer) {
    this.observers.push(observer);
  }

  async notifyAllObservers() {
    if (this.currentDate) {
      await Promise.all(
        this.observers.map((observer) =>
          observer.update(this.currentDate as number)
        )
      );
    }
  }

  async next() {
    if (this.futureDates.length > 0) {
      const data = this.futureDates.shift();
      if (data) {
        this.currentDate = data;
        this.historyDates.push(data);
        await this.notifyAllObservers();
        return true;
      }
    }
    return false;
  }
}
