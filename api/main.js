const ws = require('ws');

const port = process.env.PORT || 8081

const server = new ws.Server({ port: port })

const connections = {
	pending: []
}

server.on('connection', (websocket, req) => {
	try {
		websocket.sendObj = (obj) => {
			websocket.send(JSON.stringify(obj))
		}
		connections.pending.push(websocket)


		websocket.on('message', (message) => {
			message = receiveObj(message)
			console.log('received: ', message)
			try {
				switch (message.type) {
					case 'register': register(websocket, message.code, message.role)
						break;
					case 'transmit': transmit(websocket, message.data)
						break;
					default:
						break;
				}
			} catch (error) {
				console.error(error.message)
				if (message.msgid) {
					websocket.sendObj({ type: 'error', msgid: message.msgid, reason: error.message })
				}
			}
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

		console.log(`Added connection ${req.connection.remoteAddress}`)

		websocket.sendObj({ type: 'ready' })
	} catch (error) {
		console.error(error.message)
	}
})

console.log(`Websocket API server listening on port ${port}`)

function register(websocket, code, role) {
	if (code === undefined) {
		if (role === 'emitter') { throw new Error(`Cannot register as emitter without a connection code`) }
		code = genCode()
		websocket.sendObj({ type: 'code', code: code })
	}
	if (connections[code] === undefined || connections[code] === null) {
		connections[code] = {
			emitter: null,
			receiver: null
		}
	}
	connections[code][role] = websocket
	websocket.room = connections[code]
	websocket.role = role
	connections.pending.splice(connections.pending.indexOf(websocket))

	//TODO better code gen because this one is one hell of a potential perf sink
	function genCode() {
		let nums
		do {
			nums = [genNum(), genNum(), genNum(), genNum(), genNum(), genNum()].join('')
		} while (connections[nums])
		return nums

		function genNum() { return Math.floor(Math.random() * 9) }
	}
}

function transmit(websocket, data) {
	switch (websocket.role) {
		case 'emitter':
			websocket.room.receiver.send(data)
			break;
		case 'receiver':
			websocket.room.emitter.send(data)
			break;
		default:
			websocket.room.receiver.send(data)
			websocket.room.emitter.send(data)
			break;
	}
}

function receiveObj(serialized) {
	return JSON.parse(serialized)
}