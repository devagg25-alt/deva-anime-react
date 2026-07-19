// src/context/UserContext.jsx
// Context global yang menyimpan data user aktif secara terpusat.
// Semua komponen (Header, AnimeDetail, dll.) mengambil user dari sini
// sehingga tidak ada lagi state yang tidak sinkron antar komponen.

import { createContext, useContext, useState, useEffect } from 'react'
import { getAnime } from '../api'

const UserContext = createContext(null)

// Provider: membungkus seluruh aplikasi, menyimpan & membagikan state user
export function UserProvider({ children }) {
  const [user, setUser] = useState(null)
  const [userLoading, setUserLoading] = useState(true)

  // Hanya satu kali saat aplikasi dimuat: cek session PHP
  useEffect(() => {
    getAnime('me')
      .then(res => setUser(res.data.user || null))
      .catch(() => setUser(null))
      .finally(() => setUserLoading(false))
  }, [])

  // Fungsi logout terpusat — dipanggil dari Header, state langsung berubah di semua komponen
  const logout = async () => {
    try {
      await getAnime('logout')
    } catch (e) {
      console.error('Logout API error:', e)
    }
    setUser(null)         // ← satu baris ini langsung memberitahu SEMUA komponen: "user = null"
  }

  return (
    <UserContext.Provider value={{ user, setUser, userLoading, logout }}>
      {children}
    </UserContext.Provider>
  )
}

// Hook shortcut: const { user, logout } = useUser()
export function useUser() {
  return useContext(UserContext)
}
