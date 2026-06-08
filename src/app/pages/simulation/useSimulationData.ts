import { useState, useEffect } from 'react';
import { fetchAnomaliesV2, type AnomalieV2DTO } from '../../services/anomalieV2Service';
import { fetchRmProjets, type RmProjetDTO } from '../../services/resourceManagerService';
import { fetchRmResources, type RmResourceDTO } from '../../services/resourceManagerService';
import { fetchMyProfile } from '../../services/userService';
import {
  simulerRemplacement,
  simulerSousCharge,
  validerSimulation,
  annulerSimulation,
  type SimulationRemplacementRequest,
  type SimulationRemplacementResponse,
  type SimulationSousChargeRequest,
  type SimulationSousChargeResponse,
} from '../../services/simulationService';

export type SimulationMode = 'REMPLACEMENT' | 'SOUS_CHARGE';

export interface SimulationState {
  anomalies: AnomalieV2DTO[];
  conflits: AnomalieV2DTO[];        // CONFLIT | SURCHARGE → for REMPLACEMENT
  sousCharges: AnomalieV2DTO[];     // SOUS_CHARGE | NON_STAFFE → for SOUS_CHARGE
  projets: RmProjetDTO[];
  collaborateurs: RmResourceDTO[];
  rmId: number | null;
  loading: boolean;
  annee: number;
  mois: number;
}

export type SimulationResult = SimulationRemplacementResponse | SimulationSousChargeResponse;

export function useSimulationData() {
  const now = new Date();
  const [mode, setMode] = useState<SimulationMode>('REMPLACEMENT');
  const [state, setState] = useState<SimulationState>({
    anomalies: [], conflits: [], sousCharges: [], projets: [], collaborateurs: [],
    rmId: null, loading: true, annee: now.getFullYear(), mois: now.getMonth() + 1,
  });
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [running, setRunning] = useState(false);
  const [validated, setValidated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async (annee: number, mois: number) => {
    setState(s => ({ ...s, loading: true, annee, mois }));
    try {
      const [anomalies, projets, collaborateurs, profile] = await Promise.all([
        fetchAnomaliesV2(annee, mois),
        fetchRmProjets(),
        fetchRmResources(annee, mois),
        fetchMyProfile(),
      ]);
      const conflits = anomalies.filter(a =>
        a.typeAnomalie === 'CONFLIT' || a.typeAnomalie === 'SURCHARGE'
      );
      const sousCharges = anomalies.filter(a =>
        a.typeAnomalie === 'SOUS_CHARGE' || a.typeAnomalie === 'NON_STAFFE'
      );
      setState(s => ({
        ...s, anomalies, conflits, sousCharges, projets, collaborateurs,
        rmId: profile.id, loading: false,
      }));
    } catch {
      setState(s => ({ ...s, loading: false }));
    }
  };

  useEffect(() => { load(state.annee, state.mois); }, []);

  const setPeriod = (annee: number, mois: number) => load(annee, mois);

  const runRemplacementSimulation = async (req: SimulationRemplacementRequest) => {
    setRunning(true); setResult(null); setValidated(false); setError(null);
    try {
      const res = await simulerRemplacement(req);
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la simulation');
    } finally { setRunning(false); }
  };

  const runSousChargeSimulation = async (req: SimulationSousChargeRequest) => {
    setRunning(true); setResult(null); setValidated(false); setError(null);
    try {
      const res = await simulerSousCharge(req);
      setResult(res);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la simulation');
    } finally { setRunning(false); }
  };

  const validate = async (simId: number) => {
    try {
      await validerSimulation(simId);
      setValidated(true);
      load(state.annee, state.mois);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la validation');
    }
  };

  const cancel = async (simId: number) => {
    try {
      await annulerSimulation(simId);
      setResult(null);
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'annulation");
    }
  };

  const reset = () => { setResult(null); setValidated(false); setError(null); };

  const switchMode = (newMode: SimulationMode) => {
    setMode(newMode);
    reset();
  };

  return {
    mode, switchMode,
    state, result, running, validated, error,
    setPeriod,
    runRemplacementSimulation,
    runSousChargeSimulation,
    validate, cancel, reset,
  };
}
