import { useState, useEffect } from 'react'
import { supabase } from '../supabase' // ¡Corregido! Ahora se llama igual que en tu archivo de configuración

// ── FINGERPRINT ANTIFRAUDE ──
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

// ── BARRA DE VOTOS ──
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
      <div style={{ fontSize: '11px', color: 'var(--muted-color)', marginTop: '6px', textAlign: 'right' }}>
        {total} votos totales
      </div>
    </div>
  )
}

// ── HERO CARD ──
function HeroCard({ p, conteo, onVote }) {
  const votados = getVotados()
  const yaVoto = votados[p.id]
  const c = conteo[p.id] || { robo: 0, acierto: 0 }

  const votar = async (tipo) => {
    if (yaVoto) return
    await onVote(p.id, tipo)
  }

  return (
    <div style={styles.heroCard}>
      <div style={styles.videoPlaceholder}>
        <span style={styles.matchTag}>🔴 EN DEBATE</span>
        <span style={styles.jornada}>J{p.jornada || 34}</span>
        <div style={styles.playBtn}>▶</div>
      </div>
      <div style={styles.heroBody}>
        <p style={styles.miniMatch}>{p.partido}</p>
        <p style={styles.heroTitle}>{p.titulo}</p>
        <p style={styles.heroDesc}>{p.descripcion}</p>
        {!yaVoto ? (
          <div style={styles.voteRow}>
            <button style={styles.voteRobo} onClick={() => votar('robo')}>
              🚨 Era un robo
            </button>
            <button style={styles.voteAcierto} onClick={() => votar('acierto')}>
              ✓ Decisión correcta
            </button>
          </div>
        ) : (
          <VoteBar robo={c.robo} acierto={c.acierto} />
        )}
        {yaVoto && (
          <div style={{ fontSize: '11px', color: 'var(--muted-color)', marginTop: '8px' }}>
            Tu voto: <strong style={{ color: yaVoto === 'robo' ? '#E24B4A' : '#639922' }}>
              {yaVoto === 'robo' ? 'ROBO' : 'ACIERTO'}
            </strong>
          </div>
        )}
      </div>
    </div>
  )
}

// ── MINI CARD ──
function MiniCard({ p, conteo, onVote, index }) {
  const votados = getVotados()
  const yaVoto = votados[p.id]
  const c = conteo[p.id] || { robo: 0, acierto: 0 }
  const total = c.robo + c.acierto
  const roboP = total > 0 ? Math.round(c.robo / total * 100) : 50
  const winning = roboP >= 50 ? 'ROBO' : 'ACIERTO'
  const winColor = roboP >= 50 ? '#ff5c5a' : '#7cd13b'
  const winBg = roboP >= 50 ? 'rgba(226,75,74,0.15)' : 'rgba(99,153,34,0.15)'

  return (
    <div style={{ ...styles.miniCard, animation: `fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) ${0.2 + index * 0.08}s forwards` }}>
      <div style={styles.miniBody}>
        <p style={styles.miniMatch}>{p.partido}</p>
        <p style={styles.miniTitle}>{p.titulo}</p>
        {!yaVoto ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              onClick={() => onVote(p.id, 'robo')}
              style={{ ...styles.miniBtnRobo, flex: 1 }}>
              🚨 Robo
            </button>
            <button
              onClick={() => onVote(p.id, 'acierto')}
              style={{ ...styles.miniBtnAcierto, flex: 1 }}>
              ✓ OK
            </button>
          </div>
        ) : (
          <>
            <div style={styles.pillRow}>
              <span style={{ ...styles.pillRobo, backgroundColor: winBg, color: winColor }}>
                {winning} · {roboP >= 50 ? roboP : 100 - roboP}%
              </span>
              <span style={{ fontSize: '10px', color: 'var(--muted-color)', padding: '4px 8px' }}>
                {total} votos
              </span>
            </div>
            <div style={{ height: '4px', borderRadius: '100px', backgroundColor: 'var(--border-color)', display: 'flex', overflow: 'hidden', marginTop: '8px' }}>
              <div style={{ width: `${roboP}%`, backgroundColor: '#E24B4A', transition: 'width 0.5s' }} />
              <div style={{ width: `${100 - roboP}%`, backgroundColor: '#639922', transition: 'width 0.5s' }} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──
export default function Polemica() {
  const [polemicas, setPolemicas] = useState([])
  const [conteo, setConteo] = useState({})
  const [loading, setLoading] = useState(true)

  // Cargar polémicas + votos (Corregido con 'supabase')
  useEffect(() => {
    async function load() {
      const { data: pols } = await supabase
        .from('polemicas')
        .select('*')
        .eq('activa', true)
        .order('id')

      if (!pols?.length) { setLoading(false); return }
      setPolemicas(pols)

      const ids = pols.map(p => p.id)
      const { data: votos } = await supabase
        .from('votos')
        .select('polemica_id, tipo')
        .in('polemica_id', ids)

      const c = {}
      ;(votos || []).forEach(v => {
        if (!c[v.polemica_id]) c[v.polemica_id] = { robo: 0, acierto: 0 }
        c[v.polemica_id][v.tipo]++
      })
      setConteo(c)
      setLoading(false)
    }
    load()
  }, [])

  // Suscripción tiempo real (Corregido con 'supabase')
  useEffect(() => {
    const channel = supabase.channel('votos-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'votos' }, payload => {
        const { polemica_id, tipo } = payload.new
        setConteo(prev => ({
          ...prev,
          [polemica_id]: {
            robo: (prev[polemica_id]?.robo || 0) + (tipo === 'robo' ? 1 : 0),
            acierto: (prev[polemica_id]?.acierto || 0) + (tipo === 'acierto' ? 1 : 0),
          }
        }))
      })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  // Votar (Corregido con 'supabase')
  const handleVote = async (polId, tipo) => {
    const votados = getVotados()
    if (votados[polId]) return

    const fp = getFingerprint()
    const { error } = await supabase.from('votos').insert({ polemica_id: polId, tipo, fingerprint: fp })
    if (error) { console.error(error); return }

    saveVotado(polId, tipo)
    setConteo(prev => ({
      ...prev,
      [polId]: {
        robo: (prev[polId]?.robo || 0) + (tipo === 'robo' ? 1 : 0),
        acierto: (prev[polId]?.acierto || 0) + (tipo === 'acierto' ? 1 : 0),
      }
    }))
  }

  const destacada = polemicas.find(p => p.destacada) || polemicas[0]
  const resto = polemicas.filter(p => p.id !== destacada?.id)

  if (loading) return (
    <section style={styles.section}>
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-color)', fontSize: '13px' }}>
        Cargando polémicas...
      </div>
    </section>
  )

  if (!polemicas.length) return (
    <section style={styles.section}>
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-color)', fontSize: '13px' }}>
        No hay polémicas activas esta jornada.
      </div>
    </section>
  )

  return (
    <section id="polemica" style={styles.section}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes playPulse {
          0% { box-shadow: 0 0 0 0 rgba(150,150,150,0.4); }
          70% { box-shadow: 0 0 0 12px rgba(0,0,0,0); }
        }
      `}</style>
      <div style={styles.bgGlow1} />
      <div style={styles.bgGlow2} />
      <div style={styles.label}>
        🔥 Polémicas de la Jornada <span style={styles.labelLine} />
      </div>
      {destacada && (
        <HeroCard p={destacada} conteo={conteo} onVote={handleVote} />
      )}
      {resto.length > 0 && (
        <div style={styles.grid}>
          {resto.map((p, index) => (
            <MiniCard key={p.id} p={p} conteo={conteo} onVote={handleVote} index={index} />
          ))}
        </div>
      )}
    </section>
  )
}

// ── ESTILOS ──
const styles = {
  section: {
    padding: '1.5rem 2rem', maxWidth: '800px', margin: '0 auto', width: '100%',
    backgroundColor: 'var(--bg-color)', position: 'relative', transition: 'background-color 0.3s',
  },
  bgGlow1: {
    position: 'absolute', top: '20%', right: '-10%', width: '300px', height: '300px',
    background: 'radial-gradient(circle, rgba(226,75,74,0.08) 0%, transparent 70%)',
    zIndex: 0, pointerEvents: 'none',
  },
  bgGlow2: {
    position: 'absolute', bottom: '10%', left: '-10%', width: '350px', height: '350px',
    background: 'radial-gradient(circle, rgba(99,153,34,0.06) 0%, transparent 70%)',
    zIndex: 0, pointerEvents: 'none',
  },
  label: {
    fontSize: '12px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase',
    color: 'var(--text-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px',
    animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) forwards',
  },
  labelLine: { flex: 1, height: '1px', background: 'var(--border-color)' },
  heroCard: {
    border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden',
    backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(16px)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.1), inset 0 1px 0 0 var(--border-color)',
    animation: 'fadeInUp 0.6s cubic-bezier(0.16,1,0.3,1) 0.1s forwards',
    opacity: 0, position: 'relative', zIndex: 1, transition: 'all 0.3s ease',
  },
  videoPlaceholder: {
    background: 'var(--border-color)', height: '210px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    position: 'relative', cursor: 'pointer', borderBottom: '1px solid var(--border-color)',
  },
  matchTag: {
    position: 'absolute', top: '14px', left: '14px', backgroundColor: '#E24B4A',
    color: '#fff', fontSize: '10px', fontWeight: '700', padding: '4px 12px', borderRadius: '100px',
  },
  jornada: {
    position: 'absolute', top: '14px', right: '14px', backgroundColor: 'var(--border-color)',
    color: 'var(--muted-color)', fontSize: '10px', fontWeight: '600', padding: '4px 12px', borderRadius: '100px',
  },
  playBtn: {
    width: '56px', height: '56px', backgroundColor: 'var(--text-color)', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--bg-color)', fontSize: '16px', animation: 'playPulse 2s infinite',
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
    backgroundColor: 'var(--card-bg)', backdropFilter: 'blur(12px)', cursor: 'pointer', opacity: 0,
  },
  miniBody: { padding: '1.25rem' },
  miniMatch: { fontSize: '11px', color: 'var(--muted-color)', fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase' },
  miniTitle: { fontSize: '13.5px', fontWeight: '700', marginBottom: '14px', color: 'var(--text-color)' },
  pillRow: { display: 'flex', gap: '6px', alignItems: 'center' },
  pillRobo: { fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '100px', backgroundColor: 'rgba(226,75,74,0.15)', color: '#ff5c5a' },
  miniBtnRobo: {
    border: '1px solid #ff5c5a', borderRadius: '8px', padding: '8px 6px', cursor: 'pointer',
    fontSize: '11px', fontWeight: '700', color: '#ff5c5a', backgroundColor: 'transparent', transition: 'all 0.2s',
  },
  miniBtnAcierto: {
    border: '1px solid #7cd13b', borderRadius: '8px', padding: '8px 6px', cursor: 'pointer',
    fontSize: '11px', fontWeight: '700', color: '#7cd13b', backgroundColor: 'transparent', transition: 'all 0.2s',
  },
}