import { FC } from 'react';

interface HexLogoProps {
  size?: number;
  filled?: boolean;
}

const HexLogo: FC<HexLogoProps> = ({ size = 24, filled = false }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? '#10131c' : 'none'}
      stroke="#dea001"
      strokeWidth="2"
      strokeLinejoin="round"
    >
      <polygon points="12 2 22 8 22 16 12 22 2 16 2 8 12 2" />
    </svg>
  );
};

export default HexLogo;
