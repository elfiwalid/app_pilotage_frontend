import { RouterProvider } from 'react-router';
import { router } from './routes';
import { RoleProvider } from './context/RoleContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <RouterProvider router={router} />
      </RoleProvider>
    </AuthProvider>
  );
}
