'use client'


import React from 'react'
import HashRouter from '@/components/HashRouter'
import MonitoringHome from '@/views/MonitoringHome'
// import Menu1 from '@/views/'


export default function Page() {
return (
<HashRouter
routes={{
'/home': <MonitoringHome />,
'/menu-1': <div className="p-6">Menu 1 - placeholder</div>,
'/menu-2': <div className="p-6">Menu 2 - placeholder</div>,
'/menu-3': <div className="p-6">Menu 3 - placeholder</div>,
'/menu-4': <div className="p-6">Menu 4 - placeholder</div>,
}}
defaultRoute="/home"
/>
)
}