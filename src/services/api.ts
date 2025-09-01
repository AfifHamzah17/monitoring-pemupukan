// --- FILE: src/services/api.ts ---
import { Kebun } from '@/models/Kebun'


export async function fetchKebunAll(): Promise<Kebun[]> {
// contoh: return fetch(process.env.NEXT_PUBLIC_API_URL + '/kebun').then(r => r.json())
return new Promise((res) => setTimeout(() => res([]), 200))
}