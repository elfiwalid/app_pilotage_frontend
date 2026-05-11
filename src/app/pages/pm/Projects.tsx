import { useState, useRef } from 'react';
import {
  Plus, AlertTriangle, Calendar, DollarSign, Users, ChevronRight,
  Upload, FileSpreadsheet, Search, CheckCircle, FolderSearch,
  TrendingUp, Info, RefreshCw, Download, Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  C, S, R, PageHeader, BtnPrimary, BtnGhost, BtnSecondary,
  Avatar, Modal, ModalHeader, SectionLabel, cardStyle,
} from '../../components/ui/design-system';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

/* ─── TYPES ─────────────────────────────────────── */
interface Project {
  id: number;
  name: string;
  client: string;
  status: string;
  start: Date;
  end: Date;
  budget: number;
  spent: number;
  team: number;
  completion: number;
  desc: string;
  v2?: { type: 'trimestriel' | 'annuel'; tjm: number; collabs: string[] };
}

/* ─── INITIAL DATA ──────────────────────────────── */
const INITIAL_PROJECTS: Project[] = [
  { id: 1, name: 'Projet Alpha', client: 'BCP Bank', status: 'en-cours', start: new Date(2026, 0, 15), end: new Date(2026, 5, 30), budget: 180000, spent: 117000, team: 4, completion: 65, desc: "Développement d'une plateforme d'automatisation des processus internes. Réduction des délais de mise en production de 40%." },
  { id: 2, name: 'Projet Beta', client: 'Attijariwafa Bank', status: 'en-cours', start: new Date(2026, 1, 1), end: new Date(2026, 4, 15), budget: 150000, spent: 120000, team: 3, completion: 82, desc: "Migration et optimisation de la plateforme analytique. Intégration de modules de reporting en temps réel." },
  { id: 3, name: 'Projet Delta', client: 'BMCE Bank', status: 'en-cours', start: new Date(2026, 2, 15), end: new Date(2026, 5, 15), budget: 120000, spent: 72000, team: 3, completion: 58, desc: "R&D sur des modèles d'IA pour la prédiction des comportements clients." },
  { id: 4, name: 'Projet Sigma', client: 'CDG Capital', status: 'planifie', start: new Date(2026, 4, 1), end: new Date(2026, 9, 31), budget: 200000, spent: 0, team: 0, completion: 5, desc: "Système de gestion de portefeuille nouvelle génération. Architecture microservices cloud-native." },
  { id: 5, name: 'Projet Omega', client: 'Société Générale MA', status: 'termine', start: new Date(2025, 10, 1), end: new Date(2026, 2, 31), budget: 90000, spent: 88000, team: 2, completion: 100, desc: "Mise en conformité réglementaire et implémentation des nouvelles normes bâloises." },
];

/* Recoverable projects not yet loaded */
const RECOVERABLE: Project[] = [
  { id: 10, name: 'Projet Gamma', client: 'CIH Bank', status: 'planifie', start: new Date(2026, 5, 1), end: new Date(2026, 11, 31), budget: 160000, spent: 0, team: 0, completion: 0, desc: "Refonte complète du système de paiement temps réel pour les transactions nationales." },
  { id: 11, name: 'Projet Kappa', client: 'Banque Centrale', status: 'planifie', start: new Date(2026, 6, 1), end: new Date(2026, 11, 31), budget: 280000, spent: 0, team: 0, completion: 0, desc: "Système automatisé de surveillance et reporting réglementaire." },
  { id: 12, name: 'Projet Lambda', client: 'BMCI', status: 'en-cours', start: new Date(2026, 2, 1), end: new Date(2026, 8, 30), budget: 95000, spent: 38000, team: 3, completion: 40, desc: "Modernisation de l'infrastructure d'échange de données interbancaires." },
];

const COLLABS = ['Youssef El Amrani', 'Sara Benali', 'Mohamed Alaoui', 'Salma Idrissi', 'Ahmed Chafik', 'Imane El Fassi', 'Hamza Lahlou'];

const STATUS_MAP: Record<string, { label: string; bg: string; text: string; dot: string; accent: string }> = {
  'en-cours': { label: 'En cours', bg: '#EFF6FF', text: '#1D4ED8', dot: C.blue, accent: C.blue },
  planifie:   { label: 'Planifié',  bg: '#FFFBEB', text: '#92400E', dot: '#F59E0B', accent: '#F59E0B' },
  termine:    { label: 'Terminé',   bg: '#ECFDF5', text: '#065F46', dot: C.green,  accent: C.green },
};

const fmtCurrency = (n: number) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n);

/* ════════════════════════════════════════════════ */
/* ─── MODAL: RECOVER PROJECTS ───────────────────── */
/* ════════════════════════════════════════════════ */
function RecoverModal({ existing, onClose, onAdd }: {
  existing: number[];
  onClose: () => void;
  onAdd: (ps: Project[]) => void;
}) {
  const available = RECOVERABLE.filter(p => !existing.includes(p.id));
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);

  useState(() => { setTimeout(() => setLoading(false), 1000); });

  const toggle = (id: number) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleImport = () => {
    const toAdd = available.filter(p => selected.includes(p.id));
    onAdd(toAdd);
    toast.success(`${toAdd.length} projet${toAdd.length > 1 ? 's' : ''} récupéré${toAdd.length > 1 ? 's' : ''} avec succès !`);
    onClose();
  };

  return (
    <Modal onClose={onClose} maxWidth="560px" accentColor={C.purple}>
      <ModalHeader title="Récupérer des projets existants" subtitle="Référentiel Staff2Staff — Projets disponibles" onClose={onClose} />
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '36px 0' }}>
            <RefreshCw style={{ width: '28px', height: '28px', color: C.purple, animation: 'spin 1s linear infinite' }} />
            <p style={{ fontSize: '12px', color: C.textMuted }}>Récupération des projets en cours…</p>
          </div>
        ) : available.length === 0 ? (
          <div style={{ padding: '36px', textAlign: 'center' }}>
            <CheckCircle style={{ width: '28px', height: '28px', color: C.green, margin: '0 auto 10px' }} />
            <p style={{ fontSize: '13px', fontWeight: 600, color: C.text }}>Tous les projets disponibles sont déjà chargés.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', borderRadius: R, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <CheckCircle style={{ width: '13px', height: '13px', color: C.green }} />
              <p style={{ fontSize: '12px', color: '#065F46', fontWeight: 600 }}>{available.length} projet{available.length > 1 ? 's' : ''} trouvé{available.length > 1 ? 's' : ''} dans le référentiel</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {available.map(p => {
                const sc = STATUS_MAP[p.status];
                const isSel = selected.includes(p.id);
                return (
                  <div key={p.id} onClick={() => toggle(p.id)}
                    style={{ padding: '12px 14px', borderRadius: R, border: `2px solid ${isSel ? C.purple : C.border}`, backgroundColor: isSel ? `${C.purple}06` : '#fff', cursor: 'pointer', transition: 'all 0.15s' }}
                    onMouseEnter={e => { if (!isSel) (e.currentTarget as HTMLDivElement).style.borderColor = `${C.purple}60`; }}
                    onMouseLeave={e => { if (!isSel) (e.currentTarget as HTMLDivElement).style.borderColor = C.border; }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      {/* Checkbox */}
                      <div style={{ width: '16px', height: '16px', borderRadius: '3px', border: `2px solid ${isSel ? C.purple : C.border}`, backgroundColor: isSel ? C.purple : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                        {isSel && <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '3px' }}>
                          <p style={{ fontSize: '13px', fontWeight: 700, color: C.text }}>{p.name}</p>
                          <span style={{ fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '3px', backgroundColor: sc.bg, color: sc.text }}>{sc.label}</span>
                        </div>
                        <p style={{ fontSize: '11px', color: C.textMuted }}>{p.client} · {fmtCurrency(p.budget)}</p>
                        <p style={{ fontSize: '11px', color: C.textSecondary, marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
              <BtnPrimary onClick={handleImport} disabled={selected.length === 0}>
                <Download style={{ width: '12px', height: '12px' }} />
                Importer ({selected.length} sélectionné{selected.length > 1 ? 's' : ''})
              </BtnPrimary>
              <BtnGhost onClick={onClose}>Fermer</BtnGhost>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

/* ════════════════════════════════════════════════ */
/* ─── MODAL: PREDICT V2 ─────────────────────────── */
/* ════════════════════════════════════════════════ */
function PredictV2Modal({ project, onClose, onSave }: {
  project: Project;
  onClose: () => void;
  onSave: (id: number, v2: NonNullable<Project['v2']>) => void;
}) {
  const [tab, setTab]           = useState<'form' | 'excel'>('form');
  const [v2Type, setV2Type]     = useState<'trimestriel' | 'annuel'>('trimestriel');
  const [nomProjet, setNom]     = useState(project.name);
  const [tjm, setTjm]           = useState('650');
  const [startDate, setStart]   = useState('2026-01-01');
  const [endDate, setEnd]       = useState('2026-03-31');
  const [collabs, setCollabs]   = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); setUploaded(true);
    toast.success('Fichier V2 importé !');
    setTimeout(() => {
      onSave(project.id, { type: v2Type, tjm: 650, collabs: [] });
      onClose();
      toast.success('Prédiction V2 chargée depuis Excel !');
    }, 1000);
  };

  const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter', color: C.text, boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' };

  const periodLabel = v2Type === 'trimestriel' ? 'Janvier – Mars 2026' : 'Avril – Décembre 2026';

  return (
    <Modal onClose={onClose} maxWidth="600px" accentColor={C.purple}>
      <ModalHeader title="Prédiction V2" subtitle={`${project.name} — Formulaire de prévision`} onClose={onClose} />
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

        {/* Tabs (same pattern as Créer projet) */}
        <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden' }}>
          {[['form', 'Formulaire manuel'], ['excel', 'Import Excel V2']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as any)}
              style={{ flex: 1, padding: '7px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: tab === k ? C.purple : '#fff', color: tab === k ? '#fff' : C.textMuted, transition: 'all 0.15s', fontFamily: 'Inter' }}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'form' ? (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Nom projet */}
                <div>
                  <label style={lbl}>Nom du projet *</label>
                  <input required type="text" value={nomProjet} onChange={e => setNom(e.target.value)} style={inp}
                    onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
                </div>
                {/* TJM */}
                <div>
                  <label style={lbl}>TJM prédit (€/jour) *</label>
                  <input required type="number" value={tjm} onChange={e => setTjm(e.target.value)} placeholder="Ex: 650" style={inp}
                    onFocus={e => (e.target.style.borderColor = C.purple)} onBlur={e => (e.target.style.borderColor = C.border)} />
                </div>
                {/* Dates */}
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
        ) : (
          /* Excel tab */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              onDrop={handleFileDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${dragOver ? C.purple : C.border}`, borderRadius: R, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', backgroundColor: dragOver ? `${C.purple}06` : C.bg, transition: 'all 0.15s' }}
            >
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
                onChange={() => { setUploaded(true); toast.success('Fichier V2 sélectionné !'); setTimeout(() => { onSave(project.id, { type: v2Type, tjm: 650, collabs: [] }); onClose(); toast.success('Prédiction V2 chargée !'); }, 1000); }} />
              {uploaded ? (
                <><CheckCircle style={{ width: '32px', height: '32px', color: C.green, margin: '0 auto 10px' }} /><p style={{ fontSize: '13px', fontWeight: 700, color: C.green }}>Fichier V2 importé !</p></>
              ) : (
                <>
                  <FileSpreadsheet style={{ width: '36px', height: '36px', color: C.purple, margin: '0 auto 12px' }} />
                  <p style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>
                    Importer le fichier V2 {v2Type === 'trimestriel' ? 'Trimestriel' : 'Annuel'}
                  </p>
                  <p style={{ fontSize: '11px', color: C.textMuted, marginBottom: '12px' }}>{periodLabel} · Glissez ou cliquez</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '7px 18px', backgroundColor: C.purple, color: '#fff', borderRadius: R, fontSize: '12px', fontWeight: 600 }}>
                    <Upload style={{ width: '13px', height: '13px' }} />Choisir un fichier
                  </div>
                  <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '10px' }}>Formats : .xlsx, .xls, .csv</p>
                </>
              )}
            </div>
            {/* Template */}
            <div style={{ padding: '10px 14px', borderRadius: R, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet style={{ width: '18px', height: '18px', color: '#10B981' }} />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>Template V2 Staff2Staff</p>
                  <p style={{ fontSize: '10px', color: C.textMuted }}>Colonnes pré-configurées {v2Type === 'trimestriel' ? 'Jan–Mars' : 'Avr–Déc'}</p>
                </div>
              </div>
              <button onClick={() => toast.success('Template téléchargé !')}
                style={{ padding: '5px 12px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.text, cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
                Télécharger
              </button>
            </div>
          </div>
        )}
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
      <ModalHeader title="Analyse d'Anomalies" subtitle={project.name} onClose={onClose} />
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
          L'analyse de <strong>{project.name}</strong> repose sur des règles métier : seuils de charge, chevauchements et comparaison des capacités disponibles.
        </p>

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {[
            { l: 'Projet analysé', v: project.name, c: C.blue },
            { l: 'Ressources concernées', v: `${project.team || '—'} membres`, c: C.purple },
            { l: 'Anomalies potentielles', v: project.status === 'en-cours' ? '2' : '0', c: project.status === 'en-cours' ? C.red : C.green },
            { l: 'Méthode',              v: 'Règles métier',                           c: C.textSecondary },
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
function AddProjectModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (p: Project) => void;
}) {
  const [tab, setTab]           = useState<'form' | 'excel'>('form');
  const [dragOver, setDragOver] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData(e.target as HTMLFormElement);
    const newP: Project = {
      id: Date.now(),
      name: fd.get('name') as string || 'Nouveau Projet',
      client: fd.get('client') as string || 'Client',
      status: 'planifie',
      start: new Date(fd.get('start') as string || Date.now()),
      end: new Date(fd.get('end') as string || Date.now() + 180 * 864e5),
      budget: Number(fd.get('budget')) || 100000,
      spent: 0, team: 0, completion: 0,
      desc: fd.get('desc') as string || '',
    };
    onAdd(newP);
    toast.success('Projet créé avec succès !');
    onClose();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false); setUploaded(true);
    toast.success('Fichier Excel importé ! Traitement en cours…');
    setTimeout(() => { onClose(); toast.success('3 projets importés depuis le fichier Excel.'); }, 1200);
  };

  const inp: React.CSSProperties = { width: '100%', padding: '7px 10px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter', color: C.text, boxSizing: 'border-box' };
  const lbl: React.CSSProperties = { fontSize: '10px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '4px' };

  return (
    <Modal onClose={onClose} maxWidth="580px" accentColor={C.blue}>
      <ModalHeader title="Ajouter un Projet" subtitle="Saisie manuelle ou import Excel" onClose={onClose} />
      <div style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden', marginBottom: '16px' }}>
          {[['form', 'Formulaire manuel'], ['excel', 'Import Excel']].map(([k, l]) => (
            <button key={k} onClick={() => setTab(k as any)}
              style={{ flex: 1, padding: '7px 14px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', border: 'none', backgroundColor: tab === k ? C.blue : '#fff', color: tab === k ? '#fff' : C.textMuted, transition: 'all 0.15s', fontFamily: 'Inter' }}>
              {l}
            </button>
          ))}
        </div>

        {tab === 'form' ? (
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div><label style={lbl}>Nom du projet *</label><input required name="name" type="text" placeholder="Ex: Projet Zeta" style={inp} onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} /></div>
                <div><label style={lbl}>Client *</label><input required name="client" type="text" placeholder="Ex: BCP Bank" style={inp} onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} /></div>
                <div><label style={lbl}>Date de début *</label><input required name="start" type="date" defaultValue="2026-05-01" style={inp} onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} /></div>
                <div><label style={lbl}>Date de fin *</label><input required name="end" type="date" defaultValue="2026-10-31" style={inp} onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} /></div>
                <div><label style={lbl}>Budget (€) *</label><input required name="budget" type="number" placeholder="Ex: 150000" style={inp} onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} /></div>
                <div>
                  <label style={lbl}>Département</label>
                  <select name="dept" style={{ ...inp, cursor: 'pointer' }}><option>Digital Banking</option><option>Data & Analytics</option><option>Core Banking</option><option>Compliance</option></select>
                </div>
              </div>
              <div>
                <label style={lbl}>Description</label>
                <textarea name="desc" placeholder="Décrivez le contexte et les objectifs du projet…" rows={3}
                  style={{ ...inp, resize: 'vertical' as const, lineHeight: 1.5 }}
                  onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} />
              </div>
              <div style={{ display: 'flex', gap: '8px', paddingTop: '8px', borderTop: `1px solid ${C.borderLight}` }}>
                <BtnPrimary><CheckCircle style={{ width: '12px', height: '12px' }} />Créer le projet</BtnPrimary>
                <BtnGhost onClick={onClose}>Annuler</BtnGhost>
              </div>
            </div>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              onDrop={handleDrop} onDragOver={e => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
              onClick={() => fileRef.current?.click()}
              style={{ border: `2px dashed ${dragOver ? C.blue : C.border}`, borderRadius: R, padding: '36px 20px', textAlign: 'center', cursor: 'pointer', backgroundColor: dragOver ? `${C.blue}06` : C.bg, transition: 'all 0.15s' }}
            >
              <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }}
                onChange={() => { setUploaded(true); toast.success('Fichier sélectionné !'); setTimeout(() => { onClose(); toast.success('3 projets importés depuis le fichier Excel.'); }, 1000); }} />
              {uploaded
                ? (<><CheckCircle style={{ width: '32px', height: '32px', color: C.green, margin: '0 auto 10px' }} /><p style={{ fontSize: '13px', fontWeight: 700, color: C.green }}>Fichier importé avec succès !</p></>)
                : (<><FileSpreadsheet style={{ width: '36px', height: '36px', color: C.blue, margin: '0 auto 10px' }} /><p style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '4px' }}>Glissez votre fichier Excel ici</p><p style={{ fontSize: '12px', color: C.textMuted, marginBottom: '12px' }}>ou cliquez pour sélectionner un fichier</p><div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 14px', backgroundColor: C.blue, color: '#fff', borderRadius: R, fontSize: '12px', fontWeight: 600 }}><Upload style={{ width: '12px', height: '12px' }} />Choisir un fichier</div><p style={{ fontSize: '10px', color: C.textMuted, marginTop: '10px' }}>Formats acceptés : .xlsx, .xls, .csv</p></>)
              }
            </div>
            <div style={{ padding: '10px 14px', borderRadius: R, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FB' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileSpreadsheet style={{ width: '18px', height: '18px', color: '#10B981' }} />
                <div>
                  <p style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>Template Excel Staff2Staff</p>
                  <p style={{ fontSize: '10px', color: C.textMuted }}>Modèle avec colonnes pré-configurées</p>
                </div>
              </div>
              <button onClick={() => toast.success('Template téléchargé !')}
                style={{ padding: '5px 12px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.text, cursor: 'pointer', fontSize: '11px', fontWeight: 600 }}>
                Télécharger
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

/* ════════════════════════════════════════════════ */
/* ─── MODAL: PROJECT DETAIL ─────────────────────── */
/* ════════════════════════════════════════════════ */
function ProjectDetailModal({ project, onClose, onAnalyze, onPredictV2 }: {
  project: Project;
  onClose: () => void;
  onAnalyze: () => void;
  onPredictV2: () => void;
}) {
  const sc = STATUS_MAP[project.status];
  const budgetPct = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;

  return (
    <Modal onClose={onClose} maxWidth="560px" accentColor={sc.accent}>
      <ModalHeader title={project.name} subtitle={`Client : ${project.client}`} onClose={onClose} />
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
            {format(project.start, 'dd MMM', { locale: fr })} → {format(project.end, 'dd MMM yyyy', { locale: fr })}
          </span>
        </div>

        <p style={{ fontSize: '12px', color: C.textSecondary, lineHeight: 1.6, padding: '10px 14px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>{project.desc}</p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { l: 'Budget total', v: fmtCurrency(project.budget), c: C.blue },
            { l: 'Consommé', v: fmtCurrency(project.spent), c: budgetPct > 90 ? C.red : '#F59E0B' },
            { l: 'Équipe', v: `${project.team} membres`, c: C.purple },
            { l: 'Avancement', v: `${project.completion}%`, c: sc.accent },
          ].map(i => (
            <div key={i.l} style={{ padding: '10px 12px', backgroundColor: C.bg, borderRadius: R, border: `1px solid ${C.border}` }}>
              <p style={{ fontSize: '10px', color: C.textMuted, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px' }}>{i.l}</p>
              <p style={{ fontSize: '14px', fontWeight: 800, color: i.c }}>{i.v}</p>
            </div>
          ))}
        </div>

        {/* Budget bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: C.text }}>Consommation Budget</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: budgetPct > 90 ? C.red : '#F59E0B' }}>{budgetPct}%</span>
          </div>
          <div style={{ height: '8px', borderRadius: '4px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '4px', backgroundColor: budgetPct > 90 ? C.red : '#F59E0B', width: `${budgetPct}%` }} />
          </div>
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
  const [projects, setProjects]       = useState<Project[]>(INITIAL_PROJECTS);
  const [showAdd, setShowAdd]         = useState(false);
  const [showRecover, setShowRecover] = useState(false);
  const [detailProj, setDetailProj]   = useState<Project | null>(null);
  const [analyzeProj, setAnalyzeProj] = useState<Project | null>(null);
  const [predictProj, setPredictProj] = useState<Project | null>(null);
  const [search, setSearch]           = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const filtered = projects.filter(p => {
    const m = p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase());
    return m && (filterStatus === 'all' || p.status === filterStatus);
  });

  const addProject   = (p: Project)  => setProjects(prev => [...prev, p]);
  const recoverProjs = (ps: Project[]) => setProjects(prev => [...prev, ...ps.filter(p => !prev.find(x => x.id === p.id))]);
  const saveV2 = (id: number, v2: NonNullable<Project['v2']>) =>
    setProjects(prev => prev.map(p => p.id === id ? { ...p, v2 } : p));

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>

      {/* ── Header ── */}
      <PageHeader
        title="Mes Projets"
        subtitle={`${projects.length} projets · ${projects.filter(p => p.status === 'en-cours').length} en cours`}
      >
        <BtnGhost onClick={() => setShowRecover(true)}>
          <FolderSearch style={{ width: '12px', height: '12px' }} />Récupérer projets existants
        </BtnGhost>
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
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un projet ou client…"
            style={{ width: '100%', paddingLeft: '28px', paddingRight: '10px', paddingTop: '6px', paddingBottom: '6px', fontSize: '12px', border: `1px solid ${C.border}`, borderRadius: R, backgroundColor: '#fff', outline: 'none' }}
            onFocus={e => (e.target.style.borderColor = C.blue)} onBlur={e => (e.target.style.borderColor = C.border)} />
        </div>
        <div style={{ display: 'flex', border: `1px solid ${C.border}`, borderRadius: R, overflow: 'hidden', backgroundColor: '#fff' }}>
          {[['all', 'Tous'], ['en-cours', 'En cours'], ['planifie', 'Planifiés'], ['termine', 'Terminés']].map(([v, l]) => (
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

      {/* ── Project Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
        {filtered.map(p => {
          const sc = STATUS_MAP[p.status];
          const budgetPct = p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0;
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
                    <p style={{ fontSize: '14px', fontWeight: 700, color: C.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                    <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '2px' }}>{p.client}</p>
                  </div>
                  <ChevronRight style={{ width: '15px', height: '15px', color: C.textMuted, flexShrink: 0 }} />
                </div>

                {/* Info grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px', paddingBottom: '10px', borderBottom: `1px solid ${C.borderLight}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Calendar style={{ width: '11px', height: '11px', color: C.textMuted }} />
                    <span style={{ fontSize: '10px', color: C.textMuted }}>{format(p.start, 'MMM yyyy', { locale: fr })} → {format(p.end, 'MMM yy', { locale: fr })}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <DollarSign style={{ width: '11px', height: '11px', color: C.textMuted }} />
                    <span style={{ fontSize: '10px', color: C.textMuted }}>{fmtCurrency(p.budget)}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Users style={{ width: '11px', height: '11px', color: C.textMuted }} />
                    <span style={{ fontSize: '10px', color: C.textMuted }}>{p.team} membres</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <span style={{ fontSize: '10px', color: budgetPct > 90 ? C.red : C.textMuted }}>Budget: <strong>{budgetPct}%</strong></span>
                  </div>
                </div>

                {/* Description */}
                <p style={{ fontSize: '11px', color: C.textSecondary, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any, marginBottom: '10px' }}>{p.desc}</p>

                {/* Progress bar */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '10px', color: C.textMuted }}>Avancement</span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: sc.accent }}>{p.completion}%</span>
                  </div>
                  <div style={{ height: '4px', borderRadius: '2px', backgroundColor: C.borderLight, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '2px', backgroundColor: sc.accent, width: `${p.completion}%` }} />
                  </div>
                </div>
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
      {showAdd && <AddProjectModal onClose={() => setShowAdd(false)} onAdd={addProject} />}

      {showRecover && (
        <RecoverModal
          existing={projects.map(p => p.id)}
          onClose={() => setShowRecover(false)}
          onAdd={recoverProjs}
        />
      )}

      {detailProj && (
        <ProjectDetailModal
          project={detailProj}
          onClose={() => setDetailProj(null)}
          onAnalyze={() => { setDetailProj(null); setAnalyzeProj(detailProj); }}
          onPredictV2={() => { setDetailProj(null); setPredictProj(detailProj); }}
        />
      )}

      {analyzeProj && (
        <AnalyzeProjectModal
          project={analyzeProj}
          onClose={() => setAnalyzeProj(null)}
          onGoToAnomalies={() => {
            setAnalyzeProj(null);
            navigate('/pm/anomalies');
            toast.info(`Anomalies — ${analyzeProj.name}`);
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
