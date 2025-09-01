// src/presenters/MonitoringPresenter.ts
import { Kebun } from '@/models/Kebun';

export type MonitoringView = {
  setAllData: (d: Kebun[]) => void;
  setFilteredData: (d: { distrik: string; kebuns: Kebun[] }[]) => void;
  focusMapOn: (coords: [number, number], label?: string) => void;
};

export class MonitoringPresenter {
  private view: MonitoringView;
  private data: Kebun[] = [];
  private selectedId: string | null = null;

  constructor(view: MonitoringView) {
    this.view = view;
  }

async loadData() {
  const docId = '1kn_dZuFadC7u4h0eEBVIMyrBEc9qvK316v1smObZlYw';
  const gid = '0';

  try {
    const res = await fetch(`/api/sheet?docId=${docId}&gid=${gid}`);
    if (!res.ok) {
      console.warn('MonitoringPresenter: fetch sheet failed, status', res.status);
      this.fallbackToDummy();
      return;
    }

    const json = await res.json();
    const rows: string[][] = json.rows ?? [];
    if (rows.length <= 2) {
      console.warn('MonitoringPresenter: sheet empty or no data');
      this.fallbackToDummy();
      return;
    }

    // Skip header (baris 0), mulai dari index 1
    const mapped: Kebun[] = rows.slice(1).map((r, idx) => {
      return {
        id: r[3] ? `${r[3]}-${r[4]}` : `row-${idx}`, // SINGKATAN KEBUN - NAMA KEBUN
        distrik: r[0] ?? '',                        // A: DISTRIK
        singkatan_distrik: r[2] ?? '',              // C: SINGKATAN DISTRIK
        kode: r[3] ?? '',                            // D: SINGKATAN KEBUN
        unit: r[3] ?? '',                            // Sama dengan singkatan kebun
        nama_kebun: r[4] ?? '',                      // E: NAMA KEBUN
        luas_ha: 0,                                  // Tidak tersedia di sheet
        inventaris: Number(r[5] ?? 0),               // F: TOTAL AFDELLING
        rumah: 0,                                    // Tidak tersedia di sheet
        coords: [0, 0], // optional                        // Tidak tersedia di sheet
        pemupukan: {
          npk_smI: Number(r[6] ?? 0),                // G: Rencana NPK
          dolomit_smI: Number(r[7] ?? 0),            // H: Rencana Dolomit
        },
        stokPupuk: {
          npk: Number(r[8] ?? 0),                    // I: Stok NPK
          dolomit: Number(r[9] ?? 0),                // J: Stok Dolomit
        },
        realisasi: {
          npk: Number(r[12] ?? 0),                   // M: Realisasi NPK
          dolomit: Number(r[13] ?? 0),               // N: Realisasi Dolomit
        },
      };
    });

    this.data = mapped;
    this.view.setAllData(this.data);
    this.view.setFilteredData(this.groupByDistrict(this.data));
  } catch (err) {
    console.error('MonitoringPresenter.loadData error', err);
    this.fallbackToDummy();
  }
}

  private fallbackToDummy() {
    const dummy: Kebun[] = [
      {
        id: '1KSD',
        distrik: 'DISTRIK JAWA BARAT',
        singkatan_distrik: '1KSD',
        kode: '1KSD',
        unit: 'A',
        nama_kebun: 'KEBUN SEI DAUN',
        luas_ha: 7091.7,
        inventaris: 1001003,
        rumah: 1,
        coords: [1.67177745, 100.2937518],
        pemupukan: { npk_smI: 6985.83, dolomit_smI: 4405748 },
        stokPupuk: { npk: 1173576, dolomit: 361828 },
        realisasi: { npk: 7025, dolomit: 2898900 },
      },
    ];
    this.data = dummy;
    this.view.setAllData(this.data);
    this.view.setFilteredData(this.groupByDistrict(this.data));
  }

  private groupByDistrict(kebuns: Kebun[]) {
    const grouped: { [key: string]: Kebun[] } = {};
    kebuns.forEach((k) => {
      const key = k.distrik || 'UNKNOWN';
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(k);
    });
    return Object.keys(grouped).map((distrik) => ({ distrik, kebuns: grouped[distrik] }));
  }

  selectKebun(id: string) {
    this.selectedId = id;
    const selectedKebun = this.data.find((d) => d.id === id || d.kode === id);
    if (selectedKebun) {
      this.view.setFilteredData([{ distrik: selectedKebun.distrik, kebuns: [selectedKebun] }]);
      if (selectedKebun.coords) {
        this.view.focusMapOn(selectedKebun.coords, selectedKebun.nama_kebun);
      } else {
        console.warn('No coords for selected kebun', selectedKebun);
      }
    }
  }

  clearSelection() {
    this.selectedId = null;
    this.view.setFilteredData(this.groupByDistrict(this.data));
  }

  computeChartData(filtered: any): { cycle: string; value: number }[] {
    let kebunList: Kebun[] = [];
    if (!filtered) kebunList = this.data;
    else if (Array.isArray(filtered) && filtered[0]?.kebuns) {
      filtered.forEach((g: any) => { kebunList.push(...g.kebuns); });
    } else kebunList = filtered as Kebun[];

    const totals = kebunList.reduce(
      (acc, k) => {
        acc.totalRencanaNPK += k.pemupukan?.npk_smI ?? 0;
        acc.totalRencanaDolomit += k.pemupukan?.dolomit_smI ?? 0;
        acc.totalRealisasiNPK += k.realisasi?.npk ?? 0;
        acc.totalRealisasiDolomit += k.realisasi?.dolomit ?? 0;
        return acc;
      },
      { totalRencanaNPK: 0, totalRencanaDolomit: 0, totalRealisasiNPK: 0, totalRealisasiDolomit: 0 }
    );

    return [
      { cycle: 'Rencana NPK', value: totals.totalRencanaNPK },
      { cycle: 'Realisasi NPK', value: totals.totalRealisasiNPK },
      { cycle: 'Rencana Dolomit', value: totals.totalRencanaDolomit },
      { cycle: 'Realisasi Dolomit', value: totals.totalRealisasiDolomit },
    ];
  }

  computeKebunMetrics(filtered: any) {
    let kebunList: Kebun[] = [];
    if (!filtered) kebunList = this.data;
    else if (Array.isArray(filtered) && filtered[0]?.kebuns) {
      filtered.forEach((g: any) => kebunList.push(...g.kebuns));
    } else kebunList = filtered as Kebun[];

    return kebunList.map((k) => {
      const npk = k.pemupukan?.npk_smI ?? 0;
      const dol = k.pemupukan?.dolomit_smI ?? 0;
      const realN = k.realisasi?.npk ?? 0;
      const realD = k.realisasi?.dolomit ?? 0;
      const sisaN = npk - realN;
      const sisaD = dol - realD;
      const percN = npk ? (realN / npk) * 100 : 0;
      const percD = dol ? (realD / dol) * 100 : 0;

      return {
        id: k.id,
        nama_kebun: k.nama_kebun,
        sisaPemupukanNPK: sisaN,
        sisaPemupukanDolomit: sisaD,
        persenRealisasiNPK: percN,
        persenRealisasiDolomit: percD,
      };
    });
  }
}
