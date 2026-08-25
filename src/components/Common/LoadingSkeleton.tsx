import React from 'react';

export const CardSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-[#191917] border border-[#2E2E2A] rounded p-4 animate-pulse flex flex-col gap-2.5"
        >
          <div className="flex justify-between items-center">
            <div className="h-4 bg-[#22221F] rounded w-1/2"></div>
            <div className="h-3.5 bg-[#22221F] rounded w-14"></div>
          </div>
          <div className="h-3 bg-[#22221F] rounded w-full"></div>
          <div className="h-3 bg-[#22221F] rounded w-4/5"></div>
          <div className="mt-3 pt-2.5 border-t border-[#2E2E2A] flex gap-2">
            <div className="h-4 bg-[#22221F] rounded w-16"></div>
            <div className="h-4 bg-[#22221F] rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="bg-[#191917] border border-[#2E2E2A] rounded-lg p-6 animate-pulse space-y-5">
      <div className="flex justify-between items-start">
        <div className="space-y-2 w-2/3">
          <div className="h-6 bg-[#22221F] rounded w-1/2"></div>
          <div className="h-3.5 bg-[#22221F] rounded w-1/3"></div>
        </div>
        <div className="h-6 bg-[#22221F] rounded w-20"></div>
      </div>
      <div className="h-12 bg-[#22221F] rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="h-28 bg-[#11110F] border border-[#2E2E2A] rounded"></div>
        <div className="h-28 bg-[#11110F] border border-[#2E2E2A] rounded"></div>
      </div>
    </div>
  );
};
