/*jshint node:true */
module.exports = function( grunt ) {
    
    var Path = require('path');

	grunt.loadNpmTasks( 'grunt-contrib-concat' );
	grunt.loadNpmTasks( 'grunt-contrib-jshint' );
	grunt.loadNpmTasks( 'grunt-closure-compiler' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );

	function process( code ) {
		return code
			// Embed version
			.replace( /@VERSION/g, grunt.config( 'pkg' ).version );
	}

	grunt.initConfig({
		pkg: grunt.file.readJSON( 'package.json' ),
		concat: {
			options: { process: process },
			'default': {
				src: [
					'src/DGTable.js',
					'src/DGTable.ColumnCollection.js',
					'src/DGTable.RowCollection.js'
				],
				dest: 'dist/DGTable.js'
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			'src-js': {
				src: [ 'src/*.js' ]
			},
			'dist': {
				src: [ 'dist/*.js' ]
			}
		},
		'closure-compiler': {
			"dist": {
				js: 'dist/DGTable.js',
				jsOutputFile: 'dist/DGTable.min.js',
				
				noreport: true,
				maxBuffer: 500,
				closurePath: 'closure-compiler',
				options: {
					compilation_level: 'ADVANCED_OPTIMIZATIONS',
					language_in: 'ECMASCRIPT5_STRICT',
					externs: [
						'closure-compiler/externs/jquery-1.9.externs',
						'closure-compiler/externs/underscore-1.5.2.externs',
						'closure-compiler/externs/backbone-1.1.0.externs'
					],
                    create_source_map: 'dist/DGTable.min.js.map',
                    source_map_format: 'V3'
				}
			}
		},
		'add-map-directive': {
			"dist": {
				paths: 'dist/DGTable.min.js'
			}
		},
		'clean-source-map-paths': {
			"dist": {
				paths: 'dist/DGTable.min.js.map'
			}
		},
		watch: {
			files: [ '*', '.jshintrc', '{src}/**/{*,.*}' ],
			tasks: 'default'
		}
	});
    
    grunt.registerMultiTask('add-map-directive', 'Append source-map directive to output file', function() {
        var paths = grunt.file.expand(this.data.paths);
        paths.forEach(function(path) {
            grunt.file.write(path, 
                grunt.file.read(path) + '//# sourceMappingURL=DGTable.min.js.map');
        });
    });
    
    grunt.registerMultiTask('clean-source-map-paths', 'Fix source map paths', function() {
        var paths = grunt.file.expand(this.data.paths);
        paths.forEach(function(path) {
            var map = JSON.parse(grunt.file.read(path));
            map.file = Path.basename(map.file);
            map.sources = map.sources.map(x => Path.basename(x));
            grunt.file.write(path, JSON.stringify(map));
        });
    });

	grunt.registerTask( 'build', [ 'jshint:src-js', 'concat', 'closure-compiler', 'add-map-directive', 'clean-source-map-paths' ] );
	grunt.registerTask( 'style', [ 'jshint:src-js' ] );
	grunt.registerTask( 'default', [ 'build' ] );

};