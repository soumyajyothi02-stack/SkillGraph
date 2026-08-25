import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'skill'
    | 'tech'
    | 'role'
    | 'company'
    | 'beginner'
    | 'intermediate'
    | 'advanced'
    | 'expert'
    | 'neutral'
    | 'accent';
  className?: string;
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs';

  const variantClasses: Record<string, string> = {
    skill:
      'bg-[#C87941]/10 text-[#E08C50] border border-[#C87941]/30',
    tech:
      'bg-[#D8C7A5]/10 text-[#D8C7A5] border border-[#D8C7A5]/30',
    role:
      'bg-[#7A9A7B]/10 text-[#92B293] border border-[#7A9A7B]/30',
    company:
      'bg-[#C0614E]/10 text-[#D47562] border border-[#C0614E]/30',
    beginner:
      'bg-[#7A9A7B]/10 text-[#8CA88D] border border-[#7A9A7B]/30',
    intermediate:
      'bg-[#D8C7A5]/10 text-[#D8C7A5] border border-[#D8C7A5]/30',
    advanced:
      'bg-[#C87941]/10 text-[#E08C50] border border-[#C87941]/30',
    expert:
      'bg-[#C0614E]/10 text-[#D47562] border border-[#C0614E]/30',
    neutral:
      'bg-[#191917] text-[#A7A39A] border border-[#2E2E2A]',
    accent:
      'bg-[#C87941]/15 text-[#F2EFE7] border border-[#C87941]/40',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-mono tracking-tight font-medium ${sizeClasses} ${
        variantClasses[variant] || variantClasses.neutral
      } ${className}`}
    >
      {children}
    </span>
  );
};
