// api.js
// Konfigurasi pemanggilan API ke backend PHP
// Di lokal: proxy Vite menangani /api → localhost/deva-anime (via vite.config.js)
// Di production (Vercel): VITE_API_URL mengarah langsung ke domain InfinityFree

import axios from 'axios'

// Ambil base URL dari environment variable Vite
// Development: /api/anime-api.php (ditangani proxy lokal)
// Production: https://domain-infinityfree.com/api/anime-api.php
// Di lokal via dist: gunakan relative path ke PHP backend di XAMPP yang sama
// Di production (Vercel): override via VITE_API_URL env variable
const isDev = import.meta.env.DEV
const API_BASE = import.meta.env.VITE_API_URL
  || (isDev ? '/api/anime-api.php' : '/deva-anime/api/anime-api.php')
const DEVA_BASE = import.meta.env.VITE_DEVA_API_URL
  || (isDev ? '' : '/deva-anime')

// Instance Axios dengan pengaturan dasar
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Sertakan cookie session PHP
})

/**
 * Ambil data dari API dengan action tertentu
 * Contoh: getAnime('featured') → /api/anime-api.php?action=featured
 *
 * @param {string} action - Nama aksi (featured, trending, search, dll)
 * @param {object} params - Parameter tambahan (opsional)
 */
export function getAnime(action, params = {}) {
  return api.get('', { params: { action, ...params } })
}

/**
 * Kirim data POST ke endpoint PHP (bookmark, komentar, dll)
 *
 * @param {string} endpoint - Path endpoint, contoh: '/api/bookmark-api.php'
 * @param {URLSearchParams} data - Data yang dikirim
 */
export function postAction(endpoint, data) {
  // Di lokal: /deva-api prefix ditangani proxy Vite
  // Di production: langsung ke domain InfinityFree
  const url = DEVA_BASE ? `${DEVA_BASE}${endpoint}` : `/deva-api${endpoint}`
  return axios.post(url, data, {
    withCredentials: true,
  })
}

export default api
