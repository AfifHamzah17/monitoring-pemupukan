// --- FILE: src/models/Kebun.ts ---
export type Pemupukan = {
  npk_smI: number;
  dolomit_smI: number;
};

export type StokPupuk = {
  npk: number;
  dolomit: number;
};

export type RealisasiPupuk = {
  npk: number;
  dolomit: number;
};

export type Kebun = {
  id: string;
  distrik: string;
  singkatan_distrik: string;
  kode: string;
  unit: string;
  nama_kebun: string;
  luas_ha: number;
  inventaris: number;
  rumah: number;
  coords: [number, number];
  pemupukan: Pemupukan;
  stokPupuk: StokPupuk;
  realisasi: RealisasiPupuk;
};
