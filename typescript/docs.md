# @azat-io/eslint-config-typescript

This config extends `@azat-io/eslint-config`.

## TypeScript rules

### adjacent-overload-signatures

Require that function overload signatures be consecutive.

### array-type

Require consistently using either `T[]` or `Array<T>` for arrays.

```ts
// bad
let rikoParty: Array<string> = ['Riko', 'Reg', 'Nanachi']
```

```ts
// good
let rikoParty: string[] = ['Riko', 'Reg', 'Nanachi']
```

### await-thenable

Disallow awaiting a value that is not a Thenable.

```ts
// bad
let startGirlsLastTour = () => {}
await startGirlsLastTour()
```

```ts
// good
let startGirlsLastTour = async () => {}
await startGirlsLastTour()
```

### consistent-generic-constructors

Enforce specifying generic type arguments on constructor name of a constructor call.

```ts
// bad
let hunters: Map<string, number> = new Map()
```

```ts
// bad
let hunters = new Map<string, number>()
```

### consistent-type-definitions

Enforce using `interface` for object type definitions.

```ts
// bad
type DossierByTwilight = {
  name: string
  age: string
  country: 'Westalis' | 'Ostania'
}
```

```ts
// good
interface DossierByTwilight {
  name: string
  age: string
  country: 'Westalis' | 'Ostania'
}
```

### consistent-type-exports

Enforce consistent usage of type exports.

```ts
// bad
interface QuindecimVisitor {
  name: string
  gender: string
  causeOfDeath: string
}

let machiko = {
  name: 'Machiko',
  gender: 'female',
  causeOfDeath: 'accident',
}

export { QuindecimVisitor, machiko }
```

```ts
// good
interface QuindecimVisitor {
  name: string
  gender: string
  causeOfDeath: string
}

let machiko = {
  name: 'Machiko',
  gender: 'female',
  causeOfDeath: 'accident',
}

export type { QuindecimVisitor }
export { machiko }
```

### consistent-type-imports

Enforce consistent usage of type imports.

```ts
// bad
import { ScoutRegimentMember, sashaBraus, connySpringer } from 'scout-regiment'
```

```ts
// good
import type { ScoutRegimentMember } from 'scout-regiment'

import { sashaBraus, connySpringer } from 'scout-regiment'
```

### method-signature-style

Enforce using property signature for functions.

```ts
// bad
interface Security {
  getRoseWallStatus(): 'ok' | 'broken'
}
```

```ts
// good
interface Security {
  getRoseWallStatus: () => 'ok' | 'broken'
}
```

### no-duplicate-type-constituents

Disallow duplicate constituents of union or intersection types.

```ts
// bad
type Cat = 'Black' | 'White' | 'White'
```

```ts
// good
type Cat = 'Black' | 'White'
```

### no-empty-interface

Disallow the declaration of empty interfaces.

### no-explicit-any

```ts
// bad
let neverland: any = async () => {}
```

```ts
// bad
let neverland: () => Promise<void> = async () => {}
```

### no-extra-non-null-assertion

Disallow extra non-null assertions.

### no-for-in-array

Disallow iterating over an array with a for-in loop.

### no-import-type-side-effects

Enforce the use of top-level import type qualifier when an import only has specifiers with inline type qualifiers.

### no-mixed-enums

Disallow enums from having both number and string members.

### no-non-null-asserted-nullish-coalescing

Disallow non-null assertions in the left operand of a nullish coalescing operator.

```ts
// bad
let edmund: string = 'Edward Elric'
edmund ?? 'Alphonse Elric'
```

### no-non-null-asserted-optional-chain

Disallow non-null assertions after an optional chain expression.

```ts
// bad
findBebopSpaceship()?.start()!
```

```ts
// good
findBebopSpaceship()?.start()
```

### no-non-null-assertion

Disallow non-null assertions using the `!` postfix operator.

```ts
// bad
let hasSword = berserk.inventory?.includes('sword')
```

```ts
// good
let hasSword = berserk.inventory?.includes('sword') ?? false
```

### no-require-imports

Disallow invocation of `require()`.

```js
// bad
let team = require('kuroko-team')
```

```js
// good
import team from 'kuroko-team'
```

### no-unnecessary-boolean-literal-compare

Disallow unnecessary equality comparisons against boolean literals.

```ts
// bad
if (isEvangelion === true) {
  start()
}
```

```ts
// good
if (isEvangelion) {
  start()
}
```

### no-unnecessary-condition

Disallow conditionals where the type is always truthy or always falsy.

### no-unnecessary-type-assertion

Disallow type assertions that do not change the type of an expression.

### prefer-optional-chain

Enforce using concise optional chain expressions instead of chained logical ands, negated logical ors, or empty objects.

### restrict-plus-operands

Require both operands of addition to be the same type and be `bigint`, `number`, or `string`.

### unified-signatures

Disallow two overloads that could be unified into one with a union or an optional/rest parameter.

## Import rules

### no-commonjs

Forbid CommonJS `require` calls and `module.exports` or `exports.*`.

```js
// bad
let characters = require('steins-gate')
```

```js
// good
import characters from 'steins-gate'
```

### no-unresolved

Ensure imports point to a file/module that can be resolved.
