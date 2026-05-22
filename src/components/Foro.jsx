import { useState } from 'react';

// ==========================================
// 1. DATOS
// ==========================================
const foroPolemicas = [
  { id: '1', partido: 'Real Madrid vs Atletico', titulo: "Penalti no pitado a Vinicius en el min 88" },
  { id: '2', partido: 'Barca vs Girona',          titulo: 'Amarilla a Gavi por protestar sin hablar' },
  { id: '3', partido: 'Sevilla vs Betis',          titulo: 'Roja directa a Nacho Fernandez' },
  { id: '4', partido: 'Valencia vs Villarreal',    titulo: 'Fuera de juego anulado por VAR' },
];

const mensajesIniciales = {
  general: [
    { id: 1, autor: 'Paco_Celta',  equipo: 'Celta',      avatar: '🧔', texto: 'Este año el arbitraje esta siendo una verguenza total',    tiempo: 'Hace 5 min' },
    { id: 2, autor: 'MadridIsta99', equipo: 'Real Madrid',  avatar: '👦', texto: 'Siempre hay excusas, los arbitros hacen lo que pueden',      tiempo: 'Hace 8 min' },
    { id: 3, autor: 'ValenciaFan',  equipo: 'Valencia',    avatar: '🧓', texto: 'A nosotros nos han robado 7 puntos esta temporada minimo',    tiempo: 'Hace 12 min' },
  ],
  '1': [{ id: 1, autor: 'ColchoneroB', equipo: 'Atlético', avatar: '🧑', texto: 'Witsel no le toca, es teatro puro de Vinicius', tiempo: 'Hace 3 min' }],
  '2': [{ id: 1, autor: 'CuleActivo',  equipo: 'Barcelona', avatar: '🧔', texto: 'Gavi ni abrio la boca, fue solo un gesto', tiempo: 'Hace 10 min' }],
  '3': [{ id: 1, autor: 'SevillaFan',  equipo: 'Sevilla', avatar: '🧑', texto: 'Entrada con los dos pies, era roja si o si', tiempo: 'Hace 1 min' }],
  '4': [{ id: 1, autor: 'ValenciaFan', equipo: 'Valencia', avatar: '🧓', texto: 'Estaba en posicion legal por medio metro, robo descarado', tiempo: 'Hace 2 min' }],
};

// ==========================================
// 2. ESTILOS (usando variables CSS)
// ==========================================
const styles = {
  page: { padding: '1.5rem 2rem', maxWidth: '800px', margin: '0 auto' },
  label: { fontSize: '11px', fontWeight: '800', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--muted-color)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '12px' },
  labelLine: { flex: 1, height: '1px', backgroundColor: 'var(--border-color)' },
  tabs: { display: 'flex', gap: '8px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '4px' },
  tab: { flexShrink: 0, background: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 16px', fontSize: '12px', color: 'var(--muted-color)', cursor: 'pointer', transition: 'all 0.2s ease' },
  tabActive: { flexShrink: 0, background: 'var(--border-color)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '8px 16px', fontSize: '12px', color: 'var(--text-color)', fontWeight: '800', cursor: 'pointer' },
  chatWrap: { border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', backgroundColor: 'var(--card-bg)', transition: 'border 0.3s' },
  chatHeader: { padding: '16px 20px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  mensajesList: { padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', minHeight: '340px', maxHeight: '420px', overflowY: 'auto' },
  mensaje: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 },
  autor: { fontSize: '13px', fontWeight: '700', color: 'var(--text-color)' },
  texto: { fontSize: '13px', color: 'var(--muted-color)', lineHeight: '1.6' },
  inputArea: { padding: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'center' },
  msgInput: { flex: 1, backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', color: 'var(--text-color)', outline: 'none' }
};

// ==========================================
// 3. COMPONENTES
// ==========================================
function ChatBox({ hilo, titulo, subtitulo, usuario, abrirAuth }) {
  const mensajes = mensajesIniciales[hilo] || [];
  const [texto, setTexto] = useState('');

  return (
    <div style={styles.chatWrap}>
      <div style={styles.chatHeader}>
        <div>
          <p style={{ fontWeight: '800', color: 'var(--text-color)' }}>{titulo}</p>
          <p style={{ fontSize: '11px', color: 'var(--muted-color)' }}>{subtitulo}</p>
        </div>
      </div>
      <div style={styles.mensajesList}>
        {mensajes.map(m => (
          <div key={m.id} style={styles.mensaje}>
            <div style={styles.avatar}>{m.avatar}</div>
            <div style={{ flex: 1 }}>
              <span style={styles.autor}>{m.autor}</span>
              <p style={styles.texto}>{m.texto}</p>
            </div>
          </div>
        ))}
      </div>
      <div style={styles.inputArea}>
        {usuario ? (
          <input style={styles.msgInput} placeholder="Escribe tu opinión..." value={texto} onChange={e => setTexto(e.target.value)} />
        ) : (
          <div style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: '12px', color: 'var(--muted-color)' }}>
            <button style={{ color: 'var(--text-color)', cursor: 'pointer', background: 'none', border: 'none', textDecoration: 'underline' }} onClick={abrirAuth}>Identificarse </button> para poder comentar.
          </div>
        )}
      </div>
    </div>
  );
}

function Foro({ usuario, abrirAuth }) {
  const [tab, setTab] = useState('general');
  const info = tab === 'general' 
    ? { titulo: 'Chat general', subtitulo: 'Debate libre sobre arbitraje' }
    : foroPolemicas.find(p => p.id === tab) || { titulo: 'Discusión', subtitulo: 'Partido' };

  return (
    <section style={styles.page}>
      <div style={styles.label}>Foro de debate <span style={styles.labelLine} /></div>
      <div style={styles.tabs}>
        <button style={tab === 'general' ? styles.tabActive : styles.tab} onClick={() => setTab('general')}>General</button>
        {foroPolemicas.map(p => (
          <button key={p.id} style={tab === p.id ? styles.tabActive : styles.tab} onClick={() => setTab(p.id)}>{p.partido}</button>
        ))}
      </div>
      <ChatBox hilo={tab} titulo={info.titulo || info.partido} subtitulo={info.subtitulo || info.partido} usuario={usuario} abrirAuth={abrirAuth} />
    </section>
  );
}

export default Foro;