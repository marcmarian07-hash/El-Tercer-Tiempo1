import { useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Polemica from './components/Polemica'
import Tabla from './components/Tabla'
import Noticias from './components/Noticias'
import Foro from './components/Foro'

// ==========================================
// 1. COMPONENTE PRINCIPAL (App)
// ==========================================
function App() {
  const [vista, setVista] = useState('home')
  const [usuario, setUsuario] = useState(null)
  const [modalAbierto, setModalAbierto] = useState(false)

  const renderVista = () => {
    switch (vista) {
      case 'polemica': return <Polemica />
      case 'tabla': return <Tabla />
      case 'noticias': return <Noticias />
      case 'foro': return <Foro usuario={usuario} abrirAuth={() => setModalAbierto(true)} />
      default: return <Hero onNavegar={setVista} />
    }
  }

  // Estilos globales usando variables CSS para soportar el modo claro/oscuro
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
          onLogin={(datos) => {
            setUsuario(datos)
            setModalAbierto(false)
          }}
        />
      )}
    </div>
  )
}

export default App

// ==========================================
// 2. COMPONENTE: AuthModal (Integrado con variables)
// ==========================================
const AVATARES_DISPONIBLES = ['🤡', '🦊', '🦁', '🐸', '🐵', '🦉', '🥷', '🧙‍♂️', '🧔', '🧑', '👦', '🧓']
const EQUIPOS_DISPONIBLES = ['Real Madrid', 'Barcelona', 'Atlético', 'Sevilla', 'Betis', 'Valencia', 'Girona', 'Athletic Club', 'Real Sociedad', 'Otro / Neutral']

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
  googleBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
    backgroundColor: '#ffffff', color: '#1f1f1f', border: 'none', borderRadius: '8px',
    padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    width: '100%', marginTop: '1rem'
  },
  input: { backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', fontSize: '14px', color: 'var(--text-color)', outline: 'none' },
  avatarItem: { fontSize: '22px', padding: '6px', border: '1px solid var(--border-color)', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-color)' },
  avatarItemActive: { fontSize: '22px', padding: '6px', border: '1px solid #E24B4A', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: 'var(--border-color)' },
  select: { backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', fontSize: '14px', color: 'var(--text-color)', cursor: 'pointer' },
  submitBtn: { backgroundColor: '#E24B4A', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '5px' },
})

function AuthModal({ onCerrar, onLogin }) {
  const [paso, setPaso] = useState('google')
  const [nombre, setNombre] = useState('FútbolFan')
  const [avatarSel, setAvatarSel] = useState(AVATARES_DISPONIBLES[0])
  const [equipoSel, setEquipoSel] = useState(EQUIPOS_DISPONIBLES[0])
  const modalStyles = getModalStyles()

  return (
    <div style={modalStyles.overlay} onClick={onCerrar}>
      <div style={modalStyles.modal} onClick={e => e.stopPropagation()}>
        <button style={modalStyles.closeBtn} onClick={onCerrar}>✕</button>
        {paso === 'google' && (
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <h2 style={{ color: 'var(--text-color)' }}>Entrar</h2>
            <button style={modalStyles.googleBtn} onClick={() => setPaso('perfil')}>Continuar con Google</button>
          </div>
        )}
        {paso === 'perfil' && (
          <form onSubmit={(e) => { e.preventDefault(); onLogin({ nombre, avatar: avatarSel, equipo: equipoSel }) }}>
            <label style={{ color: 'var(--text-color)', fontSize: '12px' }}>Nick</label>
            <input style={modalStyles.input} value={nombre} onChange={e => setNombre(e.target.value)} />
            {/* ... resto de formulario ... */}
            <button type="submit" style={modalStyles.submitBtn}>Entrar</button>
          </form>
        )}
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