import { useState, useEffect } from 'react';
import { Search, UserPlus, Edit3, Clock, CheckCircle, ChevronRight, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { C, S, R, PageHeader, SectionCard, BtnPrimary, BtnSecondary, BtnGhost, Avatar, Modal, ModalHeader, SectionLabel, thStyle, tdStyle, cardStyle } from '../components/ui/design-system';
import { fetchUsers, UserResponseDTO } from '../services/userService';

/* ─── DATA ─────────────────────────────────────── */
// Legend/Heatmap period configs
const V2_MONTHS = ['Jan', 'Fév', 'Mar'];           // indices 0–2
const V2A_MONTHS = ['Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']; // indices 3–11

const getStatus = (v: number) => v > 100
  ? { label: 'Surcharge', bg: '#FEF2F2', text: '#B91C1C', bar: C.red, border: '#FECACA' }
  : v >= 90
  ? { label: 'Optimal', bg: '#ECFDF5', text: '#065F46', bar: C.green, border: '#A7F3D0' }
  : { label: 'Sous-util.', bg: '#FFF7ED', text: '#92400E', bar: '#F59E0B', border: '#FDE68A' };

const AVATAR_COLORS = [C.purple, C.blue, C.green, C.magenta, '#F59E0B', C.cyan, '#8B5CF6'];

interface ResourceItem {
  id: number;
  name: string;
  email: string;
  role: string;
  util: number;
  projects: string[];
  heatmap: number[];
  planning: { p: string; alloc: number; color: string }[];
}

/* ─── RESOURCE MODAL (merged: Profile + Planning + Modifier) ── */
function ResourceModal({ resource, onClose }: { resource: ResourceItem; onClose: () => void }) {
  const [tab, setTab] = useState<'profile' | 'planning' | 'modifier'>('profile');
  const st = getStatus(resource.util);
  const [allocValues, setAllocValues] = useState<Record<string, number>>(
    Object.fromEntries(resource.planning.map(p => [p.p, p.alloc]))
  );

  return (
    <Modal onClose={onClose} accentColor={C.purple}>
      <ModalHeader title={resource.name} subtitle={resource.role} onClose={onClose} />
      <div style={{ padding: '0 0 16px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, paddingLeft: '4px', paddingRight: '4px' }}>
          {[['profile', 'Profil'], ['planning', 'Planning'], ['modifier', 'Modifier']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as any)}
              style={{ padding: '10px 18px', fontSize: '12px', fontWeight: tab === k ? 700 : 500, cursor: 'pointer', background: 'none', border: 'none', borderBottom: tab === k ? `2px solid ${C.purple}` : '2px solid transparent', color: tab === k ? C.purple : C.textMuted, marginBottom: '-1px', fontFamily: 'Inter', transition: 'all 0.15s' }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Resource summary — always visible */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
            <Avatar name={resource.name} color={st.bar} size={42} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{resource.name}</p>
              <p style={{ fontSize: '12px', color: C.textSecondary }}>{resource.role}</p>
              <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>{resource.email}</p>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 800, color: st.text, backgroundColor: st.bg, border: `1px solid ${st.border}`, padding: '5px 12px', borderRadius: R }}>{resource.util}%</span>
          </div>

          {/* Profile tab */}
          {tab === 'profile' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                {[{ l: 'Statut', v: st.label, c: st.text }, { l: 'Projets actifs', v: String(resource.projects.length), c: C.text }, { l: 'Alloc. totale', v: `${resource.util}%`, c: st.bar }].map(i => (
                  <div key={i.l} style={{ padding: '10px 12px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
                    <p style={{ fontSize: '9px', color: C.textMuted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{i.l}</p>
                    <p style={{ fontSize: '13px', fontWeight: 700, color: i.c }}>{i.v}</p>
                  </div>
                ))}
              </div>
              <div>
                <SectionLabel>Projets en cours</SectionLabel>
                {resource.planning.length > 0 ? (
                  resource.planning.map((p, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', borderRadius: R, border: `1px solid ${C.border}`, borderLeft: `3px solid ${p.color}`, marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: C.text, flex: 1, fontWeight: 600 }}>{p.p}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: p.color }}>{p.alloc}%</span>
                    </div>
                  ))
                ) : (
                  <p style={{ fontSize: '12px', color: C.textMuted, textAlign: 'center', padding: '10px' }}>Aucun projet assigné</p>
                )}
              </div>
            </>
          )}

          {/* Planning tab */}
          {tab === 'planning' && (
            <>
              <SectionLabel>Allocations — Avril 2026</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {resource.planning.map((p, i) => (
                  <div key={i}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{p.p}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: p.color }}>{p.alloc}%</span>
                    </div>
                    <div style={{ height: '7px', borderRadius: '3px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                      <div style={{ height: '100%', borderRadius: '3px', backgroundColor: p.color, width: `${p.alloc}%` }} />
                    </div>
                  </div>
                ))}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '12px', color: C.textSecondary }}>Total alloué</span>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: resource.util > 100 ? C.red : C.green }}>{resource.util}%</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: R }}>
                <Clock style={{ width: '13px', height: '13px', color: C.blue }} />
                <span style={{ fontSize: '12px', color: '#1D4ED8', fontWeight: 500 }}>Capacité restante : {Math.max(0, 100 - resource.util)}%</span>
              </div>
            </>
          )}

          {/* Modifier tab */}
          {tab === 'modifier' && (
            <>
              <SectionLabel>Modifier les allocations</SectionLabel>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {resource.planning.map((p, i) => (
                  <div key={i} style={{ padding: '12px 14px', borderRadius: R, border: `1px solid ${C.border}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{p.p}</span>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: p.color }}>{allocValues[p.p]}%</span>
                    </div>
                    <input type="range" min="0" max="100" value={allocValues[p.p]}
                      onChange={e => setAllocValues(prev => ({ ...prev, [p.p]: Number(e.target.value) }))}
                      style={{ width: '100%', accentColor: C.purple, height: '4px', cursor: 'pointer' }} />
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: C.textMuted, marginTop: '3px' }}><span>0%</span><span>100%</span></div>
                  </div>
                ))}
              </div>
              <BtnPrimary onClick={() => { toast.success(`Affectation de ${resource.name} mise à jour.`); onClose(); }}>
                <CheckCircle style={{ width: '12px', height: '12px' }} />Valider les modifications
              </BtnPrimary>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
}

/* ─── MAIN ─────────────────────────────────────── */
export function Resources() {
  const navigate = useNavigate();
  const [view, setView] = useState<'table' | 'heatmap'>('table');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [modal, setModal] = useState<ResourceItem | null>(null);
  const [heatmapPeriod, setHeatmapPeriod] = useState<'v2' | 'v2annual'>('v2');
  
  const [resources, setResources] = useState<ResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  async function loadResources() {
    setLoading(true);
    try {
      const data = await fetchUsers();
      // Map backend UserResponseDTO to frontend ResourceItem
      const mapped: ResourceItem[] = data.map(u => ({
        id: u.id,
        name: `${u.prenom} ${u.nom}`,
        email: u.email,
        role: u.poste || 'Collaborateur',
        util: u.tauxStaffing || 0,
        projects: [], // Will be populated in Phase 2
        heatmap: Array(12).fill(u.tauxStaffing || 0), // Mock heatmap from staffing rate
        planning: [], // Will be populated in Phase 1 (Staffing)
      }));
      setResources(mapped);
    } catch (err: any) {
      toast.error("Erreur lors du chargement des collaborateurs");
    } finally {
      setLoading(false);
    }
  }

  const filtered = resources.filter(r => {
    const match = r.name.toLowerCase().includes(search.toLowerCase()) || r.role.toLowerCase().includes(search.toLowerCase());
    if (filterStatus === 'surcharge') return match && r.util > 100;
    if (filterStatus === 'optimal') return match && r.util >= 90 && r.util <= 100;
    if (filterStatus === 'sous') return match && r.util < 90;
    return match;
  });

  const heatMonths = heatmapPeriod === 'v2' ? V2_MONTHS : V2A_MONTHS;
  const heatOffset = heatmapPeriod === 'v2' ? 0 : 3;

  const handleProjectClick = (projectName: string) => {
    navigate(`/projects`);
    toast.info(`Projets — filtre actif : ${projectName}`);
  };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      <PageHeader title="Gestion des Ressources" subtitle={`${resources.length} collaborateurs actifs · ${resources.filter(r => r.util > 100).length} en surcharge`}>
        <BtnPrimary onClick={() => toast.info('Disponible en v2')}>
          <UserPlus style={{ width: '12px', height: '12px' }} />Ajouter
        </BtnPrimary>
      </PageHeader>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '12px' }}>
        {[
          { l: 'Total Ressources', v: String(resources.length), accent: C.purple },
          { l: "Taux d'util. moyen", v: `${Math.round(resources.reduce((a, r) => a + r.util, 0) / resources.length)}%`, accent: C.blue },
          { l: 'Surcharge (>100%)', v: String(resources.filter(r => r.util > 100).length), accent: C.red },
          { l: 'Sous-utilisés (<90%)', v: String(resources.filter(r => r.util < 90).length), accent: '#F59E0B' },
        ].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.accent}` }}>
            <div style={{ padding: '12px 16px' }}>
              <p style={{ fontSize: '10px', fontWeight: 600, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{s.l}</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.accent, lineHeight: 1 }}>{s.v}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend + hint */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
        {[{ c: C.green, l: 'Optimal (90–100%)' }, { c: '#F59E0B', l: 'Sous-util. (<90%)' }, { c: C.red, l: 'Surcharge (>100%)' }].map(item => (
          <div key={item.l} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: C.textMuted }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: item.c }} />{item.l}
          </div>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: '11px', color: C.textMuted, fontStyle: 'italic' }}>
          Cliquez sur un projet pour accéder à la page Projets avec filtre actif
        </span>
      </div>

      {/* Table / Heatmap */}
      <div style={cardStyle}>
        {/* Toolbar */}
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '200px' }}>
            <div style={{ position: 'relative', flex: 1, maxWidth: '260px' }}>
              <Search style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: C.textMuted, pointerEvents: 'none' }} />
              <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher…"
                style={{ width: '100%', paddingLeft: '28px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: C.bg, outline: 'none' }}
                onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger style={{ width: '190px', fontSize: '12px', borderRadius: R, height: '32px' }}><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="optimal">Optimal (90–100%)</SelectItem>
                <SelectItem value="surcharge">Surcharge (&gt;100%)</SelectItem>
                <SelectItem value="sous">Sous-utilisation (&lt;90%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            {/* Heatmap period selector */}
            {view === 'heatmap' && (
              <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden' }}>
                {[['v2', 'V2 — Jan–Mars'], ['v2annual', 'V2 Annuel — Avr–Déc']].map(([v, l]) => (
                  <button key={v} onClick={() => setHeatmapPeriod(v as any)}
                    style={{ padding: '5px 11px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', border: 'none', backgroundColor: heatmapPeriod === v ? C.purple : '#fff', color: heatmapPeriod === v ? '#fff' : C.textMuted, fontFamily: 'Inter', whiteSpace: 'nowrap' }}>
                    {l}
                  </button>
                ))}
              </div>
            )}
            {/* View toggle */}
            <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden' }}>
              {(['table', 'heatmap'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  style={{ padding: '5px 14px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', borderRadius: 0, backgroundColor: view === v ? C.purple : '#fff', color: view === v ? '#fff' : C.textMuted, transition: 'all 0.15s', fontFamily: 'Inter' }}>
                  {v === 'table' ? 'Tableau' : 'Heatmap'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* TABLE VIEW */}
        {loading ? (
          <div style={{ padding: '60px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Loader2 style={{ width: '32px', height: '32px', color: C.purple, animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '13px', color: C.textMuted, fontWeight: 500 }}>Chargement des collaborateurs…</p>
          </div>
        ) : view === 'table' ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>{['Collaborateur', 'Rôle', 'Projets', 'Utilisation', 'Statut', 'Actions'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const st = getStatus(r.util);
                  return (
                    <tr key={r.id} style={{ transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <Avatar name={r.name} color={AVATAR_COLORS[idx % AVATAR_COLORS.length]} size={30} />
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{r.name}</p>
                            <p style={{ fontSize: '10px', color: C.textMuted, lineHeight: 1.3 }}>{r.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <span style={{ fontSize: '12px', color: C.textSecondary }}>{r.role}</span>
                      </td>
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        {/* Clickable project tags */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {r.projects.map((p, i) => (
                            <button key={i}
                              onClick={() => handleProjectClick(p)}
                              style={{ fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', backgroundColor: `${C.purple}10`, border: `1px solid ${C.purple}30`, color: C.purple, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px', transition: 'all 0.12s' }}
                              onMouseEnter={e => { e.currentTarget.style.backgroundColor = C.purple; e.currentTarget.style.color = '#fff'; }}
                              onMouseLeave={e => { e.currentTarget.style.backgroundColor = `${C.purple}10`; e.currentTarget.style.color = C.purple; }}
                              title={`Voir le projet ${p} dans l'interface Projets`}
                            >
                              {p} <ChevronRight style={{ width: '9px', height: '9px' }} />
                            </button>
                          ))}
                        </div>
                      </td>
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '72px', height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                            <div style={{ height: '100%', borderRadius: '2px', backgroundColor: st.bar, width: `${Math.min(r.util, 100)}%` }} />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: st.text, backgroundColor: st.bg, border: `1px solid ${st.border}`, padding: '1px 6px', borderRadius: '3px' }}>{r.util}%</span>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '3px', backgroundColor: st.bg, border: `1px solid ${st.border}`, color: st.text }}>{st.label}</span>
                      </td>
                      <td style={{ ...tdStyle, borderBottom: idx < filtered.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                        <BtnSecondary small onClick={() => setModal(r)}>
                          <Edit3 style={{ width: '11px', height: '11px' }} />Modifier
                        </BtnSecondary>
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
                Heatmap — {heatmapPeriod === 'v2' ? 'V2 Forecast (Janvier – Mars 2026)' : 'V2 Annual Forecast (Avril – Décembre 2026)'}
              </p>
              <p style={{ fontSize: '11px', color: C.textMuted }}>Taux d'allocation mensuel par collaborateur</p>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={{ ...thStyle, minWidth: '180px', position: 'sticky', left: 0, backgroundColor: '#F8F9FB' }}>Collaborateur</th>
                  {heatMonths.map(m => <th key={m} style={{ ...thStyle, minWidth: '70px', textAlign: 'center' }}>{m}</th>)}
                  <th style={{ ...thStyle, textAlign: 'center' }}>Moy.</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, idx) => {
                  const slice = r.heatmap.slice(heatOffset, heatOffset + heatMonths.length);
                  const avg = Math.round(slice.reduce((a, v) => a + v, 0) / slice.length);
                  return (
                    <tr key={r.id} style={{ borderBottom: `1px solid ${C.borderLight}` }}>
                      <td style={{ ...tdStyle, position: 'sticky', left: 0, backgroundColor: C.white, borderBottom: 'none' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Avatar name={r.name} color={AVATAR_COLORS[idx % AVATAR_COLORS.length]} size={26} />
                          <div>
                            <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{r.name}</p>
                            <p style={{ fontSize: '10px', color: C.textMuted }}>{r.role}</p>
                          </div>
                        </div>
                      </td>
                      {slice.map((v, i) => {
                        const s = getStatus(v);
                        return (
                          <td key={i} style={{ padding: '6px', textAlign: 'center', borderBottom: 'none' }}>
                            <div style={{ width: '52px', height: '36px', borderRadius: R, backgroundColor: s.bar, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                              <span style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{v}%</span>
                              <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.7)' }}>{v > 100 ? '▲' : v >= 90 ? '●' : '▼'}</span>
                            </div>
                          </td>
                        );
                      })}
                      <td style={{ padding: '6px', textAlign: 'center', borderBottom: 'none' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, padding: '3px 8px', borderRadius: '3px', backgroundColor: getStatus(avg).bg, color: getStatus(avg).text, border: `1px solid ${getStatus(avg).border}` }}>{avg}%</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <ResourceModal resource={modal} onClose={() => setModal(null)} />}
    </div>
  );
}