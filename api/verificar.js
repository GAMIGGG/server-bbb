
export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST requerido' });

    const { version_cliente } = req.body;
    const url = process.env.TURSO_URL;
    const token = process.env.TURSO_TOKEN;

    if (!url || !token) {
        return res.status(500).json({ error: "Error: No se encontraron las credenciales en vercel.json" });
    }

    try {
        const response = await fetch(`${url}/v2/pipeline`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
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
            return res.status(200).json({ status: "ok" });
        } else {
            return res.status(403).json({ status: "update", server_version: v_server });
        }
    } catch (e) {
        return res.status(500).json({ error: "Error de conexión", detalle: e.message });
    }
}
