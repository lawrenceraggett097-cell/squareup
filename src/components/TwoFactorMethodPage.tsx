import { useState } from 'react'
import { MessageSquare, Phone, Mail } from 'lucide-react'

interface TwoFactorMethodPageProps {
  email: string
  onContinue: (method: string) => void
  onCancel: () => void
}

export function TwoFactorMethodPage({ email, onContinue, onCancel }: TwoFactorMethodPageProps) {
  const [selectedMethod, setSelectedMethod] = useState('sms')
  const [isLoading, setIsLoading] = useState(false)

  const handleContinue = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      onContinue(selectedMethod)
    }, 800)
  }

  const methods = [
    { id: 'sms', label: 'A text message to your phone', icon: MessageSquare },
    { id: 'phone', label: 'A phone call to your phone', icon: Phone },
    { id: 'email', label: `An email to ${email}`, icon: Mail }
  ]

  return (
    <div>
      <h1 className="text-[28px] font-semibold text-[#1a1a1a] mb-4 tracking-tight">
        Verify it's you
      </h1>
      
      <p className="text-[15px] text-[#6b6b6b] mb-6">
        Choose how you'd like to receive your verification code.
      </p>

      {/* Method List */}
      <div className="space-y-3 mb-8">
        {methods.map((method) => {
          const Icon = method.icon
          return (
            <label
              key={method.id}
              className={`
                flex items-center gap-4 p-4 rounded-xl border cursor-pointer
                transition-all duration-200
                ${selectedMethod === method.id 
                  ? 'border-[#1a1a1a] bg-[#f8f8f8]' 
                  : 'border-[#e0e0e0] hover:border-[#1a1a1a]'
                }
              `}
            >
              <input
                type="radio"
                name="2fa-method"
                value={method.id}
                checked={selectedMethod === method.id}
                onChange={() => setSelectedMethod(method.id)}
                className="w-5 h-5 accent-[#1a1a1a] cursor-pointer"
              />
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${selectedMethod === method.id ? 'text-[#1a1a1a]' : 'text-[#6b6b6b]'}`} />
                <span className="text-[15px] text-[#1a1a1a] font-medium">
                  {method.label}
                </span>
              </div>
            </label>
          )
        })}
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
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

        <button
          onClick={onCancel}
          disabled={isLoading}
          className="
            w-full h-12 rounded-full text-[15px] font-semibold
            bg-transparent text-[#1a1a1a]
            hover:bg-[#f5f5f5]
            transition-all duration-200
          "
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
