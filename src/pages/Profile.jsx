import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import { postAction } from '../api'
import Header from '../components/Header'
import styles from './Profile.module.css'

export default function Profile() {
  const { user, setUser, userLoading } = useUser()
  const navigate = useNavigate()

  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')

  const [message, setMessage] = useState({ text: '', type: '' })
  const [loading, setLoading] = useState(false)

  // Redirect if not logged in
  useEffect(() => {
    if (!userLoading && !user) {
      navigate('/login')
    }
    if (user) {
      setUsername(user.username || '')
      setEmail(user.email || '')
    }
  }, [user, userLoading, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/deva-anime/api/anime-api.php'}?action=update_profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, oldPassword, newPassword })
      })
      const data = await res.json()

      if (data.success) {
        setMessage({ text: data.message, type: 'success' })
        // Clear password fields on success
        setOldPassword('')
        setNewPassword('')
        // Update user context (only partial info is needed, but we can update username/email)
        setUser({ ...user, username, email })
      } else {
        setMessage({ text: data.message || 'Terjadi kesalahan.', type: 'error' })
      }
    } catch (err) {
      setMessage({ text: 'Gagal terhubung ke server.', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (userLoading || !user) return null

  return (
    <>
      <Header />
      <main className={styles.container}>
        <div className={styles.card}>
          <div className={styles.header}>
            <div className={styles.avatarLarge}>
              {user.username ? user.username[0].toUpperCase() : '?'}
            </div>
            <h2>Pengaturan Profil</h2>
            <p className={styles.roleBadge}>{user.role ? user.role.toUpperCase() : 'USER'}</p>
          </div>

          {message.text && (
            <div className={`${styles.alert} ${styles[message.type]}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                maxLength="15"
                pattern="^[a-zA-Z0-9_]{3,15}$"
                title="Username minimal 3 karakter, maksimal 15 karakter, dan hanya boleh berisi huruf, angka, atau underscore (_). Tanpa spasi."
              />
            </div>

            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className={styles.divider}>
              <span>Ganti Password (Opsional)</span>
            </div>

            <div className={styles.formGroup}>
              <label>Password Lama</label>
              <input
                type="password"
                placeholder="Masukkan jika ingin mengganti password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Password Baru</label>
              <input
                type="password"
                placeholder="Minimal 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button type="submit" className={styles.btnSave} disabled={loading}>
              {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>
          
          {user.created_at && (
            <p className={styles.memberSince}>
              Bergabung sejak: {new Date(user.created_at).toLocaleDateString('id-ID', {
                day: 'numeric', month: 'long', year: 'numeric'
              })}
            </p>
          )}
        </div>
      </main>
    </>
  )
}
