import { createBrowserRouter, Navigate } from 'react-router';
import { MainLayout } from './components/layout/MainLayout';
import { Login } from './pages/Login';
import { Documentation } from './pages/Documentation';

// RM Pages
import { Dashboard as RmDashboard } from './pages/Dashboard';
import { Resources } from './pages/Resources';
import { Projects } from './pages/Projects';
import { Conflicts } from './pages/Conflicts';
import { Simulation } from './pages/Simulation';
import { Settings } from './pages/Settings';
import { RmProfile } from './pages/rm/Profile';
import { RmNotifications } from './pages/rm/Notifications';
import { Import } from './pages/Import';
import { Conversations } from './pages/Conversations';

// PM Pages
import { PmDashboard } from './pages/pm/Dashboard';
import { PmProjects } from './pages/pm/Projects';
import { PmAnomalies } from './pages/pm/Anomalies';
import { PmReports } from './pages/pm/Reports';
import { PmProfile } from './pages/pm/Profile';
import { PmNotifications } from './pages/pm/Notifications';

// Collab Pages
import { CollabDashboard } from './pages/collab/Dashboard';
import { CollabMyProjects } from './pages/collab/MyProjects';
import { CollabSchedule } from './pages/collab/Schedule';
import { CollabNotifications } from './pages/collab/Notifications';
import { CollabProfile } from './pages/collab/Profile';

export const router = createBrowserRouter(
  [
    { path: '/login', Component: Login },
    {
      path: '/',
      Component: MainLayout,
      children: [
        // Resource Manager
        { index: true, Component: RmDashboard },
        { path: 'resources', Component: Resources },
        { path: 'projects', Component: Projects },
        { path: 'import', Component: Import },
        { path: 'conflicts', Component: Conflicts },
        { path: 'simulation', Component: Simulation },
        { path: 'conversations', Component: Conversations },
        { path: 'settings', Component: Settings },
        { path: 'rm/profile', Component: RmProfile },
        { path: 'rm/notifications', Component: RmNotifications },
        { path: 'documentation', Component: Documentation },
        { path: 'guide', element: <Navigate to="/documentation" replace /> },

        // Project Manager
        { path: 'pm', Component: PmDashboard },
        { path: 'pm/projects', Component: PmProjects },
        { path: 'pm/anomalies', Component: PmAnomalies },
        { path: 'pm/reports', Component: PmReports },
        { path: 'pm/conversations', Component: Conversations },
        { path: 'pm/profile', Component: PmProfile },
        { path: 'pm/notifications', Component: PmNotifications },

        // Collaborator
        { path: 'collab', Component: CollabDashboard },
        { path: 'collab/projects', Component: CollabMyProjects },
        { path: 'collab/schedule', Component: CollabSchedule },
        { path: 'collab/notifications', Component: CollabNotifications },
        { path: 'collab/profile', Component: CollabProfile },

        { path: '*', element: <Navigate to="/" replace /> },
      ],
    },
  ]
);
