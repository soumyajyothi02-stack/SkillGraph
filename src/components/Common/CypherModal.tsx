import React, { useState } from 'react';
import { X, Copy, Check, Terminal, Database } from 'lucide-react';

interface CypherModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  query: string;
  params?: Record<string, any>;
  explanation?: string;
}

export const CypherModal: React.FC<CypherModalProps> = ({
  isOpen,
  onClose,
  title = 'openCypher Query Inspector',
  query,
  params = {},
  explanation,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#11110F]/80 backdrop-blur-xs animate-fade-in">
      <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2E2E2A] flex items-center justify-between bg-[#11110F]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-[#C87941]/10 border border-[#C87941]/30 flex items-center justify-center text-[#C87941]">
              <Terminal className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-[#F2EFE7] font-mono">{title}</h3>
              <p className="text-[11px] text-[#A7A39A] font-mono">CognoDB openCypher Parameterized Execution</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[#6E6A62] hover:text-[#F2EFE7] hover:bg-[#22221F] rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          {explanation && (
            <div className="p-3 bg-[#11110F] border border-[#2E2E2A] rounded text-xs text-[#A7A39A] leading-relaxed">
              <span className="font-semibold text-[#D8C7A5] font-mono">Why Graph Traversal: </span>
              {explanation}
            </div>
          )}

          {/* Cypher Query Box */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-mono uppercase tracking-wider text-[#A7A39A]">
                Cypher Query
              </span>
              <button
                onClick={handleCopy}
                className="inline-flex items-center gap-1 text-xs font-mono text-[#A7A39A] hover:text-[#F2EFE7] transition-colors"
              >
                {copied ? <Check className="w-3 h-3 text-[#7A9A7B]" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied' : 'Copy Query'}</span>
              </button>
            </div>
            <pre className="p-4 bg-[#11110F] border border-[#2E2E2A] rounded text-xs font-mono text-[#D8C7A5] overflow-x-auto leading-relaxed">
              <code>{query}</code>
            </pre>
          </div>

          {/* Parameters Box */}
          {params && Object.keys(params).length > 0 && (
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-[#A7A39A] block mb-1.5">
                Bound Query Parameters ($params)
              </span>
              <pre className="p-3 bg-[#11110F] border border-[#2E2E2A] rounded text-xs font-mono text-[#7A9A7B] overflow-x-auto">
                <code>{JSON.stringify(params, null, 2)}</code>
              </pre>
            </div>
          )}

          {/* Comparison vs Relational SQL */}
          <div className="pt-2 border-t border-[#2E2E2A] text-xs text-[#6E6A62] flex items-center gap-2 font-mono">
            <Database className="w-3.5 h-3.5 text-[#6E6A62]" />
            <span>
              Direct pointer traversal across relationship edges with O(1) index-free adjacency.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#2E2E2A] bg-[#11110F] flex justify-end">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-mono bg-[#191917] hover:bg-[#22221F] text-[#F2EFE7] border border-[#2E2E2A] rounded transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
