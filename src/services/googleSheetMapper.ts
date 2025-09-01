// src/services/googleSheetMapper.ts
export type KebunRow = {
  id?: string;
  kode?: string;
  nama_kebun?: string;
  distrik?: string;
  luas_ha?: number | null;
  inventaris?: number | null;
  pemupukan?: { npk_smI?: number; dolomit_smI?: number };
  stokPupuk?: { npk?: number; dolomit?: number };
  realisasi?: { npk?: number; dolomit?: number };
};

function toNumber(v: string | undefined): number {
  if (!v) return 0;
  const cleaned = v.replace(/\s+/g, '').replace(/,/g, '');
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Map CSV rows (2D array) -> KebunRow[]
 * startRowIndex default 7 because instructions: data starts at row 8 in sheet (0-based index 7)
 *
 * Column mapping (0-based indexes):
 * B (index 1) = nama_kebun
 * C (2) = rencana NPK
 * D (3) = rencana Dolomit
 * L (11) = stok NPK
 * M (12) = stok Dolomit
 * R (17) = realisasi NPK
 * S (18) = realisasi Dolomit
 *
 * We also try to read kode from column A (index 0) if present, and distrik from column E (index 4) as a best-effort.
 */
export function mapCsvRowsToKebun(rows: string[][], startRowIndex = 7): KebunRow[] {
  const mapped: KebunRow[] = [];
  if (!rows || rows.length <= startRowIndex) return mapped;

  for (let i = startRowIndex; i < rows.length; i++) {
    const row = rows[i] ?? [];
    // skip empty rows (no kebun name)
    const nama_kebun = (row[1] ?? '').trim();
    if (!nama_kebun) continue;

    const kode = (row[0] ?? '').trim() || undefined;
    const distrik = (row[4] ?? '').trim() || undefined;

    const rencanaNPK = toNumber(row[2]);
    const rencanaDolomit = toNumber(row[3]);
    const stokNPK = toNumber(row[11]);
    const stokDolomit = toNumber(row[12]);
    const realisasiNPK = toNumber(row[17]);
    const realisasiDolomit = toNumber(row[18]);

    const kebun: KebunRow = {
      id: kode || `row-${i}`,
      kode,
      nama_kebun,
      distrik,
      luas_ha: null,
      inventaris: null,
      pemupukan: { npk_smI: rencanaNPK, dolomit_smI: rencanaDolomit },
      stokPupuk: { npk: stokNPK, dolomit: stokDolomit },
      realisasi: { npk: realisasiNPK, dolomit: realisasiDolomit },
    };

    mapped.push(kebun);
  }

  return mapped;
}