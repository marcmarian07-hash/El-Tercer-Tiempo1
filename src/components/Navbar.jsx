export default function Navbar({ vistaActual, onNavegar, usuario, abrirAuth, toggleTema }) {
  const enlaces = [
    { id: "home", texto: "Inicio" },
    { id: "polemica", texto: "Polémicas" },
    { id: "tabla", texto: "Clasificación" },
    { id: "noticias", texto: "Noticias" },
    { id: "foro", texto: "Foro" }
  ];

  return (
    <nav className="navbar-container">
      <div onClick={toggleTema} className="logo-box">🌙 El <span style={{ color: "#E24B4A" }}>Tercer</span> Tiempo</div>
      
      <div className="nav-menu">
        {enlaces.map((enlace) => (
          <span
            key={enlace.id}
            onClick={() => onNavegar(enlace.id)}
            className={vistaActual === enlace.id ? "nav-item active" : "nav-item"}
          >
            {enlace.texto}
          </span>
        ))}

        {/* Acceso exclusivo al Panel de Admin */}
        {usuario?.esAdmin && (
          <span 
            onClick={() => onNavegar("admin")} 
            className={vistaActual === "admin" ? "nav-item active" : "nav-item"}
            style={{ color: "#d4af37", fontWeight: 'bold' }}
          >
            🛠️ Admin
          </span>
        )}
      </div>

      <div className="auth-box" onClick={usuario ? () => onNavegar("perfil") : abrirAuth}>
        {usuario ? <>{usuario.avatar} {usuario.nick}</> : "Identificarse"}
      </div>
    </nav>
  );
}