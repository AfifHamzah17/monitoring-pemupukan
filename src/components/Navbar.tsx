'use client'
import React from 'react'
import Image from 'next/image' // ✅ import the Image component

export default function Navbar({ onNavigate }: { onNavigate: (p: string) => void }) {
  const menus = ['Menu 1', 'Menu 2', 'Menu 3', 'Menu 4']

  return (
    <header className="w-full bg-white shadow-sm px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* ✅ Replace <img> with <Image /> */}
        <Image
          src="https://www.mendaftarkerja.com/wp-content/uploads/2024/09/IMG_3702.png"
          alt="logo"
          width={32}
          height={32}
          className="rounded"
        />
        <div className="font-semibold text-lg">Monitoring Pemupukan</div>
      </div>
      <nav className="flex items-center gap-6">
        {menus.map((m) => (
          <button key={m} className="text-sm" onClick={() => onNavigate(m.toLowerCase().replace(/\s+/g, '-'))}>
            {m}
          </button>
        ))}
        <button className="text-sm font-semibold" onClick={() => onNavigate('home')}>Home</button>
      </nav>
    </header>
  )
}
