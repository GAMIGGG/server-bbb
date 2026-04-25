      /**
 * API para verificar la versión del cliente
 * Conecta Vercel con la base de datos Turso
 */


  export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST requerido' });

    const { version_cliente } = req.body;
    
    // USAMOS LAS VARIABLES QUE TIENES EN VERCEL
    const url = process.env.TURSO_URL;
    const token = process.env.TURSO_TOKEN;

    try {
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
        
        // ESTO ES CLAVE: Si Turso falla, te dirá por qué (ej. "tabla no existe")
        if (data.error || !data.results) {
            return res.status(500).json({ error: "Turso dice: " + JSON.stringify(data.error) });
        }

        const v_server = data.results[0].response.result.rows[0][0].value;

        if (version_cliente === v_server) {
            return res.status(200).json({ status: "ok" });
        } else {
            return res.status(403).json({ status: "update", server_version: v_server });
        }
    } catch (error) {
        return res.status(500).json({ error: "Fallo total: " + error.message });
    }
}
