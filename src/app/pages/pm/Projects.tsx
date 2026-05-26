import { useState, useEffect } from 'react';
import {
  Plus, AlertTriangle, Calendar, ChevronRight,
  Search, CheckCircle, TrendingUp, Info, Zap, Loader2,
  Upload, History,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  C, S, R, PageHeader, BtnPrimary, BtnGhost,
  Modal, ModalHeader, cardStyle,
} from '../../components/ui/design-system';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { fetchMesProjets, creerProjet, type ProjetResponseDTO, type ProjetRequestDTO } from '../../services/projetService';
import { ImportPrevisionModal } from '../../components/prevision/ImportPrevisionModal';
import { PrevisionHistoryView } from '../../components/prevision/PrevisionHistoryView';
import { PrevisionActiveCard } from '../../components/prevision/PrevisionActiveCard';
import { PrevisionStatsCard } from '../../components/prevision/PrevisionStatsCard';
import type { PrevisionResponseDTO } from '../../services/previsionService';

/* ─── TYPES ─────────────────────────────────────── */
interface Project {
  id: number;
  nom: string;
  description: string | null;
  dateDebut: string;
  dateFin: string;
  statut: 'PLANIFIE' | 'EN_COURS' | 'TERMINE' | 'SUSPENDU';
  chefProjetId: number;
  chefProjetNomComplet: string;
  dateCreation: string;
  v2?: { type: 'trimestriel' | 'annuel'; tjm: number; collabs: string[] };
}

/* ─── STATUS MAP ────────────────────────────────── */
const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string; accent: string }> = {
  'EN_COURS': { label: 'En cours', bg: '#EFF6FF', text: '#1D4ED8', dot: C.blue, accent: C.blue },
  'PLANIFIE': { label: 'Planifié', bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B', accent: '#F59E0B' },
  'TERMINE':  { label: 'Terminé', bg: '#ECFDF5', text: '#065F46', dot: C.green, accent: C.green },
  'SUSPENDU': { label: 'Suspendu', bg: '#FEF2F2', text: '#991B1B', dot: C.red, accent: C.red },
};

const COLLABS = ['Youssef El Amrani', 'Sara Benali', 'Mohamed Alaoui', 'Salma Idrissi', 'Ahmed Chafik', 'Imane El Fassi', 'Hamza Lahlou'];

/* ─── Helpers ───────────────────────────────────── */
function toProject(dto: ProjetResponseDTO): Project {
  return { ...dto, v2: undefined };
}

function formatDate(isoDate: string): string {
  try {
    return format(new Date(isoDate), 'dd MMM yyyy', { locale: fr });
  } catch {
    return isoDate;
  }
}

function formatDateShort(isoDate: string): string {
  try {
    return format(new Date(isoDate), 'MMM yyyy', { locale: fr });
  } catch {
    return isoDate;
  }
}

/* ════════════════════════════════════════════════ */
/* ─── MODAL: PREDICT V2 ─────────────────────────── */
/* ════════════════════════════════════════════════ */
function PredictV2Modal({ project, onClose, onSave }: {
  project: Project;
  onClose: () => void;
  onSave: (id: number, v2: NonNullable<Project['v2']>) => void;
}) {
  const [v2Type, setV2Type]     = useState<'trimestriel' | 'annuel'>('trimestriel');
  const [nomProjet, setNom]     = useState(project.nom);
  const [tjm, setTjm]           = useState('650');
  const [startDate, setStart]   = useState('2026-01-01');
  const [endDate, setEnd]       = useState('2026-03-31');
  const [collabs, setCollabs]   = useState<string[]>([]);

  const selectType = (t: 'trimestriel' | 'annuel') => {
    setV2Type(t);
    if (t === 'trimestriel') { setStart('2026-01-01'); setEnd('2026-03-31'); }
    else                     { setStart('2026-04-01'); setEnd('2026-12-31'); }
  };

  const toggleCollab = (c: string) =>
    setCollabs(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const v2: NonNullable<Project['v2']> = { type: v2Type, tjm: Number(tjm), collabs };
    onSave(project.id, v2);
    toast.success(`Prédiction V2 ${v2Type === 'trimestriel' ? 'Trimestrielle (Jan–Mar)' : 'Annuelle (Avr–Déc)'} créée pour ${nomProjet} !`);
    onClose();
  };

  const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter', color: C.text, boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' };

  const periodLabel = v2Type === 'trimestriel' ? 'Janvier – Mars 2026' : 'Avril – Décembre 2026';

  return (
    <Modal onClose={onClose} maxWidth="600px" accentColor={C.purple}>
      <ModalHeader title="Prédiction V2" subtitle={`${project.nom} — Formulaire de prévision`} onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* V2 type selector */}
        <div>
          <p style={{ ...lbl, marginBottom: '8px' }}>Type de prédiction</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {([
              ['trimestriel', 'V2 Trimestrielle', 'Janvier – Mars 2026'],
              ['annuel',      'V2 Annuelle',       'Avril – Décembre 2026'],
            ] as const).map(([val, label, sub]) => {
              const active = v2Type === val;
              return (
                <div key={val} onClick={() => selectType(val)}
                  style={{ padding: '12px 14px', borderRadius: R, border: `2px solid ${active ? C.purple : C.border}`, backgroundColor: active ? `${C.purple}08` : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
                  onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.borderColor = `${C.purple}60`; }}
                  onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.borderColor = C.border; }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: active ? C.purple : C.borderLight, transition: 'background 0.15s' }} />
                    <p style={{ fontSize: '13px', fontWeight: 700, color: active ? C.purple : C.text }}>{label}</p>
                  </div>
                  <p style={{ fontSize: '11px', color: C.textMuted, paddingLeft: '16px' }}>{sub}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={lbl}>Nom du projet *</label>
                <input required type="text" value={nomProjet} onChange={e => setNom(e.target.value)} style={inp}
                  onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
              <div>
                <label style={lbl}>TJM prédit (€/jour) *</label>
                <input required type="number" value={tjm} onChange={e => setTjm(e.target.value)} placeholder="Ex: 650" style={inp}
                  onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
              <div>
                <label style={lbl}>Date début</label>
                <input type="date" value={startDate} onChange={e => setStart(e.target.value)} style={inp}
                  onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
              <div>
                <label style={lbl}>Date fin</label>
                <input type="date" value={endDate} onChange={e => setEnd(e.target.value)} style={inp}
                  onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
            </div>

            {/* Collaborateurs */}
            <div>
              <label style={{ ...lbl, marginBottom: '8px' }}>Collaborateurs affectés</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {COLLABS.map(c => {
                  const sel = collabs.includes(c);
                  return (
                    <button key={c} type="button" onClick={() => toggleCollab(c)}
                      style={{ padding: '4px 10px', borderRadius: '20px', border: `1px solid ${sel ? C.purple : C.border}`, backgroundColor: sel ? `${C.purple}12` : '#fff', color: sel ? C.purple : C.textMuted, cursor: 'pointer', fontSize: '11px', fontWeight: sel ? 700 : 400, transition: 'all 0.12s' }}>
                      {sel && '✓ '}{c.split(' ')[0]}
                    </button>
                  );
                })}
              </div>
              {collabs.length > 0 && <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '5px' }}>{collabs.length} collaborateur{collabs.length > 1 ? 's' : ''} sélectionné{collabs.length > 1 ? 's' : ''}</p>}
            </div>

            {/* Summary */}
            <div style={{ padding: '10px 14px', borderRadius: R, backgroundColor: `${C.purple}06`, border: `1px solid ${C.purple}25` }}>
              <p style={{ fontSize: '11px', fontWeight: 700, color: C.purple, marginBottom: '3px' }}>
                Récapitulatif — {v2Type === 'trimestriel' ? 'V2 Trimestrielle' : 'V2 Annuelle'}
              </p>
              <p style={{ fontSize: '11px', color: C.textSecondary }}>
                {periodLabel} · TJM : {tjm}€/j · {collabs.length} collaborateur{collabs.length > 1 ? 's' : ''}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
              <BtnPrimary>
                <TrendingUp style={{ width: '12px', height: '12px' }} />Créer la prédiction V2
              </BtnPrimary>
              <BtnGhost onClick={onClose}>Annuler</BtnGhost>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

/* ════════════════════════════════════════════════ */
/* ─── MODAL: ANALYZE PER PROJECT ────────────────── */
/* ════════════════════════════════════════════════ */
function AnalyzeProjectModal({ project, onClose, onGoToAnomalies }: {
  project: Project;
  onClose: () => void;
  onGoToAnomalies: () => void;
}) {
  return (
    <Modal onClose={onClose} maxWidth="440px" accentColor={C.blue}>
      <ModalHeader title="Analyse d'Anomalies" subtitle={project.nom} onClose={onClose} />
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>
        <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: `${C.blue}12`, border: `2px solid ${C.blue}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Info style={{ width: '28px', height: '28px', color: C.blue }} />
        </div>

        <div style={{ width: '100%', padding: '14px 18px', borderRadius: R, backgroundColor: `${C.blue}08`, border: `1px solid ${C.blue}25` }}>
          <p style={{ fontSize: '14px', fontWeight: 700, color: C.blue, lineHeight: 1.6, fontStyle: 'italic' }}>
            "Analyse standard des anomalies effectuée (sans IA)"
          </p>
        </div>

        <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.7 }}>
          L'analyse de <strong>{project.nom}</strong> repose sur des règles métier : seuils de charge, chevauchements et comparaison des capacités disponibles.
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {[
            { l: 'Projet analysé', v: project.nom, c: C.blue },
            { l: 'Chef de projet', v: project.chefProjetNomComplet, c: C.purple },
            { l: 'Anomalies potentielles', v: project.statut === 'EN_COURS' ? '2' : '0', c: project.statut === 'EN_COURS' ? C.red : C.green },
            { l: 'Méthode', v: 'Règles métier', c: C.textSecondary },
          ].map(item => (
            <div key={item.l} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: '12px', color: C.textSecondary }}>{item.l}</span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: item.c }}>{item.v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', gap: '8px', width: '100%' }}>
          <button onClick={onGoToAnomalies}
            style={{ flex: 1, padding: '9px', borderRadius: R, border: 'none', backgroundColor: C.blue, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 700 }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')} onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
          >Voir les anomalies du projet</button>
          <BtnGhost onClick={onClose}>Fermer</BtnGhost>
        </div>
      </div>
    </Modal>
  );
}


/* ════════════════════════════════════════════════ */
/* ─── MODAL: ADD PROJECT ────────────────────────── */
/* ════════════════════════════════════════════════ */
function AddProjectModal({ onClose, onCreated }: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [nom, setNom]             = useState('');
  const [description, setDesc]    = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin]     = useState('');
  const [statut, setStatut]       = useState<ProjetRequestDTO['statut']>('PLANIFIE');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Client-side validation: dateFin must be after dateDebut
    if (dateDebut && dateFin && dateFin <= dateDebut) {
      setError('La date de fin doit être postérieure à la date de début.');
      return;
    }

    setSubmitting(true);
    try {
      const payload: ProjetRequestDTO = {
        nom,
        description: description || undefined,
        dateDebut,
        dateFin,
        statut,
      };
      await creerProjet(payload);
      toast.success('Projet créé avec succès !');
      onCreated();
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Erreur lors de la création du projet.';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter', color: C.text, boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' };

  return (
    <Modal onClose={onClose} maxWidth="520px" accentColor={C.blue}>
      <ModalHeader title="Ajouter un Projet" subtitle="Créer un nouveau projet" onClose={onClose} />
      <div style={{ padding: '16px 20px' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Nom */}
            <div>
              <label style={lbl}>Nom du projet *</label>
              <input required type="text" value={nom} onChange={e => setNom(e.target.value)}
                placeholder="Ex: Projet Zeta" style={inp}
                onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} />
            </div>

            {/* Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={lbl}>Date de début *</label>
                <input required type="date" value={dateDebut} onChange={e => setDateDebut(e.target.value)} style={inp}
                  onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
              <div>
                <label style={lbl}>Date de fin *</label>
                <input required type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} style={inp}
                  onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
            </div>

            {/* Statut */}
            <div>
              <label style={lbl}>Statut</label>
              <select value={statut} onChange={e => setStatut(e.target.value as ProjetRequestDTO['statut'])}
                style={{ ...inp, cursor: 'pointer' }}>
                <option value="PLANIFIE">Planifié</option>
                <option value="EN_COURS">En cours</option>
                <option value="TERMINE">Terminé</option>
                <option value="SUSPENDU">Suspendu</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label style={lbl}>Description</label>
              <textarea value={description} onChange={e => setDesc(e.target.value)}
                placeholder="Décrivez le contexte et les objectifs du projet…" rows={3}
                style={{ ...inp, resize: 'vertical' as const, lineHeight: 1.5 }}
                onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} />
            </div>

            {/* Error message */}
            {error && (
              <div style={{ padding: '8px 12px', borderRadius: R, backgroundColor: '#FEF2F2', border: '1px solid #FECACA' }}>
                <p style={{ fontSize: '12px', color: '#991B1B', fontWeight: 600 }}>{error}</p>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
              <BtnPrimary disabled={submitting}>
                {submitting ? (
                  <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
                ) : (
                  <CheckCircle style={{ width: '12px', height: '12px' }} />
                )}
                {submitting ? 'Création…' : 'Créer le projet'}
              </BtnPrimary>
              <BtnGhost onClick={onClose}>Annuler</BtnGhost>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}

/* ════════════════════════════════════════════════ */
/* ─── MODAL: PROJECT DETAIL ─────────────────────── */
/* ════════════════════════════════════════════════ */
function ProjectDetailModal({
  project, onClose, onAnalyze, onPredictV2, onImportPrevision, onShowHistory,
  refreshKey,
}: {
  project: Project;
  onClose: () => void;
  onAnalyze: () => void;
  onPredictV2: () => void;
  onImportPrevision: () => void;
  onShowHistory: () => void;
  refreshKey: number;
}) {
  const sc = STATUS_MAP[project.statut] || STATUS_MAP['PLANIFIE'];
  const [localActivePrevision, setLocalActivePrevision] = useState<PrevisionResponseDTO | null>(null);

  return (
    <Modal onClose={onClose} maxWidth="640px" accentColor={sc.accent}>
      <ModalHeader title={project.nom} subtitle={`Chef de projet : ${project.chefProjetNomComplet}`} onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Status + dates */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: sc.dot }} />{sc.label}
          </span>
          {project.v2 && (
            <span style={{ fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '3px', backgroundColor: `${C.purple}14`, color: C.purple }}>
              ● V2 {project.v2.type === 'trimestriel' ? 'Trimestrielle' : 'Annuelle'} · {project.v2.tjm}€/j
            </span>
          )}
          <span style={{ fontSize: '11px', color: C.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Calendar style={{ width: '12px', height: '12px' }} />
            {formatDate(project.dateDebut)} → {formatDate(project.dateFin)}
          </span>
        </div>

        {/* Description */}
        {project.description && (
          <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.6, padding: '10px 14px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
            {project.description}
          </p>
        )}

        {/* Info grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { l: 'Date début', v: formatDate(project.dateDebut), c: C.blue },
            { l: 'Date fin', v: formatDate(project.dateFin), c: '#F59E0B' },
            { l: 'Chef de projet', v: project.chefProjetNomComplet, c: C.purple },
            { l: 'Créé le', v: formatDate(project.dateCreation), c: C.textSecondary },
          ].map(i => (
            <div key={i.l} style={{ padding: '10px 12px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: '10px', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{i.l}</p>
              <p style={{ fontSize: '13px', fontWeight: 700, color: i.c }}>{i.v}</p>
            </div>
          ))}
        </div>

        {/* Prévisions section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', paddingTop: '6px', borderTop: `1px solid ${C.borderLight}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <p style={{ fontSize: '12px', fontWeight: 700, color: C.text, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Prévisions
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={onImportPrevision}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: R, border: `1px solid ${C.purple}30`, backgroundColor: C.purple, color: '#fff', cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <Upload style={{ width: '12px', height: '12px' }} />Importer une prévision
              </button>
              <button onClick={onShowHistory}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.text, cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = C.bg)}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
              >
                <History style={{ width: '12px', height: '12px' }} />Voir l'historique
              </button>
            </div>
          </div>

          <PrevisionActiveCard
            projetId={project.id}
            onImportClick={onImportPrevision}
            refreshTrigger={refreshKey}
            onActivePrevisionLoaded={setLocalActivePrevision}
          />

          <PrevisionStatsCard previsionId={localActivePrevision?.id ?? null} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}`, flexWrap: 'wrap' }}>
          <button onClick={onAnalyze}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: R, border: `1px solid ${C.red}30`, backgroundColor: `${C.red}08`, color: C.red, cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${C.red}15`)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${C.red}08`)}
          >
            <AlertTriangle style={{ width: '12px', height: '12px' }} />Analyser anomalies
          </button>
          <button onClick={onPredictV2}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '7px 14px', borderRadius: R, border: `1px solid ${C.purple}30`, backgroundColor: `${C.purple}08`, color: C.purple, cursor: 'pointer', fontSize: '11px', fontWeight: 700 }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${C.purple}15`)}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${C.purple}08`)}
          >
            <TrendingUp style={{ width: '12px', height: '12px' }} />Prédire V2
          </button>
          <BtnGhost onClick={onClose}>Fermer</BtnGhost>
        </div>
      </div>
    </Modal>
  );
}


/* ════════════════════════════════════════════════ */
/* ─── MAIN PAGE ─────────────────────────────────── */
/* ════════════════════════════════════════════════ */
export function PmProjects() {
  const navigate = useNavigate();
  const [projects, setProjects]       = useState<Project[]>([]);
  const [loading, setLoading]         = useState(true);
  const [showAdd, setShowAdd]         = useState(false);
  const [detailProj, setDetailProj]   = useState<Project | null>(null);
  const [analyzeProj, setAnalyzeProj] = useState<Project | null>(null);
  const [predictProj, setPredictProj] = useState<Project | null>(null);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  /* ─── Prevision integration state ─── */
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [historyOpen, setHistoryOpen]         = useState(false);
  const [refreshKey, setRefreshKey]           = useState(0);

  /* ─── Fetch projects from API ─── */
  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await fetchMesProjets();
      setProjects(data.map(toProject));
    } catch (err: any) {
      toast.error(err.message || 'Impossible de charger les projets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  /* ─── Filtering ─── */
  const filtered = projects.filter(p => {
    const matchSearch = p.nom.toLowerCase().includes(search.toLowerCase()) ||
      (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
      p.chefProjetNomComplet.toLowerCase().includes(search.toLowerCase());
    return matchSearch && (filterStatus === 'all' || p.statut === filterStatus);
  });

  const saveV2 = (id: number, v2: NonNullable<Project['v2']>) =>
    setProjects(prev => prev.map(p => p.id === id ? { ...p, v2 } : p));

  /* ─── Loading state ─── */
  if (loading) {
    return (
      <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
          <Loader2 style={{ width: '32px', height: '32px', color: C.blue, animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '13px', color: C.textMuted }}>Chargement des projets…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Header ── */}
      <PageHeader
        title="Mes Projets"
        subtitle={`${projects.length} projet${projects.length > 1 ? 's' : ''} · ${projects.filter(p => p.statut === 'EN_COURS').length} en cours`}
      >
        <BtnGhost onClick={() => navigate('/pm/anomalies')}>
          <AlertTriangle style={{ width: '12px', height: '12px', color: C.red }} />Analyser les anomalies
        </BtnGhost>
        <BtnPrimary onClick={() => setShowAdd(true)}>
          <Plus style={{ width: '12px', height: '12px' }} />Ajouter un projet
        </BtnPrimary>
      </PageHeader>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '280px' }}>
          <Search style={{ position: 'absolute', left: '9px', top: '50%', transform: 'translateY(-50%)', width: '13px', height: '13px', color: C.textMuted, pointerEvents: 'none' }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un projet…"
            style={{ width: '100%', paddingLeft: '28px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none' }}
            onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} />
        </div>
        <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden', backgroundColor: '#fff' }}>
          {[['all', 'Tous'], ['EN_COURS', 'En cours'], ['PLANIFIE', 'Planifiés'], ['TERMINE', 'Terminés'], ['SUSPENDU', 'Suspendus']].map(([v, l]) => (
            <button key={v} onClick={() => setFilterStatus(v)}
              style={{ padding: '5px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: filterStatus === v ? C.blue : '#fff', color: filterStatus === v ? '#fff' : C.textMuted, transition: 'all 0.12s', fontFamily: 'Inter' }}>
              {l}
            </button>
          ))}
        </div>
        <span style={{ fontSize: '11px', color: C.textMuted, marginLeft: 'auto' }}>
          {filtered.length} résultat{filtered.length > 1 ? 's' : ''}
        </span>
      </div>

      {/* ── Empty state ── */}
      {filtered.length === 0 && !loading && (
        <div style={{ padding: '48px 20px', textAlign: 'center' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: C.text, marginBottom: '6px' }}>Aucun projet trouvé</p>
          <p style={{ fontSize: '12px', color: C.textMuted }}>
            {projects.length === 0 ? 'Créez votre premier projet pour commencer.' : 'Essayez de modifier vos filtres.'}
          </p>
        </div>
      )}

      {/* ── Project Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
        {filtered.map(p => {
          const sc = STATUS_MAP[p.statut] || STATUS_MAP['PLANIFIE'];
          return (
            <div key={p.id}
              style={{ ...cardStyle, cursor: 'pointer', borderTop: `3px solid ${sc.accent}`, transition: 'all 0.15s', display: 'flex', flexDirection: 'column' }}
              onMouseEnter={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = S.elevated; d.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { const d = e.currentTarget as HTMLDivElement; d.style.boxShadow = S.card; d.style.transform = 'translateY(0)'; }}
            >
              <div style={{ padding: '14px 16px', flex: 1 }} onClick={() => setDetailProj(p)}>
                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                    <div style={{ display: 'flex', gap: '5px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '5px' }}>
                      <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: sc.dot }} />{sc.label}
                      </span>
                      {p.v2 && (
                        <span style={{ fontSize: '9px', fontWeight: 700, padding: '2px 6px', borderRadius: '3px', backgroundColor: `${C.purple}14`, color: C.purple }}>
                          ● V2 {p.v2.type === 'trimestriel' ? 'Trim.' : 'Ann.'}
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.nom}</p>
                    <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px' }}>{p.chefProjetNomComplet}</p>
                  </div>
                  <ChevronRight style={{ width: '15px', height: '15px', color: C.textMuted, flexShrink: 0 }} />
                </div>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px', paddingBottom: '10px', borderBottom: `1px solid ${C.borderLight}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar style={{ width: '11px', height: '11px', color: C.textMuted }} />
                    <span style={{ fontSize: '10px', color: C.textMuted }}>{formatDateShort(p.dateDebut)} → {formatDateShort(p.dateFin)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '10px', color: C.textMuted }}>Créé : {formatDateShort(p.dateCreation)}</span>
                  </div>
                </div>

                {/* Description */}
                {p.description && (
                  <p style={{ fontSize: '11px', color: C.textSecondary, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, marginBottom: '10px' }}>{p.description}</p>
                )}
              </div>

              {/* ── Card action buttons ── */}
              <div style={{ padding: '8px 14px', borderTop: `1px solid ${C.borderLight}`, display: 'flex', gap: '5px' }}
                onClick={e => e.stopPropagation()}>
                <button
                  onClick={() => setAnalyzeProj(p)}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '5px 0', borderRadius: R, border: `1px solid ${C.red}30`, backgroundColor: `${C.red}08`, color: C.red, cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${C.red}15`)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${C.red}08`)}
                >
                  <AlertTriangle style={{ width: '10px', height: '10px' }} />Analyser
                </button>
                <button
                  onClick={() => setPredictProj(p)}
                  style={{ flex: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '5px 0', borderRadius: R, border: `1px solid ${C.purple}30`, backgroundColor: `${C.purple}08`, color: C.purple, cursor: 'pointer', fontSize: '10px', fontWeight: 700 }}
                  onMouseEnter={e => (e.currentTarget.style.backgroundColor = `${C.purple}15`)}
                  onMouseLeave={e => (e.currentTarget.style.backgroundColor = `${C.purple}08`)}
                >
                  <Zap style={{ width: '10px', height: '10px' }} />Prédire V2
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modals ── */}
      {showAdd && <AddProjectModal onClose={() => setShowAdd(false)} onCreated={loadProjects} />}

      {detailProj && (
        <ProjectDetailModal
          project={detailProj}
          onClose={() => setDetailProj(null)}
          onAnalyze={() => { setDetailProj(null); setAnalyzeProj(detailProj); }}
          onPredictV2={() => { setDetailProj(null); setPredictProj(detailProj); }}
          onImportPrevision={() => setImportModalOpen(true)}
          onShowHistory={() => setHistoryOpen(true)}
          refreshKey={refreshKey}
        />
      )}

      {/* ── Prevision modals ── */}
      {detailProj && importModalOpen && (
        <ImportPrevisionModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          projetId={detailProj.id}
          onSuccess={() => setRefreshKey(k => k + 1)}
        />
      )}

      {detailProj && historyOpen && (
        <PrevisionHistoryView
          isOpen={historyOpen}
          onClose={() => setHistoryOpen(false)}
          projetId={detailProj.id}
        />
      )}

      {analyzeProj && (
        <AnalyzeProjectModal
          project={analyzeProj}
          onClose={() => setAnalyzeProj(null)}
          onGoToAnomalies={() => {
            setAnalyzeProj(null);
            navigate('/pm/anomalies');
            toast.info(`Anomalies — ${analyzeProj.nom}`);
          }}
        />
      )}

      {predictProj && (
        <PredictV2Modal
          project={predictProj}
          onClose={() => setPredictProj(null)}
          onSave={saveV2}
        />
      )}
    </div>
  );
}
