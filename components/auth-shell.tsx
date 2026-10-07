import type { ReactNode } from "react"

function BudgetIllustration() {
  return (
    <svg
      viewBox="0 0 222 150"
      aria-hidden="true"
      className="h-auto w-44"
      fill="none"
    >
      <ellipse cx="111" cy="80" rx="105" ry="62" className="fill-primary/5" />

      {/* Budget card */}
      <rect
        x="48"
        y="22"
        width="120"
        height="100"
        rx="12"
        className="fill-card stroke-primary/25"
        strokeWidth="1.5"
      />
      <path
        d="M48 34a12 12 0 0 1 12-12h96a12 12 0 0 1 12 12v10H48z"
        className="fill-primary"
      />
      <rect
        x="60"
        y="30"
        width="44"
        height="7"
        rx="3.5"
        className="fill-primary-foreground/80"
      />
      <circle cx="146" cy="33.5" r="3" className="fill-primary-foreground/50" />
      <circle cx="156" cy="33.5" r="3" className="fill-primary-foreground/50" />

      {/* Category progress rows */}
      {[
        { y: 58, fill: 56 },
        { y: 76, fill: 40 },
        { y: 94, fill: 66 },
      ].map(({ y, fill }) => (
        <g key={y}>
          <circle cx="64" cy={y + 4} r="4" className="fill-primary/30" />
          <rect
            x="76"
            y={y}
            width="80"
            height="8"
            rx="4"
            className="fill-primary/15"
          />
          <rect
            x="76"
            y={y}
            width={fill}
            height="8"
            rx="4"
            className="fill-primary"
          />
        </g>
      ))}
      <rect
        x="60"
        y="109"
        width="40"
        height="5"
        rx="2.5"
        className="fill-primary/30"
      />
      <rect
        x="130"
        y="109"
        width="26"
        height="5"
        rx="2.5"
        className="fill-primary/60"
      />

      {/* Coin stack */}
      {[112, 102, 92].map((top) => (
        <g key={top}>
          <rect
            x="158"
            y={top}
            width="40"
            height="8"
            className="fill-primary"
          />
          <ellipse
            cx="178"
            cy={top + 8}
            rx="20"
            ry="7"
            className="fill-primary"
          />
          <ellipse
            cx="178"
            cy={top}
            rx="20"
            ry="7"
            className="fill-card stroke-primary"
            strokeWidth="1.5"
          />
        </g>
      ))}
      <text
        x="178"
        y="95.5"
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        className="fill-primary"
      >
        $
      </text>

      {/* Floating coin */}
      <circle
        cx="34"
        cy="46"
        r="10"
        className="fill-card stroke-primary"
        strokeWidth="1.5"
      />
      <circle
        cx="34"
        cy="46"
        r="6"
        className="stroke-primary/40"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="grid min-h-svh place-items-center bg-muted/40 p-4">
      <div className="flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <BudgetIllustration />
          <h1 className="text-2xl font-semibold tracking-tight">
            Personal Monthly Budget
          </h1>
        </div>
        {children}
      </div>
    </main>
  )
}
