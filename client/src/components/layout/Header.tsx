import React from 'react';

interface HeaderProps {
  title: string;
  onOpenCopilot: () => void;
}

export const Header: React.FC<HeaderProps> = ({ title, onOpenCopilot }) => {
  return (
    <header className="top-header">
      <div className="page-title-area">
        <h2>{title}</h2>
      </div>

      <div className="header-actions">
        <div className="search-box">
          <input type="text" placeholder="Global search (SKU, product, PO...)" />
        </div>

        <button className="btn btn-copilot" onClick={onOpenCopilot}>
          🤖 AI Copilot
        </button>
      </div>
    </header>
  );
};
