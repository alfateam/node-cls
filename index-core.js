let fs = require('fs');
let ah = require('async_hooks');
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
		return Promise.resolve(1)
			.then(() => {
				log(`start context ${  ah.executionAsyncId()}`);
				stack[ah.executionAsyncId()].contexts[ns] = c;
				return cb();
			});
	}

	function start() {
		if (major < 12)
			throw new Error('start() is not supported in nodejs < v12.0.0');
		return Promise.resolve(1).then(() => {
			stack[ah.executionAsyncId()].contexts[ns] = c;
		});
	}
}

function getAllContexts(asyncId) {
	let obj = {};
	while(stack[asyncId]) {
		for (let ns in stack[asyncId].contexts) {
			if (!obj[ns]) {
				obj[ns] = stack[asyncId].contexts[ns];
			}
		}
		asyncId = stack[asyncId].parent;
	}
	return obj;
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

function init(asyncId, type, triggerId) {
	let node = { contexts: {} };
	Object.defineProperty(node, 'id', {
		enumerable: false,
		value: asyncId
	});
	Object.defineProperty(node, 'parent', {
		enumerable: false,
		value: triggerId
	});
	Object.defineProperty(node, 'children', {
		enumerable: false,
		value: {}
	});
	stack[asyncId] = node;
	if (stack[triggerId]) {
		stack[triggerId].children[asyncId] = node;
	}
}

function log(str) {
	if (cls.debug)
		fs.writeSync(1, `${str}\n`);
}

function destroy(asyncId) {
	log(`destroy ${  asyncId}`);
	if (stack[asyncId]) {
		let contexts = getAllContexts(asyncId);
		for (let childId in stack[asyncId].children) {
			let child = stack[asyncId].children[childId];
			for (let ns in contexts) {
				child.contexts[ns] = child.contexts[ns] || contexts[ns];
			}
		}
	}
	delete stack[asyncId];
}

module.exports = cls;