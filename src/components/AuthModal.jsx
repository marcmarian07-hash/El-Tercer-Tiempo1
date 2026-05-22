import { useState } from 'react'
import AuthModal from './components/AuthModal.jsx'

const AVATARES_DISPONIBLES = ['🤡', '🦊', '🦁', '🐸', '🐵', '🦉', '🥷', '🧙‍♂️', '🧔', '🧑', '👦', '🧓']
const EQUIPOS_DISPONIBLES = ['Real Madrid', 'Barcelona', 'Atlético', 'Sevilla', 'Betis', 'Valencia', 'Girona', 'Athletic Club', 'Real Sociedad', 'Otro / Neutral']

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: '1rem'
  },
  modal: {
    border: '1px solid #222', borderRadius: '12px', padding: '2rem',
    backgroundColor: '#0d0d0d', display: 'flex', flexDirection: 'column',
    gap: '1.25rem', maxWidth: '400px', width: '100%', position: 'relative'
  },
  closeBtn: {
    position: 'absolute', top: '12px', right: '16px', background: 'none',
    border: 'none', color: '#666', fontSize: '18px', cursor: 'pointer'
  },
  formGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  input: { backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px', padding: '10px', fontSize: '14px', color: '#f0f0f0', outline: 'none', fontFamily: 'inherit' },
  gridAvatares: { display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px' },
  avatarItem: { fontSize: '22px', padding: '6px', border: '1px solid #222', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#0a0a0a' },
  avatarItemActive: { fontSize: '22px', padding: '6px', border: '1px solid #E24B4A', borderRadius: '8px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#1a0a0a' },
  select: { backgroundColor: '#111', border: '1px solid #222', borderRadius: '8px', padding: '10px', fontSize: '14px', color: '#f0f0f0', outline: 'none', fontFamily: 'inherit', cursor: 'pointer' },
  submitBtn: { backgroundColor: '#E24B4A', color: '#fff', border: 'none', borderRadius: '8px', padding: '12px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '5px' },
}

function AuthModal({ onCerrar, onLogin }) {
  const [nombre, setNombre] = useState('')
  const [avatarSel, setAvatarSel] = useState(AVATARES_DISPONIBLES[0])
  const [equipoSel, setEquipoSel] = useState(EQUIPOS_DISPONIBLES[0])

  const manejarEnvio = (e) => {
    e.preventDefault()
    if (!nombre.trim()) return alert('¡Ponte un nick para poder opinar!')
    onLogin({ nombre: nombre.trim(), avatar: avatarSel, equipo: equipoSel })
  }

  return (
    <div style={styles.overlay} onClick={onCerrar}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onCerrar}>✕</button>
        
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f0f0f0', margin: '0 0 4px 0', textAlign: 'center' }}>Crear Cuenta</h2>
          <p style={{ fontSize: '12px', color: '#666', margin: 0, textAlign: 'center' }}>Únete a la comunidad del Llorometro</p>
        </div>

        <form onSubmit={manejarEnvio} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={styles.formGroup}>
            <label style={{ fontSize: '12px', color: '#aaa' }}>Tu Nick</label>
            <input style={styles.input} placeholder="Ej. ElLloronFC" value={nombre} onChange={e => setNombre(e.target.value)} maxLength={14} />
          </div>

          <div style={styles.formGroup}>
            <label style={{ fontSize: '12px', color: '#aaa' }}>Tu Avatar</label>
            <div style={styles.gridAvatares}>
              {AVATARES_DISPONIBLES.map(av => (
                <div key={av} style={avatarSel === av ? styles.avatarItemActive : styles.avatarItem} onClick={() => setAvatarSel(av)}>
                  {av}
                </div>
              ))}
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={{ fontSize: '12px', color: '#aaa' }}>Tu Club Favorito</label>
            <select style={styles.select} value={equipoSel} onChange={e => setEquipoSel(e.target.value)}>
              {EQUIPOS_DISPONIBLES.map(eq => (
                <option key={eq} value={eq}>{eq}</option>
              ))}
            </select>
          </div>

          <button type="submit" style={styles.submitBtn}>Guardar Perfil 🚀</button>
        </form>
      </div>
    </div>
  )
}

export default AuthModal