// Helpers
    const isCrypto = (s) => s.startsWith("BTC") || s.startsWith("ETH") || s.startsWith("SOL");
    const needsUsdJpy = (s) => s.includes("JPY");
    const getPipSize = (pair) => {
      if (pair.includes("JPY")) return 0.01;
      if (pair === "XAUUSD") return 0.01;
      if (isCrypto(pair)) return 0.01;
      return 0.0001;
    };
    const isStandardForexSixLettersUSD = (pair) => /^[A-Z]{6}$/.test(pair) && pair.includes("USD");
    const getContractSize = (pair) => {
      if (pair.includes("JPY") || isStandardForexSixLettersUSD(pair)) return 100_000;
      if (pair === "XAUUSD") return 100; // 1 lot = 100 oz common CFD mapping
      if (isCrypto(pair)) return 1;
      return 1;
    };

    // Elements
    const pairEl = document.getElementById("pair");
    const typeEl = document.getElementById("tradeType");
    const lotEl = document.getElementById("lotSize");
    const openEl = document.getElementById("openPrice");
    const closeEl = document.getElementById("closePrice");
    const ujRow = document.getElementById("usdJpyRow");
    const ujEl = document.getElementById("usdJpy");

    const out = {
      pair: document.getElementById("outPair"),
      type: document.getElementById("outType"),
      lot: document.getElementById("outLot"),
      open: document.getElementById("outOpen"),
      close: document.getElementById("outClose"),
      pipSize: document.getElementById("outPipSize"),
      contract: document.getElementById("outContract"),
      diff: document.getElementById("outDiff"),
      pips: document.getElementById("outPips"),
      usd: document.getElementById("outUsd"),
      quote: document.getElementById("outQuote"),
    };

    function sanitizePair(v){ return (v || "").trim().toUpperCase(); }

    function recalc() {
      const pair = sanitizePair(pairEl.value);
      const tradeType = typeEl.value === "sell" ? "sell" : "buy";
      const lotSize = Number(lotEl.value);
      const open = Number(openEl.value);
      const close = Number(closeEl.value);
      const uj = Number(ujEl.value);

      // Toggle USD/JPY field
      if (needsUsdJpy(pair)) {
        ujRow.classList.remove("hidden");
      } else {
        ujRow.classList.add("hidden");
      }

      const pipSize = getPipSize(pair);
      const contractSize = getContractSize(pair);

      const valid =
        pair.length > 0 &&
        Number.isFinite(lotSize) && lotSize > 0 &&
        Number.isFinite(open) &&
        Number.isFinite(close);

      let priceDiff = 0, pipMovement = 0, profitQuote = 0, profitUsd = 0;

      if (valid) {
        priceDiff = (tradeType === "buy") ? (close - open) : (open - close);
        pipMovement = Math.abs(priceDiff) / pipSize;
        profitQuote = priceDiff * lotSize * contractSize;

        if (needsUsdJpy(pair)) {
          const safeUj = Number.isFinite(uj) && uj > 0 ? uj : 1;
          profitUsd = profitQuote / safeUj;
        } else {
          profitUsd = profitQuote;
        }
      }

      const quoteCcy = pair.slice(-3);

      // Output
      out.pair.textContent = pair || "-";
      out.type.textContent = tradeType.toUpperCase();
      out.lot.textContent = Number.isFinite(lotSize) ? lotSize : "-";
      out.open.textContent = Number.isFinite(open) ? open : "-";
      out.close.textContent = Number.isFinite(close) ? close : "-";
      out.pipSize.textContent = pipSize.toString();
      out.contract.textContent = contractSize.toLocaleString();
      out.diff.textContent = priceDiff.toFixed(5);
      out.pips.textContent = `${pipMovement.toFixed(1)} pips`;
      out.usd.textContent = `$${profitUsd.toFixed(2)}`;
      out.quote.textContent = `${profitQuote.toFixed(2)} ${quoteCcy || ""}`;
    }

    // Bind events
    ["input", "change"].forEach(evt => {
      pairEl.addEventListener(evt, recalc);
      typeEl.addEventListener(evt, recalc);
      lotEl.addEventListener(evt, recalc);
      openEl.addEventListener(evt, recalc);
      closeEl.addEventListener(evt, recalc);
      ujEl.addEventListener(evt, recalc);
    });

    // Initial compute
    recalc();
