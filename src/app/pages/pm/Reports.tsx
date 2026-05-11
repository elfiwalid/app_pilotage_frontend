import { useState } from 'react';
import { FileText, Download, FileSpreadsheet, CheckCircle, Clock, RefreshCw, Calendar, Eye, ChevronRight, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { C, S, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, cardStyle, thStyle, tdStyle } from '../../components/ui/design-system';

/* ─── FORECAST REPORTS DATA ─────────────────────── */
const forecastReports = [
  {
    id: 1,
    code: 'V2-FC-Q1-2026',
    title: 'V2 Forecast',
    period: 'Janvier – Mars 2026',
    periodShort: 'Q1 2026',
    type: 'V2',
    submittedDate: '15 Janvier 2026',
    status: 'soumis',
    projects: 3,
    resources: 8,
    avgAlloc: '87%',
    lines: [
      { resource: 'Youssef El Amrani', project: 'Projet Alpha', m1: '90%', m2: '92%', m3: '95%', avg: '92%' },
      { resource: 'Sara Benali', project: 'Projet Beta', m1: '78%', m2: '80%', m3: '82%', avg: '80%' },
      { resource: 'Mohamed Alaoui', project: 'Projet Iota', m1: '100%', m2: '105%', m3: '110%', avg: '105%' },
      { resource: 'Salma Idrissi', project: 'Projet Gamma', m1: '70%', m2: '72%', m3: '75%', avg: '72%' },
      { resource: 'Ahmed Chafik', project: 'Projet Epsilon', m1: '95%', m2: '98%', m3: '100%', avg: '98%' },
    ],
    monthLabels: ['Janvier', 'Février', 'Mars'],
  },
  {
    id: 2,
    code: 'V2-FC-ANNUAL-2026',
    title: 'V2 Annual Forecast',
    period: 'Avril – Décembre 2026',
    periodShort: 'Annuel 2026',
    type: 'V2 Annuel',
    submittedDate: '01 Avril 2026',
    status: 'en-preparation',
    projects: 5,
    resources: 12,
    avgAlloc: '91%',
    lines: [
      { resource: 'Youssef El Amrani', project: 'Projet Alpha', m1: '93%', m2: '95%', m3: '92%', avg: '93%' },
      { resource: 'Sara Benali', project: 'Projet Delta', m1: '85%', m2: '88%', m3: '90%', avg: '88%' },
      { resource: 'Mohamed Alaoui', project: 'Projet Kappa', m1: '100%', m2: '98%', m3: '95%', avg: '98%' },
      { resource: 'Imane El Fassi', project: 'Projet Lambda', m1: '65%', m2: '70%', m3: '75%', avg: '70%' },
      { resource: 'Hamza Lahlou', project: 'Projet Theta', m1: '40%', m2: '45%', m3: '50%', avg: '45%' },
    ],
    monthLabels: ['Avr–Mai', 'Juin–Sep', 'Oct–Déc'],
  },
];

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  soumis: { label: 'Soumis', bg: '#ECFDF5', text: '#065F46', dot: C.green },
  'en-preparation': { label: 'En préparation', bg: '#FFF7ED', text: '#92400E', dot: '#F59E0B' },
};

const TYPE_ACCENT: Record<string, string> = { 'V2': C.blue, 'V2 Annuel': C.purple };

const allocColor = (v: string) => {
  const n = parseInt(v);
  return n > 100 ? C.red : n >= 90 ? '#F59E0B' : C.green;
};

/* ─── DETAIL MODAL ───────────────────────────────── */
function ReportDetailModal({ report, onClose }: { report: typeof forecastReports[0]; onClose: () => void }) {
  const accent = TYPE_ACCENT[report.type] || C.blue;
  const sc = STATUS_CFG[report.status];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={onClose}>
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(11,7,24,0.6)', backdropFilter: 'blur(4px)' }} />
      <div style={{ position: 'relative', backgroundColor: '#fff', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto', borderRadius: R, boxShadow: S.modal, borderTop: `3px solid ${accent}` }}
        onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <p style={{ fontSize: '15px', fontWeight: 800, color: C.text }}>{report.title}</p>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', backgroundColor: accent, padding: '2px 8px', borderRadius: '3px' }}>{report.code}</span>
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot }} />{sc.label}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: C.textMuted }}>{report.period} · {report.projects} projets · {report.resources} ressources</p>
          </div>
          <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1L11 11M11 1L1 11" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Summary KPIs */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
            {[{ l: 'Code', v: report.code, c: accent }, { l: 'Soumis le', v: report.submittedDate, c: C.text }, { l: 'Période', v: report.period, c: C.text }, { l: 'Alloc. moyenne', v: report.avgAlloc, c: parseInt(report.avgAlloc) > 95 ? C.red : C.green }].map(i => (
              <div key={i.l} style={{ padding: '8px 12px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '9px', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{i.l}</p>
                <p style={{ fontSize: '12px', fontWeight: 800, color: i.c }}>{i.v}</p>
              </div>
            ))}
          </div>

          {/* Allocation table */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>Détail des allocations prévisionnelles</p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>{['Ressource', 'Projet', ...report.monthLabels, 'Moyenne'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {report.lines.map((l, i) => (
                    <tr key={i} onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <td style={{ ...tdStyle, fontWeight: 600, color: C.text, borderBottom: i < report.lines.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>{l.resource}</td>
                      <td style={{ ...tdStyle, borderBottom: i < report.lines.length - 1 ? `1px solid ${C.borderLight}` : 'none', fontSize: '11px', color: C.textSecondary }}>{l.project}</td>
                      {[l.m1, l.m2, l.m3].map((v, vi) => (
                        <td key={vi} style={{ ...tdStyle, textAlign: 'center', borderBottom: i < report.lines.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                          <span style={{ fontSize: '11px', fontWeight: 700, color: allocColor(v), backgroundColor: `${allocColor(v)}12`, padding: '2px 6px', borderRadius: '3px' }}>{v}</span>
                        </td>
                      ))}
                      <td style={{ ...tdStyle, textAlign: 'center', borderBottom: i < report.lines.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <span style={{ fontSize: '12px', fontWeight: 800, color: allocColor(l.avg) }}>{l.avg}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
            <BtnPrimary onClick={() => { toast.success(`Export PDF — ${report.title}`); }}>
              <FileText style={{ width: '12px', height: '12px' }} />Exporter PDF
            </BtnPrimary>
            <BtnGhost onClick={() => { toast.success(`Export Excel — ${report.title}`); }}>
              <FileSpreadsheet style={{ width: '12px', height: '12px' }} />Exporter Excel
            </BtnGhost>
            <BtnGhost onClick={onClose}>Fermer</BtnGhost>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN ─────────────────────────────────────── */
export function PmReports() {
  const [selectedReport, setSelectedReport] = useState<typeof forecastReports[0] | null>(null);
  const [generating, setGenerating] = useState<number | null>(null);

  const handleGenerate = (id: number, title: string) => {
    setGenerating(id);
    toast.loading(`Génération : ${title}…`, { id: `gen-${id}` });
    setTimeout(() => {
      setGenerating(null);
      toast.success(`${title} généré avec succès !`, { id: `gen-${id}` });
    }, 1800);
  };

  const handleExport = (id: number, format: string, title: string) => {
    toast.loading(`Export ${format}…`, { id: `exp-${id}` });
    setTimeout(() => toast.success(`${title} exporté en ${format} !`, { id: `exp-${id}` }), 1200);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <PageHeader title="Rapports de Prévision V2" subtitle="Forecasts staffing chronologiques — Staff2Staff">
        <BtnPrimary onClick={() => { toast.loading('Actualisation…', { id: 'ref' }); setTimeout(() => toast.success('Rapports actualisés !', { id: 'ref' }), 1500); }}>
          <RefreshCw style={{ width: '12px', height: '12px' }} />Actualiser tous
        </BtnPrimary>
      </PageHeader>

      {/* Summary KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {[
          { l: 'Rapports disponibles', v: forecastReports.length, c: C.blue },
          { l: 'Rapports soumis', v: forecastReports.filter(r => r.status === 'soumis').length, c: C.green },
          { l: 'En préparation', v: forecastReports.filter(r => r.status === 'en-preparation').length, c: '#F59E0B' },
        ].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.c}`, padding: '12px 16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{s.l}</p>
            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Chronological timeline label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Calendar style={{ width: '14px', height: '14px', color: C.purple }} />
        <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>Rapports — Classement Chronologique 2026</p>
        <div style={{ flex: 1, height: '1px', backgroundColor: C.border, marginLeft: '8px' }} />
      </div>

      {/* Report cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {forecastReports.map((report, idx) => {
          const accent = TYPE_ACCENT[report.type] || C.blue;
          const sc = STATUS_CFG[report.status];
          const isGen = generating === report.id;

          return (
            <div key={report.id} style={{ ...cardStyle, borderLeft: `5px solid ${accent}` }}>
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>

                  {/* Index badge */}
                  <div style={{ width: '40px', height: '40px', borderRadius: R, backgroundColor: `${accent}14`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: accent }}>{String(idx + 1).padStart(2, '0')}</span>
                  </div>

                  <div style={{ flex: 1 }}>
                    {/* Title row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <p style={{ fontSize: '16px', fontWeight: 800, color: C.text }}>{report.title}</p>
                      <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', backgroundColor: accent, padding: '2px 9px', borderRadius: '3px' }}>{report.code}</span>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot }} />{sc.label}
                      </span>
                    </div>

                    {/* Meta info */}
                    <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '12px' }}>
                      <span style={{ fontSize: '12px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Calendar style={{ width: '12px', height: '12px' }} /><strong style={{ color: C.text }}>{report.period}</strong>
                      </span>
                      <span style={{ fontSize: '12px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock style={{ width: '12px', height: '12px' }} />Soumis le : {report.submittedDate}
                      </span>
                      <span style={{ fontSize: '12px', color: C.textMuted }}>{report.projects} projets · {report.resources} ressources</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: parseInt(report.avgAlloc) > 95 ? C.red : C.green, display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <TrendingUp style={{ width: '12px', height: '12px' }} />Alloc. moy. : {report.avgAlloc}
                      </span>
                    </div>

                    {/* Allocation preview bars */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '14px' }}>
                      {report.lines.slice(0, 3).map((l, i) => {
                        const val = parseInt(l.avg);
                        const barColor = allocColor(l.avg);
                        return (
                          <div key={i} style={{ padding: '6px 9px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.borderLight}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                              <span style={{ fontSize: '10px', color: C.text, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
                                {l.resource.split(' ')[0]}
                              </span>
                              <span style={{ fontSize: '10px', fontWeight: 800, color: barColor }}>{l.avg}</span>
                            </div>
                            <div style={{ height: '3px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                              <div style={{ height: '100%', borderRadius: '2px', backgroundColor: barColor, width: `${Math.min(val, 100)}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '12px', borderTop: `1px solid ${C.borderLight}` }}>
                      <button onClick={() => setSelectedReport(report)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: R, border: `1px solid ${accent}40`, backgroundColor: `${accent}08`, color: accent, cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${accent}15`)}
                        onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${accent}08`)}
                      ><Eye style={{ width: '12px', height: '12px' }} />Voir le détail</button>

                      <button onClick={() => handleExport(report.id, 'Excel', report.title)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.textSecondary, cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                      ><FileSpreadsheet style={{ width: '12px', height: '12px', color: '#10B981' }} />Exporter Excel</button>

                      <button onClick={() => handleExport(report.id, 'PDF', report.title)}
                        style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.textSecondary, cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                        onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                      ><FileText style={{ width: '12px', height: '12px', color: C.red }} />Exporter PDF</button>

                      {report.status === 'en-preparation' && (
                        <button onClick={() => handleGenerate(report.id, report.title)} disabled={isGen}
                          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: R, border: 'none', backgroundColor: isGen ? C.borderLight : accent, color: isGen ? C.textMuted : '#fff', cursor: isGen ? 'not-allowed' : 'pointer', fontSize: '11px', fontWeight: 700, marginLeft: 'auto' }}>
                          {isGen ? <RefreshCw style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : <CheckCircle style={{ width: '12px', height: '12px' }} />}
                          {isGen ? 'Génération…' : 'Générer le rapport'}
                        </button>
                      )}
                    </div>
                  </div>

                  <ChevronRight
                    style={{ width: '16px', height: '16px', color: C.textMuted, cursor: 'pointer', flexShrink: 0, marginTop: '4px' }}
                    onClick={() => setSelectedReport(report)}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {selectedReport && <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  );
}
