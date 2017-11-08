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

module.exports = function(source_dir, web_root, dest_dir){

	var fs   = require( 'fs' );
	var path = require( 'path' );
	var otpl = require( 'otpl-js' );

	if ( !fs.existsSync( source_dir ) || !fs.lstatSync( source_dir ).isDirectory() ) {
		throw new Error( 'please set a valid source directory' );
	}

	if ( !fs.existsSync( dest_dir ) || !fs.lstatSync( dest_dir ).isDirectory() ) {
		throw new Error( 'please set a valid destination directory' );
	}

	if ( !fs.existsSync( web_root ) || !fs.lstatSync( web_root ).isDirectory() ) {
		throw new Error( 'please set a valid web_root directory' );
	}

	source_dir = path.resolve(source_dir);
	dest_dir = path.resolve(dest_dir);
	web_root = path.resolve(web_root);

	var cleanFileContent = function(content){
		return content.toString()
			.replace( /"/g, '\\"' )
			.replace( /\t/g, '\\t' )
			.replace( /\n/g, '\\n' )
			.replace( /\r/g, '\\r' );
	};

	var getWebSrc =  function( src ){
		return src.replace(web_root,'')
			.replace(/\\/g,'/').replace(/^\//,'');
	};

	var bundle_files = {};//map file path to file content

	//walk into directory and search for file with given extension
	//make a bundle as output
	var dirTemplateBundle = function ( dir, exts ) {
		var list   = fs.readdirSync( dir );
		var file_reg = new RegExp("("+exts.join('|') + ")$");

		list.forEach(function(name){
			var src = path.resolve( dir, name );

			if ( fs.lstatSync( src ).isDirectory() ) {
				dirTemplateBundle( src , exts);
			} else if ( fs.lstatSync( src ).isFile() && file_reg.test(src) ){
				var src_web = getWebSrc(src);

				bundle_files[ src_web ] = cleanFileContent( fs.readFileSync( src ) );
			}
		});
	};

	dirTemplateBundle( source_dir, ['.otpl','.txt','.html']);

	var output_tpl = "(function() {\n/**\n * Auto-generated file, please don't edit\n *\n *  - otpl-bundler <%$.otpl_bundler_version%>\n *  - OTpl <%$.otpl_version%>\n *\n * <%$.otpl_bundle_date%>\n */\n\t\"use strict\";\n\n\tOTpl\n<%loop( $.files : $path : $content ){%>\n\t.addLocalFile(\n\t\t\"<%$path%>\" ,\n\t\t\"<%$content%>\"\n\t)\n<%}%>;\n\n})();";
	var o     = new otpl;
	var result = o.parse( output_tpl ).runWith( {
		'files': bundle_files,
		'otpl_bundler_version': '1.0.1',
		'otpl_version': otpl.OTPL_VERSION,
		'otpl_bundle_date': (new Date).toGMTString()
	} );

	fs.writeFileSync( path.resolve(dest_dir,'./otpl.templates.bundle.js' ) , result );
};
