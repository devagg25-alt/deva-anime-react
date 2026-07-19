import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Header'
import styles from './Login.module.css' // We can reuse the styling from login page

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/deva-anime/api/anime-api.php'}?action=register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json()
      
      if (data.success) {
        setSuccess(data.message || 'Registrasi berhasil! Mengalihkan ke login...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(data.message || 'Gagal mendaftar. Silakan coba lagi.')
      }
    } catch (err) {
      setError('Terjadi kesalahan jaringan. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Header />
      <div className={styles.container}>
        <div className={styles.formCard}>
          <h2 className={styles.title}>Buat Akun</h2>
          <p className={styles.subtitle}>Silakan isi data berikut untuk mendaftar</p>

          {error && <div className={styles.errorBox}>⚠️ {error}</div>}
          {success && (
            <div style={{
              background: 'rgba(0, 255, 102, 0.1)',
              border: '1px solid rgba(0, 255, 102, 0.3)',
              color: 'var(--accent)',
              padding: '12px',
              borderRadius: '6px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              ✓ {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Buat username Anda"
                required
                maxLength="15"
                pattern="^[a-zA-Z0-9_]{3,15}$"
                title="Username minimal 3 karakter, maksimal 15 karakter, dan hanya boleh berisi huruf, angka, atau underscore (_). Tanpa spasi."
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Masukkan email aktif"
                required
                className={styles.input}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Buat password minimal 6 karakter"
                required
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Mendaftarkan...' : 'Daftar Akun'}
            </button>
          </form>

          <p className={styles.footerText}>
            Sudah punya akun? <Link to="/login">Masuk sekarang</Link>
          </p>
        </div>
      </div>
    </>
  )
}
