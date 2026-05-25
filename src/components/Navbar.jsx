import React from "react";

export default function Navbar({ vistaActual, onNavegar, usuario, abrirAuth }) {
  const enlaces = [
    { id: "home", texto: "Inicio" },
    { id: "foro", texto: "Foro" },
    { id: "polemica", texto: "Polémicas" },
    { id: "tabla", texto: "Clasificación" },
    { id: "noticias", texto: "Noticias" }
  ];

  return (
    <nav style={{ display: "flex", justifyContent: "space-between", padding: "1rem 2rem", background: "#111", alignItems: "center", borderBottom: "1px solid #222" }}>
      <div onClick={() => onNavegar("home")} style={{ color: "#fff", fontWeight: "bold", fontSize: "1.3rem", cursor: "pointer" }}>
        El Tercer Tiempo
      </div>
      
      <div style={{ display: "flex", gap: "20px" }}>
        {enlaces.map((enlace) => (
          <span
            key={enlace.id}
            onClick={() => onNavegar(enlace.id)}
            style={{
              color: vistaActual === enlace.id ? "#E24B4A" : "#aaa",
              fontWeight: vistaActual === enlace.id ? "bold" : "normal",
              cursor: "pointer"
            }}
          >
            {enlace.texto}
          </span>
        ))}
      </div>

      <div>
        {usuario ? (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>{usuario.avatar}</span>
            <span style={{ color: "#fff", fontSize: "14px", fontWeight: "bold" }}>{usuario.nick}</span>
            <button 
              onClick={async () => {
                const { supabase } = await import("../supabase");
                await supabase.auth.signOut();
              }} 
              style={{ background: "none", border: "1px solid #444", color: "#aaa", padding: "4px 8px", borderRadius: "6px", cursor: "pointer", fontSize: "12px" }}
            >
              Salir
            </button>
          </div>
        ) : (
          <button onClick={abrirAuth} style={{ background: "#E24B4A", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
            Iniciar Sesión
          </button>
        )}
      </div>
    </nav>
  );
}