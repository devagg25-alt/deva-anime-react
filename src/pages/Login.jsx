import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'
import Header from '../components/Header'
import styles from './Login.module.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)
  const navigate                = useNavigate()
  const { setUser }             = useUser() // Ambil setUser dari Context global

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || '/deva-anime/api/anime-api.php'}?action=login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Pastikan cookie session PHP ikut dikirim
        body: JSON.stringify({ username, password })
      })
      const data = await res.json()
      
      if (data.success) {
        // Perbarui Context global → semua komponen langsung tahu user sudah login
        setUser(data.user)

        if (data.user.role === 'admin') {
          // URL Admin diambil dari env variable agar bisa diubah sesuai hosting
          window.location.href = import.meta.env.VITE_ADMIN_URL || 'http://localhost/deva-anime/admin/'
        } else {
          navigate('/')   // Redirect ke Home tanpa perlu reload — Context sudah diperbarui
        }
      } else {
        setError(data.message || 'Username atau password salah.')
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
          <h2 className={styles.title}>Selamat Datang</h2>
          <p className={styles.subtitle}>Silakan masuk ke akun DevaAnime Anda</p>

          {error && <div className={styles.errorBox}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username Anda"
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
                placeholder="Masukkan password Anda"
                required
                className={styles.input}
              />
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? 'Memproses...' : 'Masuk Ke Akun'}
            </button>
          </form>

          <p className={styles.footerText}>
            Belum punya akun? <Link to="/register">Daftar sekarang</Link>
          </p>
        </div>
      </div>
    </>
  )
}
