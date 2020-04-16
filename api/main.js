const ws = require('ws');

const port = process.env.PORT || 8081

const server = new ws.Server({ port: port })

// const connections = {
// 	pending: {}
// }

server.on('connection', (websocket) => {

	websocket.on('message', (message) => {
		console.log('received: %s', message)
	})

	websocket.on('error', (error) => {
		console.error('error: %s', error)
	})

	websocket.on('close', () => {
		console.log('closed websocket')
	})

	websocket.on('ping', () => {
		websocket.pong('pong', false)
	})

	websocket.send('zbebzbeb')
})
