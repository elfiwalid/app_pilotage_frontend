import { useEffect, useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  RefreshCw,
  Calendar,
  Eye,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  C,
  S,
  R,
  PageHeader,
  BtnPrimary,
  BtnGhost,
  cardStyle,
  thStyle,
  tdStyle,
} from '../../components/ui/design-system';
import {
  fetchPmRapportsV2,
  type PmRapportAnomalieDTO,
  type PmRapportMensuelDTO,
} from '../../services/pmReportsService';
import { exportReportExcel, exportReportPdf } from '../../services/reportExportService';

const STATUS_CFG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  GENERE: { label: 'Genere', bg: '#ECFDF5', text: '#065F46', dot: C.green },
  SANS_ANOMALIE: { label: 'Sans anomalie', bg: '#EFF6FF', text: '#1D4ED8', dot: C.blue },
};

const TYPE_CFG: Record<string, { label: string; color: string; bg: string; text: string }> = {
  CONFLIT: { label: 'Conflit', color: C.red, bg: '#FEF2F2', text: '#B91C1C' },
  SURCHARGE: { label: 'Surcharge', color: '#F59E0B', bg: '#FFF7ED', text: '#92400E' },
  SOUS_CHARGE: { label: 'Sous-charge', color: C.blue, bg: '#EFF6FF', text: '#1D4ED8' },
  NON_STAFFE: { label: 'Non staffe', color: '#6B7280', bg: '#F3F4F6', text: '#374151' },
};

const MONTHS = [
  '',
  'Janvier',
  'Fevrier',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Aout',
  'Septembre',
  'Octobre',
  'Novembre',
  'Decembre',
];

function formatPct(value: number | null): string {
  if (value == null) return 'N/A';
  return `${Math.round(value)}%`;
}

function chargeColor(value: number | null | undefined): string {
  if (value == null) return C.textMuted;
  if (value > 100) return C.red;
  if (value >= 90) return '#F59E0B';
  return C.green;
}

function reportAccent(report: PmRapportMensuelDTO): string {
  if (report.nombreConflits > 0) return C.red;
  if (report.nombreSurcharges > 0) return '#F59E0B';
  if (report.nombreSousCharges > 0 || report.nombreNonStaffes > 0) return C.blue;
  return C.green;
}

function typeLabel(type: string): string {
  return TYPE_CFG[type]?.label || type;
}

function ReportDetailModal({
  report,
  onClose,
}: {
  report: PmRapportMensuelDTO;
  onClose: () => void;
}) {
  const accent = reportAccent(report);
  const sc = STATUS_CFG[report.statut];

  const handleExport = (format: 'PDF' | 'Excel') => {
    if (format === 'PDF') {
      exportReportPdf(report);
    } else {
      exportReportExcel(report);
    }
    toast.success(`Export ${format} généré - ${report.libellePeriode}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(11,7,24,0.6)', backdropFilter: 'blur(4px)' }} />
      <div
        style={{
          position: 'relative',
          backgroundColor: '#fff',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: R,
          boxShadow: S.modal,
          borderTop: `3px solid ${accent}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px', flexWrap: 'wrap' }}>
              <p style={{ fontSize: '15px', fontWeight: 800, color: C.text }}>Rapport V2 mensuel</p>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', backgroundColor: accent, padding: '2px 8px', borderRadius: '3px' }}>
                {String(report.mois).padStart(2, '0')}/{report.annee}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot }} />{sc.label}
              </span>
            </div>
            <p style={{ fontSize: '11px', color: C.textMuted }}>
              {report.libellePeriode} · {report.nombreProjetsConcernes} projets · {report.nombreCollaborateursConcernes} collaborateurs concernes
            </p>
          </div>
          <button onClick={onClose} style={{ width: '28px', height: '28px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1L11 11M11 1L1 11" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
            {[
              { l: 'Periode', v: report.libellePeriode, c: accent },
              { l: 'Anomalies', v: report.nombreTotalAnomalies, c: report.nombreTotalAnomalies > 0 ? C.red : C.green },
              { l: 'Allocation moyenne', v: formatPct(report.allocationMoyenne), c: chargeColor(report.allocationMoyenne) },
              { l: 'Projets', v: report.nombreProjetsConcernes, c: C.text },
            ].map(i => (
              <div key={i.l} style={{ padding: '8px 12px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
                <p style={{ fontSize: '9px', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{i.l}</p>
                <p style={{ fontSize: '12px', fontWeight: 800, color: i.c }}>{i.v}</p>
              </div>
            ))}
          </div>

          <div style={{ padding: '10px 12px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: '10px', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '5px' }}>Projets concernes</p>
            <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.6 }}>
              {report.projetsConcernes.length ? report.projetsConcernes.join(' · ') : 'Aucun projet'}
            </p>
          </div>

          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '8px' }}>Details des anomalies du mois</p>
            {report.anomalies.length === 0 ? (
              <div style={{ padding: '28px', textAlign: 'center', borderRadius: R, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                <CheckCircle style={{ width: '30px', height: '30px', color: C.green, margin: '0 auto 8px' }} />
                <p style={{ fontSize: '13px', fontWeight: 700, color: C.green }}>Aucune anomalie detectee pour cette periode.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Collaborateur', 'Projet(s)', 'Type', 'Charge', 'Periode', 'Message'].map(h => (
                        <th key={h} style={thStyle}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {report.anomalies.map((a: PmRapportAnomalieDTO, i: number) => {
                      const tc = TYPE_CFG[a.typeAnomalie] || TYPE_CFG.CONFLIT;
                      return (
                        <tr key={a.idAnomalie} onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <td style={{ ...tdStyle, fontWeight: 700, color: C.text }}>{a.collaborateur || 'N/A'}</td>
                          <td style={{ ...tdStyle, maxWidth: '180px' }}>{a.projetsConcernes || 'N/A'}</td>
                          <td style={tdStyle}>
                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '3px', backgroundColor: tc.bg, color: tc.text }}>
                              {tc.label}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, textAlign: 'center' }}>
                            <span style={{ fontSize: '12px', fontWeight: 800, color: chargeColor(a.tauxCharge) }}>{a.tauxCharge}%</span>
                            <p style={{ fontSize: '9px', color: C.textMuted }}>{a.joursDemandes}/{a.capaciteMensuelle}j</p>
                          </td>
                          <td style={tdStyle}>{MONTHS[a.mois]} {a.annee}</td>
                          <td style={{ ...tdStyle, maxWidth: '260px', borderBottom: i < report.anomalies.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>{a.messageExplicatif}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
            <BtnPrimary onClick={() => handleExport('PDF')}>
              <FileText style={{ width: '12px', height: '12px' }} />Exporter PDF
            </BtnPrimary>
            <BtnGhost onClick={() => handleExport('Excel')}>
              <FileSpreadsheet style={{ width: '12px', height: '12px' }} />Exporter Excel
            </BtnGhost>
            <BtnGhost onClick={onClose}>Fermer</BtnGhost>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PmReports() {
  const [reports, setReports] = useState<PmRapportMensuelDTO[]>([]);
  const [selectedReport, setSelectedReport] = useState<PmRapportMensuelDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadReports = async (silent = false) => {
    if (!silent) setLoading(true);
    setError('');
    try {
      const data = await fetchPmRapportsV2();
      setReports(data);
      if (silent) toast.success('Rapports actualises !');
    } catch (err: any) {
      const message = err.message || 'Impossible de charger les rapports V2.';
      setError(message);
      if (silent) toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const refresh = () => {
    setRefreshing(true);
    toast.loading('Actualisation...', { id: 'reports-refresh' });
    fetchPmRapportsV2()
      .then(data => {
        setReports(data);
        setError('');
        toast.success('Rapports actualises !', { id: 'reports-refresh' });
      })
      .catch((err: any) => {
        const message = err.message || 'Impossible de charger les rapports V2.';
        setError(message);
        toast.error(message, { id: 'reports-refresh' });
      })
      .finally(() => setRefreshing(false));
  };

  const handleExport = (format: 'PDF' | 'Excel', report: PmRapportMensuelDTO) => {
    if (format === 'PDF') {
      exportReportPdf(report);
    } else {
      exportReportExcel(report);
    }
    toast.success(`Export ${format} généré - ${report.libellePeriode}`);
  };

  const totalAnomalies = reports.reduce((sum, r) => sum + r.nombreTotalAnomalies, 0);
  const generated = reports.filter(r => r.statut === 'GENERE').length;
  const withoutAnomaly = reports.filter(r => r.statut === 'SANS_ANOMALIE').length;

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <PageHeader title="Rapports de Prevision V2" subtitle="Rapports mensuels generes depuis les imports V2 reels">
        <BtnPrimary onClick={refresh} disabled={refreshing}>
          {refreshing ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} /> : <RefreshCw style={{ width: '12px', height: '12px' }} />}
          Actualiser tous
        </BtnPrimary>
      </PageHeader>

      {loading ? (
        <div style={{ ...cardStyle, padding: '60px', textAlign: 'center' }}>
          <Loader2 style={{ width: '30px', height: '30px', color: C.purple, animation: 'spin 1s linear infinite', margin: '0 auto 10px' }} />
          <p style={{ fontSize: '13px', color: C.textMuted }}>Chargement des rapports V2...</p>
        </div>
      ) : error ? (
        <div style={{ ...cardStyle, padding: '32px', textAlign: 'center', borderLeft: `4px solid ${C.red}` }}>
          <AlertTriangle style={{ width: '32px', height: '32px', color: C.red, margin: '0 auto 10px' }} />
          <p style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>Erreur de chargement</p>
          <p style={{ fontSize: '12px', color: C.textMuted, marginTop: '4px' }}>{error}</p>
          <div style={{ marginTop: '14px' }}>
            <BtnGhost onClick={() => loadReports()}>Reessayer</BtnGhost>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
          <FileText style={{ width: '36px', height: '36px', color: C.blue, margin: '0 auto 10px' }} />
          <p style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>Aucun rapport disponible</p>
          <p style={{ fontSize: '12px', color: C.textMuted, marginTop: '4px' }}>
            Importez une prevision V2 sur un de vos projets pour generer les rapports mensuels.
          </p>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
            {[
              { l: 'Rapports disponibles', v: reports.length, c: C.blue },
              { l: 'Rapports generes', v: generated, c: C.green },
              { l: 'Anomalies detectees', v: totalAnomalies, c: totalAnomalies > 0 ? C.red : C.green },
            ].map(s => (
              <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.c}`, padding: '12px 16px' }}>
                <p style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{s.l}</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar style={{ width: '14px', height: '14px', color: C.purple }} />
            <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>Rapports - Classement Chronologique</p>
            <span style={{ fontSize: '11px', color: C.textMuted }}>· {withoutAnomaly} sans anomalie</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: C.border, marginLeft: '8px' }} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {reports.map((report, idx) => {
              const accent = reportAccent(report);
              const sc = STATUS_CFG[report.statut];
              const preview = [
                { label: 'Conflits', value: report.nombreConflits, color: C.red },
                { label: 'Surcharges', value: report.nombreSurcharges, color: '#F59E0B' },
                { label: 'Sous-charges', value: report.nombreSousCharges + report.nombreNonStaffes, color: C.blue },
              ];

              return (
                <div key={`${report.annee}-${report.mois}`} style={{ ...cardStyle, borderLeft: `5px solid ${accent}` }}>
                  <div style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: R, backgroundColor: `${accent}14`, border: `1px solid ${accent}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <span style={{ fontSize: '15px', fontWeight: 800, color: accent }}>{String(idx + 1).padStart(2, '0')}</span>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <p style={{ fontSize: '16px', fontWeight: 800, color: C.text }}>Rapport V2 - {report.libellePeriode}</p>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: '#fff', backgroundColor: accent, padding: '2px 9px', borderRadius: '3px' }}>
                            {String(report.mois).padStart(2, '0')}/{report.annee}
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot }} />{sc.label}
                          </span>
                        </div>

                        <div style={{ display: 'flex', gap: '18px', flexWrap: 'wrap', marginBottom: '12px' }}>
                          <span style={{ fontSize: '12px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Calendar style={{ width: '12px', height: '12px' }} /><strong style={{ color: C.text }}>{report.libellePeriode}</strong>
                          </span>
                          <span style={{ fontSize: '12px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <Clock style={{ width: '12px', height: '12px' }} />{report.nombreTotalAnomalies} anomalies
                          </span>
                          <span style={{ fontSize: '12px', color: C.textMuted }}>{report.nombreProjetsConcernes} projets · {report.nombreCollaborateursConcernes} collaborateurs</span>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: chargeColor(report.allocationMoyenne), display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <TrendingUp style={{ width: '12px', height: '12px' }} />Alloc. moy. : {formatPct(report.allocationMoyenne)}
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '6px', marginBottom: '14px' }}>
                          {preview.map(item => {
                            const pct = report.nombreTotalAnomalies > 0
                              ? Math.round((item.value / report.nombreTotalAnomalies) * 100)
                              : 0;
                            return (
                              <div key={item.label} style={{ padding: '6px 9px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.borderLight}` }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <span style={{ fontSize: '10px', color: C.text, fontWeight: 600 }}>{item.label}</span>
                                  <span style={{ fontSize: '10px', fontWeight: 800, color: item.color }}>{item.value}</span>
                                </div>
                                <div style={{ height: '3px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                                  <div style={{ height: '100%', borderRadius: '2px', backgroundColor: item.color, width: `${pct}%` }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', paddingTop: '12px', borderTop: `1px solid ${C.borderLight}` }}>
                          <button onClick={() => setSelectedReport(report)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: R, border: `1px solid ${accent}40`, backgroundColor: `${accent}08`, color: accent, cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${accent}15`)}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${accent}08`)}
                          ><Eye style={{ width: '12px', height: '12px' }} />Voir le detail</button>

                          <button onClick={() => handleExport('Excel', report)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.textSecondary, cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                          ><FileSpreadsheet style={{ width: '12px', height: '12px', color: '#10B981' }} />Exporter Excel</button>

                          <button onClick={() => handleExport('PDF', report)}
                            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 14px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.textSecondary, cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                          ><FileText style={{ width: '12px', height: '12px', color: C.red }} />Exporter PDF</button>
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
        </>
      )}

      {selectedReport && <ReportDetailModal report={selectedReport} onClose={() => setSelectedReport(null)} />}
    </div>
  );
}
