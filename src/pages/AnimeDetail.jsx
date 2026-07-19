// AnimeDetail.jsx
// Halaman detail anime — menampilkan info, daftar episode, dan ulasan pengguna

import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getAnime, postAction } from '../api'
import { useUser } from '../context/UserContext'
import Header from '../components/Header'
import Footer from '../components/Footer'
import styles from './AnimeDetail.module.css'

export default function AnimeDetail() {
  // Ambil ID anime dari URL, contoh: /anime/3 → id = "3"
  const { id } = useParams()

  // Ambil user dari Context global (satu sumber kebenaran bersama Header)
  const { user, setUser } = useUser()

  // State utama halaman
  const [anime, setAnime]         = useState(null)   // Data anime lengkap
  const [tab, setTab]             = useState('episodes') // Tab aktif: 'episodes' atau 'comments'
  const [comment, setComment]     = useState('')     // Isi komentar yang sedang diketik
  const [comments, setComments]   = useState([])     // Daftar semua komentar
  const [bookmarked, setBookmarked] = useState(false) // Apakah sudah di-bookmark?
  const [loading, setLoading]     = useState(true)   // Sedang memuat data?
  const [submitting, setSubmitting] = useState(false) // Sedang mengirim komentar?
  const [activeEpisode, setActiveEpisode] = useState(null) // Episode yang sedang ditonton di modal player
  const [showLoginPopup, setShowLoginPopup] = useState(false) // Status munculnya modal popup login

  // Ambil data anime dari API saat halaman pertama dibuka atau ID berubah
  useEffect(() => {
    setLoading(true)

    // Ambil data detail anime (user sudah tersedia dari UserContext, tidak perlu panggil 'me' lagi)
    getAnime('detail', { id })
      .then(res => {
        const data = res.data.data
        setAnime(data)
        setComments(data.comments || [])
        setBookmarked(data.is_bookmarked || false)
      })
      .catch(err => {
        console.error('Gagal memuat detail anime:', err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [id])

  // Helper: cek apakah user sudah login sebelum melakukan aksi (nonton, bookmark, ulasan)
  // Karena user diambil dari UserContext (satu sumber kebenaran), nilainya selalu akurat.
  // Ketika Header memanggil logout(), Context langsung mengubah user=null di sini secara instan.
  const requireLogin = (callback) => {
    if (!user) {
      setShowLoginPopup(true)
      return
    }
    callback()
  }

  // Fungsi: toggle bookmark (tambah/hapus dari My List)
  const handleBookmark = async () => {
    requireLogin(async () => {
      try {
        const res = await postAction('/api/bookmark-api.php', new URLSearchParams({ anime_id: id }))

        if (res.data.success) {
          setBookmarked(res.data.action === 'added')
        } else if (res.data.code === 401) {
          setUser(null)
          setShowLoginPopup(true)
        }
      } catch (err) {
        console.error('Gagal toggle bookmark:', err)
      }
    })
  }

  // Fungsi: kirim komentar baru
  const handleComment = async (e) => {
    e.preventDefault()

    requireLogin(async () => {
      // Jangan kirim jika komentar kosong
      if (!comment.trim()) return

      setSubmitting(true)

      try {
        const res = await postAction('/api/comment-api.php', new URLSearchParams({
          anime_id: id,
          content: comment,
        }))

        if (res.data.success) {
          const komentarBaru = {
            username: res.data.username,
            content: res.data.content,
            created_at: 'Baru saja',
          }
          setComments(prev => [komentarBaru, ...prev])
          setComment('')
        } else if (res.data.code === 401) {
          setUser(null)
          setShowLoginPopup(true)
        }
      } catch (err) {
        console.error('Gagal mengirim komentar:', err)
      } finally {
        setSubmitting(false)
      }
    })
  }

  // Tampilan saat data sedang dimuat
  if (loading) {
    return (
      <>
        <Header />
        <div className={styles.loader}>
          <div className={styles.spinner}></div>
        </div>
      </>
    )
  }

  // Tampilan jika anime tidak ditemukan
  if (!anime) {
    return (
      <>
        <Header />
        <div className={styles.loader}>Anime tidak ditemukan.</div>
      </>
    )
  }

  // Pisahkan string genre "Action,Drama,Sci-Fi" menjadi array
  const genres  = anime.genres ? anime.genres.split(',') : []

  // Gambar placeholder jika poster tidak ada
  return (
    <>
      <Header />

      {/* Banner latar belakang halaman */}
      <div
        className={styles.banner}
        style={anime.banner_url || anime.poster_url ? { backgroundImage: `url(${anime.banner_url || anime.poster_url})` } : { background: '#111814' }}
      >
        <div className={styles.bannerOverlay} />
      </div>

      <main className={styles.main}>

        {/* Baris atas: poster + info utama */}
        <div className={styles.infoRow}>

          {/* Poster anime */}
          {anime.poster_url ? (
            <div className={styles.poster}>
              <img
                src={anime.poster_url}
                alt={anime.title}
                onError={e => { e.target.style.display = 'none' }}
              />
            </div>
          ) : null}

          {/* Info: judul, rating, studio, genre, tombol aksi */}
          <div className={styles.info}>
            <h1 className={styles.title}>{anime.title}</h1>

            {/* Metadata singkat */}
            <ul className={styles.metaList}>
              <li className={styles.rating}>★ {parseFloat(anime.rating).toFixed(1)}</li>
              <li>{anime.studio}</li>
              <li>{anime.release_season}</li>
              <li className={anime.status === 'Currently Airing' ? styles.airing : ''}>
                {anime.status}
              </li>
            </ul>

            {/* Daftar genre sebagai badge */}
            <div className={styles.genres}>
              {genres.map(g => (
                <span key={g} className={styles.genre}>{g.trim()}</span>
              ))}
            </div>

            {/* Tombol aksi */}
            <div className={styles.actions}>
              <button
                className={styles.btnWatch}
                title="Tonton Sekarang"
                onClick={() => requireLogin(() => {
                  if (anime.episodes && anime.episodes.length > 0) {
                    setActiveEpisode(anime.episodes[0])
                  } else {
                    alert('Belum ada episode untuk anime ini.')
                  }
                })}
              >
                ▶
              </button>
              <button
                className={bookmarked ? styles.btnBookmarked : styles.btnBookmark}
                title={bookmarked ? 'Tersimpan di My List' : 'Tambahkan ke My List'}
                onClick={handleBookmark}
              >
                {bookmarked ? '✓' : '+'}
              </button>
            </div>
          </div>

        </div>

        {/* Sinopsis */}
        <div className={styles.synopsis}>
          <h3>Sinopsis</h3>
          <p>{anime.synopsis}</p>
        </div>

        {/* Tombol tab: Episode | Ulasan */}
        <div className={styles.tabs}>
          <button
            className={tab === 'episodes' ? styles.tabActive : styles.tab}
            onClick={() => setTab('episodes')}
          >
            Episode ({anime.episodes?.length || 0})
          </button>
          <button
            className={tab === 'comments' ? styles.tabActive : styles.tab}
            onClick={() => setTab('comments')}
          >
            Ulasan ({comments.length})
          </button>
        </div>

        {/* Konten Tab: Daftar Episode */}
        {tab === 'episodes' && (
          <div id="episodes" className={styles.episodeList}>

            {/* Pesan jika belum ada episode */}
            {(anime.episodes || []).length === 0 && (
              <p className={styles.empty}>Belum ada episode tersedia.</p>
            )}

            {/* Kartu setiap episode */}
            {(anime.episodes || []).map(ep => (
              <div key={ep.id} className={styles.epCard} onClick={() => requireLogin(() => setActiveEpisode(ep))}>
                <div className={styles.epThumb}>
                  {ep.thumbnail_url ? (
                    <img
                      src={ep.thumbnail_url}
                      alt={`Episode ${ep.episode_number}`}
                      onError={e => { e.target.style.display = 'none' }}
                    />
                  ) : (
                    <div style={{width:'100%', height:'100%', background:'#18221c', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--accent)', fontWeight:'bold', fontSize:'14px'}}>
                      EP {ep.episode_number}
                    </div>
                  )}
                  <span className={styles.playIcon}>▶</span>
                </div>
                <div className={styles.epContent}>
                  <span className={styles.epNum}>
                    EP {ep.episode_number} · {ep.duration} menit
                  </span>
                  <h4>{ep.title}</h4>
                  <p>{ep.synopsis}</p>
                </div>
              </div>
            ))}

          </div>
        )}

        {/* Konten Tab: Ulasan / Komentar */}
        {tab === 'comments' && (
          <div className={styles.commentSection}>

            {/* Form kirim ulasan */}
            <form onSubmit={handleComment} className={styles.commentForm}>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="Tulis ulasan Anda tentang anime ini..."
                rows={4}
              />
              <button type="submit" className={styles.btnWatch} disabled={submitting}>
                {submitting ? 'Mengirim...' : 'Kirim Ulasan'}
              </button>
            </form>

            <hr className={styles.divider} />

            {/* Pesan jika belum ada ulasan */}
            {comments.length === 0 && (
              <p className={styles.empty}>Belum ada ulasan. Jadilah yang pertama!</p>
            )}

            {/* Daftar ulasan */}
            {comments.map((c, index) => (
              <div key={index} className={styles.comment}>
                <div className={styles.commentHeader}>
                  <div className={styles.commentAvatar}>
                    {c.username?.[0]?.toUpperCase()}
                  </div>
                  <span className={styles.commentUser}>{c.username}</span>
                  <span className={styles.commentDate}>{c.created_at}</span>
                </div>
                <p
                  className={styles.commentContent}
                  dangerouslySetInnerHTML={{ __html: c.content }}
                />
              </div>
            ))}

          </div>
        )}

      </main>

      {/* Video Player Modal */}
      {activeEpisode && (() => {
        // Tentukan URL video yang akan diputar (prioritas: episode > anime trailer)
        const videoSrc = activeEpisode.video_url || anime.trailer_url || null
        const isYoutube = videoSrc && videoSrc.includes('youtube')
        const isMp4 = videoSrc && !isYoutube && videoSrc !== 'NULL' && !videoSrc.includes('example.com')

        return (
          <div className={styles.videoModalOverlay} onClick={() => setActiveEpisode(null)}>
            <div className={styles.videoModalContent} onClick={e => e.stopPropagation()}>

              {/* Header modal: judul episode + tombol tutup */}
              <div className={styles.videoHeader}>
                <div className={styles.videoHeaderInfo}>
                  <h3>{anime.title}</h3>
                  <p style={{ color: 'var(--accent)', fontWeight: 600 }}>
                    Episode {activeEpisode.episode_number} — {activeEpisode.title}
                  </p>
                </div>
                <button className={styles.btnCloseModal} onClick={() => setActiveEpisode(null)} title="Tutup">
                  ✕
                </button>
              </div>

              {/* Area Player */}
              <div className={styles.videoPlayerContainer}>
                {isYoutube ? (
                  <iframe
                    src={videoSrc}
                    title={`${anime.title} - Episode ${activeEpisode.episode_number}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : isMp4 ? (
                  <video controls autoPlay src={videoSrc} />
                ) : (
                  /* Placeholder elegan saat tidak ada video tersedia */
                  <div className={styles.noVideoPlaceholder}>
                    <div className={styles.noVideoIcon}>🎬</div>
                    <h4>Video Belum Tersedia</h4>
                    <p>Video untuk episode ini belum ditambahkan.<br />Admin dapat menambahkan link video di panel CMS.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        )
      })()}

      {/* Modal Popup Login Jika Belum Masuk Akun */}
      {showLoginPopup && (
        <div className={styles.loginPopupOverlay} onClick={() => setShowLoginPopup(false)}>
          <div className={styles.loginPopupBox} onClick={e => e.stopPropagation()}>
            <div className={styles.loginPopupIcon}>🔒</div>
            <h3 className={styles.loginPopupTitle}>Login Diperlukan</h3>
            <p className={styles.loginPopupDesc}>
              Silakan <strong>masuk ke akun Anda</strong> terlebih dahulu untuk dapat menonton video episode, menyimpan ke My List, dan menulis ulasan anime.
            </p>
            <div className={styles.loginPopupButtons}>
              <Link to="/login" className={styles.btnPopupLogin}>
                Masuk / Daftar Akun ➔
              </Link>
              <button className={styles.btnPopupCancel} onClick={() => setShowLoginPopup(false)}>
                Batal & Nanti Saja
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}
