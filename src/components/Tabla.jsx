import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const BADGES = {
  'Real Madrid': '👑', 'FC Barcelona': '🔵', 'Atlético de Madrid': '🔴',
  'Athletic Club': '🦁', 'Real Betis': '💚', 'Villarreal CF': '🟡',
  'Real Sociedad': '⚪', 'Sevilla FC': '🌹', 'Valencia CF': '🦇',
  'Girona FC': '🔴', 'Rayo Vallecano': '⚡', 'Osasuna': '🔴',
  'Getafe CF': '🔵', 'Celta de Vigo': '🔵', 'Alavés': '🔵',
  'RCD Mallorca': '🔴', 'Espanyol': '🔵', 'Leganés': '🔵',
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

  useEffect(() => { load() }, [])

  async function load() {
    const { data: resultados } = await supabase.from('resultados').select('*')
    const { data: pols } = await supabase.from('polemicas').select('*')
    const { data: vts } = await supabase.from('votos').select('polemica_id, tipo')

    if (!resultados?.length) { setLoading(false); return }

    const conteos = {}
    ;(vts || []).forEach(v => {
      if (!conteos[v.polemica_id]) conteos[v.polemica_id] = { robo: 0, acierto: 0 }
      conteos[v.polemica_id][v.tipo]++
    })

    const tabla = {}
    resultados.forEach(r => {
      if (!tabla[r.equipo_local]) tabla[r.equipo_local] = { nombre: r.equipo_local, ptsReal: 0, ptsLloro: 0 }
      if (!tabla[r.equipo_visitante]) tabla[r.equipo_visitante] = { nombre: r.equipo_visitante, ptsReal: 0, ptsLloro: 0 }

      const gl = r.goles_local, gv = r.goles_visitante
      const ptsL = gl > gv ? 3 : gl === gv ? 1 : 0
      const ptsV = gv > gl ? 3 : gl === gv ? 1 : 0
      tabla[r.equipo_local].ptsReal += ptsL
      tabla[r.equipo_visitante].ptsReal += ptsV

      let ajLocal = 0, ajVisitante = 0
      ;(pols || []).filter(p =>
        p.partido?.toLowerCase().includes(r.equipo_local?.toLowerCase()) ||
        p.partido?.toLowerCase().includes(r.equipo_visitante?.toLowerCase())
      ).forEach(p => {
        const c = conteos[p.id] || { robo: 0, acierto: 0 }
        const total = c.robo + c.acierto
        if (total > 0 && c.robo / total > 0.6) {
          if (p.equipo_perjudicado?.toLowerCase().includes(r.equipo_local?.toLowerCase())) ajLocal++
          else ajVisitante++
        }
      })

      const glAdj = gl + ajLocal, gvAdj = gv + ajVisitante
      const ptsLAdj = glAdj > gvAdj ? 3 : glAdj === gvAdj ? 1 : 0
      const ptsVAdj = gvAdj > glAdj ? 3 : glAdj === gvAdj ? 1 : 0
      tabla[r.equipo_local].ptsLloro += ptsLAdj
      tabla[r.equipo_visitante].ptsLloro += ptsVAdj
    })

    const mapped = Object.values(tabla).sort((a, b) => b.ptsLloro - a.ptsLloro)
    setEquipos(mapped)
    setLoading(false)
  }

  const compartir = () => {
    if (!equipos.length) return
    const lider = equipos[0]
    const texto = encodeURIComponent(
      `Según El Tercer Tiempo, ${lider.nombre} lidera La Liga Real con ${lider.ptsLloro} pts. ¿Estás de acuerdo? 👉 eltercertiempo.es`
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

  if (!equipos.length) return (
    <section style={styles.section}>
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-color)', fontSize: '13px' }}>
        No hay datos de clasificación todavía. Los resultados se sincronizan automáticamente cada hora.
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