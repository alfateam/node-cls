let NODE_CLS = 'node_cls.d8b58a39';

if (process[NODE_CLS])
	module.exports = process[NODE_CLS];
else {
	let cls = require('./index-core');
	process[NODE_CLS] = cls;
	module.exports = process[NODE_CLS];
}