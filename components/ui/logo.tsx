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
        <div className="relative bg-blue-600 rounded-lg p-1.5">
          <Building2 className={cn(sizeClasses[size], 'text-white')} />
        </div>
      </div>
      {showText && (
        <span className={cn(
          'font-bold text-blue-600',
          textSizeClasses[size]
        )}>
          BuildPro
        </span>
      )}
    </div>
  );
}

