import React, { useState } from 'react';
import { AppLayout } from './components/layout/AppLayout';
import { AppRouter } from './routes';
import { TabType } from './types';
import '../../styles.css';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  return (
    <AppLayout
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onOpenCopilot={() => setActiveTab('copilot')}
    >
      <AppRouter activeTab={activeTab} />
    </AppLayout>
  );
};

export default App;
