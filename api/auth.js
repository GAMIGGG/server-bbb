const { Client } = require('pg');

export default async function handler(req, res) {
    // Usamos la variable de entorno para no exponer tu clave aquí
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        const { email, password, apodo, accion } = req.body;

        // REGISTRO
        if (accion === "registro") {
            await client.query(
                'INSERT INTO usuarios (email, password, apodo) VALUES ($1, $2, $3)', 
                [email, password, apodo]
            );
            return res.status(200).json({ mensaje: "Registro exitoso" });
        }

        // LOGIN
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