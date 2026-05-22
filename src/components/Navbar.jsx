import React, { useState, useEffect } from "react";
import { supabase } from "../supabase";

export default function Navbar() {
  const [showModal, setShowModal] = useState(false);
  const [isRegister, setIsRegister] = useState(false); // Para alternar entre Login y Registro
  const [user, setUser] = useState(null);

  // Campos del formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [team, setTeam] = useState("Real Madrid"); // Equipo por defecto

  // Lista de algunos equipos de Primera
  const teams = [
    "Athletic Club", "Atlético de Madrid", "FC Barcelona", 
    "Getafe CF", "Girona FC", "Real Madrid", "Real Sociedad", 
    "Sevilla FC", "Valencia CF", "Villarreal CF"
  ];

  useEffect(() => {
    // Comprobar si hay un usuario logueado al cargar la página
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    // Escuchar cambios en el estado de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    if (isRegister) {
      // Proceso de Registro
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
            team: team,
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}` // Avatar automático divertido
          }
        }
      });
      if (error) alert("Error en el registro: " + error.message);
      else {
        alert("¡Registro correcto! Ya puedes iniciar sesión.");
        setIsRegister(false);
      }
    } else {
      // Proceso de Inicio de Sesión
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert("Error al entrar: " + error.message);
      else setShowModal(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "1rem 2rem", background: "#111", alignItems: "center" }}>
      <div style={{ color: "#fff", fontWeight: "bold", fontSize: "1.2rem" }}>El Tercer Tiempo</div>
      
      <div>
        {user ? (
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <img 
              src={user.user_metadata?.avatar_url} 
              alt="Avatar" 
              style={{ width: "35px", height: "35px", borderRadius: "50%", background: "#333" }}
            />
            <span style={{ color: "#fff" }}>¡Hola, {user.user_metadata?.username || "Usuario"}! ({user.user_metadata?.team})</span>
            <button onClick={handleLogout} style={{ background: "#e53e3e", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>
              Salir
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowModal(true)} 
            style={{ background: "#e53e3e", color: "white", border: "none", padding: "8px 16px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold" }}
          >
            Iniciar Sesión
          </button>
        )}
      </div>

      {/* MODAL DE AUTENTICACIÓN */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.8)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "#222", padding: "2rem", borderRadius: "10px", width: "320px", position: "relative", border: "1px solid #333", color: "#fff" }}>
            <button onClick={() => setShowModal(false)} style={{ position: "absolute", top: "10px", right: "10px", background: "none", border: "none", color: "#666", fontSize: "1.2rem", cursor: "pointer" }}>✕</button>
            
            <h3 style={{ textAlign: "center", marginBottom: "1.5rem" }}>{isRegister ? "Crear Cuenta" : "Iniciar Sesión"}</h3>
            
            <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {isRegister && (
                <input 
                  type="text" 
                  placeholder="Tu Nombre / Nick" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  required 
                  style={{ padding: "8px", borderRadius: "5px", border: "1px solid #444", background: "#111", color: "#fff" }}
                />
              )}
              
              <input 
                type="email" 
                placeholder="Correo Electrónico" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                style={{ padding: "8px", borderRadius: "5px", border: "1px solid #444", background: "#111", color: "#fff" }}
              />
              
              <input 
                type="password" 
                placeholder="Contraseña" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                style={{ padding: "8px", borderRadius: "5px", border: "1px solid #444", background: "#111", color: "#fff" }}
              />

              {isRegister && (
                <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                  <label style={{ fontSize: "0.85rem", color: "#aaa" }}>Tu Equipo:</label>
                  <select 
                    value={team} 
                    onChange={(e) => setTeam(e.target.value)}
                    style={{ padding: "8px", borderRadius: "5px", border: "1px solid #444", background: "#111", color: "#fff" }}
                  >
                    {teams.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              )}

              <button type="submit" style={{ background: "#e53e3e", color: "white", border: "none", padding: "10px", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", marginTop: "10px" }}>
                {isRegister ? "Registrarse" : "Entrar"}
              </button>
            </form>

            <p style={{ textAlign: "center", fontSize: "0.85rem", marginTop: "15px", color: "#aaa" }}>
              {isRegister ? "¿Ya tienes cuenta? " : "¿No tienes cuenta? "}
              <span 
                onClick={() => setIsRegister(!isRegister)} 
                style={{ color: "#e53e3e", cursor: "pointer", textDecoration: "underline" }}
              >
                {isRegister ? "Inicia sesión" : "Regístrate aquí"}
              </span>
            </p>
          </div>
        </div>
      )}
    </nav>
  );
}