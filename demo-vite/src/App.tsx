import type { StockType } from "@ch20026103/anysis/dist/esm/stockSkills/types.js";
import { useCallback, useEffect, useState } from "react";
import "./App.css";
import viteLogo from "/vite.svg";
import { Context } from "../../dist/esm";

function App() {
  const [ctx, setCtx] = useState<Context | null>(null);
  const run = useCallback(async (id: number) => {
    // fetch fresh data from the DB
    const response = await fetch(
      "http://localhost:3001/api/yahoo?symbol=" + id,
      {
        cache: "default",
      }
    ).then((res) => res.text());

    const ta_index = response.indexOf('"ta":');
    const json_ta = "{" + response.slice(ta_index).replace(");", "");
    const parse = JSON.parse(json_ta);
    const ta: StockType[] = parse.ta;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const formatTa: any = {};
    ta.forEach((item) => {
      const { t, ...other } = item;
      formatTa[t] = other;
    });

    const idMatch = response.slice(0, ta_index).match(/"id":"(\d+)"/);
    const nameMatch = response.slice(0, ta_index).match(/"name":"([^"]+)"/);
    const stock_id = idMatch ? idMatch[1] : "noId";
    const stock_name = nameMatch ? nameMatch[1] : "noName";
    const stoscks = [
      {
        id: stock_id,
        name: stock_name,
      },
    ];
    const context = new Context({
      dates: ta.map((item) => item.t),
      stocks: stoscks,
      sell: (stockId: string, date: number) => {
        if (date % 3 === 0) {
          return formatTa[date];
        }
      },
      buy: (stockId: string, date: number) => {
        if (date % 3 === 0) {
          return formatTa[date];
        }
      },
    });

    let status = true;
    while (status) {
      status = await context.run();
    }
    setCtx(context);
    console.log("context", context);
  }, []);

  useEffect(() => {
    run(2317);
  }, [run]);

  return (
    <div>
      <img src={viteLogo} className="logo" alt="Vite logo" />
      <p>record timeline:{JSON.stringify(ctx?.record.timeline)}</p>
    </div>
  );
}

export default App;
