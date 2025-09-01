// --- FILE: app/layout.tsx ---
import './globals.css'
import React from 'react'


export const metadata = {
title: 'Monitoring Pemupukan',
description: 'SPA MVP monitoring pemupukan'
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
return (
<html lang="en">
<body>
{children}
</body>
</html>
)
}