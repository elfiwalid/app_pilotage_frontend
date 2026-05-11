import { useState } from 'react';
import { Calendar, Shield, CheckCircle, RefreshCw, Save } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { C, R, PageHeader, SectionCard, BtnPrimary, BtnGhost, SectionLabel, thStyle, tdStyle, cardStyle } from '../components/ui/design-system';

/* ─── DATA ─────────────────────────────────────── */
const workingDays = [
  { month: 'Janvier 2026', auto: 21, manual: 21, validated: true },
  { month: 'Février 2026', auto: 20, manual: 20, validated: true },
  { month: 'Mars 2026', auto: 22, manual: 22, validated: true },
  { month: 'Avril 2026', auto: 21, manual: 21, validated: false },
  { month: 'Mai 2026', auto: 19, manual: 19, validated: false },
  { month: 'Juin 2026', auto: 22, manual: 22, validated: false },
];
const holidays = [
  { date: '2026-01-01', name: 'Nouvel An' }, { date: '2026-01-11', name: "Manifeste de l'Indépendance" },
  { date: '2026-05-01', name: 'Fête du Travail' }, { date: '2026-07-30', name: 'Fête du Trône' },
  { date: '2026-08-14', name: 'Journée Oued Ed-Dahab' }, { date: '2026-08-20', name: 'Révolution du Roi et du Peuple' },
  { date: '2026-08-21', name: 'Fête de la Jeunesse' }, { date: '2026-11-06', name: 'Marche Verte' },
  { date: '2026-11-18', name: "Fête de l'Indépendance" },
];
const roles = [
  { name: 'Resource Manager', permissions: ['Tous les accès', 'Gestion conflits', 'Rapports', 'Simulation'], users: 3, color: C.purple },
  { name: 'Project Manager', permissions: ['Vue projets', 'Vue ressources', 'Rapports'], users: 12, color: C.blue },
  { name: 'Collaborateur', permissions: ['Vue personnelle', 'Calendrier'], users: 48, color: C.green },
];

export function Settings() {
  const [tab, setTab] = useState<'calendar' | 'roles'>('calendar');
  const [syncing, setSyncing] = useState(false);

  const sync = () => {
    setSyncing(true);
    toast.loading('Synchronisation…', { id: 'sync' });
    setTimeout(() => { setSyncing(false); toast.success('Calendrier synchronisé !', { id: 'sync' }); }, 1500);
  };
  const save = () => toast.success('Modifications enregistrées avec succès.');
  const validateMonth = (m: string) => toast.success(`${m} validé.`);

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
                  <p style={{ fontSize: '12px', color: C.textMuted }}>Définissez les jours ouvrables et jours fériés</p>
                </div>
                <BtnGhost onClick={sync}>
                  <RefreshCw style={{ width: '12px', height: '12px', animation: syncing ? 'spin 1s linear infinite' : 'none' }} />
                  {syncing ? 'Synchronisation…' : 'Récupérer automatiquement'}
                </BtnGhost>
              </div>

              {/* Config selects */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {[
                  { l: 'Pays / Région', default: 'ma', items: [{ v: 'ma', l: '🇲🇦 Maroc' }, { v: 'fr', l: '🇫🇷 France' }, { v: 'be', l: '🇧🇪 Belgique' }, { v: 'ch', l: '🇨🇭 Suisse' }] },
                  { l: 'Jours de travail par semaine', default: '5', items: [{ v: '5', l: '5 jours (Lun-Ven)' }, { v: '5.5', l: '5.5 jours (Lun-Sam matin)' }, { v: '6', l: '6 jours (Lun-Sam)' }] },
                ].map(sel => (
                  <div key={sel.l}>
                    <SectionLabel>{sel.l}</SectionLabel>
                    <Select defaultValue={sel.default}>
                      <SelectTrigger style={{ borderRadius: R, height: '32px', fontSize: '12px' }}><SelectValue /></SelectTrigger>
                      <SelectContent>{sel.items.map(i => <SelectItem key={i.v} value={i.v}>{i.l}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {/* Working days table */}
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
                      {workingDays.map((d, i) => (
                        <tr key={i} onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)} onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          <td style={{ ...tdStyle, borderBottom: i < workingDays.length - 1 ? `1px solid ${C.borderLight}` : 'none', fontWeight: 600, color: C.text }}>{d.month}</td>
                          <td style={{ ...tdStyle, borderBottom: i < workingDays.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>{d.auto} jours</td>
                          <td style={{ ...tdStyle, borderBottom: i < workingDays.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                            <input type="number" defaultValue={d.manual} min="0" max="31"
                              style={{ width: '56px', padding: '3px 8px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, outline: 'none', textAlign: 'center', fontFamily: 'Inter' }}
                              onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
                          </td>
                          <td style={{ ...tdStyle, borderBottom: i < workingDays.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '3px', backgroundColor: d.validated ? '#ECFDF5' : '#FFFBEB', color: d.validated ? '#065F46' : '#92400E', border: `1px solid ${d.validated ? '#A7F3D0' : '#FDE68A'}` }}>
                              {d.validated && <CheckCircle style={{ width: '10px', height: '10px' }} />}
                              {d.validated ? 'Validé' : 'En attente'}
                            </span>
                          </td>
                          <td style={{ ...tdStyle, borderBottom: i < workingDays.length - 1 ? `1px solid ${C.borderLight}` : 'none' }}>
                            <button onClick={() => validateMonth(d.month)} style={{ fontSize: '12px', fontWeight: 600, color: C.purple, background: 'none', border: 'none', cursor: 'pointer' }}>Valider</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Holidays */}
              <div>
                <p style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '10px' }}>Jours Fériés — Maroc 2026</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  {holidays.map((h, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: R, border: `1px solid ${C.border}`, transition: 'background 0.1s' }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Calendar style={{ width: '12px', height: '12px', color: C.textMuted }} />
                        <div>
                          <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>{h.name}</p>
                          <p style={{ fontSize: '10px', color: C.textMuted }}>
                            {new Date(h.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <input type="checkbox" defaultChecked style={{ cursor: 'pointer', accentColor: C.purple, width: '14px', height: '14px' }} />
                    </div>
                  ))}
                </div>
              </div>

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
                    <button style={{ fontSize: '12px', fontWeight: 600, color: role.color, background: 'none', border: 'none', cursor: 'pointer', marginLeft: '16px', marginTop: '4px' }}>Modifier</button>
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
