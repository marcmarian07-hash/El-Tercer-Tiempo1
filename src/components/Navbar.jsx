import { useState } from 'react';
// Asegúrate de que la ruta a tu cliente de supabase sea la correcta en tu proyecto
import { supabase } from '../supabase'; 

const styles = {
    navContainer: {
        position: 'sticky', top: 0, zIndex: 100, padding: '1.25rem 2rem', display: 'flex', justifyContent: 'center',
    },
    nav: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', maxWidth: '1200px',
        padding: '0.75rem 1.5rem', borderRadius: '16px', border: '1px solid var(--border-color)',
        backgroundColor: 'var(--card-bg)', 
        backdropFilter: 'blur(12px)', 
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        transition: 'background-color 0.3s, border-color 0.3s'
    },
    logo: {
        fontFamily: '"Inter", system-ui, sans-serif', fontSize: '18px', fontWeight: '700',
        letterSpacing: '-0.5px', color: 'var(--text-color)', cursor: 'pointer', userSelect: 'none',
    },
    accent: { color: '#E24B4A', fontWeight: '800' },
    links: { display: 'flex', gap: '6px', alignItems: 'center' },
    btn: {
        background: 'none', border: 'none', borderRadius: '8px', padding: '8px 16px', fontSize: '13px',
        fontWeight: '500', color: 'var(--muted-color)', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s ease',
    },
    btnActive: {
        background: 'var(--border-color)', border: 'none', borderRadius: '8px', padding: '8px 16px',
        fontSize: '13px', color: 'var(--text-color)', cursor: 'pointer', fontWeight: '600', transition: 'all 0.2s ease',
    },
    btnAuth: {
        background: 'var(--text-color)', color: 'var(--bg-color)', border: 'none', borderRadius: '8px', padding: '8px 16px',
        fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginLeft: '12px', transition: 'all 0.2s ease',
    },
    perfilNav: {
        display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-color)',
        marginLeft: '12px', paddingLeft: '14px', borderLeft: '1px solid var(--border-color)'
    },
    btnLogout: {
        background: 'none', border: 'none', color: '#E24B4A', cursor: 'pointer', fontSize: '12px',
        fontWeight: '600', padding: '4px 8px', borderRadius: '6px', marginLeft: '4px', transition: 'all 0.2s'
    }
};

const links = [
    { id: 'home', label: 'Inicio' },
    { id: 'polemica', label: 'Polémicas' },
    { id: 'tabla', label: 'Liga Real' },
    { id: 'noticias', label: 'Noticias' },
    { id: 'foro', label: 'Foro' },
];

function Navbar({ vistaActual, onNavegar, usuario, abrirAuth }) {
    const toggleTheme = () => {
        document.body.classList.toggle('light-mode');
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error al cerrar sesión:', error.message);
        } else {
            // Recargamos para limpiar los estados locales rápidamente o dejas que App.jsx maneje el estado de auth
            window.location.reload(); 
        }
    };

    return (
        <div style={styles.navContainer}>
            <nav style={styles.nav}>
                {/* Logo + Botón Modo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button onClick={toggleTheme} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}>
                        🌓
                    </button>
                    <div style={styles.logo} onClick={() => onNavegar('home')}>
                        El <span style={styles.accent}>Tercer</span> Tiempo
                    </div>
                </div>

                {/* Links */}
                <div style={styles.links}>
                    {links.map(l => (
                        <button
                            key={l.id}
                            style={vistaActual === l.id ? styles.btnActive : styles.btn}
                            onClick={() => onNavegar(l.id)}
                        >
                            {l.label}
                        </button>
                    ))}

                    {usuario ? (
                        <div style={styles.perfilNav}>
                            <span title={usuario.equipo}>{usuario.avatar}</span>
                            <strong>{usuario.nick || usuario.nombre}</strong>
                            <button 
                                onClick={handleLogout} 
                                style={styles.btnLogout}
                                title="Cerrar sesión"
                            >
                                Salir
                            </button>
                        </div>
                    ) : (
                        <button style={styles.btnAuth} onClick={abrirAuth}>
                            Identificarse
                        </button>
                    )}
                </div>
            </nav>
        </div>
    );
}

export default Navbar;