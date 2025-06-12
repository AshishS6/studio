import type { SVGProps } from 'react';

const AppLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 200 50"
    width="120"
    height="30"
    aria-label="ReferralFlow Logo"
    {...props}
  >
    <defs>
      <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    <path
      d="M10 40 C15 10, 35 10, 40 40 C35 30, 15 30, 10 40 Z"
      fill="url(#logoGradient)"
      transform="rotate(-15 25 25)"
    >
      <animateTransform
        attributeName="transform"
        type="rotate"
        from="-15 25 25"
        to="345 25 25"
        dur="10s"
        repeatCount="indefinite"
      />
    </path>
    <text
      x="55"
      y="35"
      fontFamily="Inter, sans-serif"
      fontSize="30"
      fontWeight="bold"
      fill="hsl(var(--foreground))"
      className="font-headline"
    >
      ReferralFlow
    </text>
  </svg>
);

export default AppLogo;
