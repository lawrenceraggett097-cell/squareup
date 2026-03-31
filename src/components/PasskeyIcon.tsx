interface PasskeyIconProps {
  className?: string
}

export function PasskeyIcon({ className = '' }: PasskeyIconProps) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M10.5 12a4.5 4.5 0 100-9 4.5 4.5 0 000 9zM22.5 12a3.5 3.5 0 10-5 3.15v5.35L19 22l2.5-2.5L20 18l1.5-1.5-1.24-1.24A3.5 3.5 0 0022.5 12zM19 12a1 1 0 110-2 1 1 0 010 2zM14.44 14.02A6 6 0 0012 13.5H9a6 6 0 00-6 6v2h13v-5.51a5.16 5.16 0 01-1.56-1.97z" fill="currentColor"></path>
    </svg>
  )
}
