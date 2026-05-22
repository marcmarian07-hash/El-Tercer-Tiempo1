import { useState, useEffect } from 'react'
import { db } from '../supabase'

// Noticias de fallback por si la tabla aún no tiene datos
const FALLBACK = [
  { id: 1, tag: 'Análisis', titulo: 'El Comité Técnico de Árbitros responde a las polémicas de la J38', meta: 'Hace 2 horas · Llorómetro', emoji: '📋' },
  { id: 2, tag: 'Estadística', titulo: 'LaLiga 2024-25: el equipo con más penaltis a favor dobla al siguiente', meta: 'Hace 5 horas · Análisis', emoji: '📊' },
  { id: 3, tag: 'VAR', titulo: 'El VAR interviene un 34% más en partidos con equipos de Madrid', meta: 'Ayer · Investigación', emoji: '📹' },
  { id: 4, tag: 'Opinión', titulo: 'Hernández Maeso, el árbitro más votado como polémico', meta: 'Hace 2 días · Redacción', emoji: '🧑‍⚖️' },
  { id: 5, tag: 'Comparativa', titulo: '¿Qué ligas europeas tienen el arbitraje más polémico?', meta: 'Hace 3 días · Internacional', emoji: '🌍' },
]

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000)
  if (diff < 60) return 'Hace un momento'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} horas`
  if (diff < 172800) return 'Ayer'
  return `Hace ${Math.floor(diff / 86400)} días`
}

function NoticiaItem({ noticia, index }) {
  return (
    <div
      style={{ ...styles.item, animation: `fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 0.1}s forwards` }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
        e.currentTarget.style.paddingLeft = '12px'
        e.currentTarget.children[1].style.transform = 'scale(1.05) rotate(5deg)'
        e.currentTarget.children[1].style.borderColor = 'rgba(255,255,255,0.2)'
        e.currentTarget.children[1].style.boxShadow = '0 0 20px rgba(255,255,255,0.05)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = 'transparent'
        e.currentTarget.style.paddingLeft = '0px'
        e.currentTarget.children[1].style.transform = 'scale(1) rotate(0deg)'
        e.currentTarget.children[1].style.borderColor = 'var(--border-color)'
        e.currentTarget.children[1].style.boxShadow = 'none'
      }}
    >
      <div>
        <p style={styles.tag}>{noticia.tag}</p>
        <p style={styles.titulo}>{noticia.titulo}</p>
        <p style={styles.meta}>{noticia.meta}</p>
      </div>
      <div style={styles.imgContainer}>{noticia.emoji}</div>
    </div>
  )
}

export default function Noticias() {
  const [noticias, setNoticias] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await db
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10)

      if (error || !data?.length) {
        // Si la tabla no existe o está vacía, usamos el fallback
        setNoticias(FALLBACK)
      } else {
        setNoticias(data.map(n => ({
          id: n.id,
          tag: n.tag,
          titulo: n.titulo,
          meta: `${timeAgo(n.created_at)} · ${n.fuente || 'Llorómetro'}`,
          emoji: n.emoji || '📰',
        })))
      }
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <section style={styles.section}>
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-color)', fontSize: '13px' }}>
        Cargando noticias...
      </div>
    </section>
  )

  return (
    <section id="noticias" style={styles.section}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={styles.bgGlow} />

      <div style={styles.label}>
        📰 Últimas noticias
        <span style={styles.labelLine} />
      </div>

      <div style={styles.list}>
        {noticias.map((n, index) => (
          <NoticiaItem key={n.id} noticia={n} index={index} />
        ))}
      </div>

      <p style={styles.footer}>LLORÓMETRO ARBITRAL · EL DEBATE NUNCA TERMINA</p>
    </section>
  )
}

const styles = {
  section: {
    padding: '1.5rem 2rem', maxWidth: '800px', margin: '0 auto',
    backgroundColor: 'var(--bg-color)', position: 'relative',
    overflow: 'hidden', transition: 'background-color 0.3s',
  },
  bgGlow: {
    position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
    width: '600px', height: '300px',
    background: 'radial-gradient(circle, var(--border-color) 0%, transparent 70%)',
    zIndex: 0, pointerEvents: 'none',
  },
  label: {
    fontSize: '12px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase',
    color: 'var(--text-color)', marginBottom: '1.5rem',
    display: 'flex', alignItems: 'center', gap: '12px', position: 'relative', zIndex: 1,
  },
  labelLine: { flex: 1, height: '1px', background: 'var(--border-color)' },
  list: { position: 'relative', zIndex: 1 },
  item: {
    display: 'grid', gridTemplateColumns: '1fr 70px', gap: '24px',
    padding: '1.25rem 0', borderBottom: '1px solid var(--border-color)',
    cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)', opacity: 0,
  },
  tag: {
    fontSize: '10px', fontWeight: '800', color: '#E24B4A',
    textTransform: 'uppercase', marginBottom: '6px', letterSpacing: '1px',
  },
  titulo: {
    fontSize: '16px', fontWeight: '700', lineHeight: '1.4',
    color: 'var(--text-color)', marginBottom: '6px',
  },
  meta: { fontSize: '11.5px', color: 'var(--muted-color)', fontWeight: '500' },
  imgContainer: {
    width: '70px', height: '70px', borderRadius: '14px',
    backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '28px', transition: 'all 0.4s ease',
  },
  footer: {
    marginTop: '3rem', textAlign: 'center', fontSize: '11px',
    color: 'var(--muted-color)', fontWeight: '600', letterSpacing: '0.5px',
    position: 'relative', zIndex: 1,
  },
}