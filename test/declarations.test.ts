import { writeFileSync, readFileSync, mkdtempSync, mkdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { tmpdir } from 'node:os'
import path from 'node:path'
import ts from 'typescript'

describe('published declarations', () => {
  it('resolves relative declaration imports in NodeNext ESM consumers', () => {
    let root = mkdtempSync(path.join(tmpdir(), 'config-declarations-'))
    let files = ['index.ts', 'runtime/gate.ts', 'runtime/targets.ts']
    writeFileSync(path.join(root, 'package.json'), '{"type":"module"}')

    for (let file of files) {
      let source = path.join(import.meta.dirname, '..', file)
      let declaration = path.join(root, file.replace(/\.ts$/u, '.d.ts'))
      mkdirSync(path.dirname(declaration), { recursive: true })
      // Declaration-only transpilation does not run type checking.
      let { outputText } = ts.transpileDeclaration(
        readFileSync(source, 'utf8'),
        { fileName: source },
      )
      writeFileSync(declaration, outputText)
    }

    let relativeImports = 0
    for (let file of files) {
      let declaration = path.join(root, file.replace(/\.ts$/u, '.d.ts'))
      let { importedFiles } = ts.preProcessFile(
        readFileSync(declaration, 'utf8'),
      )
      for (let { fileName } of importedFiles) {
        if (!fileName.startsWith('.')) {
          continue
        }
        let { resolvedModule } = ts.resolveModuleName(
          fileName,
          declaration,
          {
            moduleResolution: ts.ModuleResolutionKind.NodeNext,
            module: ts.ModuleKind.NodeNext,
          },
          ts.sys,
          undefined,
          undefined,
          ts.ModuleKind.ESNext,
        )
        expect(resolvedModule, `${file}: ${fileName}`).toBeDefined()
        expect(resolvedModule?.resolvedFileName).toMatch(/\.d\.ts$/u)
        relativeImports++
      }
    }
    expect(relativeImports).toBeGreaterThan(0)
  })
})
