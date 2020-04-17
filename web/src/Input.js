import TunnelSocket from './TunnelSocket.js'

let tunnel


let deferedConnected

export let connected

let inputHandlers = {}
let inputStates = {
	axises: {},
	buttons: {}
}

export function getBtn(btn) {
	if (inputStates.buttons[btn] !== undefined) {
		return inputStates.buttons[btn]
	} else {
		return false
	}
}

export function getAxis(axis) {
	if (inputStates.axises[btn] !== undefined) {
		return inputStates.axises[btn]
	} else {
		return 0.0
	}
}

function onInputMsg(input) {
	inputStates[input.type][input.name] = inpput.value
	for (let handler of inputHandlers[input.name]) {
		handler(input.value)
	}
}

export	function on(inputType, handler) {
	if (inputHandlers[inputType]) {
		inputHandlers[inputType].push(handler)
	} else {
		inputHandlers[inputType] = [handler]
	}
}

export	function clearhandlers() {
	inputHandlers = {}
}
'use strict';

export function clearInputs() {
	inputStates.axises = {}
	inputStates.buttons = {}
}

export async function connect(port) {
	try {
		tunnel = new TunnelSocket(`ws://${window.location.hostname}:${port}`, 'receiver')
		tunnel.on.connect = () => {
			deferedConnected.resolve(true)
		}
		connected = new Promise((resolve, reject) => {
			deferedConnected = {
				resolve: resolve,
				reject: reject
			}
		})
		connected.then(() => {
			tunnel.on.input = onInputMsg
		})
		return await tunnel.code
	} catch (error) {
		deferedConnected.reject(error)
		console.error(error.message)
	}
}

export { tunnel as connection }

export function disconnect() {
	connected = false
	tunnel.close()
}