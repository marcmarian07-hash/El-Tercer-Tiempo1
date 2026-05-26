import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const AVATARES = ['🤡', '🦊', '🦁', '🐸', '🐵', '🦉', '🥷', '🧙‍♂️', '🧔', '🧑', '👦', '🧓', '🐯', '🦅', '🐺', '🦄']

const EQUIPOS = [
  'Real Madrid', 'FC Barcelona', 'Atlético de Madrid', 'Athletic Club',
  'Real Sociedad', 'Real Betis', 'Villarreal CF', 'Valencia CF',
  'Girona FC', 'Rayo Vallecano', 'Osasuna', 'Getafe CF',
  'Celta de Vigo', 'Sevilla FC', 'Alavés', 'RCD Mallorca',
  'Elche', 'Espanyol', 'Levante', 'Oviedo',
  'Neutral / Sin equipo'
]

const BADGES_EQUIPO = {
  'Real Madrid': '👑', 'FC Barcelona': '🔵', 'Atlético de Madrid': '🔴',
  'Athletic Club': '🦁', 'Real Sociedad': '⚪', 'Real Betis': '💚',
  'Villarreal CF': '🟡', 'Valencia CF': '🦇', 'Girona FC': '🔴',
  'Rayo Vallecano': '⚡', 'Osasuna': '🔴', 'Getafe CF': '🔵',
  'Celta de Vigo': '🩵', 'Sevilla FC': '🌹', 'Alavés': '💙',
  'RCD Mallorca': '🏝️', 'Elche': '🌴', 'Espanyol': '🦜',
  'Levante': '🔵', 'Oviedo': '🔵', 'Neutral / Sin equipo': '⚽'
}

export default function Perfil({ usuario, setUsuario, onNavegar }) {
  const [nick, setNick] = useState(usuario?.nick || '')
  const [avatar, setAvatar] = useState(usuario?.avatar || '🦊')
  const [equipo, setEquipo] = useState(usuario?.equipo || 'Neutral / Sin equipo')
  const [guardando, setGuardando] = useState(false)
  const [exito, setExito] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({ votos: 0, mensajes: 0 })
  const [pestana, setPestana] = useState('perfil')

  useEffect(() => {
    if (!usuario?.id) return
    async function loadStats() {
      const [{ count: votos }, { count: mensajes }] = await Promise.all([
        supabase.from('votos').select('*', { count: 'exact', head: true }).eq('fingerprint', usuario.id),
        supabase.from('mensajes').select('*', { count: 'exact', head: true }).eq('user_id', usuario.id),
      ])
      setStats({ votos: votos || 0, mensajes: mensajes || 0 })
    }
    loadStats()
  }, [usuario?.id])

  const guardar = async () => {
    if (!nick.trim()) { setError('El nick no puede estar vacío.'); return }
    setGuardando(true)
    setError('')

    const { error: err } = await supabase
      .from('perfiles')
      .update({ nick: nick.trim(), avatar, equipo })
      .eq('user_id', usuario.id)

    if (err) {
      setError('Error al guardar. Inténtalo de nuevo.')
      setGuardando(false)
      return
    }

    setUsuario(prev => ({ ...prev, nick: nick.trim(), avatar, equipo }))
    setExito(true)
    setTimeout(() => setExito(false), 3000)
    setGuardando(false)
  }

  const cerrarSesion = async () => {
    await supabase.auth.signOut()
    onNavegar('home')
  }

  return (
    <div style={s.page}>
      <style>{`
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      {/* CABECERA */}
      <div style={s.header}>
        <button style={s.backBtn} onClick={() => onNavegar('home')}>← Volver</button>
        <div style={s.headerCard}>
          <div style={s.avatarBig}>{avatar}</div>
          <div>
            <div style={s.nickBig}>{nick || usuario?.nick}</div>
            <div style={s.equipoBadge}>
              {BADGES_EQUIPO[equipo] || '⚽'} {equipo}
            </div>
            <div style={s.emailMuted}>{usuario?.email}</div>
          </div>
        </div>

        {/* STATS */}
        <div style={s.statsRow}>
          <div style={s.statCard}>
            <div style={s.statVal}>{stats.votos}</div>
            <div style={s.statLbl}>Votos emitidos</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statVal}>{stats.mensajes}</div>
            <div style={s.statLbl}>Mensajes en el foro</div>
          </div>
          <div style={s.statCard}>
            <div style={s.statVal}>
              {new Date(usuario?.created_at || Date.now()).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
            </div>
            <div style={s.statLbl}>Miembro desde</div>
          </div>
        </div>
      </div>

      {/* PESTAÑAS */}
      <div style={s.tabs}>
        <button style={{ ...s.tab, ...(pestana === 'perfil' ? s.tabActive : {}) }} onClick={() => setPestana('perfil')}>
          ✏️ Editar perfil
        </button>
        <button style={{ ...s.tab, ...(pestana === 'cuenta' ? s.tabActive : {}) }} onClick={() => setPestana('cuenta')}>
          🔐 Cuenta
        </button>
      </div>

      {/* PESTAÑA: EDITAR PERFIL */}
      {pestana === 'perfil' && (
        <div style={s.section}>

          {/* NICK */}
          <div style={s.field}>
            <label style={s.label}>Nick público</label>
            <input
              style={s.input}
              value={nick}
              onChange={e => setNick(e.target.value)}
              maxLength={14}
              placeholder="Tu apodo"
            />
            <span style={s.hint}>{nick.length}/14 caracteres</span>
          </div>

          {/* AVATAR */}
          <div style={s.field}>
            <label style={s.label}>Tu Avatar</label>
            <div style={s.avatarGrid}>
              {AVATARES.map(av => (
                <div
                  key={av}
                  style={{ ...s.avatarItem, ...(avatar === av ? s.avatarActive : {}) }}
                  onClick={() => setAvatar(av)}
                >
                  {av}
                </div>
              ))}
            </div>
          </div>

          {/* EQUIPO */}
          <div style={s.field}>
            <label style={s.label}>Club favorito</label>
            <div style={s.equipoGrid}>
              {EQUIPOS.map(eq => (
                <div
                  key={eq}
                  style={{ ...s.equipoItem, ...(equipo === eq ? s.equipoActive : {}) }}
                  onClick={() => setEquipo(eq)}
                >
                  <span style={{ fontSize: '18px' }}>{BADGES_EQUIPO[eq] || '⚽'}</span>
                  <span style={{ fontSize: '11px', textAlign: 'center', lineHeight: '1.2' }}>{eq}</span>
                </div>
              ))}
            </div>
          </div>

          {error && <div style={s.errorBox}>{error}</div>}
          {exito && <div style={s.exitoBox}>✅ Perfil actualizado correctamente</div>}

          <button style={s.saveBtn} onClick={guardar} disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      )}

      {/* PESTAÑA: CUENTA */}
      {pestana === 'cuenta' && (
        <div style={s.section}>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>Email</span>
            <span style={s.infoVal}>{usuario?.email}</span>
          </div>
          <div style={s.infoRow}>
            <span style={s.infoLabel}>ID de usuario</span>
            <span style={{ ...s.infoVal, fontSize: '11px', color: '#555' }}>{usuario?.id}</span>
          </div>

          <div style={s.dangerZone}>
            <div style={s.dangerTitle}>Zona de peligro</div>
            <button style={s.logoutBtn} onClick={cerrarSesion}>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  page: {
    maxWidth: '600px', margin: '0 auto', padding: '1.5rem 1.5rem 4rem',
    animation: 'fadeIn 0.4s ease forwards',
  },
  backBtn: {
    background: 'none', border: 'none', color: 'var(--muted-color)',
    fontSize: '13px', cursor: 'pointer', padding: '0 0 1.5rem 0',
    fontFamily: 'inherit', display: 'block',
  },
  header: {
    border: '1px solid var(--border-color)', borderRadius: '14px',
    backgroundColor: 'var(--card-bg)', padding: '1.5rem', marginBottom: '1rem',
  },
  headerCard: {
    display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '1.5rem',
  },
  avatarBig: {
    fontSize: '4rem', width: '72px', height: '72px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'var(--bg-color)', borderRadius: '50%',
    border: '2px solid var(--border-color)', flexShrink: 0,
  },
  nickBig: { fontSize: '20px', fontWeight: '800', color: 'var(--text-color)', marginBottom: '4px' },
  equipoBadge: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontSize: '12px', color: 'var(--muted-color)',
    backgroundColor: 'var(--bg-color)', padding: '3px 10px',
    borderRadius: '100px', border: '1px solid var(--border-color)', marginBottom: '4px',
  },
  emailMuted: { fontSize: '11px', color: 'var(--muted-color)' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px' },
  statCard: {
    backgroundColor: 'var(--bg-color)', borderRadius: '10px', padding: '12px',
    border: '1px solid var(--border-color)', textAlign: 'center',
  },
  statVal: { fontSize: '20px', fontWeight: '800', color: '#E24B4A' },
  statLbl: { fontSize: '10px', color: 'var(--muted-color)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  tabs: {
    display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem',
  },
  tab: {
    flex: 1, padding: '12px', background: 'none', border: 'none',
    color: 'var(--muted-color)', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', borderBottom: '2px solid transparent',
    transition: 'all .15s', fontFamily: 'inherit',
  },
  tabActive: { color: '#E24B4A', borderBottomColor: '#E24B4A' },
  section: {
    border: '1px solid var(--border-color)', borderRadius: '14px',
    backgroundColor: 'var(--card-bg)', padding: '1.5rem',
    display: 'flex', flexDirection: 'column', gap: '1.5rem',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '12px', fontWeight: '700', color: 'var(--muted-color)', textTransform: 'uppercase', letterSpacing: '1px' },
  hint: { fontSize: '11px', color: 'var(--muted-color)' },
  input: {
    backgroundColor: 'var(--bg-color)', border: '1px solid var(--border-color)',
    borderRadius: '8px', padding: '10px 14px', fontSize: '15px',
    color: 'var(--text-color)', outline: 'none', fontFamily: 'inherit',
  },
  avatarGrid: { display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '8px' },
  avatarItem: {
    fontSize: '24px', padding: '8px', border: '1px solid var(--border-color)',
    borderRadius: '10px', textAlign: 'center', cursor: 'pointer',
    backgroundColor: 'var(--bg-color)', transition: 'all .15s',
  },
  avatarActive: { border: '2px solid #E24B4A', backgroundColor: 'rgba(226,75,74,0.1)' },
  equipoGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' },
  equipoItem: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    padding: '10px 6px', border: '1px solid var(--border-color)', borderRadius: '10px',
    cursor: 'pointer', backgroundColor: 'var(--bg-color)', transition: 'all .15s',
  },
  equipoActive: { border: '2px solid #E24B4A', backgroundColor: 'rgba(226,75,74,0.08)' },
  errorBox: {
    backgroundColor: 'rgba(226,75,74,0.1)', border: '1px solid rgba(226,75,74,0.3)',
    borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#E24B4A',
  },
  exitoBox: {
    backgroundColor: 'rgba(99,153,34,0.1)', border: '1px solid rgba(99,153,34,0.3)',
    borderRadius: '8px', padding: '10px', fontSize: '12px', color: '#7cd13b',
  },
  saveBtn: {
    backgroundColor: '#E24B4A', color: '#fff', border: 'none', borderRadius: '10px',
    padding: '13px', fontSize: '14px', fontWeight: '700', cursor: 'pointer',
    fontFamily: 'inherit', transition: 'opacity .15s',
  },
  infoRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 0', borderBottom: '1px solid var(--border-color)',
  },
  infoLabel: { fontSize: '12px', color: 'var(--muted-color)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '1px' },
  infoVal: { fontSize: '13px', color: 'var(--text-color)' },
  dangerZone: {
    border: '1px solid rgba(226,75,74,0.3)', borderRadius: '10px',
    padding: '1.2rem', marginTop: '0.5rem',
  },
  dangerTitle: { fontSize: '12px', color: '#E24B4A', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' },
  logoutBtn: {
    backgroundColor: 'transparent', border: '1px solid #E24B4A', color: '#E24B4A',
    borderRadius: '8px', padding: '10px 20px', fontSize: '13px', fontWeight: '600',
    cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
  },
}