import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

const STATUS_COLORS = {
  'Pending':     { bg: 'rgba(217,119,6,0.1)', color: '#b45309' },
  'In Progress': { bg: 'rgba(224,95,160,0.12)', color: '#c04080' },
  'Done':        { bg: 'rgba(22,163,74,0.1)',  color: '#15803d' },
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
      <header style={s.header}>
        <div style={s.logo}>
          <img src="/logo.png" alt="Elevated Communication" style={{ height: 40, objectFit: 'contain' }} />
        </div>
        <div style={s.headerRight}>
          <span style={s.userEmail}>{user?.email}</span>
          <button onClick={signOut} style={s.signOutBtn}>Sign out</button>
        </div>
      </header>

      <main style={s.main}>
        <div style={s.statsRow}>
          {[
            { label: 'Total jobs', value: stats.total, color: '#1a1f63' },
            { label: 'Pending', value: stats.pending, color: '#b45309' },
            { label: 'In progress', value: stats.inProgress, color: '#c04080' },
            { label: 'Done', value: stats.done, color: '#15803d' },
          ].map(st => (
            <div key={st.label} style={s.statCard}>
              <div style={s.statLabel}>{st.label}</div>
              <div style={{ ...s.statVal, color: st.color }}>{st.value}</div>
            </div>
          ))}
        </div>

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

        {loading ? (
          <p style={{ color: '#5a5f8a', padding: '2rem 0' }}>Loading jobs…</p>
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
                    <select value={job.status} onChange={e => updateStatus(job.id, e.target.value)} style={s.miniSelect}>
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
                    <span style={{ fontSize: 13, color: '#5a5f8a' }}>{job.assigned_tech}</span>
                  </div>
                  <button onClick={() => deleteJob(job.id)} style={s.delBtn}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

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
                <input style={s.input} placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div style={s.field}>
              <label style={s.fieldLabel}>Description / notes</label>
              <textarea style={{ ...s.input, height: 80, resize: 'vertical' }} placeholder="Describe the job…" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
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
  page: { minHeight: '100vh', background: '#f8f7fa' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1.5rem', height: 64, borderBottom: '1px solid rgba(26,31,99,0.1)', background: '#1a1f63', position: 'sticky', top: 0, zIndex: 10 },
  logo: { display: 'flex', alignItems: 'center' },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  userEmail: { fontSize: 13, color: 'rgba(255,255,255,0.65)' },
  signOutBtn: { fontSize: 13, color: '#fff', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: '5px 12px', cursor: 'pointer' },
  main: { maxWidth: 900, margin: '0 auto', padding: '1.5rem' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginBottom: '1.5rem' },
  statCard: { background: '#fff', border: '1px solid rgba(26,31,99,0.08)', borderRadius: '12px', padding: '14px 16px', boxShadow: '0 1px 8px rgba(26,31,99,0.04)' },
  statLabel: { fontSize: 12, color: '#5a5f8a', marginBottom: 4 },
  statVal: { fontSize: 24, fontWeight: 600 },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: '1rem', flexWrap: 'wrap' },
  filters: { display: 'flex', gap: 8 },
  select: { background: '#fff', border: '1px solid rgba(26,31,99,0.15)', borderRadius: 8, color: '#1a1f63', padding: '7px 10px', fontSize: 13 },
  addBtn: { background: '#e05fa0', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' },
  jobList: { display: 'flex', flexDirection: 'column', gap: 10 },
  jobCard: { background: '#fff', border: '1px solid rgba(26,31,99,0.08)', borderRadius: '14px', padding: '1rem 1.25rem', boxShadow: '0 1px 8px rgba(26,31,99,0.04)' },
  jobTop: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  jobName: { fontSize: 15, fontWeight: 600, color: '#1a1f63' },
  jobAddr: { fontSize: 12, color: '#5a5f8a', marginTop: 2 },
  jobActions: { display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 },
  badge: { fontSize: 11, padding: '3px 10px', borderRadius: 99, fontWeight: 600 },
  miniSelect: { background: '#f8f7fa', border: '1px solid rgba(26,31,99,0.12)', borderRadius: 6, color: '#5a5f8a', padding: '3px 6px', fontSize: 11 },
  jobDesc: { fontSize: 13, color: '#5a5f8a', lineHeight: 1.5, marginBottom: 10 },
  jobFoot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  techPill: { display: 'flex', alignItems: 'center', gap: 7 },
  avatar: { width: 26, height: 26, borderRadius: '50%', background: 'rgba(224,95,160,0.12)', color: '#c04080', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  delBtn: { fontSize: 11, color: '#dc2626', background: 'none', border: 'none', padding: '2px 6px', borderRadius: 6, cursor: 'pointer' },
  empty: { textAlign: 'center', padding: '3rem', color: '#5a5f8a', fontSize: 14 },
  modalOverlay: { position: 'fixed', inset: 0, background: 'rgba(26,31,99,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 50 },
  modal: { background: '#fff', border: '1px solid rgba(26,31,99,0.12)', borderRadius: '16px', padding: '1.75rem', width: '100%', maxWidth: 420, boxShadow: '0 8px 40px rgba(26,31,99,0.12)' },
  modalTitle: { fontSize: 17, fontWeight: 600, color: '#1a1f63', marginBottom: '1.25rem' },
  field: { marginBottom: '1rem' },
  fieldLabel: { display: 'block', fontSize: 12, color: '#5a5f8a', marginBottom: 5, fontWeight: 500 },
  input: { width: '100%', background: '#f8f7fa', border: '1px solid rgba(26,31,99,0.15)', borderRadius: 8, color: '#1a1f63', padding: '9px 12px', fontSize: 13 },
  modalBtns: { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: '1.25rem' },
  cancelBtn: { background: 'none', border: '1px solid rgba(26,31,99,0.15)', borderRadius: 8, color: '#5a5f8a', padding: '8px 16px', fontSize: 13, cursor: 'pointer' },
}
