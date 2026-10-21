
import React from 'react';
import { PixoraProvider, usePixora } from './context/PixoraContext';
import { UserApp } from './components/UserApp';
import { AdminApp } from './components/AdminApp';
import { AuthScreen } from './components/AuthScreen';

const AppContent: React.FC = () => {
  const { currentView, hasActiveAccount } = usePixora();

  if (currentView === 'admin') {
    return <AdminApp />;
  }

  if (!hasActiveAccount) {
    return <AuthScreen />;
  }

  return <UserApp />;
};

export default function App() {
  return (
    <PixoraProvider>
      <AppContent />
    </PixoraProvider>
  );
}
