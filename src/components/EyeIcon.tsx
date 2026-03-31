interface EyeIconProps {
  className?: string
}

export function EyeIcon({ className = '' }: EyeIconProps) {
  return (
    <svg 
      className={className}
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M12 5C7.5 5 3.7 7.6 2 12C3.7 16.4 7.5 19 12 19C16.5 19 20.3 16.4 22 12C20.3 7.6 16.5 5 12 5ZM12 17C9.2 17 7 14.8 7 12C7 9.2 9.2 7 12 7C14.8 7 17 9.2 17 12C17 14.8 14.8 17 12 17ZM12 9C10.3 9 9 10.3 9 12C9 13.7 10.3 15 12 15C13.7 15 15 13.7 15 12C15 10.3 13.7 9 12 9Z" 
        fill="currentColor"
      />
    </svg>
  )
}
