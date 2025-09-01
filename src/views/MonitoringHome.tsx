'use client';
import React, { useEffect, useRef, useState } from 'react';
import Navbar from '@/components/Navbar';
import { MonitoringPresenter } from '@/presenters/MonitoringPresenter';
import TableArea from './TableArea';
import ChartArea from './ChartArea';
import dynamic from 'next/dynamic';
import { Kebun } from '@/models/Kebun';

// Map heavy -> dynamic import tanpa SSR
const MapView = dynamic(() => import('./MapView'), { ssr: false });

// Interface for MapView's exposed methods via ref
interface MapViewHandle {
  setView: (coords: [number, number], zoom?: number, options?: { animate?: boolean }) => void;
}

// type FilteredDataType = { distrik: string; kebuns: Kebun[] }[];

export default function MonitoringHome() {
  const presenterRef = useRef<MonitoringPresenter | null>(null);
  const [allData, setAllData] = useState<Kebun[]>([]);
  const [filteredData, setFilteredData] = useState<any>([]);
  const [chartData, setChartData] = useState<{ cycle: string; value: number }[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Use MapViewHandle type instead of any
  const mapRef = useRef<MapViewHandle | null>(null);

  const view = React.useMemo(
    () => ({
      setAllData: (d: Kebun[]) => setAllData(d),
      setFilteredData: (d: any) => {
        setFilteredData(d);
        const cdata = presenterRef.current?.computeChartData(d) || [];
        setChartData(cdata);
      },
// eslint-disable-next-line @typescript-eslint/no-unused-vars
focusMapOn: (coords: [number, number], _label?: string) => {
  if (!mapRef.current) return;
  try {
    mapRef.current.setView(coords, 13, { animate: true });
  } catch (e) {
    console.warn('map focus failed', e);
  }
},
    }),
    []
  );

  useEffect(() => {
    if (!presenterRef.current) presenterRef.current = new MonitoringPresenter(view);
    presenterRef.current.loadData();
  }, [view]);

  const navigateHash = (p: string) => {
    window.location.hash = '#/' + p;
  };

  // helpers fullscreen with proper typings
  const goFullscreen = (elId: string) => {
    const el = document.getElementById(elId) as (HTMLElement & { webkitRequestFullscreen?: () => Promise<void> }) | null;
    if (!el) return;

    if (el.requestFullscreen) {
      el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    }
  };

  const onSelectKebun = (id: string) => {
    presenterRef.current?.selectKebun(id);
    setIsModalOpen(true); // Show modal when kebun is selected
  };

  const onClear = () => {
    presenterRef.current?.clearSelection();
    setIsModalOpen(false); // Close modal when clearing selection
  };

const flattenedFilteredData: Kebun[] = filteredData.flatMap((group: { kebuns: any; }) => group.kebuns);
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onNavigate={navigateHash} />

      <div className="flex" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Left Panel */}
        <div
          className="fixed top-20 left-4 bg-white shadow-lg rounded p-2 z-40"
          style={{ width: collapsed ? 44 : '10%' }}
        >
          <button
            className="mb-2 w-full p-2 rounded bg-gray-100 hover:bg-gray-200"
            onClick={() => setCollapsed((s) => !s)}
          >
            {collapsed ? '▸' : 'Kebun'}
          </button>

          {!collapsed && (
            <div className="overflow-auto max-h-[60vh]">
              {allData.map((d) => (
                <div key={d.id} className="mb-2 border-b pb-2">
                  <div className="text-xs font-medium">{d.distrik}</div>
                  <div className="text-sm font-semibold">{d.nama_kebun}</div>
                  <div className="flex gap-2 mt-2">
                    <button
                      className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
                      onClick={() => onSelectKebun(d.id)}
                    >
                      Select
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Content Area */}
        <main className="flex flex-1 ml-0" style={{ marginLeft: collapsed ? 44 : '10%' }}>
          <section style={{ width: '55%' }} className="p-4">
            <div id="table-and-chart" className="flex flex-col gap-3 h-full">
              <div
                className="flex-1 border rounded bg-white shadow-sm"
                style={{
                  height: flattenedFilteredData.length > 10 ? 'calc(100vh - 300px)' : 'calc(100vh - 550px)',
                }}
              >
                <TableArea data={filteredData} onFullscreen={() => goFullscreen('table-area')} />
              </div>

              <div className="h-500 bg-white rounded p-3 shadow-sm">
                <ChartArea chartData={chartData} />
              </div>
            </div>
          </section>

          <aside style={{ width: '35%' }} className="p-4">
            <div className="h-full bg-white rounded shadow-sm flex flex-col">
              <div className="flex justify-between items-center p-3 border-b">
                <h4 className="font-semibold">Peta Kebun</h4>
                <div>
                  <button className="px-3 py-1 mr-2 bg-gray-100 rounded" onClick={() => goFullscreen('map-area')}>
                    Fullscreen
                  </button>
                  <button className="px-3 py-1 bg-gray-100 rounded" onClick={onClear}>
                    Show All
                  </button>
                </div>
              </div>

              <div id="map-area" className="flex-1 relative" style={{ minHeight: 400 }}>
                <MapView
                  data={allData}
                  filteredData={flattenedFilteredData}
                  isModalOpen={isModalOpen}
                  ref={mapRef}
                />
              </div>
            </div>
          </aside>
        </main>
      </div>
    </div>
  );
}
