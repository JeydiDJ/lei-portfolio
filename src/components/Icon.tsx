export function Icon({
  name,
  size = 20,
}: {
  name:
    | "arrow"
    | "sun"
    | "moon"
    | "sound"
    | "mute"
    | "reset"
    | "close"
    | "grid"
    | "blinds"
    | "light"
    | "room";
  size?: number;
}) {
  const paths = {
    light: (
      <>
        <path d="M9 18h6m-5 3h4M8 13a6 6 0 1 1 8 0c-1 .8-1 1.7-1 3H9c0-1.3 0-2.2-1-3Z" />
      </>
    ),
    room: (
      <>
        <path d="m12 3 9 5v9l-9 5-9-5V8l9-5ZM3 8l9 5 9-5M12 13v9" />
      </>
    ),
    blinds: (
      <>
        <rect x="3" y="3" width="16" height="4" rx="1" />
        <path d="M5 7v8h12V7M5 11h12M21 5v13m-2-2 2 2 2-2" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ),
    moon: <path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10Z" />,
    sound: (
      <>
        <path d="M11 4 5 9H2v6h3l6 5V4ZM15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14" />
      </>
    ),
    mute: (
      <>
        <path d="M11 4 5 9H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6" />
      </>
    ),
    reset: (
      <>
        <path d="M3 10a9 9 0 1 1 1 8M3 4v6h6" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
