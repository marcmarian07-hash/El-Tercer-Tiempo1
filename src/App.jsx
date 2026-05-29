import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabase'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Polemica from './components/Polemica'
import Tabla from './components/Tabla'
import Noticias from './components/Noticias'
import Foro from './components/Foro'
import Perfil from './components/Perfil'
import AdminPanel from './components/AdminPanel'
import Resultados from './components/Resultados'

const ADMIN_EMAIL = 'marcalonsopol0708@gmail.com'
const EQUIPOS_DISPONIBLES = ['Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Athletic Club', 'Real Sociedad', 'Real Betis', 'Villarreal CF', 'Valencia CF', 'Girona FC', 'Rayo Vallecano', 'Osasuna', 'Getafe CF', 'Celta de Vigo', 'Sevilla FC', 'Alavés', 'RCD Mallorca', 'Elche', 'Espanyol', 'Levante', 'Oviedo', 'Neutral / Sin equipo']
const AVATARES_DISPONIBLES = ['🤡', '🦊', '🦁', '🐸', '🐵', '🦉', '🥷', '🧙‍♂️', '🧔', '🧑', '👦', '🧓']

function App() {
  const [vista, setVista] = useState('home')
  const [usuario, setUsuario] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [esModoClaro, setEsModoClaro] = useState(false)

  useEffect(() => { document.body.className = esModoClaro ? 'light-mode' : ''; }, [esModoClaro]);

  const obtenerPerfil = useCallback(async (authUser) => {
    try {
      const { data } = await supabase.from('perfiles').select('nick, avatar, equipo').eq('user_id', authUser.id).maybeSingle()
      setUsuario({
        id: authUser.id, email: authUser.email,
        nick: data?.nick || authUser.email.split('@')[0],
        avatar: data?.avatar || '🦊',
        equipo: data?.equipo || 'Neutral',
        esAdmin: authUser.email === ADMIN_EMAIL
      })
    } catch (err) { console.error('Error:', err.message) }
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) obtenerPerfil(session.user) })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) obtenerPerfil(session.user); else setUsuario(null)
    })
    return () => subscription.unsubscribe()
  }, [obtenerPerfil])

  const renderVista = () => {
    switch (vista) {
      case 'polemica': return <Polemica usuario={usuario} abrirAuth={() => setModalAbierto(true)} />
      case 'tabla': return <Tabla />
      case 'noticias': return <Noticias />
      case 'foro': return <Foro usuario={usuario} abrirAuth={() => setModalAbierto(true)} />
      case 'perfil': return <Perfil usuario={usuario} setUsuario={setUsuario} />
      case 'admin': return usuario?.esAdmin ? <AdminPanel /> : <Hero onNavegar={setVista} />
      case 'resultados': return <Resultados usuario={usuario} abrirAuth={() => setModalAbierto(true)} />
      default: return <Hero onNavegar={setVista} />
    }
  }

  return (
    <div className="app-container">
      <Navbar vistaActual={vista} onNavegar={setVista} usuario={usuario} abrirAuth={() => setModalAbierto(true)} toggleTema={() => setEsModoClaro(!esModoClaro)} />
      
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
              <span onClick={() => setVista('resultados')}>Resultados</span>
            </div>
            <div>
              <h4>Legal</h4>
              <span>Privacidad</span>
              <span>Contacto</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">© 2026 El Tercer Tiempo. Todos los derechos reservados.</div>
      </footer>

      {modalAbierto && (
        <AuthModal onCerrar={() => setModalAbierto(false)} onLoginExitoso={() => setModalAbierto(false)} setUsuario={setUsuario} obtenerPerfil={obtenerPerfil} />
      )}
    </div>
  )
}

function AuthModal({ onCerrar, onLoginExitoso, setUsuario, obtenerPerfil }) {
  const [esRegistro, setEsRegistro] = useState(false)
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [nick, setNick] = useState('')
  const [avatarSel, setAvatarSel] = useState(AVATARES_DISPONIBLES[0]), [equipoSel, setEquipoSel] = useState(EQUIPOS_DISPONIBLES[0])
  const [cargando, setCargando] = useState(false), [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault(); setCargando(true); setError('')
    try {
      if (esRegistro) {
        const { data } = await supabase.auth.signUp({ email, password })
        if (data.user) {
          await supabase.from('perfiles').insert([{ user_id: data.user.id, nick, avatar: avatarSel, equipo: equipoSel }])
          await obtenerPerfil(data.user)
        }
      } else {
        const { data } = await supabase.auth.signInWithPassword({ email, password })
        if (data?.user) await obtenerPerfil(data.user)
      }
      onLoginExitoso()
    } catch (err) { setError(err.message) } finally { setCargando(false) }
  }

  return (
    <div className="modal-overlay" onClick={onCerrar}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onCerrar}>✕</button>
        <h2>{esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="email" placeholder="Email" required onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Contraseña" required onChange={e => setPassword(e.target.value)} />
          {error && <p style={{ color: 'red', fontSize: '12px' }}>{error}</p>}
          <button type="submit">{cargando ? '...' : 'Entrar'}</button>
        </form>
      </div>
    </div>
  )
}

export default App