import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function getVotados() {
  try { return JSON.parse(localStorage.getItem('lloro_votos') || '{}') } catch { return {} }
}
function saveVotado(polId, tipo) {
  const v = getVotados(); v[polId] = tipo
  localStorage.setItem('lloro_votos', JSON.stringify(v))
}
function getFingerprint() {
  const key = 'lloro_fp'
  let fp = localStorage.getItem(key)
  if (!fp) { fp = Math.random().toString(36).slice(2) + Date.now().toString(36); localStorage.setItem(key, fp) }
  return fp
}

export default function Resultados({ usuario, abrirAuth }) {
  const [jornadas, setJornadas] = useState([])
  const [jornadaSel, setJornadaSel] = useState(null)
  const [partidos, setPartidos] = useState([])
  const [polemicas, setPolemicas] = useState([])
  const [votos, setVotos] = useState({})
  const [conteos, setConteos] = useState({})
  const [partidoAbierto, setPartidoAbierto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { cargarJornadas() }, [])
  useEffect(() => { if (jornadaSel) cargarPartidos(jornadaSel) }, [jornadaSel])

  async function cargarJornadas() {
    const { data } = await supabase.from('resultados').select('jornada').order('jornada', { ascending: true })
    if (data) {
      const unicas = [...new Set(data.map(r => r.jornada))].sort((a, b) => a - b)
      setJornadas(unicas)
      setJornadaSel(unicas[unicas.length - 1])
    }
    setLoading(false)
  }

  async function cargarPartidos(jornada) {
    const { data: res } = await supabase.from('resultados').select('*').eq('jornada', jornada).order('fecha', { ascending: true })
    const { data: pols } = await supabase.from('polemicas').select('*')
    const { data: vts } = await supabase.from('votos').select('polemica_id, tipo')

    const c = {}
    ;(vts || []).forEach(v => {
      if (!c[v.polemica_id]) c[v.polemica_id] = { robo: 0, acierto: 0 }
      c[v.polemica_id][v.tipo]++
    })

    setPartidos(res || [])
    setPolemicas(pols || [])
    setConteos(c)
    setVotos(getVotados())
  }

  function getPolemicasPartido(partido) {
    return polemicas.filter(p =>
      p.partido?.toLowerCase().includes(partido.equipo_local?.toLowerCase()) ||
      p.partido?.toLowerCase().includes(partido.equipo_visitante?.toLowerCase())
    )
  }

  function getMarcadorAjustado(partido) {
    const pols = getPolemicasPartido(partido)
    let ajLocal = 0, ajVisitante = 0
    pols.forEach(p => {
      const c = conteos[p.id] || { robo: 0, acierto: 0 }
      const total = c.robo + c.acierto
      if (total > 0 && c.robo / total > 0.6) {
        if (p.equipo_perjudicado?.toLowerCase().includes(partido.equipo_local?.toLowerCase())) ajLocal++
        else ajVisitante++
      }
    })
    return { local: partido.goles_local + ajLocal, visitante: partido.goles_visitante + ajVisitante, ajustado: ajLocal > 0 || ajVisitante > 0 }
  }

  const handleVote = async (polId, tipo) => {
    if (!usuario) { abrirAuth(); return }
    saveVotado(polId, tipo)
    setVotos(getVotados())
    setConteos(prev => ({
      ...prev,
      [polId]: {
        robo: (prev[polId]?.robo || 0) + (tipo === 'robo' ? 1 : 0),
        acierto: (prev[polId]?.acierto || 0) + (tipo === 'acierto' ? 1 : 0),
      }
    }))
    await supabase.from('votos').insert({ polemica_id: polId, tipo, fingerprint: getFingerprint() })
  }

  if (loading) return (
    <section style={s.section}>
      <p style={{ color: 'var(--muted-color)', textAlign: 'center', padding: '3rem' }}>Cargando resultados...</p>
    </section>
  )

  return (
    <section style={s.section}>
      <div style={s.label}>⚽ Resultados por Jornada <span style={s.labelLine} /></div>

      {/* Selector jornadas */}
      <div style={s.jornadasWrap}>
        {jornadas.map(j => (
          <button key={j} onClick={() => { setJornadaSel(j); setPartidoAbierto(null) }} style={{
            ...s.jornadaBtn,
            background: jornadaSel === j ? 'var(--text-color)' : 'var(--card-bg)',
            color: jornadaSel === j ? 'var(--bg-color)' : 'var(--muted-color)',
            border: jornadaSel === j ? '1px solid var(--text-color)' : '1px solid var(--border-color)',
          }}>J{j}</button>
        ))}
      </div>

      {/* Lista partidos */}
      {partidos.length === 0 && (
        <p style={{ color: 'var(--muted-color)', fontSize: '14px', textAlign: 'center', padding: '2rem' }}>No hay resultados para esta jornada.</p>
      )}

      {partidos.map(partido => {
        const pols = getPolemicasPartido(partido)
        const ajustado = getMarcadorAjustado(partido)
        const abierto = partidoAbierto === partido.id

        return (
          <div key={partido.id} style={{ marginBottom: '10px' }}>
            <div onClick={() => setPartidoAbierto(abierto ? null : partido.id)} style={s.partidoCard}>
              <div style={s.equipoCol}>
                <span style={s.equipoNombre}>{partido.equipo_local}</span>
              </div>
              <div style={s.marcadorCol}>
                <span style={s.marcadorOficial}>{partido.goles_local} - {partido.goles_visitante}</span>
                {ajustado.ajustado && (
                  <span style={s.marcadorLloro}>{ajustado.local} - {ajustado.visitante} 🔥</span>
                )}
                {pols.length > 0 && (
                  <span style={s.badge}>{pols.length} polémica{pols.length > 1 ? 's' : ''}</span>
                )}
              </div>
              <div style={{ ...s.equipoCol, textAlign: 'right' }}>
                <span style={s.equipoNombre}>{partido.equipo_visitante}</span>
              </div>
              <span style={{ color: 'var(--muted-color)', fontSize: '12px', marginLeft: '8px' }}>{abierto ? '▲' : '▼'}</span>
            </div>

            {abierto && (
              <div style={s.detallePanel}>
                <div style={s.marcadoresRow}>
                  <div style={s.marcadorBox}>
                    <p style={s.marcadorLabel}>Oficial</p>
                    <p style={s.marcadorNum}>{partido.goles_local} - {partido.goles_visitante}</p>
                  </div>
                  <div style={{ ...s.marcadorBox, borderColor: ajustado.ajustado ? '#E24B4A' : 'var(--border-color)' }}>
                    <p style={s.marcadorLabel}>Llorómetro</p>
                    <p style={{ ...s.marcadorNum, color: ajustado.ajustado ? '#E24B4A' : 'var(--muted-color)' }}>
                      {ajustado.local} - {ajustado.visitante}
                    </p>
                    {!ajustado.ajustado && <p style={{ fontSize: '11px', color: 'var(--muted-color)' }}>Sin ajustes</p>}
                  </div>
                </div>

                {pols.length > 0 ? (
                  <>
                    <p style={s.polLabel}>Polémicas del partido</p>
                    {pols.map(p => {
                      const c = conteos[p.id] || { robo: 0, acierto: 0 }
                      const total = c.robo + c.acierto
                      const roboP = total > 0 ? Math.round((c.robo / total) * 100) : 50
                      const yaVoto = votos[p.id]
                      return (
                        <div key={p.id} style={s.polCard}>
                          <p style={s.polTitulo}>{p.titulo}</p>
                          {p.descripcion && <p style={s.polDesc}>{p.descripcion}</p>}
                          {!yaVoto ? (
                            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                              <button onClick={() => handleVote(p.id, 'robo')} style={s.btnRobo}>🚨 Era un robo</button>
                              <button onClick={() => handleVote(p.id, 'acierto')} style={s.btnAcierto}>✓ Decisión correcta</button>
                            </div>
                          ) : (
                            <div style={{ marginTop: '10px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--muted-color)', marginBottom: '6px' }}>
                                <span>ROBO {roboP}%</span><span>ACIERTO {100 - roboP}%</span>
                              </div>
                              <div style={{ height: '6px', borderRadius: '100px', background: 'var(--border-color)', display: 'flex', overflow: 'hidden' }}>
                                <div style={{ width: `${roboP}%`, background: '#E24B4A', transition: 'width 0.5s' }} />
                                <div style={{ width: `${100 - roboP}%`, background: '#639922', transition: 'width 0.5s' }} />
                              </div>
                              <p style={{ fontSize: '11px', color: 'var(--muted-color)', marginTop: '4px', textAlign: 'right' }}>{total} votos</p>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </>
                ) : (
                  <p style={{ fontSize: '13px', color: 'var(--muted-color)', marginTop: '1rem' }}>Sin polémicas registradas para este partido.</p>
                )}
              </div>
            )}
          </div>
        )
      })}
    </section>
  )
}

const s = {
  section: { padding: '1.5rem 2rem', maxWidth: '800px', margin: '0 auto', backgroundColor: 'var(--bg-color)' },
  label: { fontSize: '12px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' },
  labelLine: { flex: 1, height: '1px', background: 'var(--border-color)' },
  jornadasWrap: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' },
  jornadaBtn: { padding: '6px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700' },
  partidoCard: { display: 'flex', alignItems: 'center', padding: '1rem 1.25rem', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--card-bg)', cursor: 'pointer', gap: '10px' },
  equipoCol: { flex: 1 },
  equipoNombre: { fontSize: '14px', fontWeight: '700', color: 'var(--text-color)' },
  marcadorCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '120px' },
  marcadorOficial: { fontSize: '20px', fontWeight: '800', color: 'var(--text-color)' },
  marcadorLloro: { fontSize: '13px', fontWeight: '700', color: '#E24B4A' },
  badge: { fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px', background: 'rgba(226,75,74,0.15)', color: '#E24B4A' },
  detallePanel: { border: '1px solid var(--border-color)', borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '1.25rem', background: 'var(--card-bg)' },
  marcadoresRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.25rem' },
  marcadorBox: { border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', textAlign: 'center' },
  marcadorLabel: { fontSize: '11px', fontWeight: '700', color: 'var(--muted-color)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' },
  marcadorNum: { fontSize: '28px', fontWeight: '800', color: 'var(--text-color)' },
  polLabel: { fontSize: '11px', fontWeight: '800', color: 'var(--muted-color)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' },
  polCard: { border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', marginBottom: '10px', background: 'var(--bg-color)' },
  polTitulo: { fontSize: '14px', fontWeight: '700', color: 'var(--text-color)', marginBottom: '4px' },
  polDesc: { fontSize: '12px', color: 'var(--muted-color)', lineHeight: '1.5' },
  btnRobo: { flex: 1, border: '1px solid #ff5c5a', borderRadius: '8px', padding: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#ff5c5a', background: 'rgba(226,75,74,0.1)' },
  btnAcierto: { flex: 1, border: '1px solid #7cd13b', borderRadius: '8px', padding: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', color: '#7cd13b', background: 'rgba(99,153,34,0.1)' },
}