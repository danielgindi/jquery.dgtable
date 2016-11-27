/*jshint node:true */
module.exports = function( grunt ) {

    var Path = require('path');

    grunt.loadNpmTasks( 'grunt-webpack' );
    grunt.loadNpmTasks( 'grunt-contrib-uglify' );
    grunt.loadNpmTasks( 'grunt-header' );
    grunt.loadNpmTasks( 'grunt-replace' );
    grunt.loadNpmTasks( 'grunt-closure-compiler' );

    const banner = [
        '/*!',
        ' * <%= pkg.name %> <%= pkg.version %>',
        ' * <%= pkg.repository.url %>',
        ' */\n'
    ].join('\n');

    grunt.initConfig({
        pkg: require('./package.json')
        , webpack: {
            dist: {
                // webpack options
                entry: './src/index.js'

                , output: {
                    path: 'dist/'
                    , filename: 'jquery.dgtable.js'
                    , library: 'DGTable'
                    , libraryTarget: 'umd'
                }

                , module: {
                    loaders: [
                        {
                            test: /\.js$/
                            , exclude: /(node_modules|bower_components)/
                            , loader: 'babel'

                            , query: {
                            sourceMap: false
                            , presets: ['es2015']
                            , plugins: [
                                'transform-es3-property-literals'
                                , 'transform-es3-member-expression-literals'
                                , 'transform-object-assign'
                                , 'transform-es2015-modules-commonjs'
                            ]
                            , compact: false
                        }
                        }
                    ]
                }

                , externals: {
                    'jquery': {
                        commonjs: 'jquery'
                        , commonjs2: 'jquery'
                        , amd: 'jquery'
                        , root: 'jQuery'
                    }
                }
            }
        }

        , replace: {
            dist: {
                options: {
                    patterns: [
                        {
                            match: 'VERSION',
                            replacement: require('./package.json').version
                        },
                        {
                            match: /return __webpack_require__\(0\)/g,
                            replacement: 'return __webpack_require__(0).default'
                        }
                    ]
                },
                files: [
                    { expand: true, flatten: true, src: ['dist/jquery.dgtable.js'], dest: 'dist/'}
                ]
            }
        }

        , uglify: {
            dist: {
                files: {
                    'dist/jquery.dgtable.min.js': ['dist/jquery.dgtable.js']
                }
            }
        }

        , 'closure-compiler': {
            'dist': {
                js: 'dist/jquery.dgtable.js'
                , jsOutputFile: 'dist/jquery.dgtable.min.js'

                , noreport: true
                , maxBuffer: 500
                , closurePath: 'closure-compiler'
                , options: {
                    compilation_level: 'ADVANCED_OPTIMIZATIONS'
                    , language_in: 'ECMASCRIPT5_STRICT'
                    , externs: [
                        'closure-compiler/externs/jquery-1.9.externs'
                        , 'closure-compiler/externs/underscore-1.5.2.externs'
                        , 'closure-compiler/externs/backbone-1.1.0.externs'
                    ]
                    , create_source_map: 'dist/jquery.dgtable.min.js.map'
                    , source_map_format: 'V3'
                }
            }
        }

        , 'add-map-directive': {
            'dist': {
                paths: 'dist/jquery.dgtable.min.js'
            }
        }

        , 'clean-source-map-paths': {
            'dist': {
                paths: 'dist/jquery.dgtable.min.js.map'
            }
        }

        , header: {
            dist: {
                options: {
                    text: banner
                },
                files: {
                    'dist/jquery.dgtable.js': 'dist/jquery.dgtable.js'
                    , 'dist/jquery.dgtable.min.js': 'dist/jquery.dgtable.min.js'
                }
            }
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

    grunt.registerTask( 'compile-with-closure', [ 'closure-compiler', 'add-map-directive', 'clean-source-map-paths' ] );

    grunt.registerTask( 'build', [ 'webpack', 'replace', 'uglify', 'header' ] );

    grunt.registerTask( 'default', [ 'build' ] );

};