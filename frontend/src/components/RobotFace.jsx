export default function RobotFace({ size = 32 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
      <rect width="32" height="32" rx="6" fill="#0D9488" />
      <text x="16" y="22" textAnchor="middle" fontFamily="Inter,system-ui,sans-serif" fontWeight="700" fontSize="14" fill="#FFFFFF">DA</text>
    </svg>
  );
}
