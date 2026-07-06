import { useEffect, useState } from 'react';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { useAuth } from '../context/AuthContext';
import { useRole, ROLE_DASHBOARDS } from '../context/RoleContext';
import { C, R, S } from '../components/ui/design-system';
import logo from '../../imports/Logo_moderne_de_Staff2Staff_en_hexagone.png';

export function Login() {
  const { login, isAuthenticated, user, loading: authLoading } = useAuth();
  const { setProfileFromUser } = useRole();
  const navigate = useNavigate();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd]   = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [forgotMode, setForgotMode] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(() => {
    if (!authLoading && isAuthenticated && user) {
      navigate(ROLE_DASHBOARDS[user.role], { replace: true });
    }
  }, [authLoading, isAuthenticated, user, navigate]);

  /* ── handle login form submission ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setError('');
    setLoading(true);

    const res = await login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (!res.ok) {
      setError(res.error || 'Erreur de connexion.');
      return;
    }

    // Restore user info from localStorage to set role context
    const stored = localStorage.getItem('s2s_user');
    if (stored) {
      try {
        const user = JSON.parse(stored);
        setProfileFromUser(user);
        navigate(ROLE_DASHBOARDS[user.role as keyof typeof ROLE_DASHBOARDS], { replace: true });
      } catch {
        navigate('/', { replace: true });
      }
    } else {
      navigate('/', { replace: true });
    }

    toast.success('Connexion réussie — Bienvenue sur Staff2Staff !');
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;
    toast.success(`Instructions envoyées à ${forgotEmail}`);
    setForgotMode(false);
    setForgotEmail('');
  };

  /* ── styles ── */
  const inp: React.CSSProperties = {
    width: '100%', padding: '10px 12px 10px 38px',
    fontSize: '13px', border: `1px solid ${C.border}`, borderRadius: R,
    backgroundColor: '#fff', outline: 'none', fontFamily: 'Inter', color: C.text,
    boxSizing: 'border-box', transition: 'border-color 0.15s',
  };
  const lbl: React.CSSProperties = {
    fontSize: '11px', fontWeight: 700, color: C.textMuted,
    textTransform: 'uppercase', letterSpacing: '0.06em',
    display: 'block', marginBottom: '5px',
  };

  if (authLoading || (isAuthenticated && user)) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: C.bg }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '36px', height: '36px', border: '3px solid #E5E7EB',
            borderTopColor: C.purple, borderRadius: '50%',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 12px',
          }} />
          <p style={{ fontSize: '13px', color: C.textMuted, fontWeight: 500 }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', backgroundColor: C.bg }}>

      {/* ── Left panel ────────────────────────────── */}
      <div style={{
        width: '400px', flexShrink: 0, backgroundColor: C.sidebar,
        display: 'flex', flexDirection: 'column', padding: '40px 36px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* decorative glow blobs */}
        <div style={{ position: 'absolute', top: '-100px', right: '-100px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(123,44,191,0.18) 0%,transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '-80px', left: '-80px', width: '260px', height: '260px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(230,0,169,0.15) 0%,transparent 70%)', pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '52px' }}>
          <div style={{ width: '42px', height: '42px', borderRadius: R, overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <img src={logo} alt="S2S" style={{ width: '34px', height: '34px', objectFit: 'contain' }} />
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 800, fontSize: '18px', lineHeight: 1, letterSpacing: '-0.02em' }}>Staff2Staff</p>
            <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '10px', marginTop: '2px', fontWeight: 500 }}>Sopra Banking Software</p>
          </div>
        </div>

        {/* Heading */}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', borderRadius: '20px', backgroundColor: 'rgba(123,44,191,0.2)', border: '1px solid rgba(123,44,191,0.35)', marginBottom: '20px' }}>
            <Shield style={{ width: '11px', height: '11px', color: '#9B59D6' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, color: 'rgba(255,255,255,0.65)', letterSpacing: '0.08em' }}>ACCÈS SÉCURISÉ</span>
          </div>
          <h1 style={{ color: '#fff', fontSize: '26px', fontWeight: 800, lineHeight: 1.25, marginBottom: '14px', letterSpacing: '-0.03em' }}>
            Pilotage des<br />
            <span style={{ background: 'linear-gradient(90deg,#E600A9,#7B2CBF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ressources &</span><br />
            projets
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', lineHeight: 1.75, marginBottom: '30px' }}>
            Plateforme interne SBS de staffing, détection des anomalies et prévisions V2.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { t: 'Prédiction V2 trimestrielle & annuelle', c: '#E600A9' },
              { t: 'Analyse des anomalies par projet', c: '#7B2CBF' },
              { t: 'Récupération de projets existants', c: '#2D9CDB' },
              { t: 'Planning collaborateur éditable', c: '#059669' },
            ].map(f => (
              <div key={f.t} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '5px', height: '5px', borderRadius: '50%', backgroundColor: f.c, flexShrink: 0 }} />
                <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>{f.t}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <p style={{ fontSize: '10px', color: 'rgba(255,255,255,0.18)', textAlign: 'center' }}>
            © 2026 Sopra Banking Software · Staff2Staff v2.0
          </p>
        </div>
      </div>

      {/* ── Right panel ───────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 24px' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {!forgotMode ? (
            <>
              {/* Title */}
              <div style={{ marginBottom: '28px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: C.text, marginBottom: '5px', letterSpacing: '-0.02em' }}>Connexion</h2>
                <p style={{ fontSize: '13px', color: C.textMuted }}>Accédez à votre espace Staff2Staff</p>
              </div>

              {/* Error banner */}
              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: R, backgroundColor: '#FEF2F2', border: '1px solid #FECACA', marginBottom: '16px' }}>
                  <AlertCircle style={{ width: '14px', height: '14px', color: C.red, flexShrink: 0 }} />
                  <p style={{ fontSize: '12px', color: '#B91C1C', fontWeight: 500 }}>{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {/* Email */}
                <div>
                  <label style={lbl}>Adresse email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: C.textMuted, pointerEvents: 'none' }} />
                    <input
                      type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="prenom.nom@soprabanking.com"
                      style={inp}
                      onFocus={e => (e.target.style.borderColor = C.purple)}
                      onBlur={e => (e.target.style.borderColor = C.border)}
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label style={lbl}>Mot de passe</label>
                  <div style={{ position: 'relative' }}>
                    <Lock style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: C.textMuted, pointerEvents: 'none' }} />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password} onChange={e => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                      style={{ ...inp, paddingRight: '40px' }}
                      onFocus={e => (e.target.style.borderColor = C.purple)}
                      onBlur={e => (e.target.style.borderColor = C.border)}
                      autoComplete="current-password"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)}
                      style={{ position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: C.textMuted, display: 'flex' }}>
                      {showPwd
                        ? <EyeOff style={{ width: '14px', height: '14px' }} />
                        : <Eye style={{ width: '14px', height: '14px' }} />}
                    </button>
                  </div>
                </div>

                {/* Forgot link */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '-6px' }}>
                  <button type="button" onClick={() => setForgotMode(true)}
                    style={{ fontSize: '11px', fontWeight: 600, color: C.purple, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Mot de passe oublié ?
                  </button>
                </div>

                {/* Submit */}
                <button type="submit" disabled={loading}
                  style={{
                    width: '100%', padding: '11px', borderRadius: R, border: 'none',
                    background: loading ? '#E5E7EB' : `linear-gradient(135deg,${C.purple},${C.magenta})`,
                    color: loading ? C.textMuted : '#fff',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '13px', fontWeight: 700, fontFamily: 'Inter',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    boxShadow: loading ? 'none' : `0 4px 16px ${C.purple}35`,
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.9'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
                >
                  {loading
                    ? <svg style={{ width: '16px', height: '16px', animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" strokeOpacity="0.25" /><path d="M12 2a10 10 0 0 1 10 10" /></svg>
                    : <LogIn style={{ width: '15px', height: '15px' }} />}
                  {loading ? 'Connexion…' : 'Se connecter'}
                </button>
              </form>
            </>
          ) : (
            /* ── Forgot password ── */
            <>
              <div style={{ marginBottom: '24px' }}>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: C.text, marginBottom: '5px' }}>Mot de passe oublié</h2>
                <p style={{ fontSize: '13px', color: C.textMuted }}>Renseignez votre email pour recevoir les instructions.</p>
              </div>
              <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={lbl}>Email professionnel</label>
                  <div style={{ position: 'relative' }}>
                    <Mail style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', width: '14px', height: '14px', color: C.textMuted, pointerEvents: 'none' }} />
                    <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)}
                      placeholder="prenom.nom@soprabanking.com"
                      style={inp}
                      onFocus={e => (e.target.style.borderColor = C.purple)}
                      onBlur={e => (e.target.style.borderColor = C.border)} />
                  </div>
                </div>
                <button type="submit"
                  style={{ width: '100%', padding: '10px', borderRadius: R, border: 'none', background: `linear-gradient(135deg,${C.purple},${C.magenta})`, color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: 'Inter' }}>
                  Envoyer les instructions
                </button>
                <button type="button" onClick={() => setForgotMode(false)}
                  style={{ width: '100%', padding: '10px', borderRadius: R, border: `1px solid ${C.border}`, backgroundColor: '#fff', color: C.textSecondary, cursor: 'pointer', fontSize: '12px', fontWeight: 500, fontFamily: 'Inter' }}>
                  ← Retour à la connexion
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
