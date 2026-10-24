# June & Bloom: Project Audit & Stack Decision (WP0)

**Date:** 2026-10-23 | **Refs:** `T0.1`, `T0.2`, `ADR-001`

---

## 1. Existing Workspace Audit (`T0.1`)

- **Repository Location:** `/Users/kayemmanuel/Developer/J&B`
- **Existing Codebase:** Green-field directory containing the canonical specification documents (`docs/01-PRD.md`, `docs/02-Implementation-Plan.md`, `docs/03-Architecture.md`) and `design/DESIGN.md`.
- **Recommendation:** **Build cleanly from scratch** following the exact repository layout, design tokens, and Next.js App Router architecture defined in `docs/03-Architecture.md`.

---

## 2. Architecture Decision Record: ADR-001 (`T0.2`)

- **Status:** Accepted
- **Decision:** Initialize a clean Next.js (App Router, TypeScript) application with Tailwind CSS mapped to `src/styles/tokens.css`, `motion` (`motion/react`) for tactile spring and scroll animations, Zod validation, and domain services for pricing, zones, stock, slots, capacity, and order numbers (`JB-YYMM-###`).
- **CI / Runner Compliance:** Per global infrastructure rules, `.github/workflows/ci.yml` uses `runs-on: [self-hosted, linux, x64]`.
