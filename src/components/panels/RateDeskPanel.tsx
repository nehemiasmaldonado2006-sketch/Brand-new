"use client";

import { useState } from "react";

function pay(principal: number, ratePct: number, years = 30) {
  const r = ratePct / 100 / 12;
  const n = years * 12;
  if (!principal || !ratePct || !isFinite(principal) || !isFinite(r) || r <= 0) return "—";
  return "$" + Math.round((principal * r) / (1 - Math.pow(1 + r, -n))).toLocaleString() + "/mo";
}

export function RateDeskPanel({
  rate30,
  rate15,
}: {
  rate30: number | null;
  rate15: number | null;
}) {
  const [loanText, setLoanText] = useState("");
  const loan = Number(loanText.replace(/[^0-9.]/g, ""));

  return (
    <div className="flex flex-1 flex-col gap-[15px]">
      <div className="flex gap-[34px]">
        <div>
          <div className="mb-1 text-[10px] tracking-[0.16em] text-muted uppercase">30-year</div>
          <div className="font-serif text-[40px] leading-[0.95] font-medium text-muted">
            {rate30 != null ? `${rate30.toFixed(3)}%` : "—"}
          </div>
        </div>
        <div>
          <div className="mb-1 text-[10px] tracking-[0.16em] text-muted uppercase">15-year</div>
          <div className="font-serif text-[40px] leading-[0.95] font-medium text-muted">
            {rate15 != null ? `${rate15.toFixed(3)}%` : "—"}
          </div>
        </div>
      </div>
      <svg viewBox="0 0 300 60" preserveAspectRatio="none" className="block h-[60px] w-full">
        <line x1="0" y1="59.5" x2="300" y2="59.5" stroke="rgba(20,19,17,0.12)" strokeWidth="1" />
      </svg>
      <div className="flex flex-col gap-2.5 border-t border-black/[0.07] pt-3.5">
        <label className="text-[10px] tracking-[0.16em] text-muted uppercase">Loan amount</label>
        <div className="flex items-stretch border border-black/25">
          <span className="border-r border-black/[0.12] px-2.5 py-2 font-serif text-[18px] text-muted">
            $
          </span>
          <input
            type="text"
            value={loanText}
            onChange={(e) => setLoanText(e.target.value)}
            placeholder="0"
            className="min-w-0 flex-1 border-none bg-transparent px-2.5 py-2 text-[14px] text-ink"
          />
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-[12.5px] text-muted">30-yr principal &amp; interest</span>
          <span className="font-serif text-[26px]">
            {rate30 != null ? pay(loan, rate30) : "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
