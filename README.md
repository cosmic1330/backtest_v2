# @ch20026103/backtest

一個強大的股票回測工具庫,用於分析和優化交易策略。

## Reference

![架構](https://github.com/cosmic1330/inquirer/blob/master/uml.jpg)

## Install

使用 npm:

```bash
npm install @ch20026103/backtest
```

使用 pnpm:

```bash
pnpm add @ch20026103/backtest
```

## Ｈ ow to use

```typescript
import { Context, DateSequence, Stock } from '@ch20026103/backtest';

// 初始化股票數據
const stocks = {
  'AAPL': new Stock('AAPL', [...]),
  'GOOGL': new Stock('GOOGL', [...])
};

// 創建日期序列
const dateSequence = new DateSequence([...]);


// 定義買入和賣出策略
const buyMethod = function(data){ ... };
const sellMethod = function(data){ ... };

// 創建回測上下文
const context = new Context({stocks, dateSequence,
  buyMethod,
  sellMethod,
  options:{
    capital: 100000,
    // 其他選項...
  }
});

// 運行回測
context.run();

// 分析結果
console.log(context.record.getPerformance());
```

## 貢獻

歡迎提交 Pull Requests 來幫助改進這個項目。對於重大更改,請先開 issue 討論您想要改變的內容。

## 許可證

MIT

## 作者

kim <ch20026103@yahoo.com.tw> (https://github.com/cosmic1330)
