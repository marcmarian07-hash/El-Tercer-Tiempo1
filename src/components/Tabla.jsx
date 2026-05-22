import { useState, useEffect } from 'react'
import { db } from '../supabase'

// Ajustes calculados a partir de los votos (en el futuro esto vendrá 100% de BD)
// Por ahora los definimos aquí y luego los cruzamos con los equipos reales de Supabase
const AJUSTES = {
  'Real Madrid':   -5,
  'FC Barcelona':  -4,
  'Atlético':      -3,
  'Valencia CF':   -7,
  'Real Betis':    -2,
  'Villarreal':    -1,
  'Real Sociedad':  0,
  'Sevilla FC':     0,
}

const BADGES = {
  'Real Madrid': '👑', 'FC Barcelona': '🔵', 'Atlético': '🔴',
  'Valencia CF': '🦇', 'Real Betis': '💚', 'Villarreal': '🟡',
  'Real Sociedad': '⚪', 'Sevilla FC': '🌹',
}

function FilaEquipo({ equipo, posicion, index }) {
  const diff = equipo.ptsLloro - equipo.ptsReal
  const diffStyle = diff < 0 ? styles.diffNeg : diff > 0 ? styles.diffPos : styles.diffZero
  const diffText = diff === 0 ? '—' : (diff > 0 ? '+' : '') + diff

  return (
    <div
      style={{ ...styles.row, animation: `fadeInUp 0.5s ease forwards ${index * 0.05}s` }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--border-color)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      <span style={styles.posNum}>{posicion}</span>
      <div style={styles.teamInfo}>
        <span style={{ fontSize: '18px' }}>{BADGES[equipo.nombre] || '⚽'}</span>
        <span style={styles.teamName}>{equipo.nombre}</span>
      </div>
      <span style={styles.ptsReal}>{equipo.ptsReal}</span>
      <span style={styles.ptsLloro}>{equipo.ptsLloro}</span>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={diffStyle}>{diffText}</span>
      </div>
    </div>
  )
}

export default function Tabla() {
  const [equipos, setEquipos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data, error } = await db
        .from('equipos')
        .select('*')
        .order('pts_oficiales', { ascending: false })

      if (error || !data?.length) { setLoading(false); return }

      const mapped = data.map(eq => ({
        nombre: eq.nombre,
        ptsReal: eq.pts_oficiales,
        ptsLloro: eq.pts_oficiales + (AJUSTES[eq.nombre] || 0),
      })).sort((a, b) => b.ptsLloro - a.ptsLloro)

      setEquipos(mapped)
      setLoading(false)
    }
    load()
  }, [])

  const compartir = () => {
    if (!equipos.length) return
    const lider = equipos[0]
    const texto = encodeURIComponent(
      `Según el Llorómetro, ${lider.nombre} lidera La Liga Real con ${lider.ptsLloro} pts. ¿Estás de acuerdo? 👉 llorometro.es`
    )
    window.open(`https://twitter.com/intent/tweet?text=${texto}`, '_blank')
  }

  if (loading) return (
    <section style={styles.section}>
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-color)', fontSize: '13px' }}>
        Cargando clasificación...
      </div>
    </section>
  )

  return (
    <section id="tabla" style={styles.section}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div style={styles.label}>🏆 La Liga Real — Clasificación Ajustada</div>

      <div style={styles.tablaWrap}>
        <div style={styles.header}>
          <span>#</span>
          <span>Equipo</span>
          <span style={{ textAlign: 'center' }}>Pts</span>
          <span style={{ textAlign: 'center' }}>Lloro</span>
          <span style={{ textAlign: 'center' }}>Dif</span>
        </div>
        {equipos.map((e, i) => (
          <FilaEquipo key={e.nombre} equipo={e} posicion={i + 1} index={i} />
        ))}
      </div>

      <div style={styles.shareBar}>
        <p style={{ color: 'var(--text-color)', fontSize: '13px', margin: 0 }}>
          ¿Te indigna la tabla? Compártela.
        </p>
        <button style={styles.shareBtn} onClick={compartir}>𝕏 Compartir</button>
      </div>
    </section>
  )
}

const styles = {
  section: {
    padding: '2rem', maxWidth: '800px', margin: '0 auto',
    width: '100%', backgroundColor: 'var(--bg-color)',
  },
  label: {
    fontSize: '11px', fontWeight: '800', letterSpacing: '1.5px',
    textTransform: 'uppercase', color: 'var(--muted-color)', marginBottom: '1.5rem',
  },
  tablaWrap: {
    border: '1px solid var(--border-color)', borderRadius: '10px',
    overflow: 'hidden', backgroundColor: 'var(--card-bg)',
  },
  header: {
    display: 'grid', gridTemplateColumns: '40px 1fr 60px 60px 70px',
    padding: '12px 20px', fontSize: '11px', fontWeight: '800',
    color: 'var(--muted-color)', borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'rgba(128,128,128,0.05)',
  },
  row: {
    display: 'grid', gridTemplateColumns: '40px 1fr 60px 60px 70px',
    padding: '14px 20px', fontSize: '14px',
    borderBottom: '1px solid var(--border-color)',
    alignItems: 'center', opacity: 0,
  },
  posNum: {
    fontSize: '11px', fontWeight: '800', color: 'var(--text-color)',
    textAlign: 'center', width: '24px', height: '24px', borderRadius: '4px',
    backgroundColor: 'var(--border-color)', display: 'flex',
    alignItems: 'center', justifyContent: 'center',
  },
  teamInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  teamName: { fontWeight: '600', color: 'var(--text-color)' },
  ptsReal: { textAlign: 'center', color: 'var(--muted-color)' },
  ptsLloro: { textAlign: 'center', fontWeight: '800', color: '#ff6b6b' },
  diffNeg: { color: '#ff6b6b', fontWeight: '700' },
  diffPos: { color: '#77dd77', fontWeight: '700' },
  diffZero: { color: 'var(--muted-color)' },
  shareBar: {
    marginTop: '1.5rem', padding: '16px', border: '1px solid var(--border-color)',
    borderRadius: '10px', backgroundColor: 'var(--card-bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  shareBtn: {
    backgroundColor: 'var(--text-color)', color: 'var(--bg-color)',
    padding: '8px 16px', borderRadius: '6px', fontWeight: '800',
    cursor: 'pointer', border: 'none', fontSize: '13px',
  },
}