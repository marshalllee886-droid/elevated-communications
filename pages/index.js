import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Login() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logoWrap}>
          <img src="/logo.png" alt="Elevated Communication" style={{ width: 200, objectFit: 'contain' }} />
        </div>
        <h1 style={styles.heading}>Welcome back</h1>
        <p style={styles.sub}>Sign in to view your jobs</p>
        <form onSubmit={handleLogin} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={styles.input} placeholder="you@example.com" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={styles.input} placeholder="••••••••" />
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    background: 'linear-gradient(135deg, #f8f7fa 0%, #ede8f5 100%)',
  },
  card: {
    background: '#ffffff',
    border: '1px solid rgba(26,31,99,0.1)',
    borderRadius: '20px',
    padding: '2.5rem',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 40px rgba(26,31,99,0.08)',
  },
  logoWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '1.5rem',
    background: '#1a1f63',
    borderRadius: '12px',
    padding: '16px',
  },
  heading: { fontSize: '22px', fontWeight: 600, color: '#1a1f63', marginBottom: '6px', textAlign: 'center' },
  sub: { fontSize: '14px', color: '#5a5f8a', marginBottom: '1.75rem', textAlign: 'center' },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', color: '#5a5f8a', fontWeight: 500 },
  input: {
    background: '#f8f7fa',
    border: '1px solid rgba(26,31,99,0.15)',
    borderRadius: '10px',
    color: '#1a1f63',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
  },
  error: { fontSize: '13px', color: '#dc2626', background: 'rgba(220,38,38,0.06)', padding: '10px 12px', borderRadius: '8px' },
  btn: {
    background: '#e05fa0',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 600,
    marginTop: '4px',
    cursor: 'pointer',
  },
}
