import { useId } from 'react';

interface AppLogoProps {
  size?: 'sm' | 'lg';
  className?: string;
}

const AppLogo = ({ size = 'lg', className }: AppLogoProps) => {
  const id = useId();
  const gradId = `logoGrad${id}`;
  const dollarGradId = `dollarGrad${id}`;

  const isSmall = size === 'sm';
  const viewBox = isSmall ? '0 0 40 40' : '0 0 64 64';
  const cx = isSmall ? 20 : 32;
  const cy = isSmall ? 20 : 32;
  const outerR = isSmall ? 18 : 28;
  const innerR = isSmall ? 15 : 24;
  const strokeW = isSmall ? 2 : 2.5;
  const fontSize = isSmall ? 20 : 32;
  const textY = isSmall ? 26 : 42;

  return (
    <svg viewBox={viewBox} fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="50%" stopColor="#a78bfa" />
          <stop offset="100%" stopColor="#c4b5fd" />
        </linearGradient>
        <linearGradient id={dollarGradId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cy} r={outerR} stroke={`url(#${gradId})`} strokeWidth={strokeW} fill="none" opacity="0.5" />
      <circle cx={cx} cy={cy} r={innerR} fill="rgba(139, 92, 246, 0.12)" />
      <text x={cx} y={textY} textAnchor="middle" fontSize={fontSize} fontWeight="700" fontFamily="system-ui, -apple-system, sans-serif" fill={`url(#${dollarGradId})`}>$</text>
    </svg>
  );
};

export default AppLogo;
