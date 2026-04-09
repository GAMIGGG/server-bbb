const { Client } = require('pg');

export default async function handler(req, res) {
    const client = new Client({
        // Hemos puesto el usuario 'luis' y tu contraseña secreta
        connectionString: "postgresql://luis:xsyfN-COo6uxXZTA1JvC6g@hearty-sphinx-14305.jxf.gcp-us-east1.cockroachlabs.cloud:26257/loligg?sslmode=require",
        ssl: {
            rejectUnauthorized: false
        }
    });

    try {
        await client.connect();

        // Crear tabla si no existe
        await client.query(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id SERIAL PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                apodo TEXT NOT NULL
            );
        `);

        const { email, password, apodo, accion } = req.body;

        if (accion === "registro") {
            await client.query(
                'INSERT INTO usuarios (email, password, apodo) VALUES ($1, $2, $3)', 
                [email, password, apodo]
            );
            return res.status(200).json({ mensaje: "Registro exitoso" });
        }

        if (accion === "login") {
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

    } catch (err) {
        return res.status(500).json({ error: err.message });
    } finally {
        await client.end();
    }
}
