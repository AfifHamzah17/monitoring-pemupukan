// --- FILE: src/components/HashRouter.tsx ---
'use client'
import React, { useEffect, useState } from 'react'


type RouteMap = Record<string, React.ReactNode>


export default function HashRouter({ routes, defaultRoute = '/home' }: { routes: RouteMap; defaultRoute?: string }) {
const getPath = () => {
if (typeof window === 'undefined') return defaultRoute
const h = window.location.hash || ''
const p = h.replace(/^#/, '')
return p || defaultRoute
}


const [path, setPath] = useState(getPath())


useEffect(() => {
const onHash = () => setPath(getPath())
window.addEventListener('hashchange', onHash)
return () => window.removeEventListener('hashchange', onHash)
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [])


const normalized = path.startsWith('/') ? path : '/' + path
return <>{routes[normalized] ?? routes[defaultRoute]}</>
}