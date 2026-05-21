import { useState, useEffect } from 'react';
import { AlertTriangle, Search, Filter, Mail, UserPlus, Eye, AlertCircle, TrendingUp, TrendingDown, Calendar, X, Clock, Users, CheckCircle, ArrowRight, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { C, S, R, PageHeader, SectionCard, BtnPrimary, BtnSecondary, BtnGhost, Avatar, Modal, ModalHeader, SectionLabel, thStyle, tdStyle, cardStyle } from '../components/ui/design-system';
import { fetchAnomalies, resoudreAnomalie, AnomalieResponseDTO } from '../services/anomalieService';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ─── DATA ─────────────────────────────────────── */
const SEV: Record<string, { label: string; bg: string; text: string; border: string; bar: string }> = {
  critical: { label: 'Critique', bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA', bar: C.red },
  high: { label: 'Élevée', bg: '#FFF7ED', text: '#92400E', border: '#FDE68A', bar: '#F59E0B' },
  medium: { label: 'Moyenne', bg: '#FFFBEB', text: '#92400E', border: '#FEF3C7', bar: '#F59E0B' },
  low: { label: 'Faible', bg: '#EFF6FF', text: '#1D4ED8', border: '#BFDBFE', bar: C.blue },
};

/* ─── MAIN ─────────────────────────────────────── */
export function Conflicts() {
  const [anomalies, setAnomalies] = useState<AnomalieResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadAnomalies();
  }, []);

  async function loadAnomalies() {
    setLoading(true);
    try {
      const data = await fetchAnomalies();
      setAnomalies(data);
    } catch (err) {
      toast.error("Erreur lors du chargement des anomalies");
    } finally {
      setLoading(false);
    }
  }

  const handleResolve = async (id: number) => {
    try {
      await resoudreAnomalie(id);
      toast.success("Anomalie marquée comme résolue");
      loadAnomalies();
    } catch (err) {
      toast.error("Erreur lors de la résolution");
    }
  };

  const filtered = anomalies.filter(a => {
    const matchSearch = a.collaborateurNomComplet.toLowerCase().includes(search.toLowerCase()) || 
                        a.description.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || (filterType === 'resolu' ? a.resolu : !a.resolu);
    return matchSearch && matchType;
  });

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* Header */}
      <PageHeader title="Gestion des Conflits" subtitle="Détection et résolution des anomalies de staffing">
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: R }}>
          <AlertCircle style={{ width: '12px', height: '12px', color: C.red }} />
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#B91C1C' }}>{filtered.length} conflits actifs</span>
        </div>
      </PageHeader>

      {/* KPI Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
        {[
          { l: 'Total Anomalies', v: anomalies.length, i: AlertCircle, c: '#6B7280' },
          { l: 'Non résolues', v: anomalies.filter(a => !a.resolu).length, i: AlertTriangle, c: C.red },
          { l: 'Déjà résolues', v: anomalies.filter(a => a.resolu).length, i: CheckCircle, c: C.green },
        ].map(s => (
          <div key={s.l} style={{ ...cardStyle, borderLeft: `3px solid ${s.c}`, display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px' }}>
            <s.i style={{ width: '18px', height: '18px', color: s.c, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: s.c, lineHeight: 1 }}>{s.v}</p>
              <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '2px' }}>{s.l}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
          <Search style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: C.textMuted, pointerEvents: 'none' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par collaborateur…"
            style={{ width: '100%', paddingLeft: '28px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none' }}
            onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger style={{ width: '170px', fontSize: '12px', borderRadius: R, height: '32px', backgroundColor: '#fff' }}><SelectValue placeholder="Statut" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="en-attente">En attente</SelectItem>
            <SelectItem value="resolu">Résolu</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Conflict list */}
      {loading ? (
        <div style={{ padding: '100px', textAlign: 'center' }}>
          <Loader2 style={{ width: '40px', height: '40px', color: C.purple, animation: 'spin 1s linear infinite', margin: '0 auto' }} />
          <p style={{ marginTop: '12px', color: C.textMuted, fontSize: '14px' }}>Chargement des conflits…</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.map(a => {
            const sev = a.typeAnomalie === 'SURCHARGE' ? SEV.critical : SEV.low;

            return (
              <div key={a.id} style={{ ...cardStyle, borderLeft: `4px solid ${a.resolu ? C.green : sev.bar}`, opacity: a.resolu ? 0.7 : 1 }}>
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                    <Avatar name={a.collaborateurNomComplet} color={a.resolu ? C.green : sev.bar} size={36} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px', marginBottom: '4px' }}>
                        <p style={{ fontSize: '14px', fontWeight: 700, color: C.text }}>{a.collaborateurNomComplet}</p>
                        <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: a.resolu ? '#ECFDF5' : sev.bg, border: `1px solid ${a.resolu ? '#A7F3D0' : sev.border}`, color: a.resolu ? C.green : sev.text }}>
                          {a.resolu ? 'RÉSOLU' : a.typeAnomalie}
                        </span>
                      </div>
                      <p style={{ fontSize: '12px', color: C.textSecondary, marginBottom: '8px' }}>{a.description}</p>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar style={{ width: '11px', height: '11px' }} />
                          Détecté le {format(parseISO(a.dateDetection), 'dd MMM yyyy', { locale: fr })}
                        </span>
                        {a.projetNom !== 'N/A' && (
                          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Users style={{ width: '11px', height: '11px' }} />
                            Projet : {a.projetNom}
                          </span>
                        )}
                      </div>
                    </div>

                    {!a.resolu && (
                      <BtnPrimary onClick={() => handleResolve(a.id)} small style={{ flexShrink: 0 }}>
                        <CheckCircle style={{ width: '12px', height: '12px' }} /> Résoudre
                      </BtnPrimary>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filtered.length === 0 && (
            <div style={{ ...cardStyle, padding: '48px', textAlign: 'center' }}>
              <CheckCircle style={{ width: '36px', height: '36px', color: C.green, margin: '0 auto 10px' }} />
              <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Aucun conflit détecté</p>
              <p style={{ fontSize: '12px', color: C.textMuted }}>Ton équipe est parfaitement staffée.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}