import type { FC } from 'react';

interface CircularProgressProps {
  percentage: number;
  color: string;
}

const CircularProgress: FC<CircularProgressProps> = ({ percentage, color }) => {
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <svg width="120" height="120" className="mx-auto">
      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke="lightgray"
        strokeWidth="10"
        fill="none"
      />
      <circle
        cx="60"
        cy="60"
        r={radius}
        stroke={color}
        strokeWidth="10"
        fill="none"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
      />
      <text
        x="60"
        y="60"
        textAnchor="middle"
        dy=".3em"
        fontSize="20"
        fill={color}
      >
        {percentage}%
      </text>
    </svg>
  );
};
export default CircularProgress;
