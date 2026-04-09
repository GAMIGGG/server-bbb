const { Client } = require('pg');

export default async function handler(req, res) {
    // Configuración con tu enlace directo a CockroachDB
   const client = new Client({
    connectionString: "postgresql://duqbdff_9srvdgbnj2mziw:xsyfN-COo6uxXZTA1JvC6g@hearty-sphinx-14305.jxf.gcp-us-east1.cockroachlabs.cloud:26257/loligg?sslmode=require",
    ssl: { rejectUnauthorized: false }
});
    
    try {
        await client.connect();
        
        // Verificamos que el cuerpo de la petición exista
        if (!req.body) {
            return res.status(400).json({ error: "No se recibieron datos" });
        }

        const { email, password, apodo, accion } = req.body;

        // --- LÓGICA DE REGISTRO ---
        if (accion === "registro") {
            if (!email || !password || !apodo) {
                return res.status(400).json({ error: "Faltan campos obligatorios" });
            }

            await client.query(
                'INSERT INTO usuarios (email, password, apodo) VALUES ($1, $2, $3)', 
                [email, password, apodo]
            );
            return res.status(200).json({ mensaje: "Registro exitoso" });
        }

        // --- LÓGICA DE LOGIN ---
        if (accion === "login") {
            if (!email || !password) {
                return res.status(400).json({ error: "Email y contraseña requeridos" });
            }

            const result = await client.query(
                'SELECT * FROM usuarios WHERE email = $1 AND password = $2', 
                [email, password]
            );

            if (result.rows.length > 0) {
                return res.status(200).json({ 
                    mensaje: "Bienvenido", 
                    apodo: result.rows[0].apodo 
                });
            } else {
                return res.status(401).json({ mensaje: "Usuario o clave incorrectos" });
            }
        }

        // Si la acción no es válida
        return res.status(400).json({ error: "Acción no válida" });

    } catch (err) {
        // Si hay un error (ej: el usuario ya existe), lo enviamos a Godot
        console.error(err);
        return res.status(500).json({ error: err.message });
    } finally {
        // Cerramos la conexión siempre
        await client.end();
    }
}
