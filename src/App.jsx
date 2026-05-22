import { useState, useEffect } from 'react'
import { supabase } from './supabase' 
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Polemica from './components/Polemica'
import Tabla from './components/Tabla'
import Noticias from './components/Noticias'
import Foro from './components/Foro'

// Todos los equipos de Primera División de España (Temporada actual)
const EQUIPOS_DISPONIBLES = [
  'Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Athletic Club',
  'Real Sociedad', 'Real Betis', 'Villarreal CF', 'Valencia CF',
  'Girona FC', 'Rayo Vallecano', 'Osasuna', 'Getafe CF',
  'Celta de Vigo', 'Sevilla FC', 'Alavés', 'RCD Mallorca',
  'Elche', 'Espanyol', 'Levante', 'Oviedo',
  'Neutral / Sin equipo'
]

const AVATARES_DISPONIBLES = ['🤡', '🦊', '🦁', '🐸', '🐵', '🦉', '🥷', '🧙‍♂️', '🧔', '🧑', '👦', '🧓']

// ==========================================
// 1. COMPONENTE PRINCIPAL (App)
// ==========================================
function App() {
  const [vista, setVista] = useState('home')
  const [usuario, setUsuario] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  // Escuchar cambios de autenticación en Supabase
  useEffect(() => {
    // Al cargar la app, comprobar si ya hay sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) obtenerPerfil(session.user)
    })

    // Escuchar cambios de login / logout en tiempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        obtenerPerfil(session.user)
      } else {
        setUsuario(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  // Buscar los datos de la tabla perfiles usando el ID de usuario de la autenticación
  const obtenerPerfil = async (authUser) => {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('nick, avatar, equipo')
        .eq('user_id', authUser.id)
        .maybeSingle()

      if (error) throw error

      if (data) {
        // Guardamos los datos de auth combinados con los del perfil personalizado
        setUsuario({
          id: authUser.id,
          email: authUser.email,
          nick: data.nick,
          avatar: data.avatar,
          equipo: data.equipo
        })
      } else {
        // Fallback por si la sincronización del perfil tarda un instante
        setUsuario({
          id: authUser.id,
          email: authUser.email,
          nick: authUser.email.split('@')[0],
          avatar: '🦊',
          equipo: 'Neutral'
        })
      }
    } catch (err) {
      console.error('Error al obtener perfil:', err.message)
    }
  }

  const renderVista = () => {
    switch (vista) {
      case 'polemica': return <Polemica usuario={usuario} abrirAuth={() => setModalAbierto(true)} />
      case 'tabla': return <Tabla />
      case 'noticias': return <Noticias />
      case 'foro': return <Foro usuario={usuario} abrirAuth={() => setModalAbierto(true)} />
      default: return <Hero onNavegar={setVista} />
    }
  }

  const appContainerStyle = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-color)',
    color: 'var(--text-color)',
    transition: 'background-color 0.3s, color 0.3s'
  }

  return (
    <div style={appContainerStyle}>
      <Navbar
        vistaActual={vista}
        onNavegar={setVista}
        usuario={usuario}
        abrirAuth={() => setModalAbierto(true)}
      />

      <main style={{ flex: 1 }}>
        {renderVista()}
      </main>

      <Footer />

      {modalAbierto && (
        <AuthModal
          onCerrar={() => setModalAbierto(false)}
          onLoginExitoso={() => setModalAbierto(false)}
        />
      )}
    </div>
  )
}

// ==========================================
// 2. COMPONENTE: AuthModal (Integración Real con Supabase)
// ==========================================
const getModalStyles = () => ({
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem'
  },
  modal: {
    border: '1px solid var(--border-color)', borderRadius: '12px', padding: '2rem',
    backgroundColor: 'var(--card-bg)', display: 'flex', flexDirection: 'column',
    gap: '1.25rem', maxWidth: '400px', width: '100%', position: 'relative'
  },
  closeBtn: {
    position: 'absolute', top: '12px', right: '16px', background: 'none',
    border: 'none', color: 'var(--muted-color)', fontSize: '18px', cursor: 'pointer'
  },
  input: { 
    backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', 
    borderRadius: '8px', padding: '10px', fontSize: '14px', color: 'var(--text-color)', 
    outline: 'none', width: '100%', boxSizing: 'border-box' 
  },
  avatarGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px', margin: '6px 0'
  },
  avatarItem: { fontSize: '22px', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-color)' },
  avatarItemActive: { fontSize: '22px', padding: '6px', border: '1px solid #E24B4A', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--border-color)' },
  select: { backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', fontSize: '14px', color: 'var(--text-color)', cursor: 'pointer', width: '100%' },
  submitBtn: { backgroundColor: '#E24B4A', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '5px', width: '100%' },
  switchMode: { background: 'none', border: 'none', color: 'var(--muted-color)', fontSize: '12px', cursor: 'pointer', textAlign: 'center', marginTop: '5px' },
  errorMsg: { color: '#E24B4A', fontSize: '12px', marginTop: '2px' }
})

function AuthModal({ onCerrar, onLoginExitoso }) {
  const [esRegistro, setEsRegistro] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nick, setNick] = useState('')
  const [avatarSel, setAvatarSel] = useState(AVATARES_DISPONIBLES[0])
  const [equipoSel, setEquipoSel] = useState(EQUIPOS_DISPONIBLES[0])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const modalStyles = getModalStyles()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    try {
      if (esRegistro) {
        if (!nick.trim()) throw new Error('El nick es obligatorio')

        // 1. Crear el usuario en la autenticación de Supabase
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (authError) throw authError

        const user = authData.user
        if (user) {
          // 2. Insertar los datos complementarios en la tabla perfiles
          const { error: perfilError } = await supabase
            .from('perfiles')
            .insert([
              {
                user_id: user.id,
                nick: nick.trim(),
                avatar: avatarSel,
                equipo: equipoSel
              }
            ])

          if (perfilError) throw perfilError
        }
      } else {
        // Flujo de login tradicional
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (loginError) throw loginError
      }

      onLoginExitoso()
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={modalStyles.overlay} onClick={onCerrar}>
      <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onCerrar}>✕</button>
        
        <h2 style={{ color: 'var(--text-color)', margin: '0 0 10px 0', textAlign: 'center' }}>
          {esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ color: 'var(--text-color)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Correo Electrónico</label>
            <input type="email" required style={modalStyles.input} value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" />
          </div>

          <div>
            <label style={{ color: 'var(--text-color)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Contraseña</label>
            <input type="password" required style={modalStyles.input} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
          </div>

          {esRegistro && (
            <>
              <div>
                <label style={{ color: 'var(--text-color)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Tu Nick (Apodo)</label>
                <input type="text" required style={modalStyles.input} value={nick} onChange={e => setNick(e.target.value)} placeholder="Ej. RonceroCulé" />
              </div>

              <div>
                <label style={{ color: 'var(--text-color)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Elige tu Avatar</label>
                <div style={modalStyles.avatarGrid}>
                  {AVATARES_DISPONIBLES.map(av => (
                    <div 
                      key={av} 
                      style={avatarSel === av ? modalStyles.avatarItemActive : modalStyles.avatarItem}
                      onClick={() => setAvatarSel(av)}
                    >
                      {av}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ color: 'var(--text-color)', fontSize: '12px', display: 'block', marginBottom: '4px' }}>Tu Equipo de Primera</label>
                <select style={modalStyles.select} value={equipoSel} onChange={e => setEquipoSel(e.target.value)}>
                  {EQUIPOS_DISPONIBLES.map(eq => (
                    <option key={eq} value={eq}>{eq}</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {error && <div style={modalStyles.errorMsg}>⚠️ {error}</div>}

          <button type="submit" disabled={cargando} style={modalStyles.submitBtn}>
            {cargando ? 'Procesando...' : esRegistro ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <button style={modalStyles.switchMode} onClick={() => { setEsRegistro(!esRegistro); setError(''); }}>
          {esRegistro ? '¿Ya tienes cuenta? Inicia sesión aquí' : '¿No tienes cuenta? Regístrate aquí'}
        </button>
      </div>
    </div>
  )
}

// ==========================================
// 3. COMPONENTE: Footer
// ==========================================
function Footer() {
  return (
    <footer style={{ 
      padding: '1rem', 
      borderTop: '1px solid var(--border-color)', 
      textAlign: 'center', 
      fontSize: '12px', 
      color: 'var(--muted-color)', 
      backgroundColor: 'var(--card-bg)' 
    }}>
      © 2026 El Tercer Tiempo - La comunidad del postpartido.
    </footer>
  )
}

export default App;