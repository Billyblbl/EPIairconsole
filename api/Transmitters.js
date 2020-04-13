let transmitters = {
	receivers: {},
	emitters: {}
}

function handleRegister(req, res) {
	let transmitter
	if (req.query === null || req.query === undefined
		|| typeof (req.query.type) !== 'string') {
		res.writeHead(403, 'Missing registration arguments', { 'Content-Type': 'application/json' })
		res.write(JSON.stringify({ message: 'Missing registration arguments' }))
		res.end()
	}
	try {
	} catch (error) {
		res.writeHead(403, `${error.message}`, { 'Content-Type': 'application/json' })
		res.write(JSON.stringify({ message: `${error.message}` }))
		res.end()
	}
	switch (req.query.type) {
		case 'emitter': transmitter = registerEmitter(req.connection.remoteAddress, req.query.code)
			break;
		case 'receiver': transmitter = registerReceiver(req.connection.remoteAddress)
			break;
		default: {
			res.writeHead(403, `Unknown input transmitter type: ${req.query.type}`, { 'Content-Type': 'application/json' })
			res.write(JSON.stringify({ message: `Unknown input transmitter type: ${req.query.type}` }))
			res.end()
			break;
		}
	}
	res.writeHead(201, `Registered ${req.query.type}`, { 'Content-Type': 'application/json' })
	res.write(JSON.stringify(transmitter))
	res.end()
}


function registerEmitter(remote, code) {
	if (code === undefined || code === null)
		throw new Error(`Missing connection code ${code}`)
	if (transmitters.receivers[code] === undefined || transmitters.receivers[code] === null)
		throw new Error(`No receiver ready for connection ${code}`)
	transmitters.emitters[code] = {
		code: code,
		remote: remote
	}
	return transmitters.emitters[code]
}

function registerReceiver(remote) {
	//dirty code gen, temporary, potential perf sink
	//TODO proper pure numeric UUID gen
	function getCode() {
		let high = 9
		let low = 0
		let rdm = () => { return Math.floor(Math.random() * (high - low + 1) + low) }
		let arr = [rdm(), rdm(), rdm(), rdm(), rdm(), rdm(), rdm(), rdm(), rdm()]
		let code = arr.join('')
		return code
	}
	let code
	do {
		code = getCode()
	} while (transmitters.receivers[code] !== undefined && transmitters.receivers[code] !== null);
	transmitters.receivers[code] = {
		code: code,
		remote: remote
	}
	return transmitters.receivers[code]
}

exports.handleRegister = handleRegister
exports.registerEmitter = registerEmitter
exports.registerReceiver = registerReceiver
