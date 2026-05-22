const styles = {
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    minHeight: '75vh',
    padding: '3rem 2rem',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-color)',
    transition: 'background-color 0.3s',
  },
  dotGrid: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundImage: 'radial-gradient(var(--border-color) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    maskImage: 'radial-gradient(ellipse 60% 60% at 50% 50%, #000 40%, transparent 100%)',
    zIndex: 0,
  },
  glowCentro: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '450px',
    height: '450px',
    background: 'radial-gradient(circle, rgba(226, 75, 74, 0.1) 0%, transparent 70%)',
    zIndex: 0,
    pointerEvents: 'none',
    animation: 'pulseGlow 8s ease-in-out infinite alternate',
  },
  content: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '800px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 10px',
    borderRadius: '100px',
    backgroundColor: 'rgba(226, 75, 74, 0.1)',
    border: '1px solid rgba(226, 75, 74, 0.2)',
    color: '#E24B4A',
    fontSize: '10px',
    fontWeight: '600',
    letterSpacing: '0.5px',
    marginBottom: '1.25rem',
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
  },
  puntoParpadeo: {
    width: '5px',
    height: '5px',
    backgroundColor: '#E24B4A',
    borderRadius: '50%',
    animation: 'livePulse 1.5s ease-in-out infinite',
  },
  title: {
    fontSize: 'clamp(28px, 4.5vw, 44px)',
    fontWeight: '800',
    lineHeight: '1.2',
    letterSpacing: '-0.03em',
    color: 'var(--text-color)',
    margin: '0 0 1rem 0',
    maxWidth: '650px',
    opacity: 0,
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s forwards',
  },
  subtitle: {
    fontSize: '13.5px',
    color: 'var(--muted-color)',
    lineHeight: '1.6',
    margin: '0 auto 2rem auto',
    maxWidth: '460px',
    opacity: 0,
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards',
  },
  ctaContainer: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    marginBottom: '3.5rem',
    opacity: 0,
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards',
  },
  primaryBtn: {
    backgroundColor: 'var(--text-color)',
    color: 'var(--bg-color)',
    padding: '11px 22px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '600',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  secondaryBtn: {
    backgroundColor: 'var(--card-bg)',
    color: 'var(--text-color)',
    padding: '11px 22px',
    borderRadius: '8px',
    fontSize: '12.5px',
    fontWeight: '600',
    border: '1px solid var(--border-color)',
    cursor: 'pointer',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    maxWidth: '500px',
    width: '100%',
    opacity: 0,
    animation: 'fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards',
  },
  statCard: {
    backgroundColor: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    padding: '0.85rem',
    borderRadius: '12px',
    backdropFilter: 'blur(4px)',
    transition: 'transform 0.2s ease, border-color 0.2s ease',
  },
  statNum: {
    fontSize: '15px',
    fontWeight: '700',
    color: 'var(--text-color)',
    display: 'block',
    marginBottom: '1px',
  },
  statLabel: {
    fontSize: '10px',
    color: 'var(--muted-color)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }
}

function Hero({ onNavegar }) {
  return (
    <section style={styles.hero}>
      {/* 🔮 Inyección de Keyframes de CSS nativo para que funcionen las animaciones */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulseGlow {
          from { transform: translate(-50%, -50%) scale(0.9); opacity: 0.7; }
          to { transform: translate(-50%, -50%) scale(1.1); opacity: 1; }
        }
        @keyframes livePulse {
          0% { opacity: 0.3; transform: scale(0.9); }
          50% { opacity: 1; transform: scale(1.2); }
          100% { opacity: 0.3; transform: scale(0.9); }
        }
      `}</style>

      <div style={styles.dotGrid} />
      <div style={styles.glowCentro} />

      <div style={styles.content}>
        <div style={styles.badge}>
          <span style={styles.puntoParpadeo} />
          TEMPORADA 2026/27
        </div>
        
        <h1 style={styles.title}>
          El fútbol no termina en el <span style={{color: '#E24B4A'}}>pitido final.</span>
        </h1>
        
        <p style={styles.subtitle}>
          Únete a la grada virtual de El Tercer Tiempo. Debate las polémicas de la jornada, analiza el VAR y opina en tiempo real.
        </p>

        <div style={styles.ctaContainer}>
          <button 
            style={styles.primaryBtn}
            onClick={() => onNavegar('foro')}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
              e.currentTarget.style.filter = 'brightness(0.95)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.filter = 'none';
            }}
          >
            Entrar al Foro
          </button>
          
          <button 
            style={styles.secondaryBtn}
            onClick={() => onNavegar('tabla')}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Clasificación
          </button>
        </div>

        <div style={styles.statsGrid}>
          {/* Añadidos efectos hover discretos a las tarjetas */}
          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={styles.statNum}>1,420</span>
            <span style={styles.statLabel}>Tertulianos</span>
          </div>
          
          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(226, 75, 74, 0.2)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={{ ...styles.statNum, color: '#E24B4A' }}>14</span>
            <span style={styles.statLabel}>Polémicas</span>
          </div>
          
          <div 
            style={styles.statCard}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span style={styles.statNum}>92%</span>
            <span style={styles.statLabel}>Fiebre VAR</span>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero