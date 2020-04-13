const http = require('http')
const hostname = process.env.HOSTNAME || 'localhost'
const port = process.env.PORT || 8081
const URL = require('url')
const transmitters = require('./Transmitters.js')

let server = http.createServer(onRequest)

server.listen(port, hostname, () => {
	console.log(`Server running at http://${hostname}:${port}/ (may be in a container)`)
})

const routes = {
	all: [
		{url: '/register', handler: transmitters.handleRegister}
	],
	GET: [],
	POST: [],
	PUT: [],
	DELETE: []
}

function onRequest(req, res) {
	let url = URL.parse(req.url, true)
	req.path = url.pathname
	req.query = url.query
	// console.log(JSON.stringify(req.query))
	try {
		for (let route of routes[req.method]) {
			if (req.url.startsWith(route.url)) {
				route.handler(req, res)
				return
			}
		}
		for (let route of routes.all) {
			if (req.url.startsWith(route.url)) {
				route.handler(req, res)
				return
			}
		}
		res.writeHead(404, {'Content-Type': 'text/html'});
		res.write(`Unknown route for ${req.method}: ${req.path}`);
		res.end();
	} catch (error) {
		res.writeHead(500, {'Content-Type': 'application/json'});
		res.write(error.stack);
		res.end();
	}
}
