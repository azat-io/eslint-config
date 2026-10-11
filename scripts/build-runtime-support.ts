import { writeFileSync } from 'node:fs'

import { buildRuntimeSupport } from './generate-runtime-support'

let now = new Date()
let date = process.env['RUNTIME_SUPPORT_DATE'] ?? now.toISOString().slice(0, 10)

writeFileSync(
  new URL('../runtime/support.json', import.meta.url),
  `${JSON.stringify(buildRuntimeSupport(date), null, 2)}\n`,
)
