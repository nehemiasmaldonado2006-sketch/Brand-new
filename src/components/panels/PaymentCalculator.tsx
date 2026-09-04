"use client";

import { useState } from "react";

function pay(principal: number, ratePct: number, years: number) {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (!principal || !ratePct || !isFinite(principal) || !isFinite(r) || r <= 0) return "—";
  return "$" + Math.round((principal * r) / (1 - Math.pow(1 + r, -n))).toLocaleString() + "/mo";
}

export function PaymentCalculator({
  defaultRate30,
  defaultRate15,
}: {
  defaultRate30: number | null;
  defaultRate15: number | null;
}) {
  const [loanText, setLoanText] = useState("");
  const [rate30, setRate30] = useState(defaultRate30 ? String(defaultRate30) : "");
  const [rate15, setRate15] = useState(defaultRate15 ? String(defaultRate15) : "");

  const loan = Number(loanText.replace(/[^0-9.]/g, ""));

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted">30-year rate %</label>
        <input
          type="text"
          value={rate30}
          onChange={(e) => setRate30(e.target.value)}
          className="border border-black/25 bg-transparent px-[11px] py-2.5 text-[14px] text-ink"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted">15-year rate %</label>
        <input
          type="text"
          value={rate15}
          onChange={(e) => setRate15(e.target.value)}
          className="border border-black/25 bg-transparent px-[11px] py-2.5 text-[14px] text-ink"
        />
      </div>
      <div className="h-px bg-black/[0.07]" />
      <div className="flex flex-col gap-1.5">
        <label className="text-[11px] text-muted">Loan amount</label>
        <div className="flex items-stretch border border-black/25">
          <span className="border-r border-black/[0.12] px-3 py-2.5 font-serif text-[19px] text-muted">
            $
          </span>
          <input
            type="text"
            value={loanText}
            onChange={(e) => setLoanText(e.target.value)}
            placeholder="0"
            className="min-w-0 flex-1 border-none bg-transparent px-3 py-2.5 text-[15px] text-ink"
          />
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] text-muted">30-year payment</span>
        <span className="font-serif text-[26px]">{pay(loan, Number(rate30), 30)}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-[12.5px] text-muted">15-year payment</span>
        <span className="font-serif text-[26px]">{pay(loan, Number(rate15), 15)}</span>
      </div>
    </div>
  );
}
