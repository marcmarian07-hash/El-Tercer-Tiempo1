import { useState, useEffect } from 'react'
import { supabase } from './supabase' 
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Polemica from './components/Polemica'
import Tabla from './components/Tabla'
import Noticias from './components/Noticias'
import Foro from './components/Foro'

const AVATARES = ['🤡', '🦊', '🦁', '🐸', '🐵', '🦉', '🥷', '🧙‍♂️', '🧔', '🧑', '👦', '🧓']

const EQUIPOS = [
  'Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Athletic Club',
  'Real Sociedad', 'Real Betis', 'Villarreal CF', 'Valencia CF',
  'Girona FC', 'Rayo Vallecano', 'Osasuna', 'Getafe CF',
  'Celta de Vigo', 'Sevilla FC', 'Alavés', 'RCD Mallorca',
  'Elche', 'Espanyol', 'Levante', 'Oviedo',
  'Neutral / Sin equipo'
]

export default function AuthModal({ onCerrar, onLogin }) {
  const [modo, setModo] = useState('login') // 'login' | 'registro'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nick, setNick] = useState('')
  const [avatar, setAvatar] = useState(AVATARES[0])
  const [equipo, setEquipo] = useState(EQUIPOS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await db.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email o contraseña incorrectos.')
      setLoading(false)
      return
    }

    // Cargar perfil del usuario
    const { data: perfil } = await db
      .from('perfiles')
      .select('*')
      .eq('user_id', data.user.id)
      .single()

    onLogin({ ...data.user, perfil })
    setLoading(false)
  }

  const handleRegistro = async (e) => {
    e.preventDefault()
    setError('')
    if (!nick.trim()) { setError('El nick es obligatorio.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true)

    const { data, error } = await db.auth.signUp({ email, password })

    if (error) {
      setError(error.message === 'User already registered' ? 'Este email ya está registrado.' : error.message)
      setLoading(false)
      return
    }

    // Crear perfil
    await db.from('perfiles').insert({
      user_id: data.user.id,
      nick: nick.trim(),
      avatar,
      equipo,
    })

    setExito('¡Cuenta creada! Revisa tu email para confirmar.')
    setLoading(false)
  }

  return (
    <div style={styles.overlay} onClick={onCerrar}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onCerrar}>✕</button>

        {/* TABS */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(modo === 'login' ? styles.tabActive : {}) }}
            onClick={() => { setModo('login'); setError(''); setExito('') }}
          >
            Entrar
          </button>
          <button
            style={{ ...styles.tab, ...(modo === 'registro' ? styles.tabActive : {}) }}
            onClick={() => { setModo('registro'); setError(''); setExito('') }}
          >
            Registrarse
          </button>
        </div>

        <p style={styles.subtitle}>
          {modo === 'login' ? 'Bienvenido de nuevo, tertuliano 👋' : 'Únete a la comunidad del Llorómetro'}
        </p>

        {error && <div style={styles.errorBox}>{error}</div>}
        {exito && <div style={styles.exitoBox}>{exito}</div>}

        {/* LOGIN */}
        {modo === 'login' && (
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Contraseña</label>
              <input style={styles.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar 🚀'}
            </button>
            <p style={styles.switchText}>
              ¿No tienes cuenta?{' '}
              <span style={styles.switchLink} onClick={() => setModo('registro')}>Regístrate</span>
            </p>
          </form>
        )}

        {/* REGISTRO */}
        {modo === 'registro' && !exito && (
          <form onSubmit={handleRegistro} style={styles.form}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Email</label>
              <input style={styles.input} type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Contraseña</label>
              <input style={styles.input} type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Nick (máx. 14 caracteres)</label>
              <input style={styles.input} placeholder="Ej. ElLloronFC" value={nick} onChange={e => setNick(e.target.value)} maxLength={14} required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tu Avatar</label>
              <div style={styles.gridAvatares}>
                {AVATARES.map(av => (
                  <div
                    key={av}
                    style={avatar === av ? styles.avatarActive : styles.avatarItem}
                    onClick={() => setAvatar(av)}
                  >
                    {av}
                  </div>
                ))}
              </div>
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Tu Club Favorito</label>
              <select style={styles.select} value={equipo} onChange={e => setEquipo(e.target.value)}>
                {EQUIPOS.map(eq => <option key={eq} value={eq}>{eq}</option>)}
              </select>
            </div>
            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta 🚀'}
            </button>
            <p style={styles.switchText}>
              ¿Ya tienes cuenta?{' '}
              <span style={styles.switchLink} onClick={() => setModo('login')}>Entra aquí</span>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem', overflowY: 'auto',
  },
  modal: {
    border: '1px solid #222', borderRadius: '12px', padding: '2rem',
    backgroundColor: '#0d0d0d', display: 'flex', flexDirection: 'column',
    gap: '1rem', maxWidth: '400px', width: '100%', position: 'relative',
    maxHeight: '90vh', overflowY: 'auto',
  },
  closeBtn: {
    position: 'absolute', top: '12px', right: '16px',
    background: 'none', border: 'none', color: '#666', fontSize: '18px', cursor: 'pointer',
  },
  tabs: { display: 'flex', gap: '0', borderBottom: '1px solid #222', marginBottom: '0.5rem' },
  tab: {
    flex: 1, padding: '10px', background: 'none', border: 'none',
    color: '#666', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    borderBottom: '2px solid transparent', transition: 'all .15s', fontFamily: 'inherit',
  },
  tabActive: { color: '#E24B4A', borderBottomColor: '#E24B4A' },
  subtitle: { fontSize: '12px', color: '#666', textAlign: 'center', margin: 0 },
  errorBox: {
    backgroundColor: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)',
    borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#E24B4A', textAlign: 'center',
  },
  exitoBox: {
    backgroundColor: 'rgba(99,153,34,0.1)', border: '1px solid rgba(99,153,34,0.3)',
    borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#7cd13b', textAlign: 'center',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '12px', color: '#aaa' },
  input: {
    backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px',
    padding: '10px', fontSize: '14px', color: '#f0f0f0', outline: 'none', fontFamily: 'inherit',
  },
  select: {
    backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px',
    padding: '10px', fontSize: '14px', color: '#f0f0f0', outline: 'none',
    fontFamily: 'inherit', cursor: 'pointer',
  },
  gridAvatares: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' },
  avatarItem: {
    fontSize: '22px', padding: '6px', border: '1px solid #222',
    borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#0a0a0a',
  },
  avatarActive: {
    fontSize: '22px', padding: '6px', border: '1px solid #E24B4A',
    borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#1a0a0a',
  },
  submitBtn: {
    backgroundColor: '#E24B4A', color: '#fff', border: 'none', borderRadius: '8px',
    padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
    fontFamily: 'inherit', opacity: 1, transition: 'opacity .15s',
  },
  switchText: { fontSize: '12px', color: '#666', textAlign: 'center', margin: 0 },
  switchLink: { color: '#E24B4A', cursor: 'pointer', textDecoration: 'underline' },
}