const common = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "#141311",
  strokeWidth: 1.1,
};

export function EmailIcon() {
  return (
    <svg {...common}>
      <rect x="2.5" y="5" width="19" height="14" />
      <path d="M2.5 6.5 12 13.5 21.5 6.5" />
    </svg>
  );
}

export function ContentIcon() {
  return (
    <svg {...common}>
      <rect x="2.5" y="4" width="19" height="16" />
      <path d="M9.5 8.5 15 12l-5.5 3.5z" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 6.5V12l4 2.4" />
    </svg>
  );
}

export function MarketingIcon() {
  return (
    <svg {...common}>
      <rect x="4" y="2.5" width="16" height="19" />
      <path d="M7.5 7.5h9M7.5 11.5h9M7.5 15.5h5.5" />
    </svg>
  );
}

export function RateIcon() {
  return (
    <svg {...common}>
      <path d="M3 18.5 9 11l4 3.6 7.5-9" />
      <path d="M15.5 5.5h5v5" />
    </svg>
  );
}

export function MarketIcon() {
  return (
    <svg {...common}>
      <path d="M3 20.5h18" />
      <rect x="4.5" y="12" width="4" height="8.5" />
      <rect x="10" y="7.5" width="4" height="13" />
      <rect x="15.5" y="3.5" width="4" height="17" />
    </svg>
  );
}
