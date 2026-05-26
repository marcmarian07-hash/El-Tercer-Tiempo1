import { supabase } from './supabase'

const API_KEY = '024d98339ac040aa81e415079c09300f'

// ── Usa proxy en desarrollo para evitar CORS, directo en producción ──
const BASE_URL = import.meta.env.DEV
  ? '/api-football/v4'
  : 'https://api.football-data.org/v4'

// ── Fetch con la API key ──
async function apiFetch(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: { 'X-Auth-Token': API_KEY }
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// ── Obtener partidos recientes de LaLiga (últimos 7 días) ──
export async function getPartidosRecientes() {
  const hoy = new Date()
  const hace7dias = new Date(hoy - 7 * 24 * 60 * 60 * 1000)
  const dateFrom = hace7dias.toISOString().split('T')[0]
  const dateTo = hoy.toISOString().split('T')[0]

  const data = await apiFetch(
    `/competitions/PD/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=FINISHED`
  )
  return data.matches || []
}

// ── Detectar jugadas polémicas en un partido ──
function detectarPolemicas(partido) {
  const polemicas = []
  const local = partido.homeTeam.shortName || partido.homeTeam.name
  const visitante = partido.awayTeam.shortName || partido.awayTeam.name
  const nombrePartido = `${local} vs ${visitante}`
  const jornada = partido.matchday || 1

  const marcador = partido.score?.fullTime
  const golesLocal = marcador?.home ?? 0
  const golesVisitante = marcador?.away ?? 0

  // Tarjetas rojas
  const rojas = partido.bookings?.filter(b => b.card === 'RED_CARD') || []
  rojas.forEach(roja => {
    polemicas.push({
      partido: nombrePartido,
      titulo: `Roja directa a ${roja.player?.name || 'jugador'} — ¿merecida?`,
      descripcion: `Expulsión directa en el minuto ${roja.minute}' que condicionó el partido. El árbitro no dudó pero la jugada generó mucha controversia en las redes.`,
      minuto: String(roja.minute),
      jornada,
      activa: true,
    })
  })

  // Resultado muy ajustado con posible penalti (heurística simple)
  if (Math.abs(golesLocal - golesVisitante) === 1) {
    polemicas.push({
      partido: nombrePartido,
      titulo: `Resultado ajustado en ${nombrePartido} — ¿hubo mano en el área?`,
      descripcion: `Partido decidido por la mínima (${golesLocal}-${golesVisitante}). Los aficionados debaten si hubo una mano no pitada en el área que pudo cambiar el resultado.`,
      minuto: '75',
      jornada,
      activa: true,
    })
  }

  return polemicas
}

// ── Sincronizar polémicas automáticas con Supabase ──
export async function sincronizarPolemicas() {
  try {
    const partidos = await getPartidosRecientes()
    if (!partidos.length) return { creadas: 0, mensaje: 'No hay partidos recientes.' }

    let creadas = 0

    for (const partido of partidos) {
      const polemicasDetectadas = detectarPolemicas(partido)

      for (const pol of polemicasDetectadas) {
        const { data: existe } = await supabase
          .from('polemicas')
          .select('id')
          .eq('partido', pol.partido)
          .eq('titulo', pol.titulo)
          .maybeSingle()

        if (!existe) {
          const { error } = await supabase.from('polemicas').insert(pol)
          if (!error) creadas++
        }
      }
    }

    return { creadas, mensaje: `${creadas} polémicas nuevas creadas.` }
  } catch (err) {
    console.error('Error sincronizando polémicas:', err)
    return { creadas: 0, mensaje: 'Error al conectar con la API.' }
  }
}

// ── Obtener próximos partidos ──
export async function getProximosPartidos() {
  const hoy = new Date()
  const en7dias = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000)
  const dateFrom = hoy.toISOString().split('T')[0]
  const dateTo = en7dias.toISOString().split('T')[0]

  const data = await apiFetch(
    `/competitions/PD/matches?dateFrom=${dateFrom}&dateTo=${dateTo}&status=SCHEDULED`
  )
  return data.matches || []
}