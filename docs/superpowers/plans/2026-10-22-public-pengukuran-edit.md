# Public Pengukuran Edit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Allow public form to load and edit existing measurements for the same ruangan/date/shift.

**Architecture:** Add a read endpoint for existing records and convert store to upsert for non-`is_input_2_times` categories; prefill the public form from that endpoint.

**Tech Stack:** Laravel 13, Inertia/React, Pest.

**Spec:** `docs/superpowers/specs/2026-10-22-public-pengukuran-edit-design.md`

## Global Constraints

- Public, unauthenticated endpoints.
- Preserve ACH and APAR checklist calculations.
- `is_input_2_times` categories remain append-only.

## Review Focus

- Date parsing between datetime-local and `whereDate`.
- Empty submitted values remove stale records.
- `is_input_2_times` categories are never overwritten.
- Failed existing-data fetch leaves the form usable.

## Task 1: Backend existing endpoint and upsert store

**Files:**
- Modify: `app/Http/Controllers/Public/PublicPengukuranController.php`
- Modify: `routes/web.php`

- [ ] Add `existing(Request $request)` method returning JSON map of kategori id to record fields.
- [ ] Add route `GET /public/pengukuran/existing`.
- [ ] Rewrite `store` duplicate handling: upsert non-`is_input_2_times`, create for others, delete empty existing records.
- [ ] Verify with `php -l`.

## Task 2: Prefill public form

**Files:**
- Modify: `resources/js/pages/welcome.tsx`

- [ ] Add state and fetch effect for existing data.
- [ ] Prefill non-`is_input_2_times` measurements.
- [ ] Show note when existing data is loaded.
- [ ] Keep submit behavior and reset after success.
- [ ] Verify `npm run types:check` for touched file if feasible.