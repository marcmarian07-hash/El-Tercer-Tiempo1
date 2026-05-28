import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const inputStyle = {
  width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
  background: 'var(--bg-color)', border: '1px solid var(--border-color)',
  color: 'var(--text-color)', marginBottom: '1rem', boxSizing: 'border-box'
}

export default function AdminPanel() {
  const [pendientes, setPendientes] = useState([])
  const [publicadas, setPublicadas] = useState([])
  const [videoUrls, setVideoUrls] = useState({})
  const [tab, setTab] = useState('pendientes')
  const [form, setForm] = useState({
    partido: '', titulo: '', descripcion: '', minuto: '', jornada: '', video_url: ''
  })
  const [enviando, setEnviando] = useState(false)

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

  const aceptar = async (item, destino = 'polemicas') => {
    if (destino === 'polemicas') {
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
    } else {
      const { error } = await supabase.from('temas_foro').insert([{
        titulo: item.titulo,
        descripcion: item.descripcion + (item.partido ? ' — ' + item.partido : ''),
        categoria: 'otros',
        autor_nick: 'Redacción',
        autor_avatar: '📰'
      }])
      if (error) { alert("Error al publicar en foro: " + error.message); return }
    }
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

  const publicarManual = async () => {
    if (!form.partido || !form.titulo || !form.descripcion) {
      alert('Partido, título y descripción son obligatorios.'); return
    }
    setEnviando(true)
    const { error } = await supabase.from('polemicas').insert([{
      partido: form.partido,
      titulo: form.titulo,
      descripcion: form.descripcion,
      minuto: form.minuto || '90',
      jornada: parseInt(form.jornada) || 1,
      video_url: form.video_url || null,
      activa: true
    }])
    if (error) { alert("Error: " + error.message); setEnviando(false); return }
    setForm({ partido: '', titulo: '', descripcion: '', minuto: '', jornada: '', video_url: '' })
    cargarPublicadas()
    setTab('publicadas')
    setEnviando(false)
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

      <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button onClick={() => setTab('pendientes')} style={tabStyle('pendientes')}>
          Pendientes {pendientes.length > 0 && `(${pendientes.length})`}
        </button>
        <button onClick={() => setTab('publicadas')} style={tabStyle('publicadas')}>
          Publicadas {publicadas.length > 0 && `(${publicadas.length})`}
        </button>
        <button onClick={() => setTab('crear')} style={tabStyle('crear')}>
          ✍️ Crear manual
        </button>
      </div>

      {tab === 'pendientes' && (
        <>
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
                {item.fuente && <span style={{ marginLeft: '8px', color: '#5bc4ff' }}>· {item.fuente}</span>}
              </p>
              <p style={{ fontSize: '16px', fontWeight: '800', marginBottom: '8px', color: 'var(--text-color)' }}>{item.titulo}</p>
              <p style={{ fontSize: '13px', color: 'var(--muted-color)', marginBottom: '1rem', lineHeight: '1.5' }}>{item.descripcion}</p>
              <input
                type="text"
                placeholder="URL del vídeo (YouTube...) — opcional"
                value={videoUrls[item.id] || ''}
                onChange={e => setVideoUrls(prev => ({ ...prev, [item.id]: e.target.value }))}
                style={{ ...inputStyle, marginBottom: '1rem' }}
              />
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button onClick={() => aceptar(item, 'polemicas')} style={{
                  background: '#1a3d1a', color: '#7cd13b', border: '1px solid #7cd13b',
                  padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700'
                }}>⚽ Publicar en Polémicas</button>
                <button onClick={() => aceptar(item, 'foro')} style={{
                  background: '#1a2a3d', color: '#5bc4ff', border: '1px solid #5bc4ff',
                  padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700'
                }}>💬 Publicar en Foro</button>
                <button onClick={() => denegar(item)} style={{
                  background: '#3d1a1a', color: '#ff5c5a', border: '1px solid #ff5c5a',
                  padding: '8px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700'
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

      {tab === 'crear' && (
        <div style={{ border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '14px', background: 'var(--card-bg)' }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: '16px', fontWeight: '800' }}>✍️ Publicar Polémica Manual</h3>

          <label style={{ fontSize: '12px', color: 'var(--muted-color)', fontWeight: '700', textTransform: 'uppercase' }}>Partido *</label>
          <input style={inputStyle} placeholder="Ej: Real Madrid vs FC Barcelona"
            value={form.partido} onChange={e => setForm(p => ({ ...p, partido: e.target.value }))} />

          <label style={{ fontSize: '12px', color: 'var(--muted-color)', fontWeight: '700', textTransform: 'uppercase' }}>Título *</label>
          <input style={inputStyle} placeholder="Ej: ¿Era penalti la mano de Militao?"
            value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))} />

          <label style={{ fontSize: '12px', color: 'var(--muted-color)', fontWeight: '700', textTransform: 'uppercase' }}>Descripción *</label>
          <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }}
            placeholder="Describe la jugada polémica..."
            value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))} />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted-color)', fontWeight: '700', textTransform: 'uppercase' }}>Minuto</label>
              <input style={inputStyle} placeholder="Ej: 78"
                value={form.minuto} onChange={e => setForm(p => ({ ...p, minuto: e.target.value }))} />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: 'var(--muted-color)', fontWeight: '700', textTransform: 'uppercase' }}>Jornada</label>
              <input style={inputStyle} placeholder="Ej: 34"
                value={form.jornada} onChange={e => setForm(p => ({ ...p, jornada: e.target.value }))} />
            </div>
          </div>

          <label style={{ fontSize: '12px', color: 'var(--muted-color)', fontWeight: '700', textTransform: 'uppercase' }}>URL Vídeo (opcional)</label>
          <input style={inputStyle} placeholder="https://youtube.com/watch?v=..."
            value={form.video_url} onChange={e => setForm(p => ({ ...p, video_url: e.target.value }))} />

          <button onClick={publicarManual} disabled={enviando} style={{
            width: '100%', padding: '12px', borderRadius: '10px', cursor: enviando ? 'not-allowed' : 'pointer',
            background: '#1a3d1a', color: '#7cd13b', border: '1px solid #7cd13b',
            fontSize: '14px', fontWeight: '800', marginTop: '0.5rem'
          }}>
            {enviando ? 'Publicando...' : '🚀 Publicar Polémica'}
          </button>
        </div>
      )}
    </div>
  )
}