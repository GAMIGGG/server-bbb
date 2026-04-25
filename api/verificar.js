        export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

    const { version_cliente } = req.body;
    let url = process.env.TURSO_URL;
    const token = process.env.TURSO_TOKEN;

    if (!url || !token) return res.status(500).json({ error: "Faltan variables de entorno" });

    // Limpieza total de la URL
    url = url.replace("libsql://", "https://");
    if (url.endsWith('/')) url = url.slice(0, -1); // Quita la barra final si existe

    try {
        // Ahora la URL será: https://tu-db.turso.io/v2/pipeline
        const response = await fetch(`${url}/v2/pipeline`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: [
                    { 
                        type: "execute", 
                        stmt: { sql: "SELECT version_actual FROM app_config WHERE id = 1" } 
                    }
                ]
            })
        });

        const data = await response.json();
        
        // Si Turso responde con error
        if (data.error) return res.status(500).json({ error: "Error de Turso", detalle: data.error });

        const v_server = data.results[0].response.result.rows[0][0].value;

        if (version_cliente === v_server) {
            return res.status(200).json({ status: "ok", message: "Versión correcta" });
        } else {
            return res.status(403).json({ status: "update_required", server_version: v_server });
        }
    } catch (error) {
        return res.status(500).json({ error: "Fallo de conexión", detalle: error.message });
    }
}
