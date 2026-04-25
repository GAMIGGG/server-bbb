      /**
 * API para verificar la versión del cliente
 * Conecta Vercel con la base de datos Turso
 */

export default async function handler(req, res) {
    // 1. Validar el método de la petición
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
    }

    // 2. Extraer datos del cuerpo de la petición (desde Godot)
    const { version_cliente } = req.body;
    
    // 3. Obtener credenciales desde las Variables de Entorno de Vercel
    const db_url = process.env.TURSO_URL;
    const db_token = process.env.TURSO_TOKEN;

    // Validar que las variables existan antes de continuar
    if (!db_url) return res.status(500).json({ error: "Falta la variable TURSO_URL en Vercel" });
    if (!db_token) return res.status(500).json({ error: "Falta la variable TURSO_TOKEN en Vercel" });

    // 4. Limpiar y formatear la URL de Turso
    // Cambia 'libsql://' por 'https://' y elimina barras al final
    const final_url = db_url.replace("libsql://", "https://").replace(/\/$/, "");

    try {
        // 5. Consultar la base de datos Turso mediante su API v2
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
        
        // Manejar errores devueltos por la API de Turso
        if (data.error) {
            return res.status(500).json({ error: "Error de Turso", detalle: data.error });
        }

        // 6. Extraer el valor de la versión almacenada en el servidor
        // Estructura: results -> response -> result -> rows -> primera fila -> primera columna
        const v_server = data.results[0].response.result.rows[0][0].value;

        // 7. Comparar versiones y responder
        if (version_cliente === v_server) {
            // Versión coincide: El jugador puede entrar
            return res.status(200).json({ 
                status: "ok", 
                message: "Versión correcta" 
            });
        } else {
            // Versión no coincide: El jugador debe actualizar
            return res.status(403).json({ 
                status: "update_required", 
                server_version: v_server 
            });
        }

    } catch (error) {
        // Manejar errores de conexión o errores inesperados de JavaScript
        return res.status(500).json({ 
            error: "Error crítico de conexión", 
            detalle: error.message 
        });
    }
}
