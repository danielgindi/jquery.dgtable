/* eslint-disable no-console */

import Path from 'node:path';
import { readFile, writeFile, rmdir, mkdir } from 'node:fs/promises';
import { rollup } from 'rollup';
import MagicString from 'magic-string';
import { babel } from '@rollup/plugin-babel';
import PluginTerser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import PluginCommonjs from '@rollup/plugin-commonjs';
import { fileURLToPath } from 'node:url';

(async () => {

    await rmdir('./dist', { recursive: true });
    await mkdir('./dist');

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
            nodeResolve({
                mainFields: ['module', 'main'],
            }),
            PluginCommonjs({}),
        ];

        const pkg = JSON.parse(await readFile(Path.join(Path.dirname(fileURLToPath(import.meta.url)), '../package.json'), { encoding: 'utf8' }));
        const banner = [
            `/*!`,
            ` * ${pkg.name} ${pkg.version}`,
            ` * ${pkg.repository.url}`,
            ' */\n',
        ].join('\n');

        if (task.babelTargets) {
            plugins.push(babel({
                sourceMap: !!task.sourceMap,
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
                babelHelpers: 'bundled',
                exclude: 'node_modules/**/core-js/**/*',
            }));
        }

        if (task.minified) {
            plugins.push(PluginTerser({
                toplevel: true,
                compress: {
                    ecma: task.ecmaVersion,
                    passes: 2,
                },
                sourceMap: !!task.sourceMap,
            }));
        }

        plugins.push({
            name: 'banner',

            renderChunk(code, chunk, _outputOptions = {}) {

                const magicString = new MagicString(code);
                magicString.prepend(banner);

                return {
                    code: magicString.toString(),
                    map: magicString.generateMap({
                        hires: true,
                    }),
                };
            },
        });

        const bundle = await rollup({
            preserveSymlinks: true,
            treeshake: true,
            onwarn(warning, warn) {
                if (warning.code === 'THIS_IS_UNDEFINED') return;
                warn(warning);
            },
            input: inputFile,
            plugins: plugins,
            external: ['jquery', 'jQuery', /^@danielgindi\/dom-utils(\/|$)/],
        });

        let generated = await bundle.generate({
            name: task.outputName,
            sourcemap: task.sourceMap ? 'hidden' : false,
            format: task.outputFormat,
            globals: {
                jquery: 'jQuery',
                '@danielgindi/dom-utils/lib/ScrollHelper.js': 'domUtilsScrollHelper',
                '@danielgindi/dom-utils/lib/Css.js': 'domUtilsCss',
            },
            exports: task.outputExports,
        });

        let code = generated.output[0].code;

        if (task.sourceMap && generated.output[0].map) {
            let sourceMapOutPath = task.dest + '.map';
            await writeFile(sourceMapOutPath, generated.output[0].map.toString());
            code += '\n//# sourceMappingURL=' + Path.basename(sourceMapOutPath);
        }

        await writeFile(task.dest, code);
    }

    console.info('Done.');

})();
