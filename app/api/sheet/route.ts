// app/api/sheet/route.ts
import { NextResponse } from 'next/server';

function parseCsvSimple(csv: string): string[][] {
  const lines = csv.split(/\r\n|\n/).filter(Boolean);
  return lines.map(line => {
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        cells.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    // Trim whitespace for each cell
    return cells.map(c => c.trim());
  });
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const docId = url.searchParams.get('docId');
    const gid = url.searchParams.get('gid');

    if (!docId || !gid) {
      return NextResponse.json({ error: 'docId and gid required' }, { status: 400 });
    }

    const csvUrl = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;

    const res = await fetch(csvUrl);
    if (!res.ok) {
      return NextResponse.json({ error: 'Failed fetching Google Sheet', status: res.status }, { status: 502 });
    }
    const text = await res.text();
    const rows = parseCsvSimple(text);

    return NextResponse.json({ rows });
  } catch (err) {
    return NextResponse.json({ error: 'Server error', message: String(err) }, { status: 500 });
  }
}