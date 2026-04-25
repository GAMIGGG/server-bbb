export default async function handler(req, res) {
    // 1. Solo aceptamos POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { version_cliente } = req.body;
    const url = process.env.TURSO_URL;
    const token = process.env.TURSO_TOKEN;

    // 2. Verificamos que las llaves existan
    if (!url || !token) {
        return res.status(500).json({ error: "Faltan variables de entorno en Vercel" });
    }

    // Limpiamos la URL por si tiene libsql://
    const url_limpia = url.replace("libsql://", "https://");

    try {
        // 3. Petición directa a la API de Turso (sin librerías raras)
        const response = await fetch(`${url_limpia}/v2/pipeline`, {
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
        
        // Extraemos el valor de la base de datos
        const v_server = data.results[0].response.result.rows[0][0].value;

        if (version_cliente === v_server) {
            return res.status(200).json({ status: "ok", message: "Versión correcta" });
        } else {
            return res.status(403).json({ 
                status: "update_required", 
                server_version: v_server 
            });
        }
    } catch (error) {
        console.error("Error detallado:", error);
        return res.status(500).json({ error: "Error de conexión con Turso", detalle: error.message });
    }
}
