import { context } from 'esbuild';
import { glsl } from 'esbuild-plugin-glsl';

const r = context({
  entryPoints: ['./src/index.ts'],
  outfile: './dist/bundle.js',
  platform: 'neutral',
  bundle: true,
  logLevel: 'debug',
  plugins: [glsl({
    minify: false
  })]
});

r.then(a => a.watch()).catch(ex => {
  console.error('Cant build', ex);
})