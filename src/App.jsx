import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Polemica from './components/Polemica'
import Tabla from './components/Tabla'
import Noticias from './components/Noticias'
import Foro from './components/Foro'
import Perfil from './components/Perfil'
import AdminPanel from './components/AdminPanel'

// Cambia este email por el tuyo
const ADMIN_EMAIL = 'marcmarian07@gmail.com'

const EQUIPOS_DISPONIBLES = [
  'Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Athletic Club',
  'Real Sociedad', 'Real Betis', 'Villarreal CF', 'Valencia CF',
  'Girona FC', 'Rayo Vallecano', 'Osasuna', 'Getafe CF',
  'Celta de Vigo', 'Sevilla FC', 'Alavés', 'RCD Mallorca',
  'Elche', 'Espanyol', 'Levante', 'Oviedo', 'Neutral / Sin equipo'
]

const AVATARES_DISPONIBLES = ['🤡', '🦊', '🦁', '🐸', '🐵', '🦉', '🥷', '🧙‍♂️', '🧔', '🧑', '👦', '🧓']

function App() {
  const [vista, setVista] = useState('home')
  const [usuario, setUsuario] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [esModoClaro, setEsModoClaro] = useState(false)

  useEffect(() => {
    document.body.className = esModoClaro ? 'light-mode' : '';
  }, [esModoClaro]);

  const toggleTema = () => setEsModoClaro(!esModoClaro);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) obtenerPerfil(session.user)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) obtenerPerfil(session.user)
      else setUsuario(null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const obtenerPerfil = async (authUser) => {
    try {
      const { data } = await supabase.from('perfiles').select('nick, avatar, equipo').eq('user_id', authUser.id).maybeSingle()
      setUsuario({
        id: authUser.id,
        email: authUser.email,
        nick: data?.nick || authUser.email.split('@')[0],
        avatar: data?.avatar || '🦊',
        equipo: data?.equipo || 'Neutral',
        esAdmin: authUser.email === ADMIN_EMAIL // Aquí detectamos si eres tú
      })
    } catch (err) { console.error('Error al obtener perfil:', err.message) }
  }

  const renderVista = () => {
    switch (vista) {
      case 'polemica': return <Polemica usuario={usuario} abrirAuth={() => setModalAbierto(true)} />
      case 'tabla': return <Tabla />
      case 'noticias': return <Noticias />
      case 'foro': return <Foro usuario={usuario} abrirAuth={() => setModalAbierto(true)} />
      case 'perfil': return <Perfil usuario={usuario} setUsuario={setUsuario} />
      case 'admin': return usuario?.esAdmin ? <AdminPanel /> : <Hero onNavegar={setVista} />
      default: return <Hero onNavegar={setVista} />
    }
  }

  return (
    <div className="app-container">
      <Navbar vistaActual={vista} onNavegar={setVista} usuario={usuario} abrirAuth={() => setModalAbierto(true)} toggleTema={toggleTema} />
      
      <main className="main-content">{renderVista()}</main>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-info">
            <h3>El Tercer Tiempo</h3>
            <p>La comunidad donde el fútbol no termina en el pitido final.</p>
          </div>
          <div className="footer-links">
            <div>
              <h4>Navegación</h4>
              <span onClick={() => setVista('foro')}>Foro</span>
              <span onClick={() => setVista('tabla')}>Clasificación</span>
              <span onClick={() => setVista('noticias')}>Noticias</span>
            </div>
            <div>
              <h4>Legal</h4>
              <span>Privacidad</span>
              <span>Contacto</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 El Tercer Tiempo. Todos los derechos reservados.
        </div>
      </footer>

      {modalAbierto && <AuthModal onCerrar={() => setModalAbierto(false)} onLoginExitoso={() => setModalAbierto(false)} />}
    </div>
  )
}
// ... resto del componente AuthModal (sin cambios)

function AuthModal({ onCerrar, onLoginExitoso, setUsuario, obtenerPerfil }) {
  const [esRegistro, setEsRegistro] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nick, setNick] = useState('')
  const [avatarSel, setAvatarSel] = useState(AVATARES_DISPONIBLES[0])
  const [equipoSel, setEquipoSel] = useState(EQUIPOS_DISPONIBLES[0])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      if (esRegistro) {
        const { data, error: authError } = await supabase.auth.signUp({ email, password })
        if (authError) throw authError
        if (data.user) {
          await supabase.from('perfiles').insert([{
            user_id: data.user.id, nick, avatar: avatarSel, equipo: equipoSel
          }])
          setUsuario({
            id: data.user.id, email: data.user.email,
            nick, avatar: avatarSel, equipo: equipoSel,
            esAdmin: data.user.email === ADMIN_EMAIL
          })
        }
      } else {
        const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password })
        if (loginError) throw loginError
        if (data?.user) await obtenerPerfil(data.user)
      }
      onLoginExitoso()
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onCerrar}>✕</button>
        <h2 style={{ marginBottom: '1rem' }}>{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="email" placeholder="Email" required value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '14px' }} />
          <input type="password" placeholder="Contraseña" required value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '14px' }} />
          {esRegistro && (
            <>
              <input type="text" placeholder="Nick" required value={nick} onChange={e => setNick(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '14px' }} />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: '6px' }}>
                {AVATARES_DISPONIBLES.map(av => (
                  <div key={av} onClick={() => setAvatarSel(av)} style={{ fontSize: '22px', padding: '6px', border: `1px solid ${avatarSel === av ? '#E24B4A' : 'var(--border-color)'}`, borderRadius: '8px', textAlign: 'center', cursor: 'pointer', background: avatarSel === av ? 'rgba(226,75,74,0.1)' : 'var(--bg-color)' }}>
                    {av}
                  </div>
                ))}
              </div>
              <select value={equipoSel} onChange={e => setEquipoSel(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--bg-color)', color: 'var(--text-color)', fontSize: '14px' }}>
                {EQUIPOS_DISPONIBLES.map(eq => <option key={eq} value={eq}>{eq}</option>)}
              </select>
            </>
          )}
          {error && <p style={{ color: '#E24B4A', fontSize: '12px' }}>⚠️ {error}</p>}
          <button type="submit" style={{ background: '#E24B4A', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
            {cargando ? 'Procesando...' : esRegistro ? 'Registrarse' : 'Entrar'}
          </button>
        </form>
        <p onClick={() => { setEsRegistro(!esRegistro); setError('') }} style={{ marginTop: '1rem', fontSize: '12px', color: 'var(--muted-color)', cursor: 'pointer', textAlign: 'center' }}>
          {esRegistro ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
        </p>
      </div>
    </div>
  )
}

export default App