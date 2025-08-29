import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/react/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2020',
  treeshake: true,
})

