import { useState, useEffect, useRef } from 'react'
import { supabase } from '../supabase'

const TAG_CONFIG = {
  'LaLiga':    { color: '#1a73e8', bg: 'rgba(26,115,232,0.1)' },
  'Champions': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  'Fichajes':  { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  'VAR':       { color: '#E24B4A', bg: 'rgba(226,75,74,0.1)' },
  'Arbitraje': { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  'Selección': { color: '#1a73e8', bg: 'rgba(26,115,232,0.1)' },
  'Lesiones':  { color: '#E24B4A', bg: 'rgba(226,75,74,0.1)' },
  'Goles':     { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  'Resultados':{ color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  'Noticia':   { color: '#6b7280', bg: 'rgba(107,114,128,0.1)' },
}

const CATEGORIAS = ['LaLiga', 'Champions', 'Fichajes', 'VAR', 'Arbitraje', 'Selección', 'Lesiones', 'Goles', 'Resultados']
const LIGAS = ['LaLiga', 'Champions', 'Europa League', 'Conference', 'Segunda División', 'Copa del Rey', 'Selección']
const EQUIPOS = [
  'Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Athletic Club',
  'Real Sociedad', 'Real Betis', 'Villarreal CF', 'Valencia CF',
  'Girona FC', 'Rayo Vallecano', 'Osasuna', 'Getafe CF',
  'Celta de Vigo', 'Sevilla FC', 'Alavés', 'RCD Mallorca',
  'Elche', 'Espanyol', 'Levante', 'Oviedo',
]
const TEMAS = ['Fichajes', 'VAR', 'Arbitraje', 'Lesiones', 'Goles', 'Resultados']

const FEEDS_KEY = 'llorómetro_feeds_v2'

const MEDIOS_GRANDES = ['Marca', 'AS', 'Sport', 'Mundo Deportivo', 'El País', 'El Mundo', 'Relevo', 'Estadio Deportivo']

// Comunidades → equipos. Al clicar un equipo filtra por él directamente.
const COMUNIDADES = {
  'Madrid':     ['Real Madrid', 'Atlético de Madrid', 'Rayo Vallecano', 'Getafe CF'],
  'Cataluña':   ['FC Barcelona', 'Girona FC', 'Espanyol'],
  'País Vasco': ['Athletic Club', 'Real Sociedad', 'Alavés'],
  'Andalucía':  ['Sevilla FC', 'Real Betis'],
  'Valencia':   ['Valencia CF', 'Villarreal CF', 'Levante', 'Elche'],
  'Galicia':    ['Celta de Vigo', 'RC Deportivo'],
  'Navarra':    ['Osasuna'],
  'Baleares':   ['RCD Mallorca'],
  'Asturias':   ['Oviedo', 'Sporting de Gijón'],
}

const EQUIPO_ALIASES = {
  'FC Barcelona':       ['barcelona', 'barça', 'barca', 'fc barcelona'],
  'Real Madrid':        ['real madrid', 'madrid', 'rm'],
  'Atlético de Madrid': ['atletico', 'atlético', 'atleti', 'atletico de madrid'],
  'Athletic Club':      ['athletic', 'athletic club', 'bilbao'],
  'Real Betis':         ['betis', 'real betis'],
  'Villarreal CF':      ['villarreal'],
  'Valencia CF':        ['valencia'],
  'Real Sociedad':      ['real sociedad', 'sociedad'],
  'Girona FC':          ['girona'],
  'Rayo Vallecano':     ['rayo', 'vallecano'],
  'Getafe CF':          ['getafe'],
  'Celta de Vigo':      ['celta', 'vigo'],
  'Sevilla FC':         ['sevilla'],
  'RCD Mallorca':       ['mallorca'],
  'Alavés':             ['alaves', 'alavés'],
  'Espanyol':           ['espanyol', 'español'],
  'Levante':            ['levante'],
  'Elche':              ['elche'],
  'Oviedo':             ['oviedo'],
  'Osasuna':            ['osasuna'],
  'RC Deportivo':       ['deportivo', 'coruña'],
  'Sporting de Gijón':  ['sporting', 'gijón', 'gijon'],
}

// ── FÚTBOL FEMENINO ───────────────────────────────────────────────────────────
const EQUIPOS_FEMENINO = [
  'Barça Femení', 'Real Madrid Femenino', 'Atlético Femenino',
  'Athletic Femenino', 'Real Sociedad Femenina', 'Levante Femenino',
  'Villarreal Femenino', 'Sevilla Femenino', 'Betis Femenino',
  'Valencia Femenino', 'Deportivo Abanca', 'Madrid CFF',
]

const FEMENINO_ALIASES = {
  'Barça Femení':           ['barça femení', 'barcelona femenino', 'barca femenino', 'fc barcelona femenino', 'barça femenino'],
  'Real Madrid Femenino':   ['real madrid femenino', 'madrid femenino'],
  'Atlético Femenino':      ['atlético femenino', 'atletico femenino', 'atleti femenino'],
  'Athletic Femenino':      ['athletic femenino', 'athletic club femenino'],
  'Real Sociedad Femenina': ['real sociedad femenina', 'real sociedad femenino'],
  'Levante Femenino':       ['levante femenino', 'levante ud femenino'],
  'Villarreal Femenino':    ['villarreal femenino'],
  'Sevilla Femenino':       ['sevilla femenino', 'sevilla fc femenino'],
  'Betis Femenino':         ['betis femenino', 'real betis femenino'],
  'Valencia Femenino':      ['valencia femenino', 'valencia cf femenino'],
  'Deportivo Abanca':       ['deportivo abanca'],
  'Madrid CFF':             ['madrid cff'],
}

// Palabras clave para detectar noticias femeninas
const KEYWORDS_FEMENINO = [
  'femenino', 'femenina', 'femení', 'women', 'liga f',
  'champions femenina', 'champions femenino', 'selección femenina',
  'mundial femenino', 'eurocopa femenina',
]

function esFemenino(noticia) {
  const t = ((noticia.titulo || '') + ' ' + (noticia.tag || '')).toLowerCase()
  return KEYWORDS_FEMENINO.some(k => t.includes(k)) ||
    Object.values(FEMENINO_ALIASES).flat().some(a => t.includes(a))
}

function matchEquipoFem(titulo, equipoNombre) {
  const t = (titulo || '').toLowerCase()
  const aliases = FEMENINO_ALIASES[equipoNombre] || [equipoNombre.toLowerCase()]
  return aliases.some(a => t.includes(a))
}

function matchEquipo(titulo, equipoNombre) {
  const t = (titulo || '').toLowerCase()
  const aliases = EQUIPO_ALIASES[equipoNombre] || [equipoNombre.toLowerCase()]
  return aliases.some(a => t.includes(a))
}

function matchMedio(fuente, medio) {
  if (!fuente) return false
  return fuente.toLowerCase().includes(medio.toLowerCase())
}

function formatHora(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const ahora = new Date()
  const diff = Math.floor((ahora - d) / 1000)
  if (diff < 60) return 'Hace un momento'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  if (diff < 86400) {
    const h = d.getHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0')
    return `Hoy ${h}:${m}`
  }
  if (diff < 172800) {
    const h = d.getHours().toString().padStart(2, '0')
    const m = d.getMinutes().toString().padStart(2, '0')
    return `Ayer ${h}:${m}`
  }
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
}

const PAGE_SIZE = 15
const DIAS_VIEJA = 3

// ── NOTICIA ROW ───────────────────────────────────────────────────────────────
function NoticiaRow({ noticia, index, vieja }) {
  const [hovered, setHovered] = useState(false)
  const cfg = TAG_CONFIG[noticia.tag] || TAG_CONFIG['Noticia']
  return (
    <div
      onClick={() => noticia.url && window.open(noticia.url, '_blank')}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '12px 0', borderBottom: '1px solid var(--border-color)',
        cursor: noticia.url ? 'pointer' : 'default',
        opacity: vieja ? 0.45 : 1,
        animation: `fadeInUp 0.4s ease ${Math.min(index, 10) * 0.04}s both`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px', flexWrap: 'wrap' }}>
          <span style={{
            fontSize: '10px', fontWeight: '700', textTransform: 'uppercase',
            letterSpacing: '0.8px', padding: '2px 6px', borderRadius: '3px',
            color: cfg.color, backgroundColor: cfg.bg,
          }}>{noticia.tag}</span>
          {vieja && (
            <span style={{
              fontSize: '9px', fontWeight: '600', letterSpacing: '0.6px',
              padding: '1px 5px', borderRadius: '3px', textTransform: 'uppercase',
              color: 'var(--muted-color)', border: '1px solid var(--border-color)',
            }}>Antigua</span>
          )}
        </div>
        <p style={{
          fontSize: '14px', fontWeight: '600', lineHeight: '1.45',
          color: hovered ? cfg.color : 'var(--text-color)',
          marginBottom: '4px', transition: 'color 0.15s',
        }}>{noticia.titulo}</p>
        <p style={{ fontSize: '11px', color: 'var(--muted-color)' }}>
          {noticia.hora} · {noticia.fuente}
        </p>
      </div>
    </div>
  )
}

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '10px', fontWeight: '800', letterSpacing: '1.5px',
      textTransform: 'uppercase', color: 'var(--muted-color)',
      marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px',
    }}>
      {children}
      <span style={{ flex: 1, height: '1px', background: 'var(--border-color)' }} />
    </div>
  )
}

// ── ACORDEÓN GENÉRICO ─────────────────────────────────────────────────────────
function Acordeon({ label, children, defaultOpen = false, indent = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: '2px' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: indent ? '5px 10px 5px 14px' : '5px 0',
          color: indent ? 'var(--text-color)' : 'var(--muted-color)',
          fontSize: indent ? '12px' : '10px',
          fontWeight: '700',
          letterSpacing: indent ? '0.3px' : '1.2px',
          textTransform: indent ? 'none' : 'uppercase',
          borderBottom: indent ? 'none' : '1px solid var(--border-color)',
          borderRadius: indent ? '6px' : '0',
          backgroundColor: indent
            ? open ? 'rgba(255,255,255,0.04)' : 'transparent'
            : 'transparent',
          marginBottom: indent ? '0' : '4px',
          transition: 'all 0.15s',
        }}
      >
        <span>{label}</span>
        <span style={{
          fontSize: '9px', transition: 'transform 0.2s',
          display: 'inline-block',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
          marginRight: indent ? '2px' : '0',
          color: 'var(--muted-color)',
        }}>▾</span>
      </button>
      {open && (
        <div style={{ paddingTop: '2px', paddingLeft: indent ? '10px' : '0' }}>
          {children}
        </div>
      )}
    </div>
  )
}

// ── MODAL MI FEED ──────────────────────────────────────────────────────────────
function ModalMiFeed({ onClose, onSave, feedActual }) {
  const esEdicion = !!feedActual
  const [nombre, setNombre] = useState(feedActual?.nombre || '')
  const [ligas, setLigas] = useState(feedActual?.ligas || [])
  const [equipos, setEquipos] = useState(feedActual?.equipos || [])
  const [temas, setTemas] = useState(feedActual?.temas || [])
  const overlayRef = useRef()

  function toggle(arr, setArr, val) {
    setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  function guardar() {
    if (!nombre.trim()) return
    onSave({ ...feedActual, nombre: nombre.trim(), ligas, equipos, temas })
    onClose()
  }

  return (
    <div
      ref={overlayRef}
      onClick={e => e.target === overlayRef.current && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        backgroundColor: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem', animation: 'fadeIn 0.2s ease',
      }}
    >
      <div
        className="llorómetro-scroll"
        style={{
          background: 'var(--bg-color, #0f0f0f)',
          border: '1px solid var(--border-color, #2a2a2a)',
          borderRadius: '14px', width: '100%', maxWidth: '500px',
          maxHeight: '88vh', overflowY: 'auto', padding: '24px',
          animation: 'slideUp 0.25s cubic-bezier(0.19,1,0.22,1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <p style={{ fontSize: '10px', fontWeight: '800', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#E24B4A', marginBottom: '3px' }}>
              {esEdicion ? 'Editar feed' : 'Nuevo feed'}
            </p>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-color, #fff)', margin: 0 }}>
              {esEdicion ? `Editando "${feedActual.nombre}"` : 'Personaliza tus noticias'}
            </h3>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.06)', border: 'none', borderRadius: '8px',
            width: '32px', height: '32px', cursor: 'pointer',
            color: 'var(--muted-color, #888)', fontSize: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={s.modalLabel}>Nombre del feed</label>
          <input
            value={nombre}
            onChange={e => setNombre(e.target.value)}
            placeholder="ej: Mi Barça, LaLiga + Fichajes..."
            style={s.input}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={s.modalLabel}>Competiciones</label>
          <div style={s.chipGrid}>
            {LIGAS.map(l => (
              <Chip key={l} label={l} active={ligas.includes(l)} onClick={() => toggle(ligas, setLigas, l)} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={s.modalLabel}>Equipos</label>
          <div style={s.chipGrid}>
            {EQUIPOS.map(e => (
              <Chip key={e} label={e} active={equipos.includes(e)} onClick={() => toggle(equipos, setEquipos, e)} />
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label style={s.modalLabel}>Temas</label>
          <div style={s.chipGrid}>
            {TEMAS.map(t => (
              <Chip key={t} label={t} active={temas.includes(t)} onClick={() => toggle(temas, setTemas, t)} />
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onClose} style={s.btnSecondary}>Cancelar</button>
          <button
            onClick={guardar}
            disabled={!nombre.trim()}
            style={{ ...s.btnPrimary, opacity: nombre.trim() ? 1 : 0.4, cursor: nombre.trim() ? 'pointer' : 'not-allowed' }}
          >{esEdicion ? 'Guardar cambios' : 'Crear feed'}</button>
        </div>
      </div>
    </div>
  )
}

function Chip({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '5px 11px', borderRadius: '20px', fontSize: '12px',
      fontWeight: '600', cursor: 'pointer', transition: 'all 0.15s',
      border: active ? '1px solid rgba(226,75,74,0.6)' : '1px solid var(--border-color, #2a2a2a)',
      background: active ? 'rgba(226,75,74,0.12)' : 'transparent',
      color: active ? '#E24B4A' : 'var(--muted-color, #888)',
    }}>{label}</button>
  )
}

function SidebarItem({ active, onClick, label, count, small = false }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: small ? '5px 8px' : '7px 10px',
        borderRadius: '8px', cursor: 'pointer',
        fontSize: small ? '12px' : '13px', marginBottom: '2px',
        backgroundColor: active ? 'rgba(226,75,74,0.12)' : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
        color: active ? '#E24B4A' : 'var(--text-color)',
        border: active ? '1px solid rgba(226,75,74,0.3)' : '1px solid transparent',
        transition: 'all 0.15s',
      }}
    >
      <span>{label}</span>
      {count > 0 && (
        <span style={{ fontSize: '11px', color: active ? '#E24B4A' : 'var(--muted-color)' }}>{count}</span>
      )}
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ───────────────────────────────────────────────────────
export default function Noticias() {
  const [todas, setTodas] = useState([])
  const [loading, setLoading] = useState(true)
  const [seccion, setSeccion] = useState('recientes')
  const [catActiva, setCatActiva] = useState(null)
  const [feedActivoId, setFeedActivoId] = useState(null)
  const [medioActivo, setMedioActivo] = useState(null)
  const [equipoActivo, setEquipoActivo] = useState(null)
  const [femFiltro, setFemFiltro] = useState(null) // null | 'todas' | nombre equipo femenino // filtra por equipo concreto desde comunidad

  const [feeds, setFeeds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(FEEDS_KEY))
      if (saved && !Array.isArray(saved)) return [{ ...saved, id: Date.now() }]
      return saved || []
    } catch { return [] }
  })

  const [modalData, setModalData] = useState(null)
  const [verMasCount, setVerMasCount] = useState(PAGE_SIZE)

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('noticias')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (!error && data?.length) {
        setTodas(data.map(n => {
          const fechaRef = n.publicado_en || n.created_at
          return {
            id: n.id,
            tag: n.tag || 'Noticia',
            titulo: n.titulo,
            hora: formatHora(fechaRef),
            fuente: n.fuente || 'Llorómetro',
            url: n.url,
            created_at: n.created_at,
            diasAntigua: (Date.now() - new Date(fechaRef)) / (1000 * 60 * 60 * 24),
          }
        }))
      }
      setLoading(false)
    }
    load()
  }, [])

  const mediosEnNoticias = [...new Set(todas.map(n => n.fuente).filter(Boolean))]
  const mediosGrandesPresentes = MEDIOS_GRANDES.filter(m =>
    mediosEnNoticias.some(f => f.toLowerCase().includes(m.toLowerCase()))
  )
  const mediosOtros = mediosEnNoticias.filter(f =>
    !MEDIOS_GRANDES.some(m => f.toLowerCase().includes(m.toLowerCase()))
  )

  function saveFeeds(newFeeds) {
    setFeeds(newFeeds)
    localStorage.setItem(FEEDS_KEY, JSON.stringify(newFeeds))
  }

  function handleSaveFeed(feedData) {
    let newFeeds
    if (feedData.id) {
      newFeeds = feeds.map(f => f.id === feedData.id ? feedData : f)
    } else {
      newFeeds = [...feeds, { ...feedData, id: Date.now() }]
    }
    saveFeeds(newFeeds)
    const id = feedData.id || newFeeds[newFeeds.length - 1].id
    setFeedActivoId(id)
    setSeccion('mifeed')
  }

  function eliminarFeed(id) {
    const newFeeds = feeds.filter(f => f.id !== id)
    saveFeeds(newFeeds)
    if (feedActivoId === id) { setSeccion('recientes'); setFeedActivoId(null) }
  }

  function cambiarSeccion(sec) { setSeccion(sec); setVerMasCount(PAGE_SIZE) }
  function handleCat(cat) { setCatActiva(cat); setSeccion('categoria'); setVerMasCount(PAGE_SIZE) }
  function handleMedio(nombre) { setMedioActivo(nombre); setSeccion('medio'); setVerMasCount(PAGE_SIZE) }
  function handleEquipo(nombre) { setEquipoActivo(nombre); setSeccion('equipo'); setVerMasCount(PAGE_SIZE) }
  function handleFemenino(filtro) { setFemFiltro(filtro); setSeccion('femenino'); setVerMasCount(PAGE_SIZE) }

  const feedActivo = feeds.find(f => f.id === feedActivoId) || null

  function filtrarFeed(feed) {
    return todas.filter(n => {
      const tagMatch = [...(feed.ligas || []), ...(feed.temas || [])].some(f => n.tag === f)
      const equipoMatch = (feed.equipos || []).some(eq => matchEquipo(n.titulo || '', eq))
      return tagMatch || equipoMatch
    })
  }

  function ordenarConAntiguas(lista) {
    const recientes = lista.filter(n => n.diasAntigua <= DIAS_VIEJA)
    const viejas = lista.filter(n => n.diasAntigua > DIAS_VIEJA)
    return { recientes, viejas, todas: [...recientes, ...viejas] }
  }

  const destacadas = todas.filter(n => ['VAR', 'Arbitraje', 'Champions', 'Fichajes'].includes(n.tag))
  const porCategoria = catActiva ? todas.filter(n => n.tag === catActiva) : []
  const porMedio = medioActivo ? todas.filter(n => matchMedio(n.fuente, medioActivo)) : []
  const porEquipo = equipoActivo ? todas.filter(n => matchEquipo(n.titulo || '', equipoActivo)) : []

  const todasFemenino = todas.filter(esFemenino)
  const porFemenino = femFiltro === 'todas' ? todasFemenino
    : femFiltro ? todasFemenino.filter(n => matchEquipoFem(n.titulo || '', femFiltro))
    : []

  const conteosPorTag = CATEGORIAS.reduce((acc, cat) => {
    acc[cat] = todas.filter(n => n.tag === cat).length
    return acc
  }, {})

  const listaBase =
    seccion === 'recientes'   ? todas
    : seccion === 'destacadas'? destacadas
    : seccion === 'categoria' ? porCategoria
    : seccion === 'mifeed'    ? (feedActivo ? filtrarFeed(feedActivo) : [])
    : seccion === 'medio'     ? porMedio
    : seccion === 'equipo'    ? porEquipo
    : seccion === 'femenino'  ? porFemenino
    : todas

  const { viejas: listaViejas, todas: listaOrdenada } = ordenarConAntiguas(listaBase)
  const listaConPagina = listaOrdenada.slice(0, verMasCount)
  const hayMas = verMasCount < listaOrdenada.length
  const setViejas = new Set(listaViejas.map(n => n.id))

  const tituloSeccion =
    seccion === 'recientes'   ? 'Últimas noticias'
    : seccion === 'destacadas'? 'Destacadas'
    : seccion === 'categoria' ? catActiva
    : seccion === 'mifeed'    ? (feedActivo?.nombre || 'Mi Feed')
    : seccion === 'medio'     ? medioActivo
    : seccion === 'equipo'    ? equipoActivo
    : seccion === 'femenino'  ? (femFiltro === 'todas' ? 'Fútbol Femenino — Todas' : femFiltro)
    : 'Últimas noticias'

  if (loading) return (
    <section style={s.section}>
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-color)', fontSize: '13px' }}>
        Cargando noticias...
      </div>
    </section>
  )

  return (
    <section id="noticias" style={s.section}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .llorómetro-scroll {
          scrollbar-width: thin;
          scrollbar-color: rgba(160,160,160,0.22) transparent;
        }
        .llorómetro-scroll::-webkit-scrollbar { width: 4px; }
        .llorómetro-scroll::-webkit-scrollbar-track { background: transparent; }
        .llorómetro-scroll::-webkit-scrollbar-thumb {
          background: rgba(160,160,160,0.22); border-radius: 99px;
        }
        .llorómetro-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(160,160,160,0.42);
        }
        .ver-mas-btn {
          width: 100%; padding: 10px; margin-top: 6px;
          background: transparent; border: 1px solid var(--border-color);
          border-radius: 8px; cursor: pointer;
          font-size: 12px; font-weight: 600; letter-spacing: 0.5px;
          color: var(--muted-color); transition: all 0.15s;
        }
        .ver-mas-btn:hover {
          border-color: rgba(226,75,74,0.4); color: #E24B4A;
          background: rgba(226,75,74,0.05);
        }
        .feed-row { display: flex; align-items: center; gap: 4px; margin-bottom: 2px; }
        .feed-action {
          background: none; border: none; cursor: pointer;
          color: var(--muted-color); font-size: 11px;
          padding: 3px 5px; border-radius: 4px; line-height: 1;
          transition: color 0.15s; flex-shrink: 0;
        }
        .feed-action:hover { color: #E24B4A; }
        .separador-antigua {
          font-size: 10px; font-weight: 700; letter-spacing: 1.2px;
          text-transform: uppercase; color: var(--muted-color);
          opacity: 0.5; margin: 16px 0 4px;
          display: flex; align-items: center; gap: 8px;
        }
        .separador-antigua::after {
          content: ''; flex: 1; height: 1px; background: var(--border-color);
        }
      `}</style>

      {modalData !== null && (
        <ModalMiFeed
          feedActual={modalData.feed || null}
          onClose={() => setModalData(null)}
          onSave={handleSaveFeed}
        />
      )}

      <div style={s.layout}>

        {/* COLUMNA PRINCIPAL */}
        <div style={s.main}>
          <SectionLabel>{tituloSeccion}</SectionLabel>

          {listaConPagina.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--muted-color)', padding: '1rem 0' }}>
              {seccion === 'mifeed'
                ? 'No hay noticias que coincidan con tu feed. Prueba a añadir más categorías o equipos.'
                : 'No hay noticias en esta sección todavía.'}
            </p>
          ) : (
            <>
              {(() => {
                let mostramosSep = false
                return listaConPagina.map((n, i) => {
                  const esVieja = setViejas.has(n.id)
                  let sep = null
                  if (esVieja && !mostramosSep) {
                    mostramosSep = true
                    sep = <div key={`sep-${n.id}`} className="separador-antigua">Noticias antiguas</div>
                  }
                  return (
                    <div key={n.id}>
                      {sep}
                      <NoticiaRow noticia={n} index={i} vieja={esVieja} />
                    </div>
                  )
                })
              })()}
              {hayMas && (
                <button className="ver-mas-btn" onClick={() => setVerMasCount(c => c + PAGE_SIZE)}>
                  Ver más noticias ({listaOrdenada.length - verMasCount} restantes)
                </button>
              )}
            </>
          )}
        </div>

        {/* SIDEBAR — sticky, siempre visible, scroll interno */}
        <div
          className="llorómetro-scroll"
          style={{
            position: 'sticky',
            top: 0,
            alignSelf: 'start',
            height: '100vh',
            overflowY: 'auto',
            overflowX: 'hidden',
            paddingTop: '1.5rem',
            paddingBottom: '1.5rem',
            boxSizing: 'border-box',
          }}
        >

          {/* SECCIONES */}
          <div style={s.sidebarBlock}>
            <p style={s.sidebarLabel}>Secciones</p>
            <SidebarItem active={seccion === 'recientes'} onClick={() => cambiarSeccion('recientes')} label="Últimas" count={todas.length} />
            <SidebarItem active={seccion === 'destacadas'} onClick={() => cambiarSeccion('destacadas')} label="Destacadas" count={destacadas.length} />
          </div>

          {/* MIS FEEDS */}
          <div style={s.sidebarBlock}>
            <p style={s.sidebarLabel}>Mis feeds</p>
            {feeds.map(feed => (
              <div key={feed.id} className="feed-row">
                <div
                  onClick={() => { setFeedActivoId(feed.id); setSeccion('mifeed'); setVerMasCount(PAGE_SIZE) }}
                  style={{
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 10px', borderRadius: '8px', cursor: 'pointer',
                    fontSize: '13px', transition: 'all 0.15s', minWidth: 0,
                    backgroundColor: seccion === 'mifeed' && feedActivoId === feed.id ? 'rgba(226,75,74,0.12)' : 'transparent',
                    color: seccion === 'mifeed' && feedActivoId === feed.id ? '#E24B4A' : 'var(--text-color)',
                    border: seccion === 'mifeed' && feedActivoId === feed.id
                      ? '1px solid rgba(226,75,74,0.3)' : '1px solid rgba(226,75,74,0.15)',
                  }}
                >
                  <span style={{ fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {feed.nombre}
                  </span>
                </div>
                <button className="feed-action" title="Editar feed" onClick={() => setModalData({ feed })}>✎</button>
                <button className="feed-action" title="Eliminar feed" onClick={() => eliminarFeed(feed.id)}>✕</button>
              </div>
            ))}
            <div
              onClick={() => setModalData({})}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 10px', borderRadius: '8px', cursor: 'pointer',
                fontSize: '12px', color: 'var(--muted-color)',
                border: '1px dashed var(--border-color)',
                marginTop: feeds.length > 0 ? '4px' : '0', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(226,75,74,0.4)'; e.currentTarget.style.color = '#E24B4A' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--muted-color)' }}
            >
              <span style={{ fontSize: '14px', lineHeight: 1 }}>+</span>
              <span>Nuevo feed</span>
            </div>
          </div>

          {/* CATEGORÍAS */}
          <div style={s.sidebarBlock}>
            <p style={s.sidebarLabel}>Categorías</p>
            {CATEGORIAS.map(cat => (
              <SidebarItem
                key={cat}
                active={seccion === 'categoria' && catActiva === cat}
                onClick={() => handleCat(cat)}
                label={cat}
                count={conteosPorTag[cat] || 0}
              />
            ))}
          </div>

          {/* FÚTBOL FEMENINO */}
          <div style={s.sidebarBlock}>
            <p style={s.sidebarLabel}>Fútbol Femenino</p>
            <SidebarItem
              active={seccion === 'femenino' && femFiltro === 'todas'}
              onClick={() => handleFemenino('todas')}
              label="Todas"
              count={todasFemenino.length}
            />
            <Acordeon label="Por equipo" indent={true}>
              {EQUIPOS_FEMENINO.map(eq => {
                const count = todasFemenino.filter(n => matchEquipoFem(n.titulo || '', eq)).length
                return (
                  <SidebarItem
                    key={eq}
                    small={true}
                    active={seccion === 'femenino' && femFiltro === eq}
                    onClick={() => handleFemenino(eq)}
                    label={eq}
                    count={count}
                  />
                )
              })}
            </Acordeon>
          </div>

          {/* MEDIOS */}
          <div style={s.sidebarBlock}>
            <p style={s.sidebarLabel}>Medios</p>
            <Acordeon label="Grandes medios" defaultOpen={true}>
              {mediosGrandesPresentes.length === 0
                ? <p style={{ fontSize: '11px', color: 'var(--muted-color)', padding: '4px 2px' }}>Sin noticias aún</p>
                : mediosGrandesPresentes.map(m => (
                  <SidebarItem key={m} active={seccion === 'medio' && medioActivo === m} onClick={() => handleMedio(m)} label={m} count={todas.filter(n => matchMedio(n.fuente, m)).length} />
                ))
              }
            </Acordeon>
            {mediosOtros.length > 0 && (
              <Acordeon label="Otros medios">
                {mediosOtros.map(m => (
                  <SidebarItem key={m} active={seccion === 'medio' && medioActivo === m} onClick={() => handleMedio(m)} label={m} count={todas.filter(n => matchMedio(n.fuente, m)).length} />
                ))}
              </Acordeon>
            )}
          </div>

          {/* POR COMUNIDAD — cada comunidad es un acordeón con sus equipos dentro */}
          <div style={s.sidebarBlock}>
            <p style={s.sidebarLabel}>Por comunidad</p>
            {Object.entries(COMUNIDADES).map(([comunidad, equiposList]) => {
              const countComunidad = todas.filter(n =>
                equiposList.some(eq => matchEquipo(n.titulo || '', eq))
              ).length
              return (
                <Acordeon key={comunidad} label={`${comunidad} ${countComunidad > 0 ? `(${countComunidad})` : ''}`} indent={true}>
                  {equiposList.map(eq => {
                    const count = todas.filter(n => matchEquipo(n.titulo || '', eq)).length
                    return (
                      <SidebarItem
                        key={eq}
                        small={true}
                        active={seccion === 'equipo' && equipoActivo === eq}
                        onClick={() => handleEquipo(eq)}
                        label={eq}
                        count={count}
                      />
                    )
                  })}
                </Acordeon>
              )
            })}
          </div>

        </div>{/* fin sidebar */}
      </div>

      <p style={s.footer}>LLORÓMETRO ARBITRAL · EL DEBATE NUNCA TERMINA</p>
    </section>
  )
}

const s = {
  section: {
    padding: '1.5rem 2rem', maxWidth: '1000px', margin: '0 auto',
    backgroundColor: 'var(--bg-color)', transition: 'background-color 0.3s',
  },
  layout: {
    display: 'grid', gridTemplateColumns: '1fr 200px',
    gap: '32px', alignItems: 'start',
  },
  main: { minWidth: 0 },
  sidebarBlock: { marginBottom: '20px' },
  sidebarLabel: {
    fontSize: '10px', fontWeight: '800', letterSpacing: '1.2px',
    textTransform: 'uppercase', color: 'var(--muted-color)',
    marginBottom: '6px', paddingBottom: '6px',
    borderBottom: '1px solid var(--border-color)',
  },
  footer: {
    marginTop: '3rem', textAlign: 'center', fontSize: '11px',
    color: 'var(--muted-color)', fontWeight: '600', letterSpacing: '0.5px',
  },
  modalLabel: {
    fontSize: '10px', fontWeight: '700', letterSpacing: '1px',
    textTransform: 'uppercase', color: 'var(--muted-color, #888)',
    display: 'block', marginBottom: '8px',
  },
  input: {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1px solid var(--border-color, #2a2a2a)',
    background: 'rgba(255,255,255,0.04)', color: 'var(--text-color, #fff)',
    fontSize: '13px', outline: 'none', boxSizing: 'border-box',
  },
  chipGrid: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  btnPrimary: {
    flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
    background: '#E24B4A', color: '#fff', fontSize: '13px',
    fontWeight: '700', cursor: 'pointer',
  },
  btnSecondary: {
    padding: '10px 16px', borderRadius: '8px',
    border: '1px solid var(--border-color, #2a2a2a)',
    background: 'transparent', color: 'var(--muted-color, #888)',
    fontSize: '13px', fontWeight: '600', cursor: 'pointer',
  },
}