import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

export default function AdminPanel() {
  const [pendientes, setPendientes] = useState([])
  const [publicadas, setPublicadas] = useState([])
  const [videoUrls, setVideoUrls] = useState({})
  const [tab, setTab] = useState('pendientes')

  useEffect(() => {
    cargarPendientes()
    cargarPublicadas()
  }, [])

  async function cargarPendientes() {
    const { data } = await supabase.from('polemicas_candidatas').select('*').order('id', { ascending: false })
    if (data) setPendientes(data)
  }

  async function cargarPublicadas() {
    const { data } = await supabase.from('polemicas').select('*').order('id', { ascending: false })
    if (data) setPublicadas(data)
  }

  const crearSimulacion = async () => {
    const { error } = await supabase.from('polemicas_candidatas').insert([{
      partido: 'Equipo A vs Equipo B',
      titulo: 'Polémica de prueba ' + new Date().toLocaleTimeString(),
      descripcion: 'Detalle de la jugada polémica que generó debate en redes.',
      minuto: '90',
      jornada: 1
    }])
    if (error) alert("Error al crear: " + error.message)
    else cargarPendientes()
  }

  const aceptar = async (item) => {
    const { error } = await supabase.from('polemicas').insert([{
      partido: item.partido,
      titulo: item.titulo,
      descripcion: item.descripcion,
      minuto: item.minuto,
      jornada: item.jornada,
      video_url: videoUrls[item.id] || null,
      activa: true
    }])
    if (error) { alert("Error al publicar: " + error.message); return }
    await supabase.from('polemicas_candidatas').delete().eq('id', item.id)
    setVideoUrls(prev => { const n = { ...prev }; delete n[item.id]; return n })
    cargarPendientes()
    cargarPublicadas()
  }

  const denegar = async (item) => {
    await supabase.from('polemicas_candidatas').delete().eq('id', item.id)
    cargarPendientes()
  }

  const eliminarPublicada = async (item) => {
    if (!confirm(`¿Eliminar "${item.titulo}"?`)) return
    const { error } = await supabase.from('polemicas').delete().eq('id', item.id)
    if (error) { alert("Error al eliminar: " + error.message); return }
    cargarPublicadas()
  }

  const tabStyle = (t) => ({
    padding: '8px 20px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700',
    border: tab === t ? '1px solid var(--text-color)' : '1px solid var(--border-color)',
    background: tab === t ? 'var(--text-color)' : 'transparent',
    color: tab === t ? 'var(--bg-color)' : 'var(--muted-color)',
  })

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', color: 'var(--text-color)' }}>
      <h2 style={{ marginBottom: '1.5rem', fontSize: '20px', fontWeight: '800' }}>🛠️ Panel de Moderación</h2>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <button onClick={() => setTab('pendientes')} style={tabStyle('pendientes')}>
          Pendientes {pendientes.length > 0 && `(${pendientes.length})`}
        </button>
        <button onClick={() => setTab('publicadas')} style={tabStyle('publicadas')}>
          Publicadas {publicadas.length > 0 && `(${publicadas.length})`}
        </button>
      </div>

      {tab === 'pendientes' && (
        <>
          <button onClick={crearSimulacion} style={{
            padding: '10px 18px', cursor: 'pointer', background: 'var(--card-bg)',
            border: '1px solid var(--border-color)', borderRadius: '10px',
            color: 'var(--text-color)', fontSize: '13px', marginBottom: '1.5rem'
          }}>➕ Crear Polémica de Prueba</button>

          {pendientes.length === 0 && (
            <p style={{ color: 'var(--muted-color)', fontSize: '14px' }}>No hay polémicas pendientes.</p>
          )}

          {pendientes.map(item => (
            <div key={item.id} style={{
              border: '1px solid var(--border-color)', padding: '1.25rem',
              margin: '1rem 0', borderRadius: '14px', background: 'var(--card-bg)'
            }}>
              <p style={{ fontSize: '11px', color: 'var(--muted-color)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                {item.partido} · Min {item.minuto} · J{item.jornada}
              </p>
              <p style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-color)' }}>{item.titulo}</p>
              <p style={{ fontSize: '13px', color: 'var(--muted-color)', marginBottom: '1rem', lineHeight: '1.5' }}>{item.descripcion}</p>
              <input
                type="text"
                placeholder="URL del vídeo (YouTube...) — opcional"
                value={videoUrls[item.id] || ''}
                onChange={e => setVideoUrls(prev => ({ ...prev, [item.id]: e.target.value }))}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
                  background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                  color: 'var(--text-color)', marginBottom: '1rem', boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => aceptar(item)} style={{
                  background: '#1a3d1a', color: '#7cd13b', border: '1px solid #7cd13b',
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700'
                }}>✅ Aceptar y Publicar</button>
                <button onClick={() => denegar(item)} style={{
                  background: '#3d1a1a', color: '#ff5c5a', border: '1px solid #ff5c5a',
                  padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '700'
                }}>❌ Denegar</button>
              </div>
            </div>
          ))}
        </>
      )}

      {tab === 'publicadas' && (
        <>
          {publicadas.length === 0 && (
            <p style={{ color: 'var(--muted-color)', fontSize: '14px' }}>No hay polémicas publicadas.</p>
          )}
          {publicadas.map(item => (
            <div key={item.id} style={{
              border: '1px solid var(--border-color)', padding: '1.25rem',
              margin: '1rem 0', borderRadius: '14px', background: 'var(--card-bg)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem'
            }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '11px', color: 'var(--muted-color)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: '700' }}>
                  {item.partido} · Min {item.minuto} · J{item.jornada}
                </p>
                <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '4px' }}>{item.titulo}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted-color)' }}>
                  {item.video_url ? '🎬 Con vídeo' : '📄 Sin vídeo'}
                </p>
              </div>
              <button onClick={() => eliminarPublicada(item)} style={{
                background: '#3d1a1a', color: '#ff5c5a', border: '1px solid #ff5c5a',
                padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
                fontWeight: '700', whiteSpace: 'nowrap', flexShrink: 0
              }}>🗑️ Eliminar</button>
            </div>
          ))}
        </>
      )}
    </div>
  )
}