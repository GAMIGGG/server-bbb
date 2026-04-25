export default async function handler(req, res) {
    // Solo permitimos peticiones POST por seguridad
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido' });
    }

    const { version_cliente } = req.body;
    const TURSO_URL = process.env.TURSO_URL;
    const TURSO_TOKEN = process.env.TURSO_TOKEN;

    try {
        const response = await fetch(`${TURSO_URL}/v2/pipeline`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${TURSO_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                requests: [
                    { type: "execute", stmt: { sql: "SELECT version_actual FROM app_config WHERE id = 1" } }
                ]
            })
        });

        const data = await response.json();
        const v_server = data.results[0].response.result.rows[0][0].value;

        if (version_cliente === v_server) {
            res.status(200).json({ status: "ok", message: "Versión correcta" });
        } else {
            res.status(403).json({ status: "update_required", server_version: v_server });
        }
    } catch (error) {
        res.status(500).json({ error: "Error conectando a la base de datos" });
    }
}