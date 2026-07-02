import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Edit3, Clock, Loader2, AlertTriangle, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { C, S, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, Avatar, Modal, ModalHeader, SectionLabel, thStyle, tdStyle, cardStyle } from '../components/ui/design-system';
import { fetchRmResources, supprimerRmResource, type RmResourceDTO } from '../services/resourceManagerService';

/* HELPERS */
const MONTHS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

const getStatus = (v: number) => v > 100
  ? { label: 'Surcharge', bg: '#FEF2F2', text: '#B91C1C', bar: C.red, border: '#FECACA' }
  : v >= 80
  ? { label: 'Optimal', bg: '#ECFDF5', text: '#065F46', bar: C.green, border: '#A7F3D0' }
  : { label: 'Sous-util.', bg: '#FFF7ED', text: '#92400E', bar: '#F59E0B', border: '#FDE68A' };

const AVATAR_COLORS = [C.purple, C.blue, C.green, C.magenta, '#F59E0B', C.cyan, '#8B5CF6'];

const compactThStyle: React.CSSProperties = {
  ...thStyle,
  padding: '7px 10px',
  fontSize: '10px',
  lineHeight: 1.15,
};

const compactTdStyle: React.CSSProperties = {
  ...tdStyle,
  padding: '6px 10px',
  lineHeight: 1.15,
};

/* RESOURCE MODAL */
function ResourceModal({
  resource,
  onClose,
  onProjectClick,
}: {
  resource: RmResourceDTO;
  onClose: () => void;
  onProjectClick: (projectName: string) => void;
}) {
  const [tab, setTab] = useState<'profile' | 'planning'>('profile');
  const st = getStatus(resource.tauxUtilisation);
  const fullName = `${resource.prenom} ${resource.nom}`;

  return (
    <Modal onClose={onClose} accentColor={C.purple}>
      <ModalHeader title={fullName} subtitle={resource.poste || 'Collaborateur'} onClose={onClose} />
      <div style={{ padding: '0 0 16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, paddingLeft: '4px', paddingRight: '4px' }}>
          {[['profile', 'Profil'], ['planning', 'Planning']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as any)}
              style={{ padding: '10px 18px', fontSize: '12px', fontWeight: tab === k ? 700 : 500, cursor: 'pointer', background: 'none', border: 'none', borderBottom: tab === k ? `2px solid ${C.purple}` : '2px solid transparent', color: tab === k ? C.purple : C.textMuted, marginBottom: '-1px', fontFamily: 'Inter', transition: 'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Summary */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
            <Avatar name={fullName} color={st.bar} size={42} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{fullName}</p>
              <p style={{ fontSize: '12px', color: C.textSecondary }}>{resource.poste}</p>
              <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>{resource.email}</p>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: st.text, backgroundColor: st.bg, border: `1px solid ${st.border}`, padding: '5px 12px', borderRadius: R }}>{resource.tauxUtilisation}%</span>
          </div>

          {tab === 'profile' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[{ l: 'Statut', v: st.label, c: st.text }, { l: 'Projets actifs', v: String(resource.projets.length), c: C.text }, { l: 'Alloc. totale', v: `${resource.tauxUtilisation}%`, c: st.bar }].map(i => (
                  <div key={i.l} style={{ padding: '10px 12px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: '9px', color: C.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{i.l}</p>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: i.c }}>{i.v}</p>
                  </div>
                ))}
              </div>
              <div>
                <SectionLabel>Projets en cours</SectionLabel>
                {resource.projets.length === 0 ? (
                  <p style={{ fontSize: '12px', color: C.textMuted }}>Aucun projet actif.</p>
                ) : resource.projets.map((p, i) => (
                  <div key={i} onClick={() => onProjectClick(p.projetNom)}
                    title={`Voir le projet ${p.projetNom}`}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: R, border: `1px solid ${C.border}`, borderLeft: `3px solid ${p.couleur}`, marginBottom: '6px', cursor: 'pointer', transition: 'background 0.12s, border-color 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.bg; e.currentTarget.style.borderColor = `${p.couleur}55`; }}
                    onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.borderColor = C.border; }}>
                    <span style={{ fontSize: '12px', color: C.text, flex: 1, fontWeight: 600 }}>{p.projetNom}</span>
                    <span style={{ fontSize: '10px', color: p.couleur, fontWeight: 800, marginRight: '4px' }}>Voir</span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: p.couleur }}>{p.tauxAffectation}%</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {tab === 'planning' && (
            <>
              <SectionLabel>Allocations actuelles</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {resource.projets.map((p, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{p.projetNom}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: p.couleur }}>{p.tauxAffectation}%</span>
                    </div>
                    <div style={{ height: '7px', borderRadius: '3px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '3px', backgroundColor: p.couleur, width: `${Math.min(p.tauxAffectation, 100)}%` }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '12px', color: C.textSecondary }}>Total alloué</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: resource.tauxUtilisation > 100 ? C.red : C.green }}>{resource.tauxUtilisation}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: R }}>
                <Clock style={{ width: '13px', height: '13px', color: C.blue }} />
                <span style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: 500 }}>Capacité restante : {Math.max(0, 100 - resource.tauxUtilisation)}%</span>
              </div>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* MAIN */
export function Resources() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<RmResourceDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'table' | 'heatmap'>('table');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modal, setModal] = useState<RmResourceDTO | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setResources(await fetchRmResources());
    } catch (err: any) {
      setError(err.message || 'Impossible de charger les ressources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (resource: RmResourceDTO) => {
    const fullName = `${resource.prenom} ${resource.nom}`;
    const confirmed = window.confirm(
      `Supprimer le collaborateur "${fullName}" ?\n\nSes affectations, taches, anomalies et donnees liees seront supprimees.`
    );
    if (!confirmed) return;

    try {
      setDeletingId(resource.id);
      await supprimerRmResource(resource.id);
      toast.success('Collaborateur supprime.');
      setModal(current => current?.id === resource.id ? null : current);
      await load();
    } catch (err: any) {
      toast.error(err.message || 'Impossible de supprimer le collaborateur.');
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = resources.filter(r => {
    const name = `${r.prenom} ${r.nom}`.toLowerCase();
    const match = name.includes(search.toLowerCase()) || (r.poste || '').toLowerCase().includes(search.toLowerCase());
    if (filterStatus === 'surcharge') return match && r.tauxUtilisation > 100;
    if (filterStatus === 'optimal') return match && r.tauxUtilisation >= 80 && r.tauxUtilisation <= 100;
    if (filterStatus === 'sous') return match && r.tauxUtilisation < 80;
    return match;
  });

  const openProjectFromModal = (projectName: string) => {
    setModal(null);
    navigate(`/projects?search=${encodeURIComponent(projectName)}`);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 style={{ width: '32px', height: '32px', color: C.magenta, animation: 'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <AlertTriangle style={{ width: '32px', height: '32px', color: C.red, margin: '0 auto 10px' }} />
          <p style={{ fontSize: '14px', fontWeight: 600, color: C.text }}>{error}</p>
          <button onClick={load} style={{ marginTop: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 16px', borderRadius: R, border: 'none', backgroundColor: C.magenta, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}>
            <RefreshCw style={{ width: '12px', height: '12px' }} />Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <PageHeader title="Gestion des Ressources" subtitle={`${resources.length} collaborateurs`} />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { l: 'Total Ressources', v: String(resources.length), accent: C.purple },
          { l: "Taux d'util. moyen", v: `${Math.round(resources.reduce((a, r) => a + r.tauxUtilisation, 0) / (resources.length || 1))}%`, accent: C.blue },
          { l: 'Surcharge (>100%)', v: String(resources.filter(r => r.tauxUtilisation > 100).length), accent: C.red },
          { l: 'Sous-utilisés (<80%)', v: String(resources.filter(r => r.tauxUtilisation < 80).length), accent: '#F59E0B' },
        ].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.accent}` }}>
            <div style={{ padding: '12px 16px' }}>
              <p style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{s.l}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.accent, lineHeight: 1 }}>{s.v}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {[{ c: C.green, l: 'Optimal (80-100%)' }, { c: '#F59E0B', l: 'Sous-util. (<80%)' }, { c: C.red, l: 'Surcharge (>100%)' }].map(item => (
          <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: C.textMuted }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: item.c }} />{item.l}
          </div>
        ))}
      </div>

      {/* Table / Heatmap */}
      <div style={cardStyle}>
        {/* Toolbar */}
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '260px' }}>
              <Search style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: C.textMuted, pointerEvents: 'none' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..."
                style={{ width: '100%', paddingLeft: '28px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: C.bg, outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
            </div>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '6px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', cursor: 'pointer' }}>
              <option value="all">Tous les statuts</option>
              <option value="optimal">Optimal (80-100%)</option>
              <option value="surcharge">Surcharge (&gt;100%)</option>
              <option value="sous">Sous-utilisation (&lt;80%)</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden' }}>
              {(['table', 'heatmap'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: '5px 14px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: view === v ? C.purple : '#fff', color: view === v ? '#fff' : C.textMuted, transition: 'all 0.15s', fontFamily: 'Inter' }}>
                  {v === 'table' ? 'Tableau' : 'Heatmap'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABLE VIEW */}
        {view === 'table' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Collaborateur', 'Poste', 'Projets', 'Utilisation', 'Statut', 'Actions'].map(h => <th key={h} style={compactThStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} style={{ padding: '40px', textAlign: 'center', fontSize: '13px', color: C.textMuted }}>Aucun collaborateur trouvé.</td></tr>
                ) : filtered.map((r, idx) => {
                  const st = getStatus(r.tauxUtilisation);
                  const fullName = `${r.prenom} ${r.nom}`;
                  return (
                    <tr key={r.id} style={{ transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                      <td style={{ ...compactTdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar name={fullName} color={AVATAR_COLORS[idx % AVATAR_COLORS.length]} size={24} />
                          <div>
                            <p style={{ fontSize: '12px', fontWeight: 700, color: C.text, lineHeight: 1.15 }}>{fullName}</p>
                            <p style={{ fontSize: '9px', color: C.textMuted, lineHeight: 1.15 }}>{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...compactTdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <span style={{ fontSize: '11px', color: C.textSecondary }}>{r.poste || '-'}</span>
                      </td>
                      <td style={{ ...compactTdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px' }}>
                          {r.projets.length === 0 ? (
                            <span style={{ fontSize: '9px', color: C.textMuted }}>Aucun</span>
                          ) : r.projets.map((p, i) => (
                            <span key={i} style={{ fontSize: '9px', fontWeight: 700, padding: '1px 5px', borderRadius: '3px', backgroundColor: `${p.couleur}10`, border: `1px solid ${p.couleur}30`, color: p.couleur, lineHeight: 1.2 }}>
                              {p.projetNom}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td style={{ ...compactTdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '66px', height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '2px', backgroundColor: st.bar, width: `${Math.min(r.tauxUtilisation, 100)}%` }} />
                          </div>
                          <span style={{ fontSize: '10px', fontWeight: 800, color: st.text, backgroundColor: st.bg, border: `1px solid ${st.border}`, padding: '1px 5px', borderRadius: '3px', lineHeight: 1.2 }}>{r.tauxUtilisation}%</span>
                        </div>
                      </td>
                      <td style={{ ...compactTdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <span style={{ fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '3px', backgroundColor: st.bg, border: `1px solid ${st.border}`, color: st.text, lineHeight: 1.2 }}>{st.label}</span>
                      </td>
                      <td style={{ ...compactTdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
                          <button onClick={() => setModal(r)} style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', cursor: 'pointer', fontSize: '10px', fontWeight: 700, color: C.textSecondary, lineHeight: 1.2 }}
                            onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}>
                            <Edit3 style={{ width: '10px', height: '10px' }} />Detail
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            disabled={deletingId === r.id}
                            style={{ display: 'flex', alignItems: 'center', gap: '3px', padding: '3px 8px', borderRadius: R, border: `1px solid ${C.red}`, backgroundColor: C.red, cursor: deletingId === r.id ? 'not-allowed' : 'pointer', fontSize: '10px', fontWeight: 700, color: '#fff', opacity: deletingId === r.id ? 0.65 : 1, lineHeight: 1.2 }}
                            onMouseEnter={e => { if (deletingId !== r.id) e.currentTarget.style.backgroundColor = '#B91C1C'; }}
                            onMouseLeave={e => (e.currentTarget.style.backgroundColor = C.red)}
                          >
                            {deletingId === r.id ? (
                              <Loader2 style={{ width: '10px', height: '10px', animation: 'spin 1s linear infinite' }} />
                            ) : (
                              <Trash2 style={{ width: '10px', height: '10px' }} />
                            )}
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* HEATMAP VIEW */
          <div style={{ padding: '20px', overflowX: 'auto' }}>
            <div style={{ marginBottom: '14px' }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '2px' }}>
                Heatmap - Taux de charge mensuel 
              </p>
              <p style={{ fontSize: '11px', color: C.textMuted }}>Basé sur les jours ouvrables par rapport à la capacité mensuelle</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, minWidth: '180px', position: 'sticky', left: 0, backgroundColor: '#F8F9FB' }}>Collaborateur</th>
                  {MONTHS.map(m => <th key={m} style={{ ...thStyle, minWidth: '60px', textAlign: 'center' }}>{m}</th>)}
                  <th style={{ ...thStyle, textAlign: 'center' }}>Moy.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const nonZeroValues = r.heatmap.filter(v => v > 0);
                  const avg = nonZeroValues.length > 0 ? Math.round(nonZeroValues.reduce((a, v) => a + v, 0) / nonZeroValues.length) : 0;
                  const fullName = `${r.prenom} ${r.nom}`;
                  return (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                      <td style={{ ...tdStyle, position: 'sticky', left: 0, backgroundColor: C.white, borderBottom: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar name={fullName} color={AVATAR_COLORS[idx % AVATAR_COLORS.length]} size={26} />
                          <div>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{fullName}</p>
                            <p style={{ fontSize: '10px', color: C.textMuted }}>{r.poste || '-'}</p>
                          </div>
                        </div>
                      </td>
                      {r.heatmap.map((v, i) => {
                        const s = getStatus(v);
                        return (
                          <td key={i} style={{ padding: '4px', textAlign: 'center', borderBottom: 'none' }}>
                            <div style={{ width: '46px', height: '32px', borderRadius: R, backgroundColor: v > 0 ? s.bar : C.borderLight, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                              <span style={{ fontSize: '10px', fontWeight: 700, color: v > 0 ? '#fff' : C.textMuted }}>{v}%</span>
                              {v > 0 && <span style={{ fontSize: '8px', color: 'rgba(255,255,255,0.7)' }}>{v > 100 ? '▲' : v >= 80 ? '●' : '▼'}</span>}
                            </div>
                          </td>
                        );
                      })}
                      <td style={{ padding: '4px', textAlign: 'center', borderBottom: 'none' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '3px', backgroundColor: getStatus(avg).bg, color: getStatus(avg).text, border: `1px solid ${getStatus(avg).border}` }}>{avg}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <ResourceModal resource={modal} onClose={() => setModal(null)} onProjectClick={openProjectFromModal} />}
    </div>
  );
}
