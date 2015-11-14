export var ignoreItems = [
	// compiled output
	'/dist',
	'/tmp',
	'/build',
	'/cache',
	// dependencies
	'/node_modules',
	'/bower_components',
	// misc
	'/.sass-cache',
	'/connect.lock',
	'/coverage/*',
	'/libpeerconnection.log'
];

export var jsConfig = {
  'compilerOptions': {
    'target': 'es6',
    'module': 'commonjs',
    'experimentalDecorators': true
  }
}