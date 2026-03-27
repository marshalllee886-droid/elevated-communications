import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const STATUS_COLORS = {
  'Pending':     { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
  'In Progress': { bg: 'rgba(79,142,247,0.12)', color: '#4f8ef7' },
  'Done':        { bg: 'rgba(34,197,94,0.12)',  color: '#22c55e' },
}

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTech, setFilterTech] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ customer_name: '', address: '', description: '', assigned_tech: '', status: 'Pending' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.push('/'); return }
      setUser(user)
      fetchJobs()
    })
  }, [])

  async function fetchJobs() {
    setLoading(true)
    const { data } = await supabase.from('jobs').select('*').order('created_at', { ascending: false })
    setJobs(data || [])
    setLoading(false)
  }

  async function addJob() {
    if (!form.customer_name || !form.assigned_tech) return
    setSaving(true)
    await supabase.from('jobs').insert([form])
    setForm({ customer_name: '', address: '', description: '', assigned_tech: '', status: 'Pending' })
    setShowModal(false)
    setSaving(false)
    fetchJobs()
  }

  async function updateStatus(id, status) {
    await supabase.from('jobs').update({ status }).eq('id', id)
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status } : j))
  }

  async function deleteJob(id) {
    if (!confirm('Remove this job?')) return
    await supabase.from('jobs').delete().eq('id', id)
    setJobs(prev => prev.filter(j => j.id !== id))
  }

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
  }

  const techs = [...new Set(jobs.map(j => j.assigned_tech))].sort()
  const filtered = jobs.filter(j =>
    (!filterTech || j.assigned_tech === filterTech) &&
    (!filterStatus || j.status === filterStatus)
  )

  const stats = {
    total: jobs.length,
    pending: jobs.filter(j => j.status === 'Pending').length,
    inProgress: jobs.filter(j => j.status === 'In Progress').length,
    done: jobs.filter(j => j.status === 'Done').length,
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>
          <span style={{ fontSize: 20 }}>⚡</span>
          <span style={s.logoText}>Elevated Communications</span>
        </div>
        <div style={s.headerRight}>
          <span style={s.userEmail}>{user?.email}</span>
          <button onClick={signOut} style={s.signOutBtn}>Sign out</button>
        </div>
      </header>

      <main style={s.main}>
        {/* Stats */}
        <div style={s.statsRow}>
          {[
            { label: 'Total jobs', value: stats.total },
            { label: 'Pending', value: stats.pending, color: '#f59e0b' },
            { label: 'In progress', value: stats.inProgress, color: '#4f8ef7' },
            { label: 'Done', value: stats.done, color: '#22c55e' },
          ].map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={s.statLabel}>{st.label}</div>
              <div style={{ ...s.statVal, color: st.color || 'var(--text)' }}>{st.value}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={s.toolbar}>
          <div style={s.filters}>
            <select value={filterTech} onChange={e => setFilterTech(e.target.value)} style={s.select}>
              <option value="">All techs</option>
              {techs.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={s.select}>
              <option value="">All statuses</option>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>
          <button onClick={() => setShowModal(true)} style={s.addBtn}>+ Add job</button>
        </div>

        {/* Job list */}
        {loading ? (
          <p style={{ color: 'var(--text2)', padding: '2rem 0' }}>Loading jobs…</p>
        ) : filtered.length === 0 ? (
          <div style={s.empty}>No jobs found. Hit "Add job" to create one.</div>
        ) : (
          <div style={s.jobList}>
            {filtered.map(job => (
              <div key={job.id} style={s.jobCard}>
                <div style={s.jobTop}>
                  <div>
                    <div style={s.jobName}>{job.customer_name}</div>
                    {job.address && <div style={s.jobAddr}>{job.address}</div>}
                  </div>
                  <div style={s.jobActions}>
                    <span style={{ ...s.badge, ...STATUS_COLORS[job.status] }}>{job.status}</span>
                    <select
                      value={job.status}
                      onChange={e => updateStatus(job.id, e.target.value)}
                      style={s.miniSelect}
                    >
                      <option>Pending</option>
                      <option>In Progress</option>
                      <option>Done</option>
                    </select>
                  </div>
                </div>
                {job.description && <p style={s.jobDesc}>{job.description}</p>}
                <div style={s.jobFoot}>
                  <div style={s.techPill}>
                    <div style={s.avatar}>{job.assigned_tech.slice(0,2).toUpperCase()}</div>
                    <span style={{ fontSize: 13, color: 'var(--text2)' }}>{job.assigned_tech}</span>
                  </div>
                  <button onClick={() => deleteJob(job.id)} style={s.delBtn}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Add Job Modal */}
      {showModal && (
        <div style={s.modalOverlay} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div style={s.modal}>
            <h2 style={s.modalTitle}>New job</h2>
            {[
              { label: 'Customer name *', key: 'customer_name', placeholder: 'e.g. Acme Corp' },
              { label: 'Address', key: 'address', placeholder: '123 Main St, City' },
              { label: 'Assigned tech *', key: 'assigned_tech', placeholder: 'Tech name' },
            ].map(f => (
              <div key={f.key} style={s.field}>
                <label style={s.fieldLabel}>{f.label}</label>
                <input
                  style={s.input}
                  placeholder={f.placeholder}
                  value={form[f.key]}
                  onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div style={s.field}>
              <label style={s.fieldLabel}>Description / notes</label>
              <textarea
                style={{ ...s.input, height: 80, resize: 'vertical' }}
                placeholder="Describe the job…"
                value={form.description}
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
              />
            </div>
            <div style={s.field}>
              <label style={s.fieldLabel}>Status</label>
              <select style={s.input} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option>Pending</option>
                <option>In Progress</option>
                <option>Done</option>
              </select>
            </div>
            <div style={s.modalBtns}>
              <button onClick={() => setShowModal(false)} style={s.cancelBtn}>Cancel</button>
              <button onClick={addJob} style={s.addBtn} disabled={saving}>{saving ? 'Saving…' : 'Add job'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  page: { minHeight: '100vh', background: 'var(--bg)' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: 58, borderBottom: '1px solid var(--border)', background: 'var(--bg2)', position: 'sticky', top: 0, zIndex: 10 },
  logo: { display: 'flex', alignItems: 'center', gap: 10 },
  logoText: { fontSize: 15, fontWeight: 500 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  userEmail: { fontSize: 13, color: 'var(--text2)' },
  signOutBtn: { fontSize: 13, color: 'var(--text2)', background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '5px 12px' },
  main: { maxWidth: 900, margin: '0 auto', padding: '1.5rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: '1.5rem' },
  statCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '14px 16px' },
  statLabel: { fontSize: 12, color: 'var(--text2)', marginBottom: 4 },
  statVal: { fontSize: 24, fontWeight: 600 },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' },
  filters: { display: 'flex', gap: 8 },
  select: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '7px 10px', fontSize: 13 },
  addBtn: { background: 'var(--accent)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 500 },
  jobList: { display: 'flex', flexDirection: 'column', gap: 10 },
  jobCard: { background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.25rem' },
  jobTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  jobName: { fontSize: 15, fontWeight: 500 },
  jobAddr: { fontSize: 12, color: 'var(--text2)', marginTop: 2 },
  jobActions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  badge: { fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 500 },
  miniSelect: { background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 6, color: 'var(--text2)', padding: '3px 6px', fontSize: 11 },
  jobDesc: { fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 10 },
  jobFoot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  techPill: { display: 'flex', alignItems: 'center', gap: 7 },
  avatar: { width: 24, height: 24, borderRadius: '50%', background: 'rgba(79,142,247,0.15)', color: '#4f8ef7', fontSize: 10, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  delBtn: { fontSize: 11, color: 'var(--danger)', background: 'none', border: 'none', padding: '2px 6px', borderRadius: 6 },
  empty: { textAlign: 'center', padding: '3rem', color: 'var(--text2)', fontSize: 14 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 },
  modal: { background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: 'var(--radius-lg)', padding: '1.75rem', width: '100%', maxWidth: 420 },
  modalTitle: { fontSize: 17, fontWeight: 500, marginBottom: '1.25rem' },
  field: { marginBottom: '1rem' },
  fieldLabel: { display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 5, fontWeight: 500 },
  input: { width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '9px 12px', fontSize: 13 },
  modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '1.25rem' },
  cancelBtn: { background: 'none', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text2)', padding: '8px 16px', fontSize: 13 },
}
