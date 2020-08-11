let fs = require('fs');
let ah = require('async_hooks');
let {AsyncResource} = ah;
let major = require('./major');

let stack = {};
let cls = function(ns) {
	let wrapper = {
		run: (fn) => {
			let c = cls.create(ns);
			return c.run(fn);
		}
	};
	return wrapper;
};

cls._stack = stack;
cls.create = createContext;
cls.getContext = getContext;
cls.get = getContext;
cls.exit = exitContext;
cls.debug = false;

Object.defineProperty(cls, 'active', {
	enumerable: true,
	get: getContext
});

function createContext(ns) {
	let c = {};

	Object.defineProperty(c, 'run', {
		enumerable: false,
		writable: false,
		value: run
	});

	Object.defineProperty(c, 'start', {
		enumerable: false,
		writable: false,
		value: start
	});

	return c;

	function run(cb) {
		if (cls.debug)
			log('run');
		const resource = new AsyncResource('node-cls');
		return resource.runInAsyncScope(() => {
			let asyncId = ah.executionAsyncId();
			let current = stack[asyncId];
			current.contexts[ns] = c;
			if (cb)
				return cb();
		});
	}

	function start() {
		if (major < 12)
			throw new Error('start() is not supported in nodejs < v12.0.0');
		return Promise.resolve().then(() => {
			stack[ah.executionAsyncId()].contexts[ns] = c;
		});
	}
}

function getContext(ns) {
	let asyncId = ah.executionAsyncId();
	while(asyncId) {
		let current = stack[asyncId];
		if (!current)
			return;
		if (current.contexts[ns])
			return current.contexts[ns];
		asyncId = current.parent;
	}
}

async function exitContext(ns) {
	if (cls.debug)
		log('exit Context');
	let asyncId = ah.executionAsyncId();
	let context = getContext(ns);
	if (!context)
		return;
	let node = stack[asyncId];
	if (node && node.contexts[ns] === context)
		delete node.contexts[ns];
	exitContextUp(context, ns, asyncId);
	return Promise.resolve();
}

function exitContextUp(context, ns, asyncId) {
	while(stack[asyncId]) {
		if (cls.debug)
			log(`exit ${  asyncId}`);
		asyncId = stack[asyncId].parent;
		let parent = stack[asyncId];
		if (parent) {
			if (parent.contexts[ns] === context)
				delete parent.contexts[ns];
			else if (parent.contexts[ns])
				return;
		}
	}
}

let hook = ah.createHook({
	init,
	destroy
});
hook.enable();

function newNode(asyncId, triggerId, contexts) {
	return { contexts, id: asyncId, parent: triggerId};
}

function init(asyncId, _type, triggerId) {
	let parent = stack[triggerId];
	let contexts = {};
	if (!parent) {
		if (cls.debug)
			log('no parent');
		stack[asyncId] = newNode(asyncId, triggerId, contexts);
	}
	else {
		Object.assign(contexts, parent.contexts);
		stack[asyncId] = newNode(asyncId, triggerId, contexts);
	}
	if (cls.debug)
		log('init ' + asyncId);

}

function log(str) {
	fs.writeSync(1, `${str}\n`);
}

function destroy(asyncId) {
	if (stack[asyncId])
		delete stack[asyncId];
	if (cls.debug) {
		log(`destroy ${  asyncId} : ${  Object.keys(stack).length}`);
		log(`keys ${  Object.keys(stack)}`);
	}
}

module.exports = cls;