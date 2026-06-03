import { useState, useEffect } from 'react';
import { Calendar, Shield, CheckCircle, RefreshCw, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { C, R, PageHeader, BtnPrimary, BtnGhost, SectionLabel, thStyle, tdStyle, cardStyle } from '../components/ui/design-system';
import { fetchCalendrier, type CalendrierConfigDTO, type MoisOuvrableDTO, type JourFerieDTO } from '../services/calendrierService';

/* ─── STATIC DATA (roles — pas de backend pour ça) ─── */
const roles = [
  { name: 'Resource Manager', permissions: ['Tous les accès', 'Gestion conflits', 'Rapports', 'Simulation'], users: 3, color: C.purple },
  { name: 'Project Manager', permissions: ['Vue projets', 'Vue ressources', 'Rapports'], users: 12, color: C.blue },
  { name: 'Collaborateur', permissions: ['Vue personnelle', 'Calendrier'], users: 48, color: C.green },
];

const PAYS_OPTIONS = [
  { v: 'ma', l: '🇲🇦 Maroc' },
  { v: 'fr', l: '🇫🇷 France' },
  { v: 'be', l: '🇧🇪 Belgique' },
  { v: 'ch', l: '🇨🇭 Suisse' },
  { v: 'tn', l: '🇹🇳 Tunisie' },
];

export function Settings() {
  const [tab, setTab] = useState<'calendar' | 'roles'>('calendar');
  const [pays, setPays] = useState('ma');
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [moisData, setMoisData] = useState<MoisOuvrableDTO[]>([]);
  const [joursFeries, setJoursFeries] = useState<JourFerieDTO[]>([]);
  const [manualValues, setManualValues] = useState<Record<number, number>>({});
  const [validated, setValidated] = useState<Set<number>>(new Set());

  const loadCalendrier = async (p: string, a: number) => {
    setLoading(true);
    try {
      const data = await fetchCalendrier(p, a);
      setMoisData(data.mois);
      setJoursFeries(data.joursFeries);
      // Reset manual values and validation
      const mv: Record<number, number> = {};
      data.mois.forEach(m => { mv[m.mois] = m.joursOuvrablesManuel ?? m.joursOuvrablesAuto; });
      setManualValues(mv);
      setValidated(new Set(data.mois.filter(m => m.valide).map(m => m.mois)));
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors du chargement du calendrier.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCalendrier(pays, annee); }, [pays, annee]);

  const sync = async () => {
    setSyncing(true);
    toast.loading('Synchronisation avec Nager.Date…', { id: 'sync' });
    await loadCalendrier(pays, annee);
    setSyncing(false);
    toast.success('Calendrier synchronisé !', { id: 'sync' });
  };

  const save = () => toast.success('Modifications enregistrées avec succès.');
  const validateMonth = (mois: number, label: string) => {
    setValidated(p => new Set(p).add(mois));
    toast.success(`${label} validé.`);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Paramétrage" subtitle="Configuration du système et gestion des accès" />

      {/* Main card with tabs */}
      <div style={cardStyle}>
        {/* Tab navigation */}
        <div style={{ borderBottom: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', paddingLeft: '4px' }}>
            {[{ key: 'calendar', label: 'Calendrier & Jours Ouvrables', icon: Calendar }, { key: 'roles', label: 'Rôles & Accès', icon: Shield }].map(t => {
              const active = tab === t.key;
              return (
                <button key={t.key} onClick={() => setTab(t.key as any)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 20px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', background: 'none', border: 'none', borderBottom: active ? `2px solid ${C.purple}` : '2px solid transparent', color: active ? C.purple : C.textMuted, marginBottom: '-1px', transition: 'all 0.15s', fontFamily: 'Inter' }}
                >
                  <t.icon style={{ width: '13px', height: '13px' }} />{t.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ padding: '20px 24px' }}>
          {tab === 'calendar' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Sync header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '2px' }}>Configuration du Calendrier</p>
                  <p style={{ fontSize: '12px', color: C.textMuted }}>Jours fériés récupérés automatiquement via Nager.Date API</p>
                </div>
                <BtnGhost onClick={sync}>
                  <RefreshCw style={{ width: '12px', height: '12px', animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                  {syncing ? 'Synchronisation…' : 'Récupérer automatiquement'}
                </BtnGhost>
              </div>

              {/* Config selects */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <SectionLabel>Pays / Région</SectionLabel>
                  <select value={pays} onChange={e => setPays(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', cursor: 'pointer', fontFamily: 'Inter' }}>
                    {PAYS_OPTIONS.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                  </select>
                </div>
                <div>
                  <SectionLabel>Année</SectionLabel>
                  <select value={annee} onChange={e => setAnnee(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', cursor: 'pointer', fontFamily: 'Inter' }}>
                    {[2025, 2026, 2027, 2028].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              {/* Working days table */}
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
                  <Loader2 style={{ width: '24px', height: '24px', color: C.purple, animation: 'spin 1s linear infinite' }} />
                </div>
              ) : (
                <>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>Jours Ouvrables Mensuels</p>
                    <div style={{ border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            {['Mois', 'Auto-détecté', 'Manuel', 'Statut', 'Action'].map(h => <th key={h} style={thStyle}>{h}</th>)}
                          </tr>
                        </thead>
                        <tbody>
                          {moisData.map((d, i) => {
                            const isValidated = validated.has(d.mois);
                            return (
                              <tr key={d.mois} onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                                <td style={{ ...tdStyle, borderBottom: i < moisData.length - 1 ? `1px solid ${C.borderLight}` : 'none', fontWeight: 600, color: C.text }}>{d.label}</td>
                                <td style={{ ...tdStyle, borderBottom: i < moisData.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                                  <span style={{ fontSize: '12px', color: C.textSecondary }}>{d.joursOuvrablesAuto} jours</span>
                                  <span style={{ fontSize: '10px', color: C.textMuted, marginLeft: '6px' }}>({d.joursTotal} - {d.weekends} WE - {d.joursFeries} fériés)</span>
                                </td>
                                <td style={{ ...tdStyle, borderBottom: i < moisData.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                                  <input type="number" value={manualValues[d.mois] ?? d.joursOuvrablesAuto} min="0" max="31"
                                    onChange={e => setManualValues(p => ({ ...p, [d.mois]: Number(e.target.value) }))}
                                    style={{ width: '56px', padding: '3px 8px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, outline: 'none', textAlign: 'center', fontFamily: 'Inter' }}
                                    onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
                                </td>
                                <td style={{ ...tdStyle, borderBottom: i < moisData.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', backgroundColor: isValidated ? '#ECFDF5' : '#FFFBEB', color: isValidated ? '#065F46' : '#92400E', border: `1px solid ${isValidated ? '#A7F3D0' : '#FDE68A'}` }}>
                                    {isValidated && <CheckCircle style={{ width: '10px', height: '10px' }} />}
                                    {isValidated ? 'Validé' : 'En attente'}
                                  </span>
                                </td>
                                <td style={{ ...tdStyle, borderBottom: i < moisData.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                                  <button onClick={() => validateMonth(d.mois, d.label)} style={{ fontSize: '12px', fontWeight: 600, color: C.purple, background: 'none', border: 'none', cursor: 'pointer' }}>Valider</button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Holidays */}
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>
                      Jours Fériés — {PAYS_OPTIONS.find(o => o.v === pays)?.l || pays} {annee}
                      <span style={{ fontSize: '11px', fontWeight: 400, color: C.textMuted, marginLeft: '8px' }}>({joursFeries.length} jours)</span>
                    </p>
                    {joursFeries.length === 0 ? (
                      <p style={{ fontSize: '12px', color: C.textMuted, padding: '16px', textAlign: 'center' }}>Aucun jour férié trouvé pour ce pays/année.</p>
                    ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        {joursFeries.map((h, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: R, border: `1px solid ${C.border}`, transition: 'background 0.1s' }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Calendar style={{ width: '12px', height: '12px', color: C.textMuted }} />
                              <div>
                                <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{h.nom}</p>
                                <p style={{ fontSize: '10px', color: C.textMuted }}>
                                  {new Date(h.date + 'T00:00:00').toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                              </div>
                            </div>
                            <input type="checkbox" defaultChecked={h.actif} style={{ cursor: 'pointer', accentColor: C.purple, width: '14px', height: '14px' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: `1px solid ${C.borderLight}` }}>
                <BtnPrimary onClick={save}><Save style={{ width: '12px', height: '12px' }} />Enregistrer les modifications</BtnPrimary>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '2px' }}>Gestion des Rôles et Accès</p>
                <p style={{ fontSize: '12px', color: C.textMuted }}>Configurez les permissions par rôle utilisateur</p>
              </div>

              {/* Role cards */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {roles.map((role, i) => (
                  <div key={i} style={{ padding: '14px 16px', borderRadius: R, border: `1px solid ${C.border}`, borderLeft: `4px solid ${role.color}`, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <div style={{ width: '32px', height: '32px', borderRadius: R, backgroundColor: `${role.color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Shield style={{ width: '15px', height: '15px', color: role.color }} />
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{role.name}</p>
                          <p style={{ fontSize: '11px', color: C.textMuted }}>{role.users} utilisateur{role.users > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {role.permissions.map((p, j) => (
                          <span key={j} style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '3px', backgroundColor: `${role.color}10`, color: role.color, border: `1px solid ${role.color}25` }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Staffing thresholds */}
              <div style={{ paddingTop: '16px', borderTop: `1px solid ${C.borderLight}` }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '12px' }}>Seuils de Staffing</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { l: 'Seuil Optimal (minimum)', v: 90, c: C.green, desc: 'En dessous → Sous-utilisation détectée' },
                    { l: 'Seuil Surcharge (maximum)', v: 100, c: C.red, desc: 'Au dessus → Alerte surcharge déclenchée' },
                  ].map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 14px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.border}`, borderLeft: `3px solid ${t.c}` }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '12px', fontWeight: 700, color: C.text, marginBottom: '2px' }}>{t.l}</p>
                        <p style={{ fontSize: '11px', color: C.textMuted }}>{t.desc}</p>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                        <input type="range" min="50" max="120" defaultValue={t.v} style={{ width: '100px', accentColor: t.c, cursor: 'pointer' }} />
                        <span style={{ fontSize: '14px', fontWeight: 800, color: t.c, minWidth: '40px', textAlign: 'right' }}>{t.v}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '12px', borderTop: `1px solid ${C.borderLight}` }}>
                <BtnPrimary onClick={save}><Save style={{ width: '12px', height: '12px' }} />Enregistrer les modifications</BtnPrimary>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
