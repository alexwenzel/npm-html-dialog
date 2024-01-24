import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

const production = process.env.NODE_ENV === 'production';

export default {
    input: 'src/index.js',
    output: {
        file: 'dist/html-dialog.min.js',
        format: 'iife',
        name: 'HtmlDialog',
    },
    plugins: [
        resolve(),
        commonjs(),
        babel({
            exclude: 'node_modules/**',
            presets: ['@babel/preset-env'],
        }),
        production && terser()
    ],
};
