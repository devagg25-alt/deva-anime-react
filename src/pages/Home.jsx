import { useEffect, useState, memo } from 'react'
import { Link } from 'react-router-dom'
import { getAnime } from '../api'
import Header from '../components/Header'
import Footer from '../components/Footer'
import styles from './Home.module.css'

// SkeletonCard untuk loading state
const SkeletonCard = () => (
  <div className={styles.skeletonCard}>
    <div className={styles.skeletonImg}></div>
    <div className={styles.skeletonText}></div>
    <div className={styles.skeletonTextSmall}></div>
  </div>
)

// AnimeCard memoized agar tidak re-render berulang
const AnimeCard = memo(({ anime }) => {
  const [imgError, setImgError] = useState(false)

  // Jika tidak ada poster_url atau gambar error/rusak, hilangkan card dari layar
  if (!anime || !anime.poster_url || imgError) return null

  return (
    <Link to={`/anime/${anime.id}`} className={styles.card}>
      <div className={styles.cardImgWrap}>
        <img
          src={anime.poster_url}
          alt={anime.title}
          onError={() => setImgError(true)}
          loading="lazy"
          decoding="async"
        />
        <div className={styles.cardOverlay}>
          <span className={styles.playBtn}>▶</span>
        </div>
        <div className={styles.ratingBadge}>★ {parseFloat(anime.rating || 0).toFixed(1)}</div>
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardTitle}>{anime.title}</h3>
        <div className={styles.cardMeta}>
          <span className={styles.studioName}>{anime.studio}</span>
          <span className={anime.status === 'Currently Airing' ? styles.airingDot : styles.doneDot}>
            {anime.status === 'Currently Airing' ? '● Airing' : '◉ Done'}
          </span>
        </div>
      </div>
    </Link>
  )
})

export default function Home() {
  const [featured, setFeatured] = useState(null)
  const [trending, setTrending] = useState([])
  const [seasonal, setSeasonal] = useState([])
  const [loading, setLoading]   = useState(true)
  const [imgLoaded, setImgLoaded] = useState(false)

  useEffect(() => {
    // Parallel requests — tidak blocking satu sama lain
    Promise.all([
      getAnime('featured'),
      getAnime('trending'),
      getAnime('seasonal'),
    ]).then(([f, t, s]) => {
      const validTrending = (t.data.data || []).filter(a => a && a.poster_url && a.poster_url.trim() !== '')
      const validSeasonal = (s.data.data || []).filter(a => a && a.poster_url && a.poster_url.trim() !== '')
      
      const featData = f.data.data
      setFeatured((featData && featData.poster_url) ? featData : (validTrending[0] || validSeasonal[0] || null))
      setTrending(validTrending)
      setSeasonal(validSeasonal)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  // Pre-load gambar hero di background
  useEffect(() => {
    if (!featured) return
    const src = featured.banner_url || featured.poster_url
    if (!src) return
    const img = new Image()
    img.onload = () => setImgLoaded(true)
    img.src = src
  }, [featured])

  return (
    <>
      <Header />

      {/* HERO */}
      <section className={styles.hero}>
        {/* Background image */}
        {featured && (
          <div
            className={`${styles.heroBg} ${imgLoaded ? styles.heroBgVisible : ''}`}
            style={{ backgroundImage: `url(${featured.banner_url || featured.poster_url})` }}
          />
        )}
        <div className={styles.heroGradient} />

        {/* Content */}
        <div className={styles.heroInner}>
          {loading ? (
            <div className={styles.heroSkeleton}>
              <div className={styles.skBadge}></div>
              <div className={styles.skTitle}></div>
              <div className={styles.skSynopsis}></div>
              <div className={styles.skButtons}></div>
            </div>
          ) : featured ? (
            <div className={styles.heroContent}>
              <span className={styles.badge}>● Featured · Live Now</span>
              <h1 className={styles.heroTitle}>{featured.title}</h1>
              <p className={styles.heroSynopsis}>{featured.synopsis?.slice(0, 200)}...</p>
              <div className={styles.heroBtns}>
                <Link to={`/anime/${featured.id}`} className={styles.btnPrimary} title="Watch Now">▶</Link>
                <Link to={`/anime/${featured.id}`} className={styles.btnSecondary} title="Add to My List">＋</Link>
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {/* MAIN */}
      <main className={styles.main}>

        {/* Trending */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitle}>
              Currently Trending
              <span>Anime populer yang sedang hangat</span>
            </div>
            <Link to="/search" className={styles.viewAll}>View All →</Link>
          </div>
          <div className={styles.grid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : trending.map(a => <AnimeCard key={a.id} anime={a} />)
            }
          </div>
        </section>

        {/* Seasonal */}
        <section className={styles.section}>
          <div className={styles.sectionHead}>
            <div className={styles.sectionTitle}>
              Seasonal Picks
              <span>Rekomendasi terbaik musim ini</span>
            </div>
          </div>
          <div className={styles.grid}>
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              : seasonal.map(a => <AnimeCard key={a.id} anime={a} />)
            }
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
