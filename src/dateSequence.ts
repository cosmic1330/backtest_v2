export type DatesData = number;

interface DateSequenceConstructorType {
  data: DatesData[];
}

interface Observer {
  update(currentDate: DatesData | undefined): void;
}

export default class DateSequence {
  // types
  futureDates: DatesData[];
  historyDates: DatesData[];
  currentDate: DatesData | undefined;
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

  notifyAllObservers() {
    this.observers.forEach((observer) => {
      observer.update(this.currentDate);
    });
  }

  next() {
    this.notifyAllObservers();
    if (this.futureDates.length > 0) {
      const data = this.futureDates.shift();
      if (data) {
        this.currentDate = data;
        this.historyDates.push(data);
        return true;
      }
    }
    return false;
  }
}
