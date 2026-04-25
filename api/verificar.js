       export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { version_cliente } = req.body;
    
    // USAR DIRECTAMENTE LAS VARIABLES
    const db_url = process.env.TURSO_URL;
    const db_token = process.env.TURSO_TOKEN;

    // Si esto falla, el Log dirá exactamente cuál falta
    if (!db_url) return res.status(500).json({ error: "Falta la variable TURSO_URL en Vercel" });
    if (!db_token) return res.status(500).json({ error: "Falta la variable TURSO_TOKEN en Vercel" });

    // Limpiamos la URL para asegurar que sea HTTPS
    const final_url = db_url.replace("libsql://", "https://").replace(/\/$/, "");

    try {
        const response = await fetch(`${final_url}/v2/pipeline`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${db_token}`,
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
        
        if (data.error) {
            return res.status(500).json({ error: "Error de Turso", detalle: data.error });
        }

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
        return res.status(500).json({ error: "Error crítico de conexión", detalle: error.message });
    }
}
