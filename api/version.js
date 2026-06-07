
module.exports = (req, res) => {
  // 1. Configurar cabeceras CORS para que Godot se conecte desde PC, Android o Web sin bloqueos
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  // Si el navegador o Godot hace una petición de control (OPTIONS), respondemos OK de inmediato
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. LA CONFIGURACIÓN DE TU BETA (Modifica esto cuando actualices tu juego)
  const VERSION_OFICIAL = "1.0.0"; 
  const ESTADO_SERVIDOR = "online"; // Puede ser "online" o "maintenance" (mantenimiento)

  // 3. RESPUESTA DEL SERVIDOR
  // Devolvemos un JSON completo con la versión, el estado y la hora exacta del servidor en UTC
  return res.status(200).json({
    version_oficial: VERSION_OFICIAL,
    estado_servidores: ESTADO_SERVIDOR,
    hora_servidor: Date.now(), // Devuelve la hora en milisegundos (Evita trampas de tiempo en el cliente)
    notas_parche: "Beta Inicial de King Manager - Conexión y seguridad base listas."
  });
};
