import type { PmRapportMensuelDTO } from './pmReportsService';

const MONTHS = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

function safeFileName(value: string): string {
  return value.normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function xml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function row(values: unknown[]): string {
  return `<row>${values.map(v => `<c t="inlineStr"><is><t>${xml(v)}</t></is></c>`).join('')}</row>`;
}

function worksheetXml(report: PmRapportMensuelDTO): string {
  const rows = [
    row([`Rapport V2 - ${report.libellePeriode}`]),
    row(['Mois', MONTHS[report.mois], 'Année', report.annee]),
    row([]),
    row(['Total anomalies', report.nombreTotalAnomalies]),
    row(['Conflits', report.nombreConflits]),
    row(['Surcharges', report.nombreSurcharges]),
    row(['Sous-charges', report.nombreSousCharges]),
    row(['Non staffés', report.nombreNonStaffes]),
    row(['Collaborateurs concernés', report.nombreCollaborateursConcernes]),
    row(['Projets concernés', report.projetsConcernes.join(', ')]),
    row([]),
    row(['Collaborateur', 'Projet(s)', 'Type anomalie', 'Statut', 'Mois', 'Année', 'Capacité mensuelle', 'Jours demandés', 'Taux charge', 'Message']),
    ...report.anomalies.map(a => row([
      a.collaborateur,
      a.projetsConcernes,
      a.typeAnomalie,
      a.statutAnomalie,
      a.mois,
      a.annee,
      a.capaciteMensuelle,
      a.joursDemandes,
      `${a.tauxCharge}%`,
      a.messageExplicatif,
    ])),
  ];

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>${rows.join('')}</sheetData>
</worksheet>`;
}

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let i = 0; i < 8; i++) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function u16(value: number): number[] {
  return [value & 0xff, (value >>> 8) & 0xff];
}

function u32(value: number): number[] {
  return [value & 0xff, (value >>> 8) & 0xff, (value >>> 16) & 0xff, (value >>> 24) & 0xff];
}

function makeZip(files: Record<string, string>): Blob {
  const encoder = new TextEncoder();
  const localParts: Uint8Array[] = [];
  const centralParts: Uint8Array[] = [];
  let offset = 0;

  Object.entries(files).forEach(([name, content]) => {
    const nameBytes = encoder.encode(name);
    const data = encoder.encode(content);
    const crc = crc32(data);
    const localHeader = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameBytes.length), ...u16(0),
    ]);
    localParts.push(localHeader, nameBytes, data);

    const centralHeader = new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameBytes.length), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0), ...u32(0), ...u32(offset),
    ]);
    centralParts.push(centralHeader, nameBytes);
    offset += localHeader.length + nameBytes.length + data.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(Object.keys(files).length),
    ...u16(Object.keys(files).length), ...u32(centralSize), ...u32(offset), ...u16(0),
  ]);

  return new Blob([...localParts, ...centralParts, end], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

export function exportReportExcel(report: PmRapportMensuelDTO): void {
  const files = {
    '[Content_Types].xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`,
    '_rels/.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
    'xl/workbook.xml': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Rapport V2" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
    'xl/_rels/workbook.xml.rels': `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`,
    'xl/worksheets/sheet1.xml': worksheetXml(report),
  };
  download(makeZip(files), `rapport-v2-${safeFileName(report.libellePeriode)}.xlsx`);
}

function pdfEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function buildPdf(lines: string[]): Blob {
  const pages = Array.from({ length: Math.max(1, Math.ceil(lines.length / 44)) }, (_, pageIndex) =>
    lines.slice(pageIndex * 44, pageIndex * 44 + 44)
  );
  const objects: string[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  ];
  const pageObjectIds: number[] = [];

  pages.forEach((pageLines) => {
    const pageObjectId = objects.length + 1;
    const contentObjectId = pageObjectId + 1;
    pageObjectIds.push(pageObjectId);
    const stream = pageLines.map((line, index) => {
      const y = 800 - index * 16;
      return `BT /F1 10 Tf 50 ${y} Td (${pdfEscape(line.slice(0, 110))}) Tj ET`;
    }).join('\n');
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectId} 0 R >>`,
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
    );
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`;

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [0];
  objects.forEach((obj, i) => {
    offsets.push(pdf.length);
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`;
  });
  const xref = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

export function exportReportPdf(report: PmRapportMensuelDTO): void {
  const lines = [
    `Rapport V2 - ${report.libellePeriode}`,
    `Mois / année : ${MONTHS[report.mois]} ${report.annee}`,
    `Total anomalies : ${report.nombreTotalAnomalies}`,
    `Conflits : ${report.nombreConflits} | Surcharges : ${report.nombreSurcharges} | Sous-charges : ${report.nombreSousCharges} | Non staffés : ${report.nombreNonStaffes}`,
    `Collaborateurs concernés : ${report.nombreCollaborateursConcernes}`,
    `Projets concernés : ${report.projetsConcernes.join(', ') || 'Aucun'}`,
    '',
    'Anomalies détaillées',
    ...report.anomalies.map(a => [
      `${a.collaborateur || 'N/A'} | ${a.typeAnomalie} | ${a.tauxCharge}% | ${MONTHS[a.mois]} ${a.annee}`,
      `Projets: ${a.projetsConcernes || 'N/A'}`,
      `Message: ${a.messageExplicatif || 'N/A'}`,
      '',
    ]).flat(),
  ];
  download(buildPdf(lines), `rapport-v2-${safeFileName(report.libellePeriode)}.pdf`);
}
