'use client';
import React, { useMemo, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { FiSave } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
interface Pemupukan {
  npk_smI?: number | string;
  dolomit_smI?: number | string;
}

interface StokPupuk {
  npk?: number | string;
  dolomit?: number | string;
}

interface Realisasi {
  npk?: number | string;
  dolomit?: number | string;
}

interface DataRow {
  distrik?: string;
  singkatan_distrik?: string;
  singkatan_kebun?: string;
  nama_kebun?: string;
  total_afdeling?: number | string;
  pemupukan?: Pemupukan;
  rencanaNPK?: number | string;
  rencanaDolomit?: number | string;
  stokPupuk?: StokPupuk;
  stokNPK?: number | string;
  stokDolomit?: number | string;
  sisaPemupukanNPK?: number | string;
  sisaPemupukanDolomit?: number | string;
  realisasiNPK?: number | string;
  realisasiDolomit?: number | string;
  realisasi?: Realisasi;
  realVsRencanaNPK?: number | string | null;
  realVsRencanaDolomit?: number | string | null;
  kode?: string;
  id?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
[key: string]: any;
  // [key: string]: string | number | null | undefined | Pemupukan | Realisasi | StokPupuk;
}

function toNumber(v: unknown) {
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    const cleaned = v.replace(/\s+/g, '').replace(/,/g, '');
    const n = parseFloat(cleaned);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

// helper untuk mendapatkan nilai dari row berdasarkan key yang kita gunakan

function getFieldValue(r: DataRow, key: string) {
  switch (key) {
    case 'distrik':
      return r.distrik ?? r['DISTRIK'] ?? '';
    case 'singkatan_distrik':
      return r.singkatan_distrik ?? r['SINGKATAN DISTRIK'] ?? '';
    case 'singkatan_kebun':
      // fallback ke kode jika presenter hanya kasih "kode"
      return r.singkatan_kebun ?? r.kode ?? r['SINGKATAN KEBUN'] ?? '';
    case 'nama_kebun':
      return r.nama_kebun ?? r['NAMA KEBUN'] ?? '';
    case 'total_afdeling':
      // fallback ke inventaris dari presenter
      return r.total_afdeling ?? r.inventaris ?? r['TOTAL AFDELLING'] ?? 0;
    case 'rencanaNPK':
      return toNumber(r.pemupukan?.npk_smI ?? r.rencanaNPK ?? r['Rencana NPK'] ?? 0);
    case 'rencanaDolomit':
      return toNumber(r.pemupukan?.dolomit_smI ?? r.rencanaDolomit ?? r['Rencana Dolomit'] ?? 0);
    case 'stokNPK':
      return toNumber(r.stokPupuk?.npk ?? r.stokNPK ?? r['Stok NPK'] ?? 0);
    case 'stokDolomit':
      return toNumber(r.stokPupuk?.dolomit ?? r.stokDolomit ?? r['Stok Dolomit'] ?? 0);
    case 'sisaPemupukanNPK':
      return toNumber(r.sisaPemupukanNPK ?? r['Sisa Pemupukan NPK'] ?? 0);
    case 'sisaPemupukanDolomit':
      return toNumber(r.sisaPemupukanDolomit ?? r['Sisa Pemupukan Dolomit'] ?? 0);
    case 'realisasiNPK':
      return toNumber(r.realisasi?.npk ?? r.realisasiNPK ?? r['Realisasi NPK'] ?? 0);
    case 'realisasiDolomit':
      return toNumber(r.realisasi?.dolomit ?? r.realisasiDolomit ?? r['Realisasi Dolomit'] ?? 0);
    case 'realVsRencanaNPK':
      return r.realVsRencanaNPK ?? r['Real vs Rencana Npk'] ?? null;
    case 'realVsRencanaDolomit':
      return r.realVsRencanaDolomit ?? r['Real vs Rencana Dolomit'] ?? null;
    case 'kode':
      return r.kode ?? r.id ?? r['SINGKATAN KEBUN'] ?? '';
    default:
      return r[key];
  }
}

export default function TableArea({
  data,
  onFullscreen,
}: {
  data: DataRow[];
  onFullscreen: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({
    key: 'nama_kebun',
    direction: 'ascending' as 'ascending' | 'descending',
  });

  const closeModal = () => setIsOpen(false);
  const openModal = () => setIsOpen(true);

  // sorting util — gunakan getFieldValue untuk fleksibilitas
  const sortedData = useMemo(() => {
    const arr = [...(data || [])];
    const key = sortConfig.key;
    const dir = sortConfig.direction === 'ascending' ? 1 : -1;
    arr.sort((a, b) => {
      const va = getFieldValue(a, key);
      const vb = getFieldValue(b, key);

      // If both values numeric -> compare numeric
      const na = toNumber(va);
      const nb = toNumber(vb);
      if (na !== 0 || nb !== 0) {
        return dir * (na - nb);
      }

      // fallback to string compare
      const sa = String(va ?? '').toLowerCase();
      const sb = String(vb ?? '').toLowerCase();
      return dir * sa.localeCompare(sb);
    });

    return arr;
  }, [data, sortConfig]);

  const totalPages = Math.max(1, Math.ceil((sortedData?.length ?? 0) / rowsPerPage));
  const currentData = useMemo(() => {
    return sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const handleRowsPerPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Math.max(1, Number(e.target.value) || 1);
    setRowsPerPage(val);
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    setCurrentPage(1);
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === 'ascending' ? 'descending' : 'ascending' };
      }
      return { key, direction: 'ascending' };
    });
  };

  // Export helpers use same getters so values consistent with table
  const exportToExcel = () => {
    const rows = (sortedData || []).map((r) => {
      const rencanaNPK = getFieldValue(r, 'rencanaNPK');
      const rencanaDolomit = getFieldValue(r, 'rencanaDolomit');
      const stokNPK = getFieldValue(r, 'stokNPK');
      const stokDolomit = getFieldValue(r, 'stokDolomit');
      const realisasiNPK = getFieldValue(r, 'realisasiNPK');
      const realisasiDolomit = getFieldValue(r, 'realisasiDolomit');
      const realVsNPK = getFieldValue(r, 'realVsRencanaNPK') ?? (rencanaNPK ? ((realisasiNPK / rencanaNPK) * 100).toFixed(2) + '%' : '0.00%');
      const realVsDol = getFieldValue(r, 'realVsRencanaDolomit') ?? (rencanaDolomit ? ((realisasiDolomit / rencanaDolomit) * 100).toFixed(2) + '%' : '0.00%');

      return {
        distrik: getFieldValue(r, 'distrik'),
        singkatan_distrik: getFieldValue(r, 'singkatan_distrik'),
        singkatan_kebun: getFieldValue(r, 'singkatan_kebun'),
        nama_kebun: getFieldValue(r, 'nama_kebun'),
        total_afdeling: getFieldValue(r, 'total_afdeling'),
        rencanaNPK: toNumber(rencanaNPK),
        rencanaDolomit: toNumber(rencanaDolomit),
        stokNPK: toNumber(stokNPK),
        stokDolomit: toNumber(stokDolomit),
        sisaPemupukanNPK: toNumber(getFieldValue(r, 'sisaPemupukanNPK')),
        sisaPemupukanDolomit: toNumber(getFieldValue(r, 'sisaPemupukanDolomit')),
        realisasiNPK: toNumber(realisasiNPK),
        realisasiDolomit: toNumber(realisasiDolomit),
        realVsRencanaNPK: realVsNPK,
        realVsRencanaDolomit: realVsDol,
      };
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DataKebun');
    XLSX.writeFile(wb, 'data_kebun.xlsx');
    closeModal();
  };

  const exportToPDF = () => {
    const doc = new jsPDF('landscape');
    const tableColumn = [
      'Distrik',
      'Singkatan Distrik',
      'Singkatan Kebun',
      'Nama Kebun',
      'Total Afdeling',
      'Rencana NPK',
      'Rencana Dolomit',
      'Stok NPK',
      'Stok Dolomit',
      'Sisa Pemupukan NPK',
      'Sisa Pemupukan Dolomit',
      'Realisasi NPK',
      'Realisasi Dolomit',
      'Real vs Rencana NPK',
      'Real vs Rencana Dolomit',
    ];

    const tableRows = (sortedData || []).map((r) => {
      const rencanaNPK = toNumber(getFieldValue(r, 'rencanaNPK'));
      const rencanaDolomit = toNumber(getFieldValue(r, 'rencanaDolomit'));
      const stokNPK = toNumber(getFieldValue(r, 'stokNPK'));
      const stokDolomit = toNumber(getFieldValue(r, 'stokDolomit'));
      const sisaNPK = toNumber(getFieldValue(r, 'sisaPemupukanNPK'));
      const sisaDol = toNumber(getFieldValue(r, 'sisaPemupukanDolomit'));
      const realisasiNPK = toNumber(getFieldValue(r, 'realisasiNPK'));
      const realisasiDolomit = toNumber(getFieldValue(r, 'realisasiDolomit'));
      const realVsNPK = getFieldValue(r, 'realVsRencanaNPK') ?? (rencanaNPK ? ((realisasiNPK / rencanaNPK) * 100).toFixed(2) + '%' : '0.00%');
      const realVsDol = getFieldValue(r, 'realVsRencanaDolomit') ?? (rencanaDolomit ? ((realisasiDolomit / rencanaDolomit) * 100).toFixed(2) + '%' : '0.00%');

      return [
        getFieldValue(r, 'distrik'),
        getFieldValue(r, 'singkatan_distrik'),
        getFieldValue(r, 'singkatan_kebun'),
        getFieldValue(r, 'nama_kebun'),
        String(getFieldValue(r, 'total_afdeling') ?? ''),
        rencanaNPK.toFixed(2),
        rencanaDolomit.toFixed(2),
        stokNPK.toFixed(2),
        stokDolomit.toFixed(2),
        sisaNPK.toFixed(2),
        sisaDol.toFixed(2),
        realisasiNPK.toFixed(2),
        realisasiDolomit.toFixed(2),
        String(realVsNPK),
        String(realVsDol),
      ];
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 10,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [17, 63, 103] },
    });

    doc.save('data_kebun.pdf');
    closeModal();
  };

  // number of columns: 15 (as per your header)
  const colCount = 15;

  return (
    <div className="relative h-full p-3 flex flex-col bg-[#F8F8F8] text-black" id="table-area">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-semibold">Data Kebun</h3>
        <div className="flex gap-2 items-center">
          <button className="px-3 py-1 bg-[#113F67] text-white rounded" onClick={onFullscreen}>
            Full Table
          </button>
          <button className="px-3 py-1 bg-[#5E936C] text-white rounded flex items-center gap-1" onClick={openModal}>
            <FiSave />
            Save As
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto border rounded flex-1">
        <table className="min-w-full table-auto text-sm">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('distrik')}>Distrik</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('singkatan_distrik')}>Singkatan Distrik</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('singkatan_kebun')}>Singkatan Kebun</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('nama_kebun')}>Nama Kebun</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('total_afdeling')}>Total Afdeling</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('rencanaNPK')}>Rencana NPK</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('rencanaDolomit')}>Rencana Dolomit</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('stokNPK')}>Stok NPK</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('stokDolomit')}>Stok Dolomit</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('sisaPemupukanNPK')}>Sisa NPK</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('sisaPemupukanDolomit')}>Sisa Dolomit</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('realisasiNPK')}>Realisasi NPK</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('realisasiDolomit')}>Realisasi Dolomit</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('realVsRencanaNPK')}>Real vs Rencana NPK</th>
              <th className="p-2 cursor-pointer" onClick={() => handleSort('realVsRencanaDolomit')}>Real vs Rencana Dolomit</th>
            </tr>
          </thead>

          <tbody>
            {currentData.map((r, idx) => {
              const key = (getFieldValue(r, 'kode') || getFieldValue(r, 'nama_kebun') || `row-${idx}`) as string;
              const rencanaNPK = toNumber(getFieldValue(r, 'rencanaNPK'));
              const rencanaDolomit = toNumber(getFieldValue(r, 'rencanaDolomit'));
              const stokNPK = toNumber(getFieldValue(r, 'stokNPK'));
              const stokDolomit = toNumber(getFieldValue(r, 'stokDolomit'));
              const sisaNPK = toNumber(getFieldValue(r, 'sisaPemupukanNPK'));
              const sisaDol = toNumber(getFieldValue(r, 'sisaPemupukanDolomit'));
              const realisasiNPK = toNumber(getFieldValue(r, 'realisasiNPK'));
              const realisasiDolomit = toNumber(getFieldValue(r, 'realisasiDolomit'));

              const realVsNPK = getFieldValue(r, 'realVsRencanaNPK');
              const realVsDol = getFieldValue(r, 'realVsRencanaDolomit');

              const pctNPK = realVsNPK ?? (rencanaNPK ? ((realisasiNPK / rencanaNPK) * 100).toFixed(2) + '%' : '0.00%');
              const pctDol = realVsDol ?? (rencanaDolomit ? ((realisasiDolomit / rencanaDolomit) * 100).toFixed(2) + '%' : '0.00%');

              return (
                <tr key={key} className="border-t hover:bg-slate-50">
                  <td className="p-2">{getFieldValue(r, 'distrik')}</td>
                  <td className="p-2">{getFieldValue(r, 'singkatan_distrik')}</td>
                  <td className="p-2">{getFieldValue(r, 'singkatan_kebun')}</td>
                  <td className="p-2">{getFieldValue(r, 'nama_kebun')}</td>
                  <td className="p-2">{getFieldValue(r, 'total_afdeling') ?? ''}</td>
                  <td className="p-2">{rencanaNPK.toFixed(2)}</td>
                  <td className="p-2">{rencanaDolomit.toFixed(2)}</td>
                  <td className="p-2">{stokNPK.toFixed(2)}</td>
                  <td className="p-2">{stokDolomit.toFixed(2)}</td>
                  <td className="p-2">{sisaNPK.toFixed(2)}</td>
                  <td className="p-2">{sisaDol.toFixed(2)}</td>
                  <td className="p-2">{realisasiNPK.toFixed(2)}</td>
                  <td className="p-2">{realisasiDolomit.toFixed(2)}</td>
                  <td className="p-2">{pctNPK}</td>
                  <td className="p-2">{pctDol}</td>
                </tr>
              );
            })}

            {currentData.length === 0 && (
              <tr>
                <td colSpan={colCount} className="p-4 text-center text-sm text-gray-500">
                  No data
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-4">
        <div className="flex items-center gap-2">
          <label className="text-sm">Rows per page:</label>
          <input
            type="number"
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
            className="border rounded p-1 w-20 text-sm"
            min={1}
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Modal */}
      <Dialog
        open={isOpen}
        onClose={closeModal}
        className="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-black shadow-xl transition-all z-50"
      >
        <div className="fixed inset-0 bg-black/40 backdrop-blur-md transition-opacity" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
          <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white text-black shadow-xl transition-all scale-95 z-60">
            <div className="flex justify-end p-2">
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600" aria-label="Close">✕</button>
            </div>
            <div className="px-6 pb-6">
              <Dialog.Title className="text-lg font-semibold mb-2">Export Data Kebun</Dialog.Title>
              <p className="text-sm text-gray-600 mb-4">Pilih format file yang ingin kamu gunakan untuk menyimpan data kebun.</p>
              <div className="flex flex-col gap-3">
                <button onClick={exportToExcel} className="px-4 py-2 bg-[#5E936C] text-white rounded">Export to Excel</button>
                <button onClick={exportToPDF} className="px-4 py-2 bg-[#113F67] text-white rounded">Export to PDF</button>
              </div>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
