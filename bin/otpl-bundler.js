#!/usr/bin/env nodejs 
/**
 * otpl-bundler v1.0.1
 *
 * - when using otpl-js in a browser you may have error like:
 * 		XMLHttpRequest cannot load file:///path/to/template.otpl
 * 		Cross origin requests are only supported for protocol schemes:
 * 		http, data, chrome, chrome-extension, https, chrome-extension-resource
 * - so we bundle all our template files in a single file and load it as js file
 *
 * Emile Silas SARE (emile.silas@gmail.com)
 */

var otplBundler = require( './../index' );

var argExists = function(name){
	return process.argv.indexOf(name) != -1;
};

var getArg = function(name){
	var argv = process.argv;
	var pos = argv.indexOf(name);

	if (pos != -1){
		return argv[pos+1];
	}

	return undefined;
};

var printUsage = function( err_message ){
	console.log(
		"\notpl-bundler: bundle otpl templates for web\n"
		+"\nUsage:\n"
		+"\n otpl-bundler --source src_dir --web-root web_root [--dest-dir destination_dir]"
		+"\n otpl-bundler -h|--help\n"
		+"\nOptions:"
		+"\n  --source     path to your templates dir"
		+"\n  --web-root   path to your project web root dir"
		+"\n  --dest-dir   path to destination dir"
		+"\n"
	);

	if( err_message ) console.error( err_message );

	process.exit(0);
};

if( argExists('-h') || argExists('--help') ) return printUsage();

var source_dir = getArg('--source') ;
var dest_dir = getArg('--dest-dir') || process.cwd();
var web_root = getArg('--web-root');

try {
	otplBundler(source_dir,web_root,dest_dir);
} catch(e){
	printUsage( e.message || e );
}
