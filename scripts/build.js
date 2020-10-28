/* eslint-disable no-console */

const FsExtra = require('fs-extra');
const Path = require('path');

(async () => {

    await FsExtra.emptyDir('./dist');

    const Rollup = require('rollup');

    const rollupTasks = [{
        dest: 'dist/jquery.dgtable.es6.js',
        sourceMap: true,
        outputFormat: 'esm',
        babelTargets: {
            node: 10,
        },
        minified: false,
        ecmaVersion: 6,
    }, {
        dest: 'dist/jquery.dgtable.es6.min.js',
        sourceMap: true,
        outputFormat: 'esm',
        babelTargets: {
            node: 10,
        },
        minified: true,
        ecmaVersion: 6,
    }, {
        dest: 'dist/jquery.dgtable.umd.js',
        sourceMap: true,
        outputFormat: 'umd',
        outputExports: 'default',
        babelTargets: '> 0.25%, not dead',
        minified: false,
        ecmaVersion: 6,
        outputName: 'DGTable',
    }, {
        dest: 'dist/jquery.dgtable.umd.min.js',
        sourceMap: true,
        outputFormat: 'umd',
        outputExports: 'default',
        babelTargets: '> 0.25%, not dead',
        minified: true,
        ecmaVersion: 6,
        outputName: 'DGTable',
    }, {
        dest: 'dist/jquery.dgtable.cjs.js',
        sourceMap: true,
        outputFormat: 'cjs',
        outputExports: 'default',
        babelTargets: {
            node: 10,
        },
        minified: false,
        ecmaVersion: 6,
    }, {
        dest: 'dist/jquery.dgtable.cjs.min.js',
        sourceMap: true,
        outputFormat: 'cjs',
        outputExports: 'default',
        babelTargets: {
            node: 10,
        },
        minified: true,
        ecmaVersion: 6,
    }];

    const inputFile = 'src/index.js';

    for (let task of rollupTasks) {
        console.info('Generating ' + task.dest + '...');

        let plugins = [
            require('rollup-plugin-node-resolve')({
                mainFields: ['module', 'main'],
            }),
            require('rollup-plugin-commonjs')({}),
        ];

        const pkg = require('../package.json');
        const banner = [
            `/*!`,
            ` * ${pkg.name} ${pkg.version}`,
            ` * ${pkg.repository.url}`,
            ' */\n',
        ].join('\n');

        if (task.babelTargets) {
            plugins.push(require('rollup-plugin-babel')({
                sourceMap: task.sourceMap ? true : false,
                presets: [
                    ['@babel/env', {
                        targets: task.babelTargets,
                        useBuiltIns: 'usage',
                        corejs: 3,
                    }],
                ],
                compact: false,
                minified: false,
                comments: true,
                retainLines: true,
                exclude: 'node_modules/**/core-js/**/*',
            }));
        }

        if (task.minified) {
            plugins.push(require('rollup-plugin-terser').terser({
                toplevel: true,
                compress: {
                    ecma: task.ecmaVersion,
                    passes: 2,
                },
            }));
        }

        plugins.push({
            name: 'banner',

            renderChunk(code, chunk, _outputOptions = {}) {

                const magicString = new (require('magic-string'))(code);
                magicString.prepend(banner);

                return {
                    code: magicString.toString(),
                    map: magicString.generateMap({
                        hires: true,
                    }),
                };
            },
        });

        const bundle = await Rollup.rollup({
            preserveSymlinks: true,
            treeshake: true,
            onwarn(warning, warn) {
                if (warning.code === 'THIS_IS_UNDEFINED') return;
                warn(warning);
            },
            input: inputFile,
            plugins: plugins,
            external: ['jquery', 'jQuery'],
        });

        let generated = await bundle.generate({
            name: task.outputName,
            sourcemap: task.sourceMap,
            format: task.outputFormat,
            globals: {
                jquery: 'jQuery',
            },
            exports: task.outputExports,
        });

        let code = generated.output[0].code;

        if (task.sourceMap === true && generated.output[0].map) {
            let sourceMapOutPath = task.dest + '.map';
            FsExtra.writeFileSync(sourceMapOutPath, generated.output[0].map.toString());
            code += '\n//# sourceMappingURL=' + Path.basename(sourceMapOutPath);
        }

        FsExtra.writeFileSync(task.dest, code);
    }

    console.info('Done.');

})();
