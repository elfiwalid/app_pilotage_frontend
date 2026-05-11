import { useState, useRef } from 'react';
import { AlertTriangle, Search, CheckCircle, Download, Activity, RefreshCw, Info, Upload, FileSpreadsheet, X, User, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { C, S, R, PageHeader, BtnPrimary, BtnGhost, BtnSecondary, Avatar, Modal, ModalHeader, SectionLabel, thStyle, tdStyle, cardStyle } from '../../components/ui/design-system';

/* ─── DATA ─────────────────────────────────────── */
const anomaliesData = [
  { id: 1, resource: 'Youssef El Amrani', role: 'Architecte Solution', project: 'Projet Alpha', type: 'Surcharge', charge: 180, impact: 'Retard livraison Sprint 3', sev: 'critical', status: 'ouvert', date: '09/04/2026', currentAlloc: 55, suggestedAlloc: 40 },
  { id: 2, resource: 'Sara Benali', role: 'Data Scientist', project: 'Projet Beta', type: 'Surcharge', charge: 200, impact: 'Qualité code dégradée', sev: 'critical', status: 'ouvert', date: '08/04/2026', currentAlloc: 100, suggestedAlloc: 70 },
  { id: 3, resource: 'Hamza Lahlou', role: 'Data Analyst', project: 'Projet Alpha', type: 'Sous-utilisation', charge: 30, impact: 'Capacité non exploitée', sev: 'low', status: 'en-cours', date: '07/04/2026', currentAlloc: 30, suggestedAlloc: 60 },
  { id: 4, resource: 'Salma Idrissi', role: 'Business Analyst', project: 'Projet Delta', type: 'Surcharge', charge: 150, impact: 'Risque burnout', sev: 'high', status: 'en-cours', date: '06/04/2026', currentAlloc: 100, suggestedAlloc: 75 },
  { id: 5, resource: 'Khalid Bennani', role: 'Tech Lead', project: 'Projet Sigma', type: 'Sous-utilisation', charge: 45, impact: 'Ressource non assignée', sev: 'medium', status: 'resolu', date: '05/04/2026', currentAlloc: 45, suggestedAlloc: 75 },
];

const SEV: Record<string, { label: string; bg: string; text: string; border: string; bar: string }> = {
  critical: { label: 'Critique', bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', bar: C.red },
  high: { label: 'Élevée', bg: '#FFF7ED', text: '#92400E', border: '#FDE68A', bar: '#F59E0B' },
  medium: { label: 'Moyenne', bg: '#FFFBEB', text: '#92400E', border: '#FEF3C7', bar: '#F59E0B' },
  low: { label: 'Faible', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', bar: C.blue },
};

const STATUS_CFG: Record<string, { label: string; bg: string; text: string }> = {
  ouvert: { label: 'Ouvert', bg: '#FEF2F2', text: '#B91C1C' },
  'en-cours': { label: 'En correction', bg: '#FFF7ED', text: '#92400E' },
  resolu: { label: 'Résolu', bg: '#ECFDF5', text: '#065F46' },
};

const AVATAR_COLORS = [C.red, C.blue, '#F59E0B', '#8B5CF6', C.green];

/* ─── ANALYZE POPUP ─────────────────────────────── */
function AnalyzeModal({ onClose }: { onClose: () => void }) {
  return (
    <Modal onClose={onClose} maxWidth="440px" accentColor={C.blue}>
      <ModalHeader title="Résultat de l'Analyse" subtitle="Anomalies de staffing — Avril 2026" onClose={onClose} />
      <div style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: `${C.blue}12`, border: `2px solid ${C.blue}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Info style={{ width: '28px', height: '28px', color: C.blue }} />
          </div>
          <div>
            <p style={{ fontSize: '16px', fontWeight: 800, color: C.text, marginBottom: '12px' }}>Analyse Standard Complète</p>
            <div style={{ padding: '14px 18px', borderRadius: R, backgroundColor: `${C.blue}08`, border: `1px solid ${C.blue}25`, marginBottom: '14px' }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: C.blue, lineHeight: 1.6, fontStyle: 'italic' }}>
                "Analyse standard des anomalies effectuée.<br />Aucune intelligence artificielle impliquée."
              </p>
            </div>
            <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.6 }}>
              L'analyse repose sur des règles métier définies : seuils de charge, détection des chevauchements et comparaison des capacités disponibles.
            </p>
          </div>
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              { l: 'Anomalies détectées', v: '5', c: C.red },
              { l: 'Ressources surchargées', v: '3', c: '#F59E0B' },
              { l: 'Ressources sous-utilisées', v: '2', c: C.blue },
              { l: 'Période analysée', v: 'Avril 2026', c: C.purple },
            ].map(item => (
              <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                <span style={{ fontSize: '12px', color: C.textSecondary }}>{item.l}</span>
                <span style={{ fontSize: '12px', fontWeight: 800, color: item.c }}>{item.v}</span>
              </div>
            ))}
          </div>
          <button onClick={onClose}
            style={{ width: '100%', padding: '9px', borderRadius: R, border: 'none', backgroundColor: C.blue, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >Fermer l'analyse</button>
        </div>
      </div>
    </Modal>
  );
}

/* ─── CORRECT MODAL ─────────────────────────────── */
function CorrectModal({ anomaly, onClose, onValidate }: {
  anomaly: typeof anomaliesData[0];
  onClose: () => void;
  onValidate: () => void;
}) {
  const [tab, setTab] = useState<'form' | 'excel'>('form');
  const [alloc, setAlloc] = useState(anomaly.suggestedAlloc);
  const [startDate, setStartDate] = useState('2026-04-15');
  const [endDate, setEndDate] = useState('2026-04-30');
  const [assignee, setAssignee] = useState(anomaly.resource);
  const [notes, setNotes] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleValidate = () => {
    toast.success(`Correction validée — ${anomaly.resource} : allocation ajustée à ${alloc}%`);
    onValidate();
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    setUploaded(true);
    toast.success('Fichier V2 importé avec succès !');
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', fontSize: '12px',
    border: `1px solid ${C.border}`, borderRadius: R,
    backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter',
    color: C.text, boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    fontSize: '10px', fontWeight: 700, color: C.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'block', marginBottom: '4px',
  };

  const reduction = anomaly.charge - alloc;

  return (
    <Modal onClose={onClose} maxWidth="580px" accentColor={C.purple}>
      <ModalHeader title="Corriger l'Anomalie" subtitle={`${anomaly.resource} — ${anomaly.project}`} onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {/* Anomaly summary */}
        <div style={{ padding: '10px 14px', borderRadius: R, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderLeft: `3px solid ${C.red}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: 700, color: '#B91C1C' }}>{anomaly.type} — {anomaly.charge}%</p>
              <p style={{ fontSize: '11px', color: C.textSecondary }}>{anomaly.impact}</p>
            </div>
            <AlertTriangle style={{ width: '20px', height: '20px', color: C.red }} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden' }}>
          {[['form', 'Correction manuelle'], ['excel', 'Import fichier V2']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as any)}
              style={{ flex: 1, padding: '8px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: tab === k ? C.purple : '#fff', color: tab === k ? '#fff' : C.textMuted, fontFamily: 'Inter', transition: 'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'form' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Ressource</label>
                <input type="text" value={assignee} onChange={e => setAssignee(e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
              <div>
                <label style={labelStyle}>Projet</label>
                <input type="text" defaultValue={anomaly.project} readOnly style={{ ...inputStyle, backgroundColor: C.bg, cursor: 'default' }} />
              </div>
              <div>
                <label style={labelStyle}>Nouvelle date de début</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
              <div>
                <label style={labelStyle}>Nouvelle date de fin</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={inputStyle} onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
            </div>

            {/* Allocation slider */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Nouvelle allocation</label>
                <span style={{ fontSize: '16px', fontWeight: 800, color: alloc > 100 ? C.red : C.green }}>{alloc}%</span>
              </div>
              <input type="range" min="10" max="100" step="5" value={alloc}
                onChange={e => setAlloc(Number(e.target.value))}
                style={{ width: '100%', accentColor: C.purple, cursor: 'pointer', height: '4px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: C.textMuted, marginTop: '2px' }}><span>10%</span><span>100%</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', padding: '7px 12px', borderRadius: R, backgroundColor: reduction > 0 ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${reduction > 0 ? '#A7F3D0' : '#FECACA'}` }}>
                <span style={{ fontSize: '11px', color: C.textSecondary }}>Réduction de surcharge</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: reduction > 0 ? C.green : C.red }}>
                  {reduction > 0 ? `-${reduction}%` : `+${Math.abs(reduction)}%`}
                </span>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Notes de correction</label>
              <textarea
                placeholder="Décrivez la raison et le contexte de la correction…"
                rows={2} value={notes} onChange={e => setNotes(e.target.value)}
                style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 } as React.CSSProperties}
                onFocus={e => (e.target.style.borderColor = C.purple)}
                onBlur={e => (e.target.style.borderColor = C.border)}
              />
            </div>
          </div>
        ) : (
          <div>
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              style={{
                border: `2px dashed ${dragOver ? C.purple : C.border}`,
                borderRadius: R, padding: '36px 20px', textAlign: 'center',
                cursor: 'pointer', backgroundColor: dragOver ? `${C.purple}06` : C.bg,
                transition: 'all 0.15s',
              }}
            >
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
                onChange={() => { setUploaded(true); toast.success('Fichier V2 chargé avec succès !'); }} />
              {uploaded ? (
                <>
                  <CheckCircle style={{ width: '32px', height: '32px', color: C.green, margin: '0 auto 10px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 700, color: C.green }}>Fichier V2 importé !</p>
                  <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '4px' }}>Le fichier a été chargé et sera traité.</p>
                </>
              ) : (
                <>
                  <FileSpreadsheet style={{ width: '36px', height: '36px', color: C.purple, margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Importer le fichier V2 corrigé</p>
                  <p style={{ fontSize: '11px', color: C.textMuted, marginBottom: '14px' }}>Glissez votre fichier Excel V2 ici ou cliquez pour sélectionner</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 18px', backgroundColor: C.purple, color: '#fff', borderRadius: R, fontSize: '12px', fontWeight: 600 }}>
                    <Upload style={{ width: '13px', height: '13px' }} />Sélectionner un fichier
                  </div>
                  <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '10px' }}>Formats acceptés : .xlsx, .xls, .csv</p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
          <button onClick={handleValidate}
            style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '9px', borderRadius: R, border: 'none', backgroundColor: C.green, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >
            <CheckCircle style={{ width: '14px', height: '14px' }} />Valider la correction
          </button>
          <BtnGhost onClick={onClose}>Annuler</BtnGhost>
        </div>
      </div>
    </Modal>
  );
}

/* ─── MAIN ─────────────────────────────────────── */
export function PmAnomalies() {
  const [search, setSearch] = useState('');
  const [filterSev, setFilterSev] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [resolvedIds, setResolvedIds] = useState<number[]>([5]);
  const [showAnalyze, setShowAnalyze] = useState(false);
  const [correctTarget, setCorrectTarget] = useState<typeof anomaliesData[0] | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const filtered = anomaliesData.filter(a => {
    const m = a.resource.toLowerCase().includes(search.toLowerCase()) || a.project.toLowerCase().includes(search.toLowerCase());
    if (!m) return false;
    if (filterSev !== 'all' && a.sev !== filterSev) return false;
    if (filterStatus !== 'all' && a.status !== filterStatus) return false;
    return true;
  });

  const handleAnalyze = () => {
    setAnalyzing(true);
    toast.loading('Analyse en cours…', { id: 'analyze' });
    setTimeout(() => {
      setAnalyzing(false);
      toast.dismiss('analyze');
      setShowAnalyze(true);
    }, 1400);
  };

  const handleValidate = (id: number) => {
    setResolvedIds(p => [...p, id]);
    toast.success(`Anomalie #${id} validée et marquée comme résolue.`);
  };

  const handleExport = () => {
    toast.loading('Export des anomalies…', { id: 'exp' });
    setTimeout(() => toast.success('Rapport d\'anomalies exporté !', { id: 'exp' }), 1500);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <PageHeader title="Anomalies de Staffing" subtitle="Détection, correction et validation des anomalies sur vos projets">
        <BtnGhost onClick={handleExport}><Download style={{ width: '12px', height: '12px' }} />Exporter</BtnGhost>
        <BtnPrimary onClick={handleAnalyze} disabled={analyzing}>
          {analyzing
            ? <RefreshCw style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
            : <Activity style={{ width: '12px', height: '12px' }} />}
          {analyzing ? 'Analyse…' : 'Analyser'}
        </BtnPrimary>
      </PageHeader>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { l: 'Total Anomalies', v: anomaliesData.length, c: '#6B7280' },
          { l: 'Critiques ouvertes', v: anomaliesData.filter(a => a.sev === 'critical' && !resolvedIds.includes(a.id)).length, c: C.red },
          { l: 'En correction', v: anomaliesData.filter(a => a.status === 'en-cours').length, c: '#F59E0B' },
          { l: 'Résolues', v: resolvedIds.length, c: C.green },
        ].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.c}`, padding: '12px 16px' }}>
            <p style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{s.l}</p>
            <p style={{ fontSize: '1.75rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
          <Search style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: C.textMuted, pointerEvents: 'none' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
            style={{ width: '100%', paddingLeft: '28px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none' }}
            onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} />
        </div>
        <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden', backgroundColor: '#fff' }}>
          {[['all', 'Toutes sévérités'], ['critical', 'Critique'], ['high', 'Élevée'], ['low', 'Faible']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterSev(v)}
              style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: filterSev === v ? C.red : '#fff', color: filterSev === v ? '#fff' : C.textMuted, fontFamily: 'Inter' }}>
              {l}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden', backgroundColor: '#fff' }}>
          {[['all', 'Tous statuts'], ['ouvert', 'Ouvert'], ['en-cours', 'En cours'], ['resolu', 'Résolu']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              style={{ padding: '5px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: filterStatus === v ? C.purple : '#fff', color: filterStatus === v ? '#fff' : C.textMuted, fontFamily: 'Inter' }}>
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={cardStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>{['Ressource', 'Projet', 'Type', 'Charge', 'Impact', 'Sévérité', 'Statut', 'Date', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {filtered.map((a, idx) => {
                const sev = SEV[a.sev];
                const isResolved = resolvedIds.includes(a.id);
                const stc = STATUS_CFG[isResolved ? 'resolu' : a.status] || STATUS_CFG.ouvert;
                return (
                  <tr key={a.id}
                    style={{ backgroundColor: a.sev === 'critical' && !isResolved ? `${C.red}04` : 'transparent', transition: 'background 0.1s' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = a.sev === 'critical' && !isResolved ? `${C.red}04` : 'transparent')}
                  >
                    <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar name={a.resource} color={AVATAR_COLORS[idx % AVATAR_COLORS.length]} size={28} />
                        <div><p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{a.resource}</p><p style={{ fontSize: '10px', color: C.textMuted }}>{a.role}</p></div>
                      </div>
                    </td>
                    <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                      <span style={{ fontSize: '11px', fontWeight: 600, color: C.text }}>{a.project}</span>
                    </td>
                    <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: a.type === 'Surcharge' ? '#FEF2F2' : '#EFF6FF', color: a.type === 'Surcharge' ? '#B91C1C' : '#1D4ED8' }}>{a.type}</span>
                    </td>
                    <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: a.charge > 100 ? C.red : C.blue }}>{a.charge}%</span>
                    </td>
                    <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                      <span style={{ fontSize: '11px', color: C.textSecondary }}>{a.impact}</span>
                    </td>
                    <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', backgroundColor: sev.bg, color: sev.text, border: `1px solid ${sev.border}` }}>{sev.label}</span>
                    </td>
                    <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', backgroundColor: stc.bg, color: stc.text }}>{stc.label}</span>
                    </td>
                    <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                      <span style={{ fontSize: '11px', color: C.textMuted }}>{a.date}</span>
                    </td>
                    <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {!isResolved ? (
                          <>
                            <button onClick={() => setCorrectTarget(a)}
                              style={{ padding: '3px 8px', borderRadius: R, border: `1px solid ${C.purple}40`, backgroundColor: `${C.purple}08`, color: C.purple, cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}
                              onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${C.purple}15`)}
                              onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${C.purple}08`)}
                            >Corriger</button>
                            <button onClick={() => handleValidate(a.id)}
                              style={{ padding: '3px 8px', borderRadius: R, border: 'none', backgroundColor: C.green, color: '#fff', cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}>
                              Valider
                            </button>
                          </>
                        ) : (
                          <span style={{ fontSize: '10px', color: C.green, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <CheckCircle style={{ width: '10px', height: '10px' }} />Résolu
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAnalyze && <AnalyzeModal onClose={() => setShowAnalyze(false)} />}
      {correctTarget && (
        <CorrectModal
          anomaly={correctTarget}
          onClose={() => setCorrectTarget(null)}
          onValidate={() => {
            setResolvedIds(p => [...p, correctTarget.id]);
          }}
        />
      )}
    </div>
  );
}
