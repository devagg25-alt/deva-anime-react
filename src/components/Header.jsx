// Header.jsx
// Komponen navigasi atas yang muncul di semua halaman
// - Transparan di hero, blur saat di-scroll
// - Menampilkan nama user jika sudah login
// - Tombol logout mengakhiri session PHP via UserContext (state global terpusat)

import { Link, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useUser } from '../context/UserContext'
import styles from './Header.module.css'

export default function Header() {
  // Ambil user dan fungsi logout dari Context global (bukan state lokal)
  const { user, logout } = useUser()
  const navigate = useNavigate()
  // State: apakah halaman sudah di-scroll (untuk efek blur)
  const [isScrolled, setIsScrolled] = useState(false)
  // State: apakah menu mobile sedang terbuka
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  // State: tampilkan konfirmasi logout
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  // Pasang listener scroll saat komponen pertama muncul
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Tutup menu mobile saat rute berubah (opsional, tapi bagus untuk UX)
  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  // Keluar akun: panggil logout dari Context → state user langsung null di SEMUA komponen
  const handleLogout = async () => {
    setShowLogoutConfirm(false)
    await logout()
    // Tidak perlu reload — React Context langsung menyebarkan perubahan ke seluruh tree
    // Arahkan ke home agar halaman kembali bersih
    navigate('/')
  }

  return (
    <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.inner}>

        {/* Logo */}
        <Link to="/" className={styles.logo}>
          Deva<span>Anime</span>
        </Link>

        {/* Menu Navigasi */}
        <nav className={`${styles.nav} ${isMobileMenuOpen ? styles.navOpen : ''}`}>
          <Link to="/" onClick={closeMobileMenu}>Home</Link>
          <Link to="/search" onClick={closeMobileMenu}>Discovery</Link>

          {/* Menu khusus user yang sudah login */}
          {user && <Link to="/search?my_list=1" onClick={closeMobileMenu}>My List</Link>}
          {user && <Link to="/profile" onClick={closeMobileMenu} className={styles.mobileOnly}>Profil</Link>}

          {/* Menu khusus admin */}
          {user?.role === 'admin' && (
            <a href={import.meta.env.VITE_ADMIN_URL || 'http://localhost/deva-anime/admin/'} className={styles.adminLink} onClick={closeMobileMenu}>
              Admin CMS
            </a>
          )}
          
          {/* Tombol Logout khusus Mobile (di dalam hamburger menu) */}
          {user && (
            <button 
              onClick={(e) => { e.preventDefault(); setShowLogoutConfirm(true); closeMobileMenu(); }} 
              className={`${styles.mobileOnly} ${styles.mobileLogoutBtn}`}
            >
              Keluar Akun
            </button>
          )}
        </nav>

        {/* Kanan: icon pencarian + info user */}
        <div className={styles.right}>
          <Link to="/search" className={styles.searchBtn} title="Cari anime">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </Link>

          {user ? (
            // User sudah login: tampilkan avatar + nama + tombol logout
            <div className={styles.profileContainer}>
              <Link to="/profile" className={styles.profile} title="Pengaturan Profil">
                <div className={styles.avatar}>
                  {user.username ? user.username[0].toUpperCase() : '?'}
                </div>
                <span>
                  {user.username 
                    ? (user.username.length > 15 ? user.username.substring(0, 15) + '...' : user.username)
                    : 'User'}
                </span>
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); setShowLogoutConfirm(true); }}
                className={styles.logoutBtn}
                title="Keluar dari akun"
              >
                ⇥
              </button>
            </div>
          ) : (
            // Belum login: tampilkan tombol Login
            <Link to="/login" className={styles.loginBtn}>
              Login
            </Link>
          )}
          
          {/* Tombol Hamburger untuk Mobile */}
          <button 
            className={`${styles.hamburger} ${isMobileMenuOpen ? styles.hamburgerOpen : ''}`}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard}>
            <h3 className={styles.modalTitle}>Konfirmasi Keluar</h3>
            <p className={styles.modalDesc}>Apakah Anda yakin ingin keluar dari akun {user?.username}?</p>
            <div className={styles.modalActions}>
              <button className={styles.modalBtnCancel} onClick={() => setShowLogoutConfirm(false)}>Batal</button>
              <button className={styles.modalBtnConfirm} onClick={handleLogout}>Ya, Keluar</button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
