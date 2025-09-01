// src/services/googleSheet.ts
export function csvUrlFor(docId: string, gid: string) {
  return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
}

/** simple CSV parser (same logic as server) */
export function parseCsvSimple(csv: string): string[][] {
  const lines = csv.split(/\r\n|\n/).filter(Boolean);
  return lines.map(line => {
    const cells: string[] = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (ch === ',' && !inQuotes) {
        cells.push(cur);
        cur = '';
      } else {
        cur += ch;
      }
    }
    cells.push(cur);
    return cells.map(c => c.trim());
  });
}