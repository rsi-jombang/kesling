# Public Pengukuran Edit Design

## Intent

Petugas yang mengisi formulir pencatatan publik perlu bisa melihat data lama untuk ruangan, tanggal, dan shift yang sama, lalu mengeditnya manual sebelum menyimpan. Saat ini form menolak pengisian ulang untuk kategori non-`is_input_2_times`.

## Goals

- Load existing measurements for selected ruangan/tanggal/shift into the public form.
- Allow editing and saving updates instead of creating duplicates for non-`is_input_2_times` categories.
- Keep `is_input_2_times` categories able to create new entries.
- Do not require login.

## Non-goals

- No user ownership/audit trail.
- No edit history or versioning.
- No changes to admin create/edit flow.

## Constraints

- Public, unauthenticated.
- Preserve existing calculation rules (ACH, APAR checklist).
- Preserve `is_input_2_times` behavior.

## Approach

Backend:
- Add `GET /public/pengukuran/existing` returning a map of `kategori_pengukuran_id => {id, value, detail_pengukuran, keterangan}` for records matching ruangan/date/shift.
- Change `PublicPengukuranController::store` to upsert: update existing non-`is_input_2_times` records, create new records otherwise, delete records whose submitted value is empty.

Frontend (`welcome.tsx`):
- Fetch existing data when ruangan, tanggal, and shift are selected.
- Prefill only non-`is_input_2_times` categories.
- Show a note when existing data is loaded.
- Keep form submit behavior.

## Review Focus

- Date parsing between datetime-local input and `whereDate`.
- Empty values should remove stale records, not leave nulls.
- `is_input_2_times` categories must not be overwritten.
- Fetch should not clobber in-progress edits unexpectedly.
- Missing/failed fetch should leave form usable.