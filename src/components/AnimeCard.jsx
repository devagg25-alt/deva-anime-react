import { useState } from 'react'
import { Link } from 'react-router-dom'
import styles from './AnimeCard.module.css'

export default function AnimeCard({ anime }) {
  const [imgError, setImgError] = useState(false)

  // Jika tidak ada gambar/poster_url dari API atau gambar rusak/gagal dimuat, sembunyikan/hilangkan card sepenuhnya
  if (!anime || !anime.poster_url || imgError) {
    return null
  }

  return (
    <Link to={`/anime/${anime.id}`} className={styles.card}>
      <div className={styles.imgWrap}>
        <img
          src={anime.poster_url}
          alt={anime.title}
          onError={() => setImgError(true)}
          loading="lazy"
        />
        <div className={styles.overlay}>
          <span className={styles.rating}>★ {parseFloat(anime.rating).toFixed(1)}</span>
        </div>
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>{anime.title}</h3>
        <div className={styles.meta}>
          <span>{anime.studio}</span>
          <span className={anime.status === 'Currently Airing' ? styles.airing : styles.done}>
            {anime.status === 'Currently Airing' ? '● Airing' : '◉ Done'}
          </span>
        </div>
      </div>
    </Link>
  )
}
