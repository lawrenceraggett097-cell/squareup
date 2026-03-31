import { useState } from 'react'
import { PasskeyIcon } from './PasskeyIcon'

interface EmailPageProps {
  onContinue: (email: string) => void
}

export function EmailPage({ onContinue }: EmailPageProps) {
  const [email, setEmail] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const hasValue = email.trim() !== ''
  const showLabel = !hasValue && !isFocused

  const isValidEmailOrPhone = (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/
    return emailRegex.test(value) || phoneRegex.test(value)
  }

  const handleContinue = () => {
    if (!email.trim() || !isValidEmailOrPhone(email.trim())) {
      setError('Please enter a valid email address or phone number.')
      return
    }

    setError('')
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      onContinue(email.trim())
    }, 800)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleContinue()
    }
  }

  return (
    <div>
      <h1 className="text-[28px] font-semibold text-[#1a1a1a] mb-4 tracking-tight">
        Sign in
      </h1>
      
      <p className="text-[15px] text-[#6b6b6b] mb-6">
        New to Square?{' '}
        <a href="#" className="text-[#1a1a1a] underline font-medium hover:text-black">
          Sign up
        </a>
      </p>

      {/* Input Field */}
      <div className="relative mb-4">
        <input
          type="text"
          id="email-input"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={handleKeyPress}
          autoComplete="email"
          className={`
            w-full h-14 px-4 pt-5 pb-2 
            border rounded-lg text-base text-[#1a1a1a] bg-white
            transition-all duration-200 outline-none
            hover:border-[#1a1a1a]
            focus:border-[#1a1a1a] focus:shadow-[0_0_0_2px_rgba(26,26,26,0.1)]
            ${error ? 'border-[#d32f2f]' : 'border-[#d1d1d1]'}
          `}
        />
        <label
          htmlFor="email-input"
          className={`
            absolute left-4 text-base text-[#6b6b6b] pointer-events-none
            transition-all duration-200 origin-top-left
            ${showLabel ? 'top-[18px]' : 'top-2 scale-[0.85]'}
          `}
        >
          Email or phone number
        </label>
      </div>

      {error && (
        <p className="text-[13px] text-[#d32f2f] mb-2">{error}</p>
      )}

      {/* Continue Button */}
      <button
        onClick={handleContinue}
        disabled={isLoading}
        className="
          w-full h-12 rounded-full text-[15px] font-semibold
          bg-[#1a1a1a] text-white
          hover:bg-black
          disabled:bg-[#e0e0e0] disabled:text-[#9e9e9e] disabled:cursor-not-allowed
          flex items-center justify-center gap-2
          transition-all duration-200
        "
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          'Continue'
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center my-5">
        <span className="flex-1 h-px bg-[#e0e0e0]" />
        <span className="px-4 text-sm text-[#6b6b6b]">or</span>
        <span className="flex-1 h-px bg-[#e0e0e0]" />
      </div>

      {/* Passkey Button */}
      <button
        className="
          w-full h-12 rounded-full text-[15px] font-semibold
          bg-[#f0f0f0] text-[#1a1a1a]
          hover:bg-[#e5e5e5]
          flex items-center justify-center gap-2
          transition-all duration-200
        "
      >
        <PasskeyIcon className="w-[18px] h-[18px]" />
        Sign in with a passkey
      </button>
    </div>
  )
}
