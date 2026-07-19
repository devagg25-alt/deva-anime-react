// Search.jsx
// Halaman Discovery & Pencarian Anime dengan Filter Lengkap

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getAnime } from '../api'
import AnimeCard from '../components/AnimeCard'
import Header from '../components/Header'
import Footer from '../components/Footer'
import styles from './Search.module.css'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  
  // Ambil parameter dari URL saat pertama kali dimuat
  const initialQ      = searchParams.get('q') || ''
  const initialMyList = searchParams.get('my_list') === '1'

  // State filter pencarian
  const [keyword, setKeyword]     = useState(initialQ)
  const [status, setStatus]       = useState('')
  const [sort, setSort]           = useState('newest')
  const [genres, setGenres]       = useState([])           // ID genre yang dipilih
  const [allGenres, setAllGenres] = useState([])           // Semua genre dari DB
  const [genreQuery, setGenreQuery] = useState('')         // Pencarian cepat nama genre
  const [isMyList, setIsMyList]   = useState(initialMyList)// Mode My List

  const [results, setResults]     = useState([])
  const [loading, setLoading]     = useState(false)
  const [showMobileFilter, setShowMobileFilter] = useState(false) // Mode filter ngambang (drawer) di mobile

  // Update state jika URL berubah (misal klik "My List" atau "Discovery" di Header)
  useEffect(() => {
    setKeyword(searchParams.get('q') || '')
    setIsMyList(searchParams.get('my_list') === '1')
  }, [searchParams])

  // Ambil daftar semua genre sekali saat halaman dibuka
  useEffect(() => {
    getAnime('genres').then(res => {
      setAllGenres(res.data.data || [])
    }).catch(err => console.error('Gagal memuat genre:', err))
  }, [])

  // Fungsi utama pencarian ke backend API PHP
  const performSearch = useCallback(() => {
    setLoading(true)
    getAnime('search', {
      q: keyword,
      status: status,
      sort: sort,
      genres: genres,
      my_list: isMyList ? 1 : 0,
    })
      .then(res => {
        // Hilangkan/filter konten anime yang tidak memiliki gambar dari API
        const validResults = (res.data.data || []).filter(a => a && a.poster_url && a.poster_url.trim() !== '')
        setResults(validResults)
      })
      .catch(err => {
        console.error('Gagal mencari anime:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [keyword, status, sort, genres, isMyList])

  // Debounce: otomatis cari setelah 300ms berhenti mengetik
  useEffect(() => {
    const timer = setTimeout(performSearch, 300)
    return () => clearTimeout(timer)
  }, [performSearch])

  // Toggle centang genre
  const toggleGenre = (id) => {
    const numId = Number(id)
    setGenres(prev => 
      prev.includes(numId) 
        ? prev.filter(g => g !== numId) 
        : [...prev, numId]
    )
  }

  // Reset semua filter ke awal
  const handleResetFilters = () => {
    setKeyword('')
    setStatus('')
    setSort('newest')
    setGenres([])
    setGenreQuery('')
    setIsMyList(false)
    setSearchParams({})
  }

  // Filter daftar genre berdasarkan ketikan di pencarian genre
  const filteredGenres = allGenres.filter(g => 
    g.name.toLowerCase().includes(genreQuery.toLowerCase())
  )

  // Format nama genre agar rapi dan bersihkan enter/newline dari DB
  const formatGenreName = (name) => {
    if (!name) return ''
    const clean = name.replace(/[\r\n]+/g, '').trim()
    if (clean === clean.toUpperCase() && clean.length > 2) {
      return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase()
    }
    return clean
  }

  // Hitung jumlah filter aktif
  const activeFilterCount = (keyword ? 1 : 0) + (status ? 1 : 0) + (sort !== 'newest' ? 1 : 0) + genres.length + (isMyList ? 1 : 0)

  return (
    <>
      <Header />
      <main className={styles.layout}>

        {/* Tombol Bulat Ngambang (Floating Action Button) di pojok kanan bawah saat mode mobile */}
        <button
          className={styles.floatingBtn}
          onClick={() => setShowMobileFilter(true)}
          title="Buka Filter"
        >
          ⚙ {activeFilterCount > 0 && <span className={styles.floatingBadge}>{activeFilterCount}</span>}
        </button>

        {/* Overlay gelap saat drawer filter mobile terbuka */}
        {showMobileFilter && (
          <div className={styles.mobileFilterOverlay} onClick={() => setShowMobileFilter(false)} />
        )}

        {/* Sidebar Filter (di desktop diam di kiri, di mobile ngambang dari bawah) */}
        <aside className={`${styles.sidebar} ${showMobileFilter ? styles.sidebarMobileActive : ''}`}>
          {/* Header khusus saat mode mobile (ngambang/drawer) */}
          <div className={styles.mobileSidebarHead}>
            <div className={styles.mobileSidebarTitle}>
              <span>⚙ Filter & Pencarian</span>
            </div>
            <button className={styles.btnCloseSidebar} onClick={() => setShowMobileFilter(false)}>
              ✕
            </button>
          </div>

          <div className={styles.filterHead}>
            <h3 className={styles.filterTitle}>
              ⚙ Filter {activeFilterCount > 0 && <span className={styles.filterBadge}>{activeFilterCount}</span>}
            </h3>
            {activeFilterCount > 0 && (
              <button onClick={handleResetFilters} className={styles.resetLink}>
                Reset
              </button>
            )}
          </div>

          {/* Mode My List (jika aktif) */}
          {isMyList && (
            <div className={styles.myListAlert}>
              <span>★ Menampilkan My List</span>
              <button onClick={() => setIsMyList(false)} title="Tutup My List">✕</button>
            </div>
          )}

          {/* Cari Judul */}
          <div className={styles.filterGroup}>
            <label>Cari Judul</label>
            <input
              type="text"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              placeholder="Ketik judul anime..."
              className={styles.input}
            />
          </div>

          {/* Status Rilis */}
          <div className={styles.filterGroup}>
            <label>Status Rilis</label>
            <select value={status} onChange={e => setStatus(e.target.value)} className={styles.input}>
              <option value="">Semua Status</option>
              <option value="Currently Airing">Sedang Tayang</option>
              <option value="Finished Airing">Selesai Tayang</option>
            </select>
          </div>

          {/* Urutkan */}
          <div className={styles.filterGroup}>
            <label>Urutkan</label>
            <select value={sort} onChange={e => setSort(e.target.value)} className={styles.input}>
              <option value="newest">Terbaru Ditambahkan</option>
              <option value="rating">Rating Tertinggi (★)</option>
              <option value="alphabetical">Abjad (A - Z)</option>
            </select>
          </div>

          {/* Genre */}
          <div className={styles.filterGroup}>
            <div className={styles.genreHeader}>
              <label>Genre ({genres.length} dipilih)</label>
            </div>
            
            {/* Input cari genre cepat */}
            {allGenres.length > 8 && (
              <input
                type="text"
                value={genreQuery}
                onChange={e => setGenreQuery(e.target.value)}
                placeholder="Cari genre..."
                className={styles.genreSearchInput}
              />
            )}

            {/* Kotak daftar genre yang bisa di-scroll */}
            <div className={styles.genreBox}>
              {filteredGenres.length === 0 ? (
                <p className={styles.noGenre}>Genre tidak ditemukan</p>
              ) : (
                filteredGenres.map(g => {
                  const gId = Number(g.id)
                  const isChecked = genres.includes(gId)
                  return (
                    <label key={g.id} className={`${styles.genreLabel} ${isChecked ? styles.genreActive : ''}`}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleGenre(gId)}
                      />
                      <span className={styles.customCheck} />
                      <span className={styles.genreText}>{formatGenreName(g.name)}</span>
                    </label>
                  )
                })
              )}
            </div>
          </div>

          {/* Tombol Hapus Filter jika ada yang aktif */}
          {activeFilterCount > 0 && (
            <button onClick={handleResetFilters} className={styles.btnResetFull}>
              ✕ Hapus Semua Filter
            </button>
          )}

          {/* Tombol Terapkan & Lihat Hasil di bagian bawah drawer mobile */}
          <div className={styles.mobileSidebarFoot}>
            <button className={styles.btnApplyFilter} onClick={() => setShowMobileFilter(false)}>
              Lihat Hasil ({results.length} Anime)
            </button>
          </div>
        </aside>

        {/* Hasil Pencarian */}
        <section className={styles.results}>
          <div className={styles.resultsHead}>
            <h2 className={styles.resultsTitle}>
              {isMyList ? 'Daftar My List' : 'Jelajahi Anime'}
              <span>
                {isMyList 
                  ? 'Anime yang telah Anda simpan' 
                  : activeFilterCount > 0 
                    ? 'Menampilkan hasil sesuai filter' 
                    : 'Temukan berbagai judul menarik'
                }
              </span>
            </h2>
            <span className={styles.count}>{results.length} judul ditemukan</span>
          </div>

          {loading ? (
            <div className={styles.loadingRow}>
              <div className={styles.spinner} />
              <p>Memuat hasil...</p>
            </div>
          ) : results.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>😕</div>
              <h4>Tidak ada anime yang cocok</h4>
              <p>Coba kurangi atau ubah filter pencarian Anda.</p>
              {activeFilterCount > 0 && (
                <button onClick={handleResetFilters} className={styles.btnResetEmpty}>
                  Reset Filter
                </button>
              )}
            </div>
          ) : (
            <div className={styles.grid}>
              {results.map(a => <AnimeCard key={a.id} anime={a} />)}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </>
  )
}
