import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ className, size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg blur-sm opacity-50"></div>
        <div className="relative bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-lg p-1.5">
          <Building2 className={cn(sizeClasses[size], 'text-white')} />
        </div>
      </div>
      {showText && (
        <span className={cn(
          'font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent',
          textSizeClasses[size]
        )}>
          BuildPro
        </span>
      )}
    </div>
  );
}

