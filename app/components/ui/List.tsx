import React from 'react';

interface ListProps {
  children: React.ReactNode;
  className?: string;
}

function List({ children, className = '' }: ListProps) {
  return <div className={`max-h-80 space-y-3 overflow-y-auto pr-2 custom-scrollbar ${className}`}>{children}</div>;
}

export default React.memo(List);
