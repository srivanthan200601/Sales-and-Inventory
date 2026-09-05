import React from 'react';

export const CopilotPage: React.FC = () => {
  return (
    <div className="glass-card">
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>AI Copilot Workspace</h3>
      <p style={{ color: 'var(--text-muted)' }}>Natural language AI assistant connected to LLM Tool Calling API.</p>
    </div>
  );
};
