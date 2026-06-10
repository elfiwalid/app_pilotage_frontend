import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { fetchMyProfile } from '../services/userService';

export type Role = 'rm' | 'pm' | 'collab';

export interface UserProfile {
  name: string;
  shortName: string;
  initials: string;
  email: string;
  role: string;
  roleLabel: string;
  accent: string;
  avatarGradient: string;
  photoUrl?: string | null;
}

/**
 * Default profile templates per role.
 * The actual name/email will be overridden from the authenticated user.
 */
const ROLE_DEFAULTS: Record<Role, { roleLabel: string; accent: string; avatarGradient: string }> = {
  rm: {
    roleLabel: 'Resource Manager',
    accent: '#E600A9',
    avatarGradient: 'linear-gradient(135deg, #7B2CBF 0%, #E600A9 100%)',
  },
  pm: {
    roleLabel: 'Chef de Projet',
    accent: '#2D9CDB',
    avatarGradient: 'linear-gradient(135deg, #1E40AF 0%, #2D9CDB 100%)',
  },
  collab: {
    roleLabel: 'Collaborateur',
    accent: '#059669',
    avatarGradient: 'linear-gradient(135deg, #065F46 0%, #059669 100%)',
  },
};

export const ROLE_DASHBOARDS: Record<Role, string> = {
  rm: '/',
  pm: '/pm',
  collab: '/collab',
};

/**
 * Static visual metadata per role — used by Profile pages for the role-switcher UI.
 * These do NOT contain credentials or sensitive data.
 */
export const PROFILES: Record<Role, UserProfile> = {
  rm: buildProfile('rm', 'Resource Manager', '', 'RM'),
  pm: buildProfile('pm', 'Chef de Projet', '', 'CP'),
  collab: buildProfile('collab', 'Collaborateur', '', 'CO'),
};

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  profile: UserProfile;
  setProfileFromUser: (user: { name: string; email: string; initials: string; role: Role; photoUrl?: string | null }) => void;
}

function buildProfile(role: Role, name = '', email = '', initials = '', photoUrl?: string | null): UserProfile {
  const defaults = ROLE_DEFAULTS[role];
  const shortName = name.length > 18 ? name.slice(0, 16) + '…' : name;
  return {
    name,
    shortName,
    initials,
    email,
    role: defaults.roleLabel,
    roleLabel: defaults.roleLabel,
    accent: defaults.accent,
    avatarGradient: defaults.avatarGradient,
    photoUrl,
  };
}

const RoleContext = createContext<RoleContextType>({
  role: 'rm',
  setRole: () => {},
  profile: buildProfile('rm'),
  setProfileFromUser: () => {},
});

export const useRole = () => useContext(RoleContext);

export function RoleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [role, setRoleState] = useState<Role>('rm');
  const [profile, setProfile] = useState<UserProfile>(buildProfile('rm'));

  // Synchroniser le RoleContext avec l'utilisateur authentifié
  // (au démarrage et après refresh, le user est restauré depuis localStorage)
  useEffect(() => {
    if (user) {
      setRoleState(user.role);
      setProfile(buildProfile(user.role, user.name, user.email, user.initials, user.photoUrl));
      fetchMyProfile()
        .then(profileData => {
          const name = `${profileData.prenom} ${profileData.nom}`;
          const initials = `${profileData.prenom.charAt(0)}${profileData.nom.charAt(0)}`.toUpperCase();
          setProfile(buildProfile(user.role, name, profileData.email, initials, profileData.photoUrl));
        })
        .catch(() => {});
    } else {
      // Pas d'utilisateur connecté : reset au profil par défaut
      setRoleState('rm');
      setProfile(buildProfile('rm'));
    }
  }, [user]);

  useEffect(() => {
    const handleProfileUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ name: string; email: string; initials: string; role: Role; photoUrl?: string | null }>).detail;
      if (!detail) return;
      setRoleState(detail.role);
      setProfile(buildProfile(detail.role, detail.name, detail.email, detail.initials, detail.photoUrl));
    };

    window.addEventListener('s2s_profile_updated', handleProfileUpdated);
    return () => window.removeEventListener('s2s_profile_updated', handleProfileUpdated);
  }, []);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    setProfile(prev => buildProfile(newRole, prev.name, prev.email, prev.initials, prev.photoUrl));
  };

  const setProfileFromUser = (user: { name: string; email: string; initials: string; role: Role; photoUrl?: string | null }) => {
    setRoleState(user.role);
    setProfile(buildProfile(user.role, user.name, user.email, user.initials, user.photoUrl));
  };

  return (
    <RoleContext.Provider value={{ role, setRole, profile, setProfileFromUser }}>
      {children}
    </RoleContext.Provider>
  );
}
