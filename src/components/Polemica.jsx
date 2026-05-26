import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function getFingerprint() {
  const key = 'lloro_fp'
  let fp = localStorage.getItem(key)
  if (!fp) {
    fp = Math.random().toString(36).slice(2) + Date.now().toString(36)
    localStorage.setItem(key, fp)
  }
  return fp
}

function getVotados() {
  try { return JSON.parse(localStorage.getItem('lloro_votos') || '{}') } catch { return {} }
}

function saveVotado(polId, tipo) {
  const v = getVotados()
  v[polId] = tipo
  localStorage.setItem('lloro_votos', JSON.stringify(v))
}

function VoteBar({ robo, acierto }) {
  const total = robo + acierto
  const roboP = total > 0 ? Math.round((robo / total) * 100) : 50
  const aciertoP = 100 - roboP
  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted-color)', marginBottom: '8px' }}>
        <span>ROBO {roboP}%</span>
        <span>ACIERTO {aciertoP}%</span>
      </div>
      <div style={{ height: '8px', borderRadius: '100px', backgroundColor: 'var(--border-color)', display: 'flex', overflow: 'hidden' }}>
        <div style={{ width: `${roboP}%`, backgroundColor: '#E24B4A', transition: 'width 0.5s ease' }} />
        <div style={{ width: `${aciertoP}%`, backgroundColor: '#639922', transition: 'width 0.5s ease' }} />
      </div>
      <div style={{ fontSize: '11px', color: 'var(--muted-color)', marginTop: '6px', textAlign: 'right' }}>{total} votos</div>
    </div>
  )
}

function HeroCard({ p, conteo, onVote }) {
  const votados = getVotados()
  const yaVoto = votados[p.id]
  const c = conteo[p.id] || { robo: 0, acierto: 0 }

  const getEmbedUrl = (url) => {
    if (!url) return null
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/)
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`
    return null
  }

  const embedUrl = getEmbedUrl(p.video_url)

  return (
    <div style={styles.heroCard}>
      <div style={styles.videoPlaceholder}>
        <span style={styles.matchTag}>🔴 EN DEBATE</span>
        <span style={styles.jornada}>J{p.jornada || 34}</span>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            style={{ width: '100%', height: '100%', border: 'none', position: 'absolute', top: 0, left: 0 }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div style={styles.playBtn}>▶</div>
        )}
      </div>
      <div style={styles.heroBody}>
        <p style={styles.miniMatch}>{p.partido}</p>
        <p style={styles.heroTitle}>{p.titulo}</p>
        <p style={styles.heroDesc}>{p.descripcion}</p>
        {!yaVoto ? (
          <div style={styles.voteRow}>
            <button style={styles.voteRobo} onClick={() => onVote(p.id, 'robo')}>🚨 Era un robo</button>
            <button style={styles.voteAcierto} onClick={() => onVote(p.id, 'acierto')}>✓ Decisión correcta</button>
          </div>
        ) : (
          <VoteBar robo={c.robo} acierto={c.acierto} />
        )}
      </div>
    </div>
  )
}

function MiniCard({ p, conteo, onVote }) {
  const votados = getVotados()
  const yaVoto = votados[p.id]
  const c = conteo[p.id] || { robo: 0, acierto: 0 }

  return (
    <div style={styles.miniCard}>
      <div style={styles.miniBody}>
        <p style={styles.miniMatch}>{p.partido}</p>
        <p style={styles.miniTitle}>{p.titulo}</p>
        {!yaVoto ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button onClick={() => onVote(p.id, 'robo')} style={{ ...styles.miniBtnRobo, flex: 1 }}>🚨 Robo</button>
            <button onClick={() => onVote(p.id, 'acierto')} style={{ ...styles.miniBtnAcierto, flex: 1 }}>✓ OK</button>
          </div>
        ) : (
          <VoteBar robo={c.robo} acierto={c.acierto} />
        )}
      </div>
    </div>
  )
}

export default function Polemica() {
  const [polemicas, setPolemicas] = useState([])
  const [conteo, setConteo] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    load()
    const channel = supabase.channel('votos-channel')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votos' }, payload => {
        const { polemica_id, tipo } = payload.new
        setConteo(prev => ({
          ...prev,
          [polemica_id]: {
            robo: (prev[polemica_id]?.robo || 0) + (tipo === 'robo' ? 1 : 0),
            acierto: (prev[polemica_id]?.acierto || 0) + (tipo === 'acierto' ? 1 : 0),
          }
        }))
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function load() {
    const { data: pols } = await supabase.from('polemicas').select('*')
    const { data: votos } = await supabase.from('votos').select('polemica_id, tipo')

    const c = {}
    ;(votos || []).forEach(v => {
      if (!c[v.polemica_id]) c[v.polemica_id] = { robo: 0, acierto: 0 }
      c[v.polemica_id][v.tipo]++
    })

    const ordenadas = (pols || []).sort((a, b) => {
      const totalA = (c[a.id]?.robo || 0) + (c[a.id]?.acierto || 0)
      const totalB = (c[b.id]?.robo || 0) + (c[b.id]?.acierto || 0)
      return totalB - totalA
    })

    setPolemicas(ordenadas)
    setConteo(c)
    setLoading(false)
  }

  const handleVote = async (polId, tipo) => {
    saveVotado(polId, tipo)
    setConteo(prev => ({
      ...prev,
      [polId]: {
        robo: (prev[polId]?.robo || 0) + (tipo === 'robo' ? 1 : 0),
        acierto: (prev[polId]?.acierto || 0) + (tipo === 'acierto' ? 1 : 0),
      }
    }))
    await supabase.from('votos').insert({ polemica_id: polId, tipo, fingerprint: getFingerprint() })
  }

  const destacada = polemicas[0]
  const resto = polemicas.slice(1)

  return (
    <section id="polemica" style={styles.section}>
      <div style={styles.label}>🔥 Polémicas de la Jornada <span style={styles.labelLine} /></div>
      {loading ? <p>Cargando...</p> : (
        <>
          {destacada && <HeroCard p={destacada} conteo={conteo} onVote={handleVote} />}
          <div style={styles.grid}>
            {resto.map((p, i) => <MiniCard key={p.id} p={p} conteo={conteo} onVote={handleVote} index={i} />)}
          </div>
        </>
      )}
    </section>
  )
}

const styles = {
  section: {
    padding: '1.5rem 2rem', maxWidth: '800px', margin: '0 auto', width: '100%',
    backgroundColor: 'var(--bg-color)', position: 'relative', transition: 'background-color 0.3s',
  },
  label: {
    fontSize: '12px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase',
    color: 'var(--text-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px',
  },
  labelLine: { flex: 1, height: '1px', background: 'var(--border-color)' },
  heroCard: {
    border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden',
    backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 0 var(--border-color)',
    position: 'relative', zIndex: 1, transition: 'all 0.3s ease',
  },
  videoPlaceholder: {
    background: 'var(--border-color)', height: '210px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', cursor: 'pointer', borderBottom: '1px solid var(--border-color)',
    overflow: 'hidden',
  },
  matchTag: {
    position: 'absolute', top: '14px', left: '14px', backgroundColor: '#E24B4A',
    color: '#fff', fontSize: '10px', fontWeight: '700', padding: '4px 12px', borderRadius: '100px',
    zIndex: 2,
  },
  jornada: {
    position: 'absolute', top: '14px', right: '14px', backgroundColor: 'var(--border-color)',
    color: 'var(--muted-color)', fontSize: '10px', fontWeight: '600', padding: '4px 12px', borderRadius: '100px',
    zIndex: 2,
  },
  playBtn: {
    width: '56px', height: '56px', backgroundColor: 'var(--text-color)', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--bg-color)', fontSize: '16px',
  },
  heroBody: { padding: '1.75rem' },
  heroTitle: { fontSize: '18px', fontWeight: '800', marginBottom: '10px', lineHeight: '1.4', color: 'var(--text-color)' },
  heroDesc: { fontSize: '13.5px', color: 'var(--muted-color)', lineHeight: '1.6', margin: '0 0 1.75rem 0' },
  voteRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' },
  voteRobo: {
    border: '1px solid #ff5c5a', borderRadius: '10px', padding: '13px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '700', color: '#ff5c5a', backgroundColor: 'rgba(226,75,74,0.1)',
    transition: 'all 0.2s ease',
  },
  voteAcierto: {
    border: '1px solid #7cd13b', borderRadius: '10px', padding: '13px', cursor: 'pointer',
    fontSize: '13px', fontWeight: '700', color: '#7cd13b', backgroundColor: 'rgba(99,153,34,0.1)',
    transition: 'all 0.2s ease',
  },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px', position: 'relative', zIndex: 1 },
  miniCard: {
    border: '1px solid var(--border-color)', borderRadius: '14px',
    backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(12px)', cursor: 'pointer',
  },
  miniBody: { padding: '1.25rem' },
  miniMatch: { fontSize: '11px', color: 'var(--muted-color)', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' },
  miniTitle: { fontSize: '13.5px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-color)' },
  miniBtnRobo: {
    border: '1px solid #ff5c5a', borderRadius: '8px', padding: '8px 6px', cursor: 'pointer',
    fontSize: '11px', fontWeight: '700', color: '#ff5c5a', backgroundColor: 'transparent', transition: 'all 0.2s',
  },
  miniBtnAcierto: {
    border: '1px solid #7cd13b', borderRadius: '8px', padding: '8px 6px', cursor: 'pointer',
    fontSize: '11px', fontWeight: '700', color: '#7cd13b', backgroundColor: 'transparent', transition: 'all 0.2s',
  },
}