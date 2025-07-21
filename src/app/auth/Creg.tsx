// File: src/app/auth/Creg.tsx
// Commit: Company registration form to insert into company_applications table

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Creg() {
  const [form, setForm] = useState({
    company_name: '',
    business_number: '',
    manager_name: '',
    manager_email: '',
    manager_phone: '',
    subscription_tier: '',
    subscription_start: '',
    subscription_end: '',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setSuccess(false)

    const { error: insertError } = await supabase
      .from('company_applications')
      .insert([form])

    if (insertError) {
      setError(insertError.message)
    } else {
      setSuccess(true)
      setForm({
        company_name: '',
        business_number: '',
        manager_name: '',
        manager_email: '',
        manager_phone: '',
        subscription_tier: '',
        subscription_start: '',
        subscription_end: '',
      })
    }

    setLoading(false)
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-white dark:bg-gray-900 text-black dark:text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white dark:bg-neutral-900 p-6 rounded shadow space-y-4">
        <h1 className="text-2xl font-semibold text-center mb-4">Register Your Company</h1>

        <input
          type="text"
          name="company_name"
          value={form.company_name}
          onChange={handleChange}
          placeholder="Company Name"
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="text"
          name="business_number"
          value={form.business_number}
          onChange={handleChange}
          placeholder="Business Number"
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="text"
          name="manager_name"
          value={form.manager_name}
          onChange={handleChange}
          placeholder="Manager Name"
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="email"
          name="manager_email"
          value={form.manager_email}
          onChange={handleChange}
          placeholder="Manager Email"
          className="w-full px-4 py-2 border rounded"
          required
        />
        <input
          type="tel"
          name="manager_phone"
          value={form.manager_phone}
          onChange={handleChange}
          placeholder="Manager Phone"
          className="w-full px-4 py-2 border rounded"
        />
        <select
          name="subscription_tier"
          value={form.subscription_tier}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded"
        >
          <option value="">Select Subscription Tier</option>
          <option value="basic">Basic</option>
          <option value="pro">Pro</option>
          <option value="enterprise">Enterprise</option>
        </select>
        <input
          type="month"
          name="subscription_start"
          value={form.subscription_start}
          onChange={(e) => {
            const value = e.target.value
            setForm((prev) => ({
              ...prev,
              subscription_start: `${value}-01`,
            }))
          }}
          placeholder="Subscription Start (YYYY-MM)"
          className="w-full px-4 py-2 border rounded"
        />
        <input
          type="month"
          name="subscription_end"
          value={form.subscription_end}
          onChange={(e) => {
            const value = e.target.value
            setForm((prev) => ({
              ...prev,
              subscription_end: `${value}-01`,
            }))
          }}
          placeholder="Subscription End (YYYY-MM)"
          className="w-full px-4 py-2 border rounded"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}
        {success && <p className="text-sm text-green-600">Application submitted successfully.</p>}
      </form>
    </main>
  )
}
