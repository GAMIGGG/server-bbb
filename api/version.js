// API Serverless para verificar la versión de la beta del juego
module.exports = (req, res) => {
  // Configurar cabeceras CORS para que Godot pueda hacer peticiones desde cualquier lado
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Versión oficial mínima requerida para jugar la Beta
  const VERSION_OFICIAL = "1.0.0";

  // Si es un POST, podemos recibir la versión que el cliente dice tener y compararla aquí mismo
  if (req.method === 'POST') {
    const { version } = req.body || {};
    
    if (!version) {
      return res.status(400).json({ error: "Falta el parámetro 'version' en el cuerpo de la petición." });
    }

    if (version === VERSION_OFICIAL) {
      return res.status(200).json({ 
        valido: true, 
        mensaje: "Versión correcta. Acceso concedido a la Beta.",
        version_oficial: VERSION_OFICIAL 
      });
    } else {
      return res.status(403).json({ 
        valido: false, 
        mensaje: `Tu versión (${version}) no es válida o está obsoleta. Descarga la versión oficial ${VERSION_OFICIAL}.`,
        version_oficial: VERSION_OFICIAL 
      });
    }
  }

  // Si es un GET simple, solo devolvemos cuál es la versión oficial actual
  return res.status(200).json({
    version_oficial: VERSION_OFICIAL,
    estado_servidores: "online",
    notas_parche: "Beta inicial - Mecánicas base listas."
  });
};
