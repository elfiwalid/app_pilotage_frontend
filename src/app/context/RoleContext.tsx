import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

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
  setProfileFromUser: (user: { name: string; email: string; initials: string; role: Role }) => void;
}

function buildProfile(role: Role, name = '', email = '', initials = ''): UserProfile {
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
      setProfile(buildProfile(user.role, user.name, user.email, user.initials));
    } else {
      // Pas d'utilisateur connecté : reset au profil par défaut
      setRoleState('rm');
      setProfile(buildProfile('rm'));
    }
  }, [user]);

  const setRole = (newRole: Role) => {
    setRoleState(newRole);
    setProfile(prev => buildProfile(newRole, prev.name, prev.email, prev.initials));
  };

  const setProfileFromUser = (user: { name: string; email: string; initials: string; role: Role }) => {
    setRoleState(user.role);
    setProfile(buildProfile(user.role, user.name, user.email, user.initials));
  };

  return (
    <RoleContext.Provider value={{ role, setRole, profile, setProfileFromUser }}>
      {children}
    </RoleContext.Provider>
  );
}
