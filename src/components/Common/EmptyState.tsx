import React from 'react';
import { SearchX, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No results found',
  description = 'Try adjusting your search criteria, clearing filters, or exploring related graph nodes.',
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[#191917] border border-dashed border-[#2E2E2A] rounded-lg my-6">
      <div className="w-10 h-10 rounded bg-[#11110F] border border-[#2E2E2A] flex items-center justify-center text-[#6E6A62] mb-3">
        <SearchX className="w-5 h-5" />
      </div>
      <h3 className="text-sm font-semibold font-mono text-[#F2EFE7] mb-1">{title}</h3>
      <p className="text-xs text-[#A7A39A] max-w-md mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#F2EFE7] bg-[#22221F] hover:bg-[#282824] border border-[#2E2E2A] rounded transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
