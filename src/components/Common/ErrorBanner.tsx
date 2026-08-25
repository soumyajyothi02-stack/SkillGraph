import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';

interface ErrorBannerProps {
  message?: string;
  onRetry?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  message = 'Unable to connect to the SkillGraph database. Please try again.',
  onRetry,
}) => {
  return (
    <div className="bg-[#C0614E]/10 border border-[#C0614E]/30 rounded-lg p-4 my-4 flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-4 h-4 text-[#C0614E] mt-0.5 shrink-0" />
        <div>
          <h4 className="text-xs font-semibold font-mono text-[#F2EFE7]">Database Connection Alert</h4>
          <p className="text-xs font-mono text-[#A7A39A] mt-1">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-mono text-[#F2EFE7] bg-[#191917] hover:bg-[#22221F] border border-[#2E2E2A] rounded transition-colors shrink-0"
        >
          <RefreshCcw className="w-3 h-3" />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
};
