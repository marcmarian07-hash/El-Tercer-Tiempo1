import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

const styles = {
  page: { padding: '1.5rem 2rem', maxWidth: '800px', margin: '0 auto' },
  label: { fontSize: '11px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' },
  labelLine: { flex: 1, height: '1px', backgroundColor: 'var(--border-color)' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '4px' },
  tab: { flexShrink: 0, background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 16px', fontSize: '12px', color: 'var(--muted-color)', cursor: 'pointer' },
  tabActive: { flexShrink: 0, background: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 16px', fontSize: '12px', color: 'var(--text-color)', fontWeight: '800', cursor: 'pointer' },
  chatWrap: { border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--card-bg)' },
  chatHeader: { padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  mensajesList: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '340px', maxHeight: '420px', overflowY: 'auto' },
  mensaje: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
  autor: { fontSize: '13px', fontWeight: '700', color: 'var(--text-color)' },
  equipo: { fontSize: '11px', color: 'var(--muted-color)', marginLeft: '6px' },
  texto: { fontSize: '13px', color: 'var(--muted-color)', lineHeight: '1.6', marginTop: '2px' },
  tiempo: { fontSize: '11px', color: 'var(--muted-color)', marginTop: '2px' },
  inputArea: { padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'center' },
  msgInput: { flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: 'var(--text-color)', outline: 'none' },
  sendBtn: { padding: '10px 16px', borderRadius: '10px', border: 'none', background: '#E24B4A', color: '#fff', fontWeight: '800', fontSize: '13px', cursor: 'pointer' },
  temaCard: { border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1rem', background: 'var(--card-bg)', cursor: 'pointer', marginBottom: '10px' },
  nuevaTemaBtn: { padding: '10px 18px', borderRadius: '10px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-color)', fontSize: '13px', fontWeight: '700', cursor: 'pointer', marginBottom: '1rem' },
  inputStyle: { width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px', background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', marginBottom: '10px', boxSizing: 'border-box' },
}

const CATEGORIAS = [
  { id: 'general', label: '💬 General' },
  { id: 'arbitraje', label: '🟨 Arbitraje' },
  { id: 'laliga', label: '⚽ LaLiga' },
  { id: 'champions', label: '🏆 Champions' },
  { id: 'seleccion', label: '🇪🇸 Selección' },
  { id: 'otros', label: '➕ Otros' },
]

const SUBTEMAS_OTROS = [
  'Fichaje bomba', 'Declaraciones polémicas', 'Escándalo fuera del campo',
  'Presidente / directiva', 'Vestuario', 'Entrenador', 'Afición / ultras',
  'VAR / tecnología', 'Fútbol europeo', 'Sudamérica', 'Selección sub-21',
  'Fútbol femenino', 'Rumor / filtración', 'Otro tema'
]

function tiempoRelativo(fecha) {
  const diff = new Date() - new Date(fecha)
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'Ahora'
  if (min < 60) return `Hace ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

function ChatBox({ temaId, titulo, subtitulo, usuario, abrirAuth }) {
  const [mensajes, setMensajes] = useState([])
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    cargarMensajes()
    const channel = supabase.channel('mensajes-' + temaId)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'mensajes_foro', filter: 'tema_id=eq.' + temaId }, payload => {
        setMensajes(prev => [...prev, payload.new])
        setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
      }).subscribe()
    return () => supabase.removeChannel(channel)
  }, [temaId])

  async function cargarMensajes() {
    const { data } = await supabase.from('mensajes_foro').select('*').eq('tema_id', temaId).order('created_at', { ascending: true })
    if (data) setMensajes(data)
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100)
  }

  const enviar = async () => {
    if (!texto.trim() || enviando) return
    setEnviando(true)
    await supabase.from('mensajes_foro').insert([{
      tema_id: temaId,
      autor_id: usuario.id,
      autor_nick: usuario.nick,
      autor_avatar: usuario.avatar,
      autor_equipo: usuario.equipo,
      texto: texto.trim()
    }])
    setTexto('')
    setEnviando(false)
  }

  return (
    <div style={styles.chatWrap}>
      <div style={styles.chatHeader}>
        <div>
          <p style={{ fontWeight: '800', color: 'var(--text-color)', fontSize: '15px' }}>{titulo}</p>
          {subtitulo && <p style={{ fontSize: '11px', color: 'var(--muted-color)' }}>{subtitulo}</p>}
        </div>
        <span style={{ fontSize: '11px', color: 'var(--muted-color)' }}>{mensajes.length} mensajes</span>
      </div>
      <div style={styles.mensajesList}>
        {mensajes.length === 0 && (
          <p style={{ color: 'var(--muted-color)', fontSize: '13px', textAlign: 'center', margin: 'auto' }}>Sé el primero en comentar</p>
        )}
        {mensajes.map(m => (
          <div key={m.id} style={styles.mensaje}>
            <div style={styles.avatar}>{m.autor_avatar || '🦊'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={styles.autor}>{m.autor_nick}</span>
                {m.autor_equipo && <span style={styles.equipo}>· {m.autor_equipo}</span>}
              </div>
              <p style={styles.texto}>{m.texto}</p>
              <p style={styles.tiempo}>{tiempoRelativo(m.created_at)}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div style={styles.inputArea}>
        {usuario ? (
          <>
            <input
              style={styles.msgInput}
              placeholder="Escribe tu opinión..."
              value={texto}
              onChange={e => setTexto(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && enviar()}
            />
            <button style={styles.sendBtn} onClick={enviar} disabled={enviando}>
              {enviando ? '...' : '↑'}
            </button>
          </>
        ) : (
          <div style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: '12px', color: 'var(--muted-color)' }}>
            <button style={{ color: 'var(--text-color)', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }} onClick={abrirAuth}>Identificarse</button> para comentar.
          </div>
        )}
      </div>
    </div>
  )
}

export default function Foro({ usuario, abrirAuth }) {
  const [tab, setTab] = useState('general')
  const [temas, setTemas] = useState([])
  const [vistaDetalle, setVistaDetalle] = useState(null)
  const [mostrarFormTema, setMostrarFormTema] = useState(false)
  const [nuevoTema, setNuevoTema] = useState({ titulo: '', descripcion: '', subtema: '' })
  const [creando, setCreando] = useState(false)

  useEffect(() => { cargarTemas() }, [tab])

  async function cargarTemas() {
    const { data } = await supabase.from('temas_foro').select('*').eq('categoria', tab).order('created_at', { ascending: false })
    if (data) setTemas(data)
  }

  const crearTema = async () => {
    if (!nuevoTema.titulo.trim()) { alert('El título es obligatorio'); return }
    if (!usuario) { abrirAuth(); return }
    if (tab === 'otros' && !nuevoTema.subtema) { alert('Selecciona un subtema'); return }
    setCreando(true)

    const tituloFinal = tab === 'otros' && nuevoTema.subtema
      ? `[${nuevoTema.subtema}] ${nuevoTema.titulo}`
      : nuevoTema.titulo

    const { data, error } = await supabase.from('temas_foro').insert([{
      titulo: tituloFinal,
      descripcion: nuevoTema.descripcion.trim(),
      categoria: tab,
      autor_id: usuario.id,
      autor_nick: usuario.nick,
      autor_avatar: usuario.avatar
    }]).select().single()

    if (error) { alert('Error: ' + error.message); setCreando(false); return }
    setNuevoTema({ titulo: '', descripcion: '', subtema: '' })
    setMostrarFormTema(false)
    setCreando(false)
    cargarTemas()
    setVistaDetalle(data)
  }

  if (vistaDetalle) {
    return (
      <section style={styles.page}>
        <button onClick={() => setVistaDetalle(null)} style={{ background: 'none', border: 'none', color: 'var(--muted-color)', cursor: 'pointer', fontSize: '13px', marginBottom: '1rem', padding: 0 }}>
          ← Volver al foro
        </button>
        <ChatBox
          temaId={vistaDetalle.id}
          titulo={vistaDetalle.titulo}
          subtitulo={vistaDetalle.descripcion}
          usuario={usuario}
          abrirAuth={abrirAuth}
        />
      </section>
    )
  }

  return (
    <section style={styles.page}>
      <div style={styles.label}>💬 Foro de debate <span style={styles.labelLine} /></div>

      {/* Chat general siempre visible arriba */}
      <div style={{ marginBottom: '2rem' }}>
        <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--muted-color)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' }}>Chat en vivo</p>
        <ChatBox
          temaId={-1}
          titulo="💬 Chat General"
          subtitulo="Debate libre sobre fútbol"
          usuario={usuario}
          abrirAuth={abrirAuth}
        />
      </div>

      {/* Hilos */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <p style={{ fontSize: '12px', fontWeight: '800', color: 'var(--muted-color)', textTransform: 'uppercase', letterSpacing: '1px' }}>Hilos de debate</p>
        <button onClick={() => { if (!usuario) { abrirAuth(); return } setMostrarFormTema(!mostrarFormTema) }} style={styles.nuevaTemaBtn}>
          ✍️ Nuevo hilo
        </button>
      </div>

      {/* Formulario nuevo tema */}
      {mostrarFormTema && (
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '12px', padding: '1.25rem', background: 'var(--card-bg)', marginBottom: '1rem' }}>

          {/* Selector subtema si estamos en Otros */}
          {tab === 'otros' && (
            <>
              <label style={{ fontSize: '12px', color: 'var(--muted-color)', fontWeight: '700', textTransform: 'uppercase' }}>Subtema *</label>
              <select
                value={nuevoTema.subtema}
                onChange={e => setNuevoTema(p => ({ ...p, subtema: e.target.value }))}
                style={{ ...styles.inputStyle, cursor: 'pointer' }}
              >
                <option value="">— Selecciona un subtema —</option>
                {SUBTEMAS_OTROS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </>
          )}

          <label style={{ fontSize: '12px', color: 'var(--muted-color)', fontWeight: '700', textTransform: 'uppercase' }}>Título *</label>
          <input style={styles.inputStyle} placeholder="¿De qué quieres hablar?"
            value={nuevoTema.titulo} onChange={e => setNuevoTema(p => ({ ...p, titulo: e.target.value }))} />

          <label style={{ fontSize: '12px', color: 'var(--muted-color)', fontWeight: '700', textTransform: 'uppercase' }}>Descripción (opcional)</label>
          <textarea style={{ ...styles.inputStyle, minHeight: '80px', resize: 'vertical' }}
            placeholder="Añade contexto..."
            value={nuevoTema.descripcion} onChange={e => setNuevoTema(p => ({ ...p, descripcion: e.target.value }))} />

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button onClick={() => setMostrarFormTema(false)} style={{ ...styles.nuevaTemaBtn, marginBottom: 0 }}>Cancelar</button>
            <button onClick={crearTema} disabled={creando} style={{ padding: '10px 18px', borderRadius: '10px', border: 'none', background: '#E24B4A', color: '#fff', fontWeight: '800', fontSize: '13px', cursor: 'pointer' }}>
              {creando ? 'Creando...' : '🚀 Crear hilo'}
            </button>
          </div>
        </div>
      )}

      {/* Tabs categorías */}
      <div style={styles.tabs}>
        {CATEGORIAS.map(c => (
          <button key={c.id} style={tab === c.id ? styles.tabActive : styles.tab} onClick={() => setTab(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Lista temas */}
      {temas.length === 0 && (
        <p style={{ color: 'var(--muted-color)', fontSize: '14px', textAlign: 'center', padding: '2rem' }}>No hay hilos aquí todavía. ¡Sé el primero!</p>
      )}
      {temas.map(tema => (
        <div key={tema.id} style={styles.temaCard} onClick={() => setVistaDetalle(tema)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '4px' }}>{tema.titulo}</p>
              {tema.descripcion && <p style={{ fontSize: '12px', color: 'var(--muted-color)', marginBottom: '8px' }}>{tema.descripcion}</p>}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: 'var(--muted-color)' }}>{tema.autor_avatar} {tema.autor_nick}</span>
                <span style={{ fontSize: '11px', color: 'var(--muted-color)' }}>· {tiempoRelativo(tema.created_at)}</span>
              </div>
            </div>
            <span style={{ fontSize: '18px', marginLeft: '10px' }}>→</span>
          </div>
        </div>
      ))}
    </section>
  )
}