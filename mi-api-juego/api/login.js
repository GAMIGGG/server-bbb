func enviar_login_a_vercel(user, pass):
	var vercel_url = "https://tu-proyecto.vercel.app/api/login"
	var headers = ["Content-Type: application/json"]
	var datos = {
		"usuario": user,
		"password": pass
	}
	
	$HTTPRequest.request(vercel_url, headers, HTTPClient.METHOD_POST, JSON.stringify(datos))

func _on_http_request_completed(result, response_code, headers, body):
	var respuesta = JSON.parse_string(body.get_string_from_utf8())
	
	if response_code == 200:
		print("¡Bienvenido al juego!")
		# Cambiar a la escena del mundo o simulador
	else:
		print("Error: ", respuesta["message"])