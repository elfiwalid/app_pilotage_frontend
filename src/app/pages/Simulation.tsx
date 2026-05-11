import { useState } from 'react';
import { Play, RefreshCw, TrendingUp, TrendingDown, AlertCircle, CheckCircle, ArrowRight, BarChart2, AlertTriangle, ChevronRight } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { toast } from 'sonner';
import { C, S, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, SectionLabel, cardStyle } from '../components/ui/design-system';

/* ─── DATA ─────────────────────────────────────── */
const OVER = [
  { id: 'ahmed', name: 'Ahmed Chafik', role: 'Lead Dev', charge: 120, projects: ['Alpha (70%)', 'Omega (50%)'] },
  { id: 'youssef', name: 'Youssef El Amrani', role: 'Architecte Solution', charge: 180, projects: ['Alpha (55%)', 'Beta (40%)', 'Gamma (85%)'] },
  { id: 'sara', name: 'Sara Benali', role: 'Data Scientist', charge: 200, projects: ['Delta (100%)', 'Epsilon (100%)'] },
  { id: 'salma', name: 'Salma Idrissi', role: 'Business Analyst', charge: 150, projects: ['Eta (100%)', 'Theta (50%)'] },
  { id: 'mohamed', name: 'Mohamed Alaoui', role: 'Lead Dev Backend', charge: 110, projects: ['Iota (60%)', 'Kappa (50%)'] },
];
const UNDER = [
  { id: 'hamza', name: 'Hamza Lahlou', role: 'Data Analyst', charge: 40, availability: 60 },
  { id: 'imane', name: 'Imane El Fassi', role: 'ML Engineer', charge: 65, availability: 35 },
  { id: 'khalid', name: 'Khalid Bennani', role: 'Tech Lead', charge: 55, availability: 45 },
  { id: 'amina', name: 'Amina Tazi', role: 'Business Analyst', charge: 70, availability: 30 },
  { id: 'omar', name: 'Omar Idrissi', role: 'Dev Senior', charge: 45, availability: 55 },
];
const PROJECTS = [
  { id: 'alpha', name: 'Projet Alpha', manager: 'Fatima Zahra Bennis' },
  { id: 'beta', name: 'Projet Beta', manager: 'Khalid Bennani' },
  { id: 'gamma', name: 'Projet Gamma', manager: 'Amina Tazi' },
  { id: 'delta', name: 'Projet Delta', manager: 'Omar El Alami' },
  { id: 'iota', name: 'Projet Iota', manager: 'Rachid Benjelloun' },
  { id: 'kappa', name: 'Projet Kappa', manager: 'Soukaina Berrada' },
];

type Result = { oName: string; uName: string; oBefore: number; oAfter: number; uBefore: number; uAfter: number; alloc: number; project: string; resolved: boolean; rec: string; before: { o: number; u: number; c: number }; after: { o: number; u: number; c: number } };

const CT = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ backgroundColor: C.white, border: `1px solid ${C.border}`, borderRadius: R, padding: '8px 12px', boxShadow: S.elevated, fontSize: '11px' }}>
      <p style={{ fontWeight: 700, color: C.text, marginBottom: '4px' }}>{label}</p>
      {payload.map((e: any, i: number) => <p key={i} style={{ color: e.fill, margin: '1px 0' }}>{e.name}: <strong>{e.value}%</strong></p>)}
    </div>
  );
};

export function Simulation() {
  const [overId, setOverId] = useState('ahmed');
  const [underId, setUnderId] = useState('hamza');
  const [projId, setProjId] = useState('alpha');
  const [alloc, setAlloc] = useState(25);
  const [start, setStart] = useState('2026-04-15');
  const [end, setEnd] = useState('2026-04-30');
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [validated, setValidated] = useState(false);

  const over = OVER.find(r => r.id === overId)!;
  const under = UNDER.find(r => r.id === underId)!;
  const proj = PROJECTS.find(p => p.id === projId)!;

  const run = () => {
    setRunning(true); setResult(null); setValidated(false);
    toast.loading('Simulation en cours…', { id: 'sim' });
    setTimeout(() => {
      const oA = Math.max(over.charge - alloc, 0);
      const uA = Math.min(under.charge + alloc, 120);
      const resolved = oA <= 100;
      setResult({
        oName: over.name, uName: under.name, oBefore: over.charge, oAfter: oA, uBefore: under.charge, uAfter: uA, alloc, project: proj.name, resolved,
        rec: resolved ? `${alloc}% transféré de ${over.name} vers ${under.name} sur ${proj.name}. Conflit résolu.` : `La réaffectation de ${alloc}% réduit la surcharge mais ne suffit pas. Augmentez le transfert.`,
        before: { o: 3, u: 4, c: 5 }, after: { o: resolved ? 2 : 3, u: uA >= 90 ? 3 : 4, c: resolved ? 4 : 5 },
      });
      setRunning(false);
      toast.success('Simulation terminée !', { id: 'sim' });
    }, 2200);
  };

  const validate = () => {
    if (!result) return;
    toast.success(`Scénario appliqué ! ${result.alloc}% transféré vers ${result.uName}.`);
    setValidated(true);
  };

  const reset = () => {
    setOverId('ahmed'); setUnderId('hamza'); setProjId('alpha'); setAlloc(25);
    setStart('2026-04-15'); setEnd('2026-04-30'); setResult(null); setValidated(false);
    toast.info('Paramètres réinitialisés.');
  };

  const chartData = result ? [
    { name: over.name.split(' ')[0], Avant: result.oBefore, Après: result.oAfter },
    { name: under.name.split(' ')[0], Avant: result.uBefore, Après: result.uAfter },
  ] : [];

  const inputStyle = { width: '100%', padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter' };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Simulation What-If" subtitle="Analysez l'impact du remplacement d'un collaborateur surchargé par un collaborateur sous-utilisé">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', backgroundColor: `${C.purple}10`, border: `1px solid ${C.purple}30`, borderRadius: R }}>
          <BarChart2 style={{ width: '13px', height: '13px', color: C.purple }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: C.purple }}>Module What-If</span>
        </div>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '16px', alignItems: 'start' }}>

        {/* ── LEFT CONFIG ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          {/* Step indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
            {['Sélection', 'Projet', 'Période', 'Allocation'].map((s, i) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '18px', height: '18px', borderRadius: R, backgroundColor: i === 0 ? C.purple : C.borderLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: i === 0 ? '#fff' : C.textMuted }}>{i + 1}</div>
                <span style={{ fontSize: '10px', color: i === 0 ? C.purple : C.textMuted, fontWeight: i === 0 ? 700 : 400 }}>{s}</span>
                {i < 3 && <ChevronRight style={{ width: '11px', height: '11px', color: C.textMuted }} />}
              </div>
            ))}
          </div>

          {/* Config card */}
          <div style={cardStyle}>
            <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.borderLight}` }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>Configuration du Scénario</p>
            </div>
            <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Overloaded */}
              <div>
                <SectionLabel>Collaborateur surchargé</SectionLabel>
                <Select value={overId} onValueChange={setOverId}>
                  <SelectTrigger style={{ fontSize: '12px', borderRadius: R, height: '32px' }}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {OVER.map(r => <SelectItem key={r.id} value={r.id}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '10px', fontWeight: 700, color: C.red, backgroundColor: '#FEF2F2', padding: '1px 5px', borderRadius: '3px' }}>{r.charge}%</span>{r.name}</span></SelectItem>)}
                  </SelectContent>
                </Select>
                <div style={{ marginTop: '6px', padding: '8px 10px', borderRadius: R, backgroundColor: '#FEF2F2', border: `1px solid #FECACA`, borderLeft: `3px solid ${C.red}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <div><p style={{ fontSize: '11px', fontWeight: 700, color: '#B91C1C' }}>{over.name}</p><p style={{ fontSize: '10px', color: '#DC2626' }}>{over.role}</p></div>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: C.red }}>{over.charge}%</span>
                  </div>
                  <div style={{ height: '3px', borderRadius: '2px', backgroundColor: '#FECACA', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: C.red, width: `${Math.min(over.charge / 2, 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Underutilized */}
              <div>
                <SectionLabel>Collaborateur sous-chargé</SectionLabel>
                <Select value={underId} onValueChange={setUnderId}>
                  <SelectTrigger style={{ fontSize: '12px', borderRadius: R, height: '32px' }}><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {UNDER.map(r => <SelectItem key={r.id} value={r.id}><span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ fontSize: '10px', fontWeight: 700, color: '#D97706', backgroundColor: '#FFF7ED', padding: '1px 5px', borderRadius: '3px' }}>{r.charge}%</span>{r.name}</span></SelectItem>)}
                  </SelectContent>
                </Select>
                <div style={{ marginTop: '6px', padding: '8px 10px', borderRadius: R, backgroundColor: '#FFF7ED', border: `1px solid #FDE68A`, borderLeft: `3px solid #F59E0B` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <div><p style={{ fontSize: '11px', fontWeight: 700, color: '#92400E' }}>{under.name}</p><p style={{ fontSize: '10px', color: '#D97706' }}>{under.role}</p></div>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#D97706' }}>{under.charge}%</span>
                  </div>
                  <div style={{ height: '3px', borderRadius: '2px', backgroundColor: '#FDE68A', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: '#F59E0B', width: `${under.charge}%` }} />
                  </div>
                </div>
              </div>

              {/* Project */}
              <div>
                <SectionLabel>Projet concerné</SectionLabel>
                <Select value={projId} onValueChange={setProjId}>
                  <SelectTrigger style={{ fontSize: '12px', borderRadius: R, height: '32px' }}><SelectValue /></SelectTrigger>
                  <SelectContent>{PROJECTS.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                </Select>
                <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '3px' }}>Chef : {proj.manager}</p>
              </div>

              {/* Allocation slider */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <SectionLabel>Allocation à transférer</SectionLabel>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: C.purple }}>{alloc}%</span>
                </div>
                <input type="range" min="5" max={Math.min(under.availability, 100)} step="5" value={alloc}
                  onChange={e => setAlloc(Number(e.target.value))}
                  style={{ width: '100%', accentColor: C.purple, cursor: 'pointer' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: C.textMuted, marginTop: '3px' }}><span>5%</span><span>{Math.min(under.availability, 100)}%</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', padding: '5px 8px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.textSecondary }}>Charge résultante de {over.name.split(' ')[0]}</span>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: over.charge - alloc <= 100 ? C.green : C.red }}>{over.charge - alloc}%</span>
                </div>
              </div>

              {/* Period */}
              <div>
                <SectionLabel>Période d'application</SectionLabel>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                  <input type="date" value={start} onChange={e => setStart(e.target.value)} style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
                  <ArrowRight style={{ width: '12px', height: '12px', color: C.textMuted, flexShrink: 0 }} />
                  <input type="date" value={end} onChange={e => setEnd(e.target.value)} style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingTop: '4px', borderTop: `1px solid ${C.borderLight}` }}>
                <button onClick={run} disabled={running || validated}
                  style={{ width: '100%', padding: '9px', borderRadius: R, border: 'none', background: running || validated ? C.borderLight : `linear-gradient(135deg, ${C.purple}, ${C.magenta})`, color: running || validated ? C.textMuted : '#fff', cursor: running || validated ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', boxShadow: running || validated ? 'none' : `0 2px 8px ${C.purple}40` }}
                >
                  {running ? <><RefreshCw style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} />Simulation…</> : <><Play style={{ width: '13px', height: '13px' }} />Lancer la simulation</>}
                </button>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {result && !validated && (
                    <button onClick={validate} style={{ flex: 1, padding: '7px', borderRadius: R, border: 'none', backgroundColor: C.green, color: '#fff', cursor: 'pointer', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                      <CheckCircle style={{ width: '12px', height: '12px' }} />Valider
                    </button>
                  )}
                  <button onClick={reset} style={{ flex: 1, padding: '7px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.textSecondary, cursor: 'pointer', fontSize: '11px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <RefreshCw style={{ width: '12px', height: '12px' }} />Réinitialiser
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Precautions */}
          <div style={{ padding: '10px 12px', borderRadius: R, backgroundColor: '#FFFBEB', border: `1px solid #FDE68A`, borderLeft: `3px solid #F59E0B` }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle style={{ width: '13px', height: '13px', color: '#D97706', flexShrink: 0, marginTop: '1px' }} />
              <div>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#92400E', marginBottom: '5px' }}>Précautions</p>
                <ul style={{ fontSize: '11px', color: '#92400E', lineHeight: 1.6, paddingLeft: '12px' }}>
                  <li>Validez la disponibilité réelle</li>
                  <li>Consultez les chefs de projet</li>
                  <li>Vérifiez les impacts délais</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT RESULTS ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

          {/* Placeholder */}
          {!result && !running && (
            <div style={{ ...cardStyle, padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: R, backgroundColor: `${C.purple}10`, border: `1px solid ${C.purple}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <BarChart2 style={{ width: '26px', height: '26px', color: C.purple }} />
              </div>
              <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '6px' }}>Aucune simulation lancée</p>
              <p style={{ fontSize: '12px', color: C.textMuted, maxWidth: '280px', margin: '0 auto' }}>Configurez le scénario à gauche puis lancez la simulation pour visualiser les résultats Avant / Après.</p>
            </div>
          )}

          {/* Loading */}
          {running && (
            <div style={{ ...cardStyle, padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', border: `4px solid ${C.borderLight}`, borderTop: `4px solid ${C.purple}`, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
              <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Simulation en cours…</p>
              <p style={{ fontSize: '12px', color: C.textMuted }}>Calcul de l'impact de la réaffectation</p>
            </div>
          )}

          {/* Results */}
          {result && !running && (
            <>
              {/* Status */}
              <div style={{ padding: '12px 16px', borderRadius: R, backgroundColor: result.resolved ? '#ECFDF5' : '#FFFBEB', border: `1px solid ${result.resolved ? '#A7F3D0' : '#FDE68A'}`, borderLeft: `4px solid ${result.resolved ? C.green : '#F59E0B'}`, display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: R, backgroundColor: result.resolved ? '#D1FAE5' : '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {result.resolved ? <CheckCircle style={{ width: '18px', height: '18px', color: C.green }} /> : <AlertTriangle style={{ width: '18px', height: '18px', color: '#D97706' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: result.resolved ? '#065F46' : '#92400E' }}>
                      {result.resolved ? '✓ Conflit résolu avec succès' : '⚠ Conflit partiellement résolu'}
                    </p>
                    {validated && <span style={{ fontSize: '10px', fontWeight: 700, color: '#fff', backgroundColor: C.green, padding: '1px 8px', borderRadius: '3px' }}>Validé & Appliqué</span>}
                  </div>
                  <p style={{ fontSize: '12px', color: result.resolved ? '#047857' : '#B45309' }}>{result.rec}</p>
                </div>
              </div>

              {/* Before/After comparison */}
              <SectionCard title="Tableau Comparatif Avant / Après" subtitle="Impact sur les taux de charge" accent={C.magenta}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  {[{ name: result.oName, before: result.oBefore, after: result.oAfter, delta: -result.alloc }, { name: result.uName, before: result.uBefore, after: result.uAfter, delta: result.alloc }].map((r, i) => {
                    const isGood = r.after >= 90 && r.after <= 100;
                    const isOver = r.after > 100;
                    return (
                      <div key={i}>
                        <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center', marginBottom: '8px' }}>{r.name.split(' ').slice(0, 2).join(' ')}</p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div style={{ padding: '10px', borderRadius: R, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', textAlign: 'center' }}>
                            <p style={{ fontSize: '10px', color: '#DC2626', marginBottom: '2px' }}>Avant</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: C.red, lineHeight: 1 }}>{r.before}%</p>
                          </div>
                          <div style={{ padding: '10px', borderRadius: R, backgroundColor: isGood ? '#ECFDF5' : '#FFF7ED', border: `1px solid ${isGood ? '#A7F3D0' : '#FDE68A'}`, textAlign: 'center' }}>
                            <p style={{ fontSize: '10px', color: isGood ? C.green : '#D97706', marginBottom: '2px' }}>Après</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 800, color: isGood ? C.green : isOver ? C.red : '#D97706', lineHeight: 1 }}>{r.after}%</p>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', marginTop: '6px' }}>
                          {r.delta < 0 ? <TrendingDown style={{ width: '12px', height: '12px', color: C.green }} /> : <TrendingUp style={{ width: '12px', height: '12px', color: C.blue }} />}
                          <span style={{ fontSize: '11px', fontWeight: 700, color: r.delta < 0 ? C.green : C.blue }}>{r.delta > 0 ? '+' : ''}{r.delta}% de charge</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chartData} barSize={28} barCategoryGap="40%" margin={{ top: 4, right: 40, bottom: 0, left: -16 }}>
                    <CartesianGrid strokeDasharray="4 4" stroke={C.borderLight} vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: C.textMuted }} tickLine={false} axisLine={false} unit="%" />
                    <Tooltip content={<CT />} />
                    <ReferenceLine y={100} stroke={C.red} strokeDasharray="4 3" strokeWidth={1} label={{ value: '100%', position: 'right', fontSize: 9, fill: C.red }} />
                    <ReferenceLine y={90} stroke={C.green} strokeDasharray="4 3" strokeWidth={1} label={{ value: '90%', position: 'right', fontSize: 9, fill: C.green }} />
                    <Bar dataKey="Avant" fill={C.red} radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Après" fill={C.green} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', marginTop: '8px' }}>
                  {[{ c: C.red, l: 'Avant' }, { c: C.green, l: 'Après' }].map(i => <div key={i.l} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: C.textMuted }}><div style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: i.c }} />{i.l}</div>)}
                </div>
              </SectionCard>

              {/* Indicators */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
                {[
                  { l: 'Conflits', b: result.before.c, a: result.after.c, imp: result.after.c < result.before.c },
                  { l: 'Surchargées', b: result.before.o, a: result.after.o, imp: result.after.o < result.before.o },
                  { l: 'Sous-util.', b: result.before.u, a: result.after.u, imp: result.after.u < result.before.u },
                ].map((ind, i) => (
                  <div key={i} style={{ ...cardStyle, borderLeft: `3px solid ${ind.imp ? C.green : '#F59E0B'}`, padding: '12px 14px' }}>
                    <p style={{ fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>{ind.l}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: C.textMuted }}>Avant</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: C.textSecondary, lineHeight: 1 }}>{ind.b}</p>
                      </div>
                      <ArrowRight style={{ width: '14px', height: '14px', color: C.textMuted }} />
                      <div style={{ textAlign: 'center' }}>
                        <p style={{ fontSize: '9px', color: C.textMuted }}>Après</p>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, color: ind.imp ? C.green : '#F59E0B', lineHeight: 1 }}>{ind.a}</p>
                      </div>
                      {ind.a !== ind.b && <span style={{ marginLeft: 'auto', fontSize: '11px', fontWeight: 800, color: ind.a < ind.b ? C.green : C.red }}>{ind.a < ind.b ? `-${ind.b - ind.a}` : `+${ind.a - ind.b}`}</span>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Recommendation */}
              <div style={{ padding: '12px 16px', borderRadius: R, backgroundColor: result.resolved ? '#ECFDF5' : '#FFFBEB', border: `1px solid ${result.resolved ? '#A7F3D0' : '#FDE68A'}`, display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <CheckCircle style={{ width: '14px', height: '14px', color: result.resolved ? C.green : '#D97706', flexShrink: 0, marginTop: '1px' }} />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 700, color: result.resolved ? '#065F46' : '#92400E', marginBottom: '3px' }}>Recommandation du système</p>
                  <p style={{ fontSize: '12px', color: result.resolved ? '#047857' : '#B45309', marginBottom: '8px' }}>{result.rec}</p>
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px', backgroundColor: result.resolved ? '#D1FAE5' : '#FEF3C7', color: result.resolved ? '#065F46' : '#92400E' }}>
                    Statut : {result.resolved ? '✓ Résolu' : '⚠ Partiel'} · Transfert {result.alloc}% sur {result.project}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
