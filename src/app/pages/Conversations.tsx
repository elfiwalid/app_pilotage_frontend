import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { CheckCircle, Loader2, MessageSquare, RefreshCw, Send, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { C, R, PageHeader, cardStyle } from '../components/ui/design-system';
import { useRole } from '../context/RoleContext';
import {
  acceptSimulation,
  fetchConversation,
  fetchConversationMessages,
  fetchMyConversations,
  rejectSimulation,
  sendConversationMessage,
  type ConversationSimulationDto,
  type MessageConversationDto,
} from '../services/conversationService';

function decisionColor(status: string) {
  if (status === 'ACCEPTED') return C.green;
  if (status === 'REJECTED') return C.red;
  if (status === 'NOT_REQUIRED') return C.textMuted;
  return C.orange;
}

export function Conversations() {
  const { role, profile } = useRole();
  const [searchParams] = useSearchParams();
  const conversationIdParam = searchParams.get('conversationId');
  const [conversations, setConversations] = useState<ConversationSimulationDto[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selected, setSelected] = useState<ConversationSimulationDto | null>(null);
  const [messages, setMessages] = useState<MessageConversationDto[]>([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const loadList = async () => {
    setLoading(true);
    try {
      const data = await fetchMyConversations();
      setConversations(data);
      const requestedId = conversationIdParam ? Number(conversationIdParam) : null;
      if (requestedId && data.some(c => c.id === requestedId)) {
        setSelectedId(requestedId);
      } else if (!selectedId && data.length > 0) {
        setSelectedId(data[0].id);
      }
    } catch (e: any) {
      toast.error(e.message || 'Erreur lors du chargement des conversations');
    } finally {
      setLoading(false);
    }
  };

  const loadSelected = async (id: number) => {
    try {
      const [conv, msgs] = await Promise.all([
        fetchConversation(id),
        fetchConversationMessages(id),
      ]);
      setSelected(conv);
      setMessages(msgs);
    } catch (e: any) {
      toast.error(e.message || 'Conversation introuvable');
    }
  };

  useEffect(() => { loadList(); }, []);
  useEffect(() => { if (selectedId) loadSelected(selectedId); }, [selectedId]);

  const myDecision = useMemo(() => {
    if (role !== 'pm' || !selected) return null;
    return selected.decisions.find(d => d.chefProjetNomComplet === profile.name) || null;
  }, [role, selected, profile.name]);

  const canDecide = role === 'pm' && selected?.status === 'ACTIVE' && myDecision?.status === 'PENDING';

  const send = async () => {
    if (!selected || !draft.trim()) return;
    setBusy(true);
    try {
      const msg = await sendConversationMessage(selected.id, draft.trim());
      setMessages(prev => [...prev, msg]);
      setDraft('');
    } catch (e: any) {
      toast.error(e.message || 'Message non envoye');
    } finally {
      setBusy(false);
    }
  };

  const decide = async (accepted: boolean) => {
    if (!selected) return;
    const commentaire = window.prompt(accepted ? 'Commentaire optionnel' : 'Motif du refus') || '';
    setBusy(true);
    try {
      const updated = accepted
        ? await acceptSimulation(selected.simulationId, commentaire)
        : await rejectSimulation(selected.simulationId, commentaire);
      setSelected(updated);
      await loadSelected(updated.id);
      await loadList();
      toast.success(accepted ? 'Simulation acceptee et appliquee' : 'Simulation refusee');
    } catch (e: any) {
      toast.error(e.message || 'Action impossible');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: C.bg, minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <PageHeader title="Conversations" subtitle="Discussions autour des simulations What-If">
        <button onClick={loadList} disabled={loading} style={{ padding: '7px 12px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: C.white, color: C.textSecondary, cursor: 'pointer', fontSize: '12px', fontWeight: 700, display: 'flex', gap: '6px', alignItems: 'center' }}>
          {loading ? <Loader2 style={{ width: '13px', height: '13px', animation: 'spin 1s linear infinite' }} /> : <RefreshCw style={{ width: '13px', height: '13px' }} />}
          Actualiser
        </button>
      </PageHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '14px', minHeight: '620px' }}>
        <div style={{ ...cardStyle, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px', borderBottom: `1px solid ${C.borderLight}`, fontSize: '13px', fontWeight: 800, color: C.text }}>Mes conversations</div>
          <div style={{ overflowY: 'auto' }}>
            {loading ? (
              <div style={{ padding: '24px', textAlign: 'center' }}><Loader2 style={{ width: '22px', height: '22px', color: C.purple, animation: 'spin 1s linear infinite' }} /></div>
            ) : conversations.length === 0 ? (
              <p style={{ padding: '18px', fontSize: '12px', color: C.textMuted }}>Aucune conversation.</p>
            ) : conversations.map(conv => (
              <button key={conv.id} onClick={() => setSelectedId(conv.id)}
                style={{ width: '100%', textAlign: 'left', padding: '12px 14px', border: 'none', borderBottom: `1px solid ${C.borderLight}`, backgroundColor: selectedId === conv.id ? '#F5F3FF' : C.white, cursor: 'pointer' }}>
                <p style={{ fontSize: '12px', fontWeight: 800, color: selectedId === conv.id ? C.purple : C.text }}>Simulation #{conv.simulationId}</p>
                <p style={{ fontSize: '11px', color: C.textMuted, marginTop: '3px' }}>{conv.collaborateurSource} {'->'} {conv.collaborateurCible}</p>
                <p style={{ fontSize: '10px', color: C.textMuted, marginTop: '3px' }}>{conv.projetsConflit.join(', ')}</p>
              </button>
            ))}
          </div>
        </div>

        <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.textMuted, fontSize: '13px' }}>Selectionnez une conversation</div>
          ) : (
            <>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${C.borderLight}`, display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 900, color: C.text }}>Proposition de resolution de conflit</p>
                  <p style={{ fontSize: '12px', color: C.textMuted, marginTop: '4px' }}>{selected.collaborateurSource} {'->'} {selected.collaborateurCible} · {selected.dateDebut} au {selected.dateFin}</p>
                  <p style={{ fontSize: '11px', color: C.purple, fontWeight: 700, marginTop: '4px' }}>{selected.projetsConflit.join(' · ')}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {canDecide && (
                    <>
                      <button disabled={busy} onClick={() => decide(true)} style={{ padding: '8px 10px', borderRadius: R, border: 'none', backgroundColor: C.green, color: '#fff', cursor: 'pointer', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}><CheckCircle style={{ width: '13px', height: '13px' }} />Accepter</button>
                      <button disabled={busy} onClick={() => decide(false)} style={{ padding: '8px 10px', borderRadius: R, border: `1px solid ${C.red}`, backgroundColor: '#FEF2F2', color: C.red, cursor: 'pointer', fontSize: '12px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}><XCircle style={{ width: '13px', height: '13px' }} />Refuser</button>
                    </>
                  )}
                  <span style={{ fontSize: '10px', fontWeight: 800, color: selected.status === 'ACTIVE' ? C.green : C.textMuted, backgroundColor: selected.status === 'ACTIVE' ? '#ECFDF5' : C.borderLight, padding: '3px 8px', borderRadius: '3px' }}>{selected.status}</span>
                </div>
              </div>

              <div style={{ padding: '12px 16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderBottom: `1px solid ${C.borderLight}` }}>
                {[
                  ['Source avant', `${Math.round(selected.tauxSourceAvant)}%`],
                  ['Source apres', `${Math.round(selected.tauxSourceApres)}%`],
                  ['Cible avant', `${Math.round(selected.tauxCibleAvant)}%`],
                  ['Cible apres', `${Math.round(selected.tauxCibleApres)}%`],
                ].map(([l, v]) => <div key={l} style={{ padding: '8px', borderRadius: R, backgroundColor: C.bg, border: `1px solid ${C.borderLight}` }}><p style={{ fontSize: '10px', color: C.textMuted, fontWeight: 700 }}>{l}</p><p style={{ fontSize: '16px', fontWeight: 900, color: C.text }}>{v}</p></div>)}
              </div>

              <div style={{ padding: '10px 16px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderBottom: `1px solid ${C.borderLight}` }}>
                {selected.decisions.map(d => (
                  <span key={d.id} style={{ fontSize: '10px', fontWeight: 800, color: decisionColor(d.status), backgroundColor: `${decisionColor(d.status)}15`, padding: '3px 8px', borderRadius: '3px' }}>{d.projetNom}: {d.status}</span>
                ))}
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{ alignSelf: msg.type === 'SYSTEM' ? 'center' : 'stretch', padding: '10px 12px', borderRadius: R, backgroundColor: msg.type === 'SYSTEM' ? '#FFFBEB' : C.white, border: `1px solid ${msg.type === 'SYSTEM' ? '#FDE68A' : C.borderLight}` }}>
                    <p style={{ fontSize: '11px', fontWeight: 800, color: msg.type === 'SYSTEM' ? C.orange : C.text, marginBottom: '4px', display: 'flex', gap: '5px', alignItems: 'center' }}><MessageSquare style={{ width: '12px', height: '12px' }} />{msg.auteurNomComplet}</p>
                    <p style={{ fontSize: '12px', color: C.text, whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{msg.contenu}</p>
                  </div>
                ))}
              </div>

              <div style={{ padding: '12px 16px', borderTop: `1px solid ${C.borderLight}`, display: 'flex', gap: '8px' }}>
                <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') send(); }} placeholder="Ecrire un message..."
                  style={{ flex: 1, padding: '9px 12px', borderRadius: R, border: `1px solid ${C.border}`, fontSize: '12px', outline: 'none' }} />
                <button onClick={send} disabled={busy || !draft.trim()} style={{ padding: '9px 12px', borderRadius: R, border: 'none', backgroundColor: C.purple, color: '#fff', cursor: busy || !draft.trim() ? 'not-allowed' : 'pointer', fontSize: '12px', fontWeight: 800, display: 'flex', gap: '6px', alignItems: 'center' }}><Send style={{ width: '13px', height: '13px' }} />Envoyer</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
