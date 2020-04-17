'use strict';

export class TunnelSocket extends WebSocket {
	constructor(url, role, code, protocols) {
		super(url, protocols)
		this.onmessage = (messageEvent) => {
			let message = this.receiveObj(messageEvent.data)
			if (typeof(this.on[message.type]) === 'function') {
				this.on[message.type](message)
			} else {
				console.error(`Unhandled message "${messageEvent.data}"`)
			}
		}

		this.#ready = new Promise((resolve, reject) => {
			this.#deferedReady = {
				resolve: resolve,
				reject: reject
			}
		}, (err) => {
			console.error(err)
		})

		this.#code = this.register(role, code)
		this.ready.then(()=> {console.log('tunnel socket ready for registration')})
		this.code.then(()=> {console.log('tunnel socket code established')})
		if (code) {
			this.on.code({ code: code })
		}
	}

	on = {
		code: message => {this.#onCode(message)},
		input: () => {console.error('Not implemented yet')},
		ready: () => {this.#onReady()}
	}

	#deferedReady
	#onReady = () => {
		this.#deferedReady.resolve()
	}

	#deferedCode
	#onCode = (message) => {
		if (message.code) {
			this.#deferedCode.resolve(message.code)
		} else {
			this.#deferedCode.reject(new Error('Failed to retrieve code'))
		}
	}

	#ready
	#code

	get code() {
		return this.#code
	}

	get ready() {
		return this.#ready
	}

	transmit(data) {
		this.sendObj({ type: 'transmit', data: data })
	}

	async register(role, code) {
		return await new Promise(async (resolve, reject) => {
			try {
				this.#deferedCode = {
					resolve: resolve,
					reject: reject
				}
				let msg = code ? { type: 'register', role: role, code: code } : { type: 'register', role: role }
				await this.ready
				this.sendObj(msg)
			} catch (err) {
				console.error(err)
			}
		}, (err) => {
			console.error(err)
		})
	}

	sendObj(obj) {
		this.send(JSON.stringify(obj))
	}

	receiveObj(serialized) {
		return JSON.parse(serialized)
	}

}

export { TunnelSocket as default }