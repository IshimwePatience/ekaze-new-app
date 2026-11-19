import React from 'react';
import { Puzzle } from 'lucide-react';

interface CharacterIllustrationProps {
  type?: 'users' | 'workers' | 'companies' | 'incidents' | 'transactions' | 'requests' | 'default';
  title?: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  hideBubbles?: boolean;
  titleClassName?: string;
  descriptionClassName?: string;
}

export const CharacterIllustration: React.FC<CharacterIllustrationProps> = ({
  type = 'default',
  title,
  description,
  action,
  className = "w-24 h-24",
  titleClassName,
  descriptionClassName,
}) => {
  const renderPuzzleIcon = () => {
    return (
      <div className="flex items-center justify-center mb-4">
        <Puzzle className="w-24 h-24 text-[#2478b8] fill-[#2478b8] drop-shadow-sm transition-transform hover:scale-105" />
      </div>
    );
  };

  if (!title && !description && !action) {
    return renderPuzzleIcon();
  }

  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
      {renderPuzzleIcon()}
      {title && <h3 className={`text-base font-bold mt-2 mb-1 ${titleClassName || 'text-slate-900'}`}>{title}</h3>}
      {description && <p className={`text-xs max-w-sm mb-5 leading-relaxed ${descriptionClassName || 'text-slate-500'}`}>{description}</p>}
      {action && <div>{action}</div>}
    </div>
  );
};

export default CharacterIllustration;
