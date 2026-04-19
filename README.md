# FairShift

> **A Fairness Analytics Dashboard for Healthcare Payroll Systems**  
> Prepared for SLR Industries · Advance Ontario Program · April 2026

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?style=flat-square&logo=vercel)](https://fairshift.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

---

## What is FairShift?

FairShift is a self-initiated prototype — not an assignment — built proactively to demonstrate the kind of execution-focused contribution I'd bring to SLR Industries' Advance Ontario project.

It is a single-page analytics dashboard that surfaces **fairness inequities in healthcare payroll and scheduling data**, making them immediately visible to HR leads and payroll administrators who don't have time to dig through spreadsheets.

The goal: turn abstract fairness concerns into specific, actionable signals.

---

## The Problem It Solves

Healthcare facilities — particularly LTCs and clinics — routinely accumulate subtle but compounding inequities in how shifts, overtime, and compensation are distributed across staff. These rarely get caught until a grievance is filed or someone burns out.

FairShift detects them early, automatically, using five mathematically rigorous metrics designed to be interpretable by non-technical administrators.

---

## Fairness Metrics Framework

| Metric | Description | Scale |
|--------|-------------|-------|
| **WES** — Workload Equity Score | Gini coefficient applied to total hours worked within the same role | 0 (perfect equity) → 1 (total inequity) |
| **OBI** — Overtime Balance Index | Share of total overtime absorbed by the top 20% of staff | 0% → 100% |
| **SFR** — Shift Fairness Ratio | Distribution equity of weekend/night/holiday shifts across eligible staff | 0 (unequal) → 1 (equal) |
| **CPI** — Compensation Parity Index | Normalized standard deviation of hourly pay within the same role | Lower is better |
| **BRS** — Burnout Risk Score | Composite: overtime rate + night shift rate + weekend rate, per staff | 0 (low) → 100 (high) |

All five metrics are computed **live in the browser** over the synthetic dataset with no backend required.

---

## Dashboard Panels

- **Overview** — Facility-wide scorecard with all 5 KPIs and trend charts
- **Staff Equity** — Individual burnout risk ranking, weekend shift heatmap, and staff table with risk-tier badges
- **Role Analysis** — Pay band comparisons across RN / RPN / PSW / Admin with coefficient of variation drill-down
- **Alerts & Insights** — Rule-based natural language callouts surfacing detected inequities (e.g. "Top 20% of staff absorb 30.6% of all overtime")

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React 18 + Vite | Fast, industry-standard |
| Styling | Tailwind CSS v3 | Utility-first, consistent |
| Charts | Recharts | Composable, accessible |
| Icons | Lucide React | Consistent SVG icon set |
| UI System | shadcn-compatible (`/components/ui`) | Portable, extensible |
| Glass FX | SVG `feTurbulence` + `feDisplacementMap` | Native liquid glass effect |
| Fonts | Fira Code + Fira Sans | Dashboard-native, technical precision |
| Data | Python (pandas + numpy + Faker) | Synthetic but realistic |
| Deployment | Vercel (static) | Zero cost, public URL |

---

## Synthetic Dataset

Because real healthcare payroll data is confidential, FairShift uses a **purpose-built synthetic dataset** that:

- Covers **50 staff** across 4 roles: RN, RPN, PSW, Administrative
- Spans **2 facilities**: Sunrise LTC and City Health Clinic
- Includes **90 days** of scheduling and payroll transactions (~2,845 shifts)
- Embeds **deliberate inequity patterns** so the metrics have visible signal to detect:
  - A subset of 3 PSWs receiving ~95% weekend assignment probability vs. 40% baseline
  - 2 RNs with a $2.50/hr unexplained pay variance below cohort average

The generator lives in `execution/generate_synthetic_data.py`.

---

## Running Locally

### Prerequisites
- Node.js ≥ 18
- Python 3 (for regenerating data — optional)

### Setup

```bash
# Clone the repo
git clone https://github.com/varnangoenka/fairshift.git
cd fairshift

# Install dashboard dependencies
cd dashboard
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

### Regenerate the synthetic dataset (optional)

```bash
# From project root
python3 -m venv execution/.venv
source execution/.venv/bin/activate
pip install -r execution/requirements.txt
python3 execution/generate_synthetic_data.py

# Then copy to dashboard public folder
cp .tmp/synthetic_data.json dashboard/public/synthetic_data.json
```

---

## Project Structure

```
.
├── dashboard/                  # Vite + React frontend
│   ├── public/
│   │   └── synthetic_data.json # Pre-generated dataset
│   └── src/
│       ├── components/ui/      # shadcn-compatible component layer
│       │   └── liquid-glass-button.jsx
│       ├── lib/
│       │   └── utils.js        # cn() utility
│       ├── App.jsx             # Main app + all 4 panels
│       ├── components.jsx      # Chart + card components
│       ├── metrics.js          # WES, OBI, SFR, CPI, BRS engines
│       └── index.css           # Liquid glass design system
├── execution/
│   ├── generate_synthetic_data.py
│   └── requirements.txt
├── directives/                 # SOPs (3-layer agent architecture)
├── .tmp/                       # Intermediate files (gitignored)
└── design-system/              # UI/UX Pro Max generated design spec
```

---

## Design Philosophy

The UI targets **payroll administrators and HR leads** — people who make decisions under time pressure and don't need a data science degree to act on what they see.

Design principles applied (via [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) skill):
- Liquid glass panels using SVG `feTurbulence` displacement maps + inset shimmer shadows
- Fira Code for numbers/headers (precision aesthetic), Fira Sans for body
- Color-coded severity system: green → yellow → red, consistent across all metric types
- Facility filter that live-recomputes all 5 metrics on switch

---

## Value to SLR Industries

FairShift is built on three fronts:

1. **Reference implementation** — Fork, critique, or extend the prototype as a starting point for the Advance Ontario project
2. **Documented fairness framework** — The five metrics + methodology can be adopted directly or used as a baseline
3. **Sales-enabling artifact** — Can be shown to prospective clinic and LTC clients as a tangible demo

---

## License

MIT — use freely, attribution appreciated.

---

*Built by Varnan Goenka — Advance Ontario Applicant, Digital Enterprise Management, University of Toronto Mississauga*
