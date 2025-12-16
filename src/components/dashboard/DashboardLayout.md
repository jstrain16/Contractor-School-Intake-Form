# DashboardLayout

A reusable dashboard shell that matches the Contractor School Figma layout. It renders the header, hero/CTA, overall progress, step cards with status + progress bars, continuation CTA, stats cards, and floating help button.

## When to use
- Applicant dashboard or any licensing/education overview.
- Anytime you need a grid of status cards with progress and a persistent CTA/help affordance.

## Props
- `title?: string` — Heading in the hero. Default: "Contractor School".
- `subtitle?: string` — Sub-heading copy.
- `overall: { percent: number; nextUp?: string; label?: string }` — Overall progress block; percent is clamped to 0–100.
- `sections: DashboardSection[]` — Grid rows.
  - `id: string`
  - `label: string`
  - `status: "complete" | "pending" | "not_started"`
  - `progress?: number` — Overrides default (complete=100, pending=45, not_started=0).
  - `icon?: ReactNode`
  - `description?: string`
  - `href?: string` — Wraps card in `<a>`.
  - `onClick?: () => void` — Wraps card in `<button>` when no href.
- `primaryCta?: { label: string; href?: string; onClick?: () => void }` — Hero CTA.
- `continueCta?: { label: string; href?: string; onClick?: () => void }` — Lower CTA.
- `stats?: DashboardStat[]` — Summary cards at bottom.
  - `id: string`
  - `title: string`
  - `value: ReactNode`
  - `description?: string`
- `headerLabel?: string` — Right-aligned header text. Default: "Dashboard".
- `userIcon?: ReactNode` — Override the circle avatar icon.
- `showHelpButton?: boolean` — Toggles floating help. Default: true.
- `onHelpClick?: () => void` — Handler for help button.

## Accessibility
- All progress bars include `role="progressbar"` with `aria-valuenow/min/max` and labels.
- Cards are wrapped in anchor or button and include focus-visible rings.
- Buttons use high-contrast orange (#f54900) with hover and focus states.

## Examples
```tsx
import { DashboardLayout } from "@/components/dashboard"

<DashboardLayout
  overall={{ percent: 52, nextUp: "Workers Compensation" }}
  sections={[
    { id: "account", label: "Account Setup", status: "complete" },
    { id: "workers-comp", label: "Workers Compensation", status: "pending", progress: 50 },
  ]}
  primaryCta={{ label: "Go to Application", href: "/application" }}
  continueCta={{ label: "Continue Application", href: "/application" }}
  stats={[
    { id: "progress", title: "Progress", value: "52%", description: "Weighted completion across all sections" },
    { id: "next", title: "Next Action", value: "Workers Compensation" },
  ]}
/>
```


