# Аудит `@azat-io/eslint-config` v2.99.0

> Аудит независимый, только анализ: файлы репозитория не менялись. Все
> эксперименты шли в изолированной копии (`git archive HEAD` → scratchpad,
> `pnpm install --frozen-lockfile`), на отдельных фикстурах, в «чистых» npm- и
> pnpm-проектах-потребителях с опубликованным пакетом и на бенчмарк-корпусе
> (исходники `zod@3.25.76`: 241 TS-файл, около 53k строк).
>
> Версии: ESLint 10.12.0, typescript-eslint 8.71.1, TypeScript 6.0.3, unicorn
> 77.0.0, perfectionist 5.12.1, eslint-react 5.24.6 (проверено и с 5.26.0),
> react-hooks 7.1.1, Node 22.22.0.
>
> **Уровни доказательности:**
>
> - **[VERIFIED]** — воспроизведено запуском или прочтением кода;
> - **[DOCUMENTED]** — подтверждается метаданными или документацией плагина;
> - **[LIKELY]** — сильная аргументация без отдельного эксперимента;
> - **[SPECULATIVE]** — гипотеза.
>
> Полный список правил — в `appendix-a-inventory.md`, список доступных, но не
> подключённых правил — в `appendix-b-unconfigured.md`.

---

## 1. EXECUTIVE ASSESSMENT

### Коротко

Ядро корректности у конфига редкого качества. Ни одна известная мне публичная
конфигурация не включает столько правил, ловящих **реальные runtime-баги**,
которые TypeScript пропускает:

- «invalid-API»-семейство unicorn: `no-invalid-fetch-options`,
  `no-invalid-intl-options`, `no-invalid-url-protocol-comparison`,
  `no-late-event-control`, `no-unsafe-promise-all-settled-values`,
  `no-loop-iterable-mutation`, `no-misrefactored-assignment` и др.;
- почти весь `eslint-plugin-regexp`;
- type-aware правила typescript-eslint;
- deprecated-правила Vue.

Это главная ценность конфига, и её нужно беречь.

При этом у конфига три системные проблемы, и они перевешивают:

1. **Релизы не проверяются, и сломанное уходит в npm [VERIFIED].** В
   опубликованной v2.99.0:
   - **(a)** любой `.jsx`/`.tsx` при `react: true` роняет ESLint (`TypeError`):
     19 настроенных React-правил не существуют ни в установленной, ни в
     последней версии eslint-react;
   - **(b)** у npm-потребителей с `react: true` ESLint падает ещё при загрузке
     конфига, даже на `.ts`-файлах. Причина — конфликт `zod-validation-error`
     между устаревшим `eslint-plugin-react-compiler` и
     `eslint-plugin-react-hooks@7`;
   - **(c)** `react: true` или `qwik: true` без TypeScript не парсит ни одного
     `.jsx`;
   - **(d)** `engines.node: ">=18"` — неправда: зависимости требуют Node
     `^22.22.3 || ^24.16.0`.

   CI зелёный, потому что в репозитории нет ни одного
   `.tsx`/`.vue`/`.svelte`/`.astro`, а ESLint валидирует правила лениво, только
   для реально линтуемых файлов.

2. **Автофиксы не проверены на безопасность [VERIFIED].** Несколько автофиксов
   меняют семантику или ломают код и тесты:
   - `vitest/prefer-to-be-falsy` превращает падающий тест в проходящий,
     `vitest/prefer-called-with` — проходящий в падающий (проверено запуском
     vitest);
   - `capitalized-comments` молча отключает `// prettier-ignore`,
     `webpackChunkName`, `biome-ignore`;
   - `perfectionist/sort-decorators` меняет порядок применения декораторов;
   - `perfectionist/sort-maps` и `sort-sets` меняют порядок итерации;
   - `perfectionist/sort-objects` меняет порядок вычисления значений с побочными
     эффектами;
   - `prefer-let` своим фиксом ломает компиляцию TS (literal widening);
   - `unicorn/prefer-at` вносит TS2532.

3. **Правила копятся без курирования.** Похоже, правила добавляются по мере
   выхода релизов плагинов (последние 15 коммитов — по одному новому правилу
   unicorn), а не по результатам ревью. Последствия:
   - ≥ 20 доказанных пар-дубликатов, которые дают по два-три сообщения на одну
     проблему;
   - противоречащие опции:
     `unicorn/no-useless-undefined { checkArguments: false }` перекрывает
     `sonarjs/no-undefined-argument`,
     `no-misused-promises { checksVoidReturn: false }` —
     `typescript/strict-void-return`;
   - правила, требующие API, которых нет в текущих LTS:
     `prefer-uint8array-base64` нужен Node 25, `prefer-get-or-insert-computed` —
     Node 26;
   - всё на уровне `error`: в конфиге нет ни одного `warn`.

### Что сделано исключительно хорошо

- **Модульная архитектура с ленивыми импортами.** Фреймворк-плагины грузятся
  только при включённой опции (`interopDefault(import(...))`). Типизированные
  правила привязаны только к TS-файлам, а JS-файлы не платят за project service
  [VERIFIED: `inv-tsnode`].
- **Корректная замена core-правил TS-аналогами** для 17 правил
  (`typescript/index.ts:564-580`).
- **Строгое и глубокое покрытие TypeScript:** `no-floating-promises` с
  `checkThenables`, `no-unsafe-*`, `no-unnecessary-condition`,
  `require-array-sort-compare`, `no-base-to-string`, `restrict-plus-operands`,
  `only-throw-error`, `consistent-type-imports/exports`.
- **Почти полный regexp-набор**, включая `no-super-linear-backtracking` (ReDoS),
  `no-misleading-capturing-group`, `no-useless-assertions`.
- **Хорошая гигиена директив:** `eslint-comments/*` и `no-unlimited-disable`.
- **Фиксы большей частью сходятся.** Проверены цепочки
  escape-последовательностей, импортов и упрощений выражений: циклических фиксов
  не найдено [VERIFIED].
- **Зрелый CI с точки зрения безопасности:** pinned actions, `harden-runner` с
  `egress-policy: block`, provenance при публикации.
- **Комментарий у каждого правила**, явные имена конфигов
  (`azat-io/core/rules`), что удобно в config-inspector.

### Самые большие слабости

1. Нет тестов конфигурации — отсюда P0-баги (§10).
2. Небезопасные автофиксы (§4, §5).
3. React-модуль устарел: deprecated `react-compiler`, React
   Compiler-несовместимый `react-perf`, тройные дубликаты. При этом нет
   `no-missing-key` и `no-leaked-conditional-rendering`, которые ловят настоящие
   баги [VERIFIED].
4. Кластер правил, наказывающих за комментарии: `capitalized-comments`,
   `slop/prefer-jsdoc` → `jsdoc/require-*`, `slop/no-jargon`,
   `slop/max-comment-length`, `jsdoc/require-description-complete-sentence`,
   `jsdoc/informative-docs`. Путь наименьшего сопротивления — удалить
   комментарий [VERIFIED: каскад в §4].
5. Тип сортировки `line-length` в Perfectionist: изменение **значения**
   переставляет **ключ**, отсюда шумные диффы [VERIFIED]. В собственных модулях
   вы сами переключаете `sort-objects` на `alphabetical` директивой в шапке
   каждого файла.

### Оправдана ли строгость

Частично:

- Слой корректности (≈ 350–400 правил) строг в правильную сторону.
- Слой стиля и вкуса (≈ 200 правил) непропорционально дорог. На коде `zod` v3
  (83 файла) самые частые **автофиксируемые** сообщения — `prefer-let` (1292),
  `capitalized-comments` (582), `unicorn/name-replacements` (578),
  `perfectionist/sort-objects` (421) [VERIFIED]. Ни одно из них не связано с
  корректностью.
- Строгость сама по себе не проблема. Проблема — строгость, к которой
  прилагается небезопасный автофикс, и строгость без градаций (`warn`
  отсутствует).

### Не переусложнён ли конфиг

Архитектура простая. Сложность — в количестве правил и в том, что их
взаимодействия никто не тестирует: 1134 записи, 1092 уникальных эффективных
правила со всеми опциями, 677 активных для типичного TS + Node проекта.
Сложность случайная, а не намеренная.

### Улучшает ли он код

- **Да**, там, где речь о корректности, безопасности, API-misuse и типах.
- **Нет или спорно** там, где он:
  - навязывает `let` (теряются literal types и сигнал «не переприсваивается»);
  - порядок по длине строки;
  - переименования `btnRef` → `buttonReference`, `fn` → `function_`;
  - заставляет превращать однострочный комментарий в полный JSDoc.

### Философия (как я её реконструирую)

- «Максимальная механическая консистентность».
- «Современные API по умолчанию».
- «Если правило существует и не ошибочно — включить как `error`».
- Плюс явные вкусовые решения автора: `let`, function declarations, сортировка
  по длине, отказ от `forEach` и `for`-циклов, мутирующих методов массивов.

Намеренные решения: `prefer-let`, `line-length`, `func-style`, `curly: all`,
отказ от мутаций. Случайные: дубликаты, мёртвые настройки, сломанные
React-правила, противоречащие опции, глобальные `benchmark/**` и `nanostores`.

---

## 2. CONFIGURATION INVENTORY

### 2.1 Как собирается конфигурация

1. `index.ts` нормализует опции: 9 булевых флагов, все по умолчанию `false`,
   плюс `extends`.
2. Параллельно вызываются 12 фабрик в фиксированном порядке:
   `core, a11y, react, node, typescript, vitest, astro, svelte, qwik, vue, packageJson, perfectionist`
   (`index.ts:46-59`). Каждая возвращает **один** объект конфигурации с
   собственным `files` или `{}`, если опция выключена.
3. Итоговый массив: `gitignore()` → глобальный ignore `benchmark/**/*` → 12
   объектов → пользовательские `extends`, в которые инжектируются **все**
   плагины. Всё оборачивается в `defineConfig()`.
4. Всегда включены `core` (JS-файлы, плюс TS/JSX/Vue/Svelte/Astro, если включены
   соответствующие опции) и `package-json` (`**/package.json`).
5. Приоритет: более поздний объект побеждает. Реальные переопределения есть
   только в `typescript` поверх `core` (17 core-правил → `off`, 5
   jsdoc-настроек). Переопределений между фреймворками нет: у них
   непересекающиеся `files`, кроме пары react/qwik на `*.tsx` (§5, C9).
6. Парсеры:
   - `core` — espree;
   - `typescript` ставит `typescript-eslint/parser` для
     `ts/tsx/vue/svelte/astro`;
   - затем `astro`, `svelte` и `vue` перекрывают `parser` своим, а TS-парсер
     передают через `parserOptions.parser`. Порядок фабрик здесь критичен, и он
     верный [VERIFIED].
7. Процессоры: Vue — `vuePlugin.processors['.vue']`, Svelte —
   `processors['.svelte']`. Astro **без процессора**, поэтому клиентские
   `<script>` не линтятся [VERIFIED, §8].

### 2.2 Количества (эффективная конфигурация, `calculateConfigForFile`)

| Тип файла                              |                       Все опции | `{typescript, perfectionist, node}` |        `{}` |
| -------------------------------------- | ------------------------------: | ----------------------------------: | ----------: |
| `.js/.cjs/.mjs`                        |                             606 |                                 607 |         566 |
| `.ts/.cts/.mts/.d.ts`                  |                             674 |                                 677 | не линтится |
| `*.test.ts`, `test/*.ts` (vitest)      |                             713 |                                 677 |           — |
| `test/nested/*.ts`, `*.spec.ts`        |            674 (**без vitest**) |                                 677 |           — |
| `.tsx` (react, после исправления имён) |                             766 |                                   — |           — |
| `.jsx` (react, после исправления имён) | 698 (но **parse error** без TS) |                                   — |           — |
| `.vue`                                 |                             813 |                                   — |           — |
| `.svelte` / `.astro`                   |                       719 / 719 |                                   — |           — |
| `package.json`                         |                              37 |                                  37 |          37 |
| прочие `.json`, `.md`, `.yaml`         |                     не линтятся |                                     |             |

- **Всего настроено:** 1134 записи правил (1110 `error`, 24 `off`). Уникальных
  эффективных правил по всем типам файлов — **1092**.
- **Распределение по плагинам (настроенные `error`):** unicorn 247, eslint core
  146, vue 139, typescript 88, regexp 73, jsdoc 47, astro 45, svelte 45, vitest
  39, package-json 36, jsx-a11y 32, sonarjs 22, node 21, perfectionist 20,
  react-x 17, react-dom 15, promise 12, qwik 10, slop 8, react-web-api 6 (+16
  несуществующих), eslint-comments 5, import 4, react-perf 4, react-jsx 3,
  de-morgan 2, react-hooks 2, react-naming-convention 2 (+1 несуществующее),
  react-compiler 1, prefer-let 1, depend 1.
- **Severity:** **все** включённые правила — `error`, `warn` не используется ни
  разу [VERIFIED].
- **Автофикс:** 414 правил; ещё 142 дают только suggestions. Type-aware правил —
  51, из них 8 sonarjs.

### 2.3 Явно выключенные и переопределённые правила

- `core`: `no-useless-assignment` выключается **глобально** для всех файлов,
  если включён `astro`, `react` или `qwik` (`core/index.ts:640-641`).
- `typescript` для TS-файлов: `class-methods-use-this`, `consistent-return`,
  `default-param-last`, `dot-notation`, `max-params`, `no-array-constructor`,
  `no-dupe-class-members`, `no-implied-eval`, `no-shadow`, `no-undef`,
  `no-unused-expressions`, `no-unused-private-class-members`, `no-unused-vars`,
  `no-use-before-define`, `no-useless-constructor`, `prefer-destructuring`,
  `require-await`. Также `jsdoc/no-undefined-types`, `require-param-type`,
  `require-property-type`, `require-returns-type`;
  `typescript/no-unsafe-assignment` и `typescript/triple-slash-reference`
  выключаются при `astro`.
- **Не выключены, хотя должны:** `no-redeclare` (ложные срабатывания, §3),
  `no-throw-literal`, `prefer-promise-reject-errors` (дубликаты), а также 15
  core-правил, проверку которых дублирует компилятор (`constructor-super`,
  `getter-return`, `no-const-assign`, …). typescript-eslint сам выключает их в
  `eslint-recommended` [VERIFIED: `eslint-recommended-raw.js`].

### 2.4 Правила, которые настроены, но неэффективны или ведут себя не так, как задумано

| Что                                                               | Почему                                                                                                                     | Доказательство  |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------------- |
| 19 React-правил (`react/index.ts:167, 193–278, 299, 320`)         | не существуют, ESLint падает                                                                                               | [VERIFIED]      |
| `settings.react` (`react/index.ts:358-364`)                       | eslint-react читает `settings["react-x"]`; react-perf, react-hooks, react-compiler и jsx-a11y-x не читают `settings.react` | [VERIFIED grep] |
| `no-empty { allowEmptyCatch: true }`                              | работает, но `typescript/no-unused-vars` (caughtErrors: all) всё равно ругается на `catch (error) {}`                      | [VERIFIED]      |
| `unicorn/no-useless-undefined { checkArguments: false }`          | `sonarjs/no-undefined-argument` ловит ровно этот случай                                                                    | [VERIFIED]      |
| `no-misused-promises { checksVoidReturn: false }`                 | `typescript/strict-void-return` ловит async-коллбэки                                                                       | [VERIFIED]      |
| `typescript/method-signature-style: 'method'`                     | комментарий: «Enforce using property signature», опция — обратная                                                          | [VERIFIED]      |
| `parserOptions.ecmaVersion/sourceType` в `core`                   | в flat config ESLint и так подставляет `ecmaVersion: 'latest'`; `.cjs` всё равно парсится как commonjs                     | [VERIFIED]      |
| `globals.es2025`                                                  | ES-глобалы уже даёт `ecmaVersion: 'latest'`                                                                                | [DOCUMENTED]    |
| vitest `files`                                                    | не покрывают `test/**/` (вложенные), `*.spec.*`, `__tests__`                                                               | [VERIFIED]      |
| `jsdoc/ts-*` в TS-файлах                                          | `jsdoc/no-types` запрещает типы в JSDoc, так что ts-* правилам нечего проверять (мёртвый вес, ~0.2 с на корпусе)           | [LIKELY]        |
| `jsdoc/require-template-description`, `check-template-names` в TS | `check-tag-names { typed: true }` запрещает `@template`                                                                    | [LIKELY]        |

---

## 3. DUPLICATE RULES

Все пары с пометкой «run» воспроизведены на одном узле одного фикстур-файла
(`src/dups.ts`, `src/dups.js`, `src/simplify.ts`) — два и более сообщения на
одну проблему.

### 3.1 Точные дубликаты (одновременно активны в одном файле)

| Rule A                                             | Rule B                                                                                 | Перекрытие                                                                                                                | Рекомендация                      | Почему                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------- | ---------------------------------------------- |
| `no-else-return`                                   | `unicorn/no-useless-else`                                                              | 100% (run)                                                                                                                | убрать `no-else-return`           | unicorn покрывает и `throw`/`continue`/`break` |
| `no-useless-concat`                                | `unicorn/no-useless-concat`                                                            | 100% (run)                                                                                                                | убрать core                       | одинаково                                      |
| `prefer-named-capture-group`                       | `regexp/prefer-named-capture-group`                                                    | 100% (run). Core даёт **по сообщению на каждую группу в одной позиции**, итого 4 сообщения на один regex                  | убрать core                       | regexp точнее указывает позицию                |
| `no-invalid-regexp`                                | `regexp/no-invalid-regexp`                                                             | regexp — надмножество: проверяет и литералы (`/\:/u` core пропустил) (run)                                                | убрать core                       |                                                |
| `no-empty-character-class`                         | `regexp/no-empty-character-class`                                                      | 100% (run)                                                                                                                | убрать core                       |                                                |
| `no-control-regex`                                 | `regexp/no-control-character` (+ `regexp/control-character-escape`)                    | 3 сообщения на `/\x0C/u` (run)                                                                                            | убрать core                       |                                                |
| `no-regex-spaces`                                  | `regexp/prefer-quantifier`                                                             | regexp — надмножество (run)                                                                                               | убрать core                       |                                                |
| `no-useless-backreference`                         | `regexp/no-useless-backreference`                                                      | 100%                                                                                                                      | убрать core                       | [DOCUMENTED]                                   |
| `no-useless-escape`                                | `regexp/no-useless-escape`                                                             | пересечение в regex-литералах                                                                                             | оставить оба                      | core нужен для строк                           |
| `prefer-promise-reject-errors`                     | `typescript/prefer-promise-reject-errors`                                              | 100% в TS (run)                                                                                                           | выключить core в TS               | забыто в `typescript/index.ts:564+`            |
| `no-throw-literal`                                 | `typescript/only-throw-error`                                                          | 100% в TS (run)                                                                                                           | выключить core в TS               | TS-версия type-aware                           |
| `unicorn/no-this-assignment`                       | `typescript/no-this-alias`                                                             | 100% (run)                                                                                                                | убрать `typescript/no-this-alias` | unicorn работает и в JS                        |
| `unicorn/no-useless-template-literals`             | `typescript/no-unnecessary-template-expression`                                        | 100% (run)                                                                                                                | в TS оставить TS-правило          | type-aware, знает типы выражений               |
| `unicorn/no-unnecessary-boolean-comparison`        | `typescript/no-unnecessary-boolean-literal-compare`                                    | 100% (run)                                                                                                                | в TS оставить TS-правило          | учитывает `boolean \| undefined`               |
| `promise/no-multiple-resolved`                     | `unicorn/no-multiple-promise-resolver-calls`                                           | 100% (run)                                                                                                                | оставить одно (unicorn)           | плагин promise отстаёт (см. `spec-only`)       |
| `import/no-named-default`                          | `unicorn/no-named-default`                                                             | unicorn — надмножество: ловит и `export { x as default }` (run)                                                           | убрать `import/`                  |                                                |
| `sonarjs/prefer-single-boolean-return`             | `unicorn/prefer-boolean-return`                                                        | 100% (run)                                                                                                                | убрать sonarjs                    | unicorn с автофиксом                           |
| `sonarjs/no-inverted-boolean-check`                | `unicorn/no-negated-comparison`                                                        | `!(a === b)`: оба (run). Для `!(a > b)` sonar предлагает `<=`, а это **неэквивалентно при NaN**; unicorn корректно молчит | убрать sonarjs                    |                                                |
| `no-unneeded-ternary { defaultAssignment: false }` | `unicorn/prefer-logical-operator-over-ternary`, `typescript/prefer-nullish-coalescing` | 3 сообщения на `a ? a : b` (run). Фиксы ведут в **разные** стороны (§5, C2)                                               | `defaultAssignment: true`         |                                                |
| `typescript/explicit-function-return-type`         | `typescript/explicit-module-boundary-types`                                            | 2 сообщения на каждую экспортируемую функцию без return type (run)                                                        | оставить одно (§6)                |                                                |
| `slop/no-static-only-class`                        | `unicorn/no-static-only-class`                                                         | slop — надмножество: unicorn пропустил класс с `public static` (run)                                                      | убрать unicorn                    |                                                |
| `react-compiler/react-compiler`                    | `react-x/immutability` (+ `react-hooks/immutability`)                                  | 2–3 сообщения на одно переприсваивание state (run)                                                                        | убрать `react-compiler`           |                                                |
| `eslint-plugin-react-compiler`                     | `react-hooks@7` (compiler-правила в `recommended`)                                     | одна реализация, разные упаковки                                                                                          | убрать `react-compiler`           | [DOCUMENTED] README react-hooks                |

### 3.2 Частичные дубликаты

| Rule A                                      | Rule B                                                     | Перекрытие                                         | Рекомендация                                 |
| ------------------------------------------- | ---------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------- |
| `array-callback-return`                     | `sonarjs/array-callback-without-return`                    | core шире: ловит и «не все ветки возвращают» (run) | убрать sonarjs                               |
| `sonarjs/no-misleading-array-reverse`       | `unicorn/no-array-reverse`                                 | unicorn запрещает любое мутирующее использование   | убрать sonarjs [LIKELY]                      |
| `sonarjs/no-identical-conditions`           | `no-dupe-else-if` + `no-duplicate-case`                    | почти полное                                       | убрать sonarjs [DOCUMENTED]                  |
| `sonarjs/no-duplicated-branches`            | `unicorn/no-duplicate-if-branches`                         | unicorn — только смежные ветки, sonar — и switch   | оставить оба                                 |
| `sonarjs/no-identical-expressions`          | `no-self-compare`, `unicorn/no-duplicate-logical-operands` | sonar шире (`a - a`, `a / a`)                      | оставить                                     |
| `sonarjs/no-ignored-return`                 | `unicorn/no-unused-builtin-method-return`                  | sonar type-aware и шире                            | оставить sonar, unicorn убрать в TS [LIKELY] |
| `sonarjs/no-gratuitous-expressions`         | `typescript/no-unnecessary-condition`                      | в TS почти полное                                  | оставить для JS [LIKELY]                     |
| `typescript/prefer-for-of`                  | `unicorn/no-for-loop`                                      | unicorn с автофиксом, шире                         | убрать TS-правило [DOCUMENTED]               |
| `typescript/await-thenable`                 | `unicorn/no-unnecessary-await`                             | TS-версия точнее                                   | в TS выключить unicorn [LIKELY]              |
| `typescript/no-unnecessary-type-conversion` | `unicorn/no-useless-coercion`, `no-extra-boolean-cast`     | частичное                                          | оставить, низкий приоритет                   |
| `no-undef-init`                             | `unicorn/no-useless-undefined`                             | `let x = undefined`                                | убрать core [LIKELY]                         |
| `unicorn/prefer-smaller-scope`              | `unicorn/no-declarations-before-early-exit`                | второе — частный случай первого                    | оставить, низкий приоритет                   |
| `regexp/prefer-unicode-codepoint-escapes`   | `unicorn/prefer-unicode-code-point-escapes`                | в regex-литералах                                  | оставить. Фиксы сходятся [VERIFIED]          |

### 3.3 Конкурирующие реализации

- **React:** `react-compiler` ↔ `react-hooks@7` ↔ `react-x` (`immutability`,
  `set-state-in-effect`, `use-memo`, `purity`, `refs`, `static-components`,
  `rules-of-hooks`, `exhaustive-deps` есть в **обоих** — и в react-hooks 7, и в
  react-x 5). Выберите один источник compiler-правил (рекомендация в §8).
- **Promise:** `eslint-plugin-promise` ↔ unicorn (`no-async-promise-finally`,
  `no-useless-promise-resolve-reject`, `no-multiple-promise-resolver-calls`,
  `prefer-await`) ↔ sonarjs (`prefer-promise-shorthand`). У promise уникальны
  только `catch-or-return`, `no-nesting`, `no-callback-in-promise`,
  `no-promise-in-callback`, `param-names`, `valid-params`, `prefer-catch`. В TS
  `catch-or-return` перекрывается `no-floating-promises`.
- **Import:** `import-lite` (4 правила) ↔ `perfectionist/sort-imports` ↔
  `typescript/consistent-type-imports`. Сочетание рабочее, но
  `import/no-duplicates` не включён [VERIFIED: два импорта из `./helper.js` не
  помечены и не слиты].

### 3.4 Проверки, которые уже выполняет компилятор (в TS-файлах)

`constructor-super`, `getter-return`, `no-class-assign`, `no-const-assign`,
`no-dupe-args`, `no-dupe-keys`, `no-func-assign`, `no-import-assign`,
`no-new-native-nonconstructor`, `no-obj-calls`, `no-setter-return`,
`no-this-before-super`, `no-unreachable`, `no-unsafe-negation`, `no-with`. Из
unicorn: `no-invalid-argument-count` (TS2554), `no-undeclared-class-members`
(TS2339). Из promise: `valid-params`.

Почти все безвредны, только тратят время: `unicorn/no-invalid-argument-count` —
384 мс на корпусе, самое дорогое правило unicorn [VERIFIED]. Рекомендация:
применить к TS-файлам список `eslint-recommended` из typescript-eslint и
выключить два правила unicorn.

**Исключение — `no-redeclare`: это ложные срабатывания, а не просто избыточность
[VERIFIED].**

```ts
export function overload(value: string): string
export function overload(value: number): number // ← no-redeclare
export function overload(value: string | number) {
  return value
}

export const Direction = { Up: 'up' } as const
export type Direction = (typeof Direction)[keyof typeof Direction] // ← no-redeclare
```

На `zod` v3 — 57 ложных срабатываний (`export const INVALID` +
`export type INVALID`, `ZodIssueCode` и т.д.). Нужно `'no-redeclare': 'off'` в
TS. Если хочется сохранить проверку — `typescript/no-redeclare`, но она тоже не
входит в рекомендации typescript-eslint.

---

## 4. HARMFUL OR QUESTIONABLE RULES

Порядок — от самого опасного к наименее значимому. «Опасный» означает, что
правило или его автофикс меняет поведение программы или тестов, ломает сборку
либо систематически подталкивает к худшему коду.

### 4.1 `vitest/prefer-to-be-falsy`, `vitest/prefer-to-be-truthy`, `vitest/prefer-called-with` — автофикс меняет смысл тестов

**Конфигурация:** `vitest/index.ts:130, 178, 186`, все `error`, все с
автофиксом.

**Проблема.** `toBe(false)` проверяет строго, а `toBeFalsy()` пропускает `0`,
`''`, `null`, `undefined`, `NaN`. Фикс **ослабляет** тест. `toHaveBeenCalled()`
→ `toHaveBeenCalledWith()` (без аргументов) означает «вызван **без
аргументов**», так что фикс **ломает** корректный тест.

```ts
let isEmpty = value => (value === '' ? 1 : 0) // баг: возвращает число
expect(isEmpty('x')).toBe(false) // до фикса: FAIL (баг пойман)
expect(isEmpty('x')).toBeFalsy() // после --fix: PASS (баг скрыт)

callback('payload')
expect(callback).toHaveBeenCalled() // до фикса: PASS
expect(callback).toHaveBeenCalledWith() // после --fix: FAIL
```

**Поведение [VERIFIED].** `eslint --fix` дал ровно этот вывод. Затем
`vitest run`: тест «strict boolean» до фикса падает, после — проходит; тест
«called» до фикса проходит, после — падает. Ещё один эффект: на
`expect(x instanceof Object).toBe(true)` первым срабатывает
`prefer-to-be-truthy` (→ `toBeTruthy()`), и `prefer-to-be-object` уже не
применяется. Результат зависит от порядка фиксов.

**Повторное подтверждение [VERIFIED].** При написании прототипа из §14.1
`eslint --fix` с этим конфигом переписал мою проверку
`expect(emit).toHaveBeenCalledOnce()` в `toHaveBeenCalledExactlyOnceWith()`
(сообщение: «Prefer toHaveBeenCalledExactlyOnceWith(/* expected args */)»), и
корректный тест упал. Правило трогает не только `toHaveBeenCalled()`, но и
`toHaveBeenCalledOnce()`.

**Влияние.** Это худший класс автофикса: молча снижает чувствительность
тестового набора.

**Контраргументы.** «Truthy/falsy читаемее». Возможно, но вы явно выбрали стиль
«строгие проверки» во всём остальном конфиге.

**Рекомендация.** **REMOVE** все три. Добавить
`vitest/prefer-strict-boolean-matchers` (обратное направление: `toBe(true)`
вместо `toBeTruthy()`) и `vitest/expect-expect`. Если нужна проверка аргументов
— `vitest/prefer-called-exactly-once-with` без автозамены на пустой вызов.
**Уверенность: высокая.**

### 4.2 `capitalized-comments` — автофикс отключает директивы инструментов

**Конфигурация:** `core/index.ts:117-123`,
`['error', 'always', { ignorePattern: 'c8|v8|spell-checker' }]`.

**Проблема.** Правило по умолчанию игнорирует только `eslint`, `jshint`,
`istanbul`, `global`, `exported` и т.п. Директивы других инструментов
регистрозависимы.

**Поведение [VERIFIED]** (`--fix`):

```ts
// prettier-ignore            →  // Prettier-ignore      (Prettier перестаёт игнорировать блок — проверено)
import(/* webpackChunkName: "chart" */ …) → /* WebpackChunkName: … */  (magic comment мёртв)
// biome-ignore lint: legacy  →  // Biome-ignore …
// cspell:disable-next-line   →  // Cspell:disable-next-line
// return computeTotal(items) →  // Return computeTotal(items)   (портит закомментированный код)
```

После фикса Prettier переформатировал матрицу, которую пользователь явно защитил
`prettier-ignore`.

**Влияние.** Скрытая поломка tooling, которая замечается только постфактум.
Польза правила чисто эстетическая.

**Контраргументы.** Единообразие комментариев. Его можно сохранить без вреда.

**Рекомендация.** **REMOVE**. Если правило дорого как стиль — **KEEP WITH
DIFFERENT OPTIONS**:

```ts
'capitalized-comments': ['error', 'always', {
  ignoreConsecutiveComments: true,
  ignoreInlineComments: true,
  ignorePattern: String.raw`prettier-ignore|biome-ignore|oxlint-|webpack[A-Z]|vite-ignore|turbopack|cspell|spell-checker|c8|v8|@ts-|tslint|stylelint|noinspection|language=|https?:`,
}],
```

**Уверенность: высокая.**

### 4.3 Perfectionist: `sort-decorators`, `sort-maps`, `sort-sets` и `sort-objects` со значениями с побочными эффектами

**Конфигурация:** `perfectionist/index.ts:64-145`, все 20 правил, глобально
`type: 'line-length', order: 'desc'`.

**Проблема.** Сортировка — семантическая операция там, где порядок наблюдаем.

**Поведение [VERIFIED]** (`--fix`):

```ts
@log                  →  @authenticateRequest   // порядок применения декораторов изменён:
@authenticateRequest  →  @log                   // теперь log оборачивает уже проверенный вызов
handle() {}

new Map([['parse',1],['validate',2],['transform',3]])
  → new Map([['transform',3],['validate',2],['parse',1]])   // порядок итерации pipeline перевёрнут

new Set(['low', 'critical']) → new Set(['critical', 'low'])  // порядок итерации изменён

{ primary: next(), fallbackIdentifier: next() }
  → { fallbackIdentifier: next(), primary: next() }         // primary теперь получает 2, а не 1
```

Что Perfectionist делает правильно [VERIFIED]: зависимости между полями класса
учитывает (`derived = this.base * 2` остаётся после `base`), объединение
перегрузок в intersection не переставил.

**Влияние.** `sort-decorators` — реальный источник багов (NestJS guards и
interceptors, TypeORM, MobX, Angular). `sort-maps` и `sort-sets` бьют по
«упорядоченным реестрам». `sort-objects` с вызовами в значениях встречается
редко, но такой баг очень трудно найти.

**Контраргументы.** Порядок — договорённость. Partition-комментарии
(`partitionByComment`) и `partitionByNewLine` дают escape hatch. Вы автор
Perfectionist и знаете эти edge cases.

**Рекомендация.**

- `sort-decorators` — **REMOVE**: выигрыш (эстетика) несоизмерим с риском.
- `sort-maps`, `sort-sets` — **REMOVE**, либо оставить с
  `partitionByNewLine: true`.
- `sort-objects` — **KEEP WITH DIFFERENT OPTIONS**: `partitionByNewLine: true`
  глобально и задокументированное правило для order-sensitive объектов.

**Уверенность: высокая** (decorators, maps), средняя (objects).

### 4.4 `typescript/method-signature-style: 'method'` — систематически отключает проверку вариантности

**Конфигурация:** `typescript/index.ts:188-191`. Комментарий говорит «Enforce
using **property** signature for functions», а опция — `'method'`.

**Проблема.** Method signatures в TypeScript **бивариантны** по параметрам даже
под `strictFunctionTypes`. Правило переписывает type-safe property signatures в
небезопасные.

**Поведение [VERIFIED]** (`tsc --strict`):

```ts
interface Handler {
  handle: (value: string | number) => void
} // property
let onlyStrings = (value: string) => value.toUpperCase()
let handler: Handler = { handle: onlyStrings } // TS2322 — ошибка поймана

interface Handler {
  handle(value: string | number): void
} // method (требует конфиг)
let handler: Handler = { handle: onlyStrings } // компилируется
handler.handle(42) // runtime TypeError: value.toUpperCase is not a function
```

Кроме того, `jsdoc/ts-method-signature-style` (`core/index.ts:1057`) по
комментарию предпочитает property: для JSDoc-типов в JS и для TS действуют
противоположные политики.

**Контраргументы.** Method signatures короче. Нужны для overload'ов в
интерфейсах. Ближе к классам.

**Рекомендация.** **KEEP WITH DIFFERENT OPTIONS**: `['error', 'property']`. Это
та же позиция, что в `strict`-пресетах сообщества, и она совпадает с вашим
собственным комментарием. **Уверенность: высокая.**

### 4.5 `prefer-let/prefer-let` — намеренное решение с измеримой ценой в TypeScript

**Конфигурация:** `core/index.ts:1082-1087`, `{ forceUpperCaseConst: true }`,
**с автофиксом**.

**Проблема.**

1. В TS `let` расширяет literal types. Автофикс `const` → `let` ломает
   компиляцию.
2. Исчезает механическая гарантия «не переприсваивается», а с ней и сигнал
   читателю.

**Поведение [VERIFIED].**

```ts
declare function sortBy(order: 'asc' | 'desc'): void
const order = 'asc'
sortBy(order) // OK
let order = 'asc'
sortBy(order) // TS2345: 'string' is not assignable to '"asc" | "desc"'
```

На `zod` v3 это самое частое автофиксируемое сообщение: 1292 из 20 888.

**Контраргументы, честно.**

- Это сознательная школа (Frontside): `const` создаёт ложное ощущение
  иммутабельности объекта.
- TS 5.4+ сохраняет narrowing в замыканиях после последнего присваивания, так
  что старый аргумент про narrowing в основном снят.
- Переприсваивание React-state (`let [count, setCount]`; `count = …`) ловят
  `react-hooks/immutability` и `react-x/immutability` [VERIFIED].
- `no-useless-assignment`, `no-unassigned-vars`, `no-param-reassign` частично
  компенсируют потерю.

**Влияние.** Цена реальна, но умеренна: поломки при фиксе, `as const` и
аннотации там, где `const` вывел бы literal type, чуть более шумные диффы.
Выгода — стилистическая консистентность.

**Рекомендация.** Решать вам; это философский выбор. Минимум — **DISABLE
AUTOFIX** (в плагине опции нет, значит **LOWER TO WARNING**/off в TS-файлах).
Либо **REMOVE** для TS и оставить для JS. Если оставляете — добавить в README
раздел «почему let» и пример с `as const`. **Уверенность: высокая** в фактах,
средняя в рекомендации.

### 4.6 `react-perf/*` (4 правила) — противоречит современному React и React Compiler

**Конфигурация:** `react/index.ts:173-188`, все `error`.

**Проблема.** Правила требуют выносить или мемоизировать любые inline-функции,
объекты и массивы в props:

- это противоречит официальной позиции React («не оптимизируйте
  преждевременно»);
- бессмысленно при React Compiler, который вы сами включаете через
  `react-compiler`;
- пакет не обновлялся с октября 2024 и объявляет `peer eslint ≤ 9` — npm выдаёт
  `ERESOLVE` warning при ESLint 10 [VERIFIED].

**Поведение [VERIFIED].** `<li onClick={() => setSelected(item.id)}>` и
`style={{ padding: 8 }}` дают по ошибке. Чтобы соблюсти правило, нужны
`useCallback`/`useMemo` и вынесенные константы — больше кода, ничем не
подкреплённая «оптимизация» и сложнее рефакторинг.

**Рекомендация.** **REMOVE** весь плагин. Вместо него точечно:
`react-x/no-unstable-context-value` (уже включено) и
`react-x/no-unstable-default-props`. **Уверенность: высокая.**

### 4.7 Unicorn-правила, требующие API новее ваших `engines`

**Конфигурация:**

- `core/index.ts:2618` `prefer-uint8array-base64` (autofix + sugg): Node
  **25+**;
- `:2342` `prefer-get-or-insert-computed` (autofix): Node **26+**, Safari 26.2;
- `:2309` `prefer-dom-node-html-methods` (autofix): `setHTML` в Safari
  отсутствует;
- `:2378/2383` `prefer-iterator-helpers` / `prefer-iterator-to-array`: Node 22,
  Safari 18.4;
- `:2501` `prefer-set-methods`: Node 22.

**Проблема [VERIFIED, MDN BCD 8.1.5].** Правила включены безусловно. Пакет
объявляет `engines >=18`, а потребители на Node 22/24 LTS получают ошибку на
`Buffer.from(x, 'base64')` без возможности её соблюсти.
`node/no-unsupported-features/es-builtins` новых API **не знает** и не страхует:
на проекте с `engines >=22` unicorn потребовал `Uint8Array.fromBase64`, `n`
промолчал. Для JS-проектов автофикс таких правил даёт runtime-crash; в TS —
ошибку компиляции, если `lib` не `esnext`.

**Рекомендация.** **GATE BY TARGETS**, то есть ровно ваша идея; подробный дизайн
— в §14.1. Без гейтинга: `prefer-uint8array-base64` и
`prefer-get-or-insert-computed` — off, `prefer-dom-node-html-methods` —
`{ checkSetHTML: false }`. **Уверенность: высокая.**

### 4.8 Каскад `slop/prefer-jsdoc` → `jsdoc/require-*` — наказание за комментарий

**Конфигурация:** `slop/prefer-jsdoc` (`core/index.ts:1477`, autofix) плюс
`jsdoc/require-param`, `require-returns`, `require-param-description`,
`require-description-complete-sentence` для всех файлов, включая TS.

**Поведение [VERIFIED].**

```ts
// converts the amount to cents
export function toCents(amount: number, currency: string): number { … }
```

После `--fix`:

```ts
/**
 * Converts the amount to cents.
 *
 * @param amount
 * @param currency
 */
```

и ещё **3 неисправимые ошибки**: `require-returns`, `require-param-description`
×2.

**Влияние.** Разработчик, оставивший полезную однострочную подсказку, вынужден
написать пять строк документации, дублирующей сигнатуру TS, или удалить
комментарий. Конфиг экономически поощряет второе.

**Рекомендация.**

- В TS-файлах **DISABLE** `jsdoc/require-param` и `jsdoc/require-returns`: типы
  уже в сигнатуре. Описания параметров требовать, только если `@param` написан.
- `slop/prefer-jsdoc` — **KEEP**, только если вы сознательно хотите JSDoc на
  всех экспортах; иначе **REMOVE**.

**Уверенность: высокая.**

### 4.9 `slop/no-em-dash` — проверяет и строковые литералы

**Конфигурация:** `core/index.ts:1454`.

**Поведение [VERIFIED].** `let label = 'Loading — please wait'` → «Avoid em
dashes in prose».

**Влияние.** В русском тексте тире — обязательная пунктуация («Москва —
столица»). Любые UI-строки и i18n-ресурсы в JS/TS получают ложные срабатывания.
Опций у правила нет.

**Рекомендация.** **REMOVE**. Если цель — бороться с LLM-«водой» в комментариях,
для этого есть `slop/no-jargon`. **Уверенность: высокая.**

### 4.10 `camelcase { properties: 'always' }` — пинг-понг с вашим же Prettier

**Конфигурация:** `core/index.ts:107-113`.

**Поведение [VERIFIED].**
`{ grant_type: 'client_credentials', client_id: 'abc' }` (OAuth wire format) → 2
ошибки. Обходной путь — кавычки `'grant_type'`: camelcase их пропускает. Но
`@azat-io/prettier-config` (`quoteProps: 'as-needed'`) **снимает кавычки**, и
ошибка возвращается. Соблюсти правило невозможно, кроме как через
`eslint-disable`.

**Рекомендация.** **KEEP WITH DIFFERENT OPTIONS**:
`['error', { properties: 'never', ignoreGlobals: true, ignoreImports: true }]`.
Именование собственных свойств и так покрывается здравым смыслом и
`typescript/naming-convention`. **Уверенность: высокая.**

### 4.11 `prefer-destructuring` / `typescript/prefer-destructuring` с массивами — тупик

**Конфигурация:** `core/index.ts:721`, `typescript/index.ts:469`, по умолчанию
(`array: true` и для declarator, и для assignment).

**Поведение [VERIFIED].**

- `let third = array[2]` → «Use array destructuring».
- `let [, , third] = array` → `unicorn/no-unreadable-array-destructuring`.

Единственный путь — `array.at(2)`, который в TS меняет тип на `T | undefined`.
Destructuring при присваивании (`({ value } = event)`) тоже форсируется и хуже
читается.

**Рекомендация.**

```ts
'typescript/prefer-destructuring': ['error', {
  VariableDeclarator: { array: false, object: true },
  AssignmentExpression: { array: false, object: false },
}, { enforceForRenamedProperties: false }],
```

То же для core в JS. **Уверенность: высокая.**

### 4.12 `unicorn/prefer-includes-over-repeated-comparisons` в TS — уничтожает narrowing

**Поведение [VERIFIED].** Правило требует переписать
`status === 'active' || status === 'pending' || status === 'archived'`
(автофикса нет). Ручная правка на
`['active','pending','archived'].includes(status)` даёт **TS2345** при передаче
`status` дальше: narrowing union потерян.

**Рекомендация.** **DISABLE FOR SPECIFIC FILES**: off в TS-файлах, оставить для
JS. **Уверенность: высокая.**

### 4.13 `typescript/strict-void-return` против вашего же `checksVoidReturn: false`

**Конфигурация:** `typescript/index.ts:289-294, 548`.

**Поведение [VERIFIED].**
`target.addEventListener('click', async () => { await save() })` → «Async
function used in a context where a void function is expected». Ровно этот случай
вы сознательно разрешили в `no-misused-promises`.

**Рекомендация.** Определиться:

- либо **REMOVE** `strict-void-return` и оставить
  `no-misused-promises { checksVoidReturn: { attributes: false } }` —
  JSX-обработчики разрешены, а `addEventListener` с async подсвечивается: это и
  есть реальный источник unhandled rejection;
- либо убрать исключение в `no-misused-promises`.

**Уверенность: высокая.**

### 4.14 `unicorn/name-replacements` — переименования с автофиксом и ложные срабатывания на файлах фреймворков

**Поведение [VERIFIED].**

- Файлы `env.d.ts` (шаблон create-vue) и `next-env.d.ts` (генерируется Next.js,
  переименовать нельзя) помечаются, если не включён `astro`: `env` разрешён
  только при `config.astro`, `core/index.ts:1668`.
- Автофикс: `btnRef` → `buttonReference` (против React-конвенции `*Ref`), `fn` →
  `function_`, `args` → `arguments_`, `{ env, params }` →
  `{ env: environment, params: parameters }`.

Что работает хорошо [VERIFIED]: `+page.svelte`, `[id].astro`, `[...path].ts`,
`(group)/page.tsx`, `vite-env.d.ts` не помечаются.

**Рекомендация.** **KEEP WITH DIFFERENT OPTIONS**: `allowList` — `env: true`
всегда;
`replacements: { ref: false, refs: false, fn: false, args: false, params: false, ctx: false, env: false }`;
для `next-env.d.ts` — `ignore: [String.raw`next-env\.d\.ts$`]`. Проверено
[VERIFIED]: с этими опциями `env.d.ts` и `next-env.d.ts` проходят, а `btnRef`
становится `buttonRef`, а не `buttonReference`. **Уверенность: высокая** в
фактах; итоговый список — дело вкуса.

### 4.15 Сортировка по `line-length` (глобальная настройка Perfectionist)

**Поведение [VERIFIED].** Изменение только **значения** (`read: 3000` →
`read: 30`) переставляет **ключ** при следующем `--fix`. Позиция зависит от
данных, а не от имён: появляются шумные диффы и лишние merge-конфликты в часто
меняемых объектах (таймауты, feature flags, i18n).

Самый сильный аргумент: в шапке каждого модуля этого репозитория стоит директива
`/* eslint perfectionist/sort-objects: ['error', { type: 'alphabetical', … partitionByNewLine: true }] */`.
Для длинных списков вы сами предпочли алфавит.

**Контраргумент.** «Лесенка» визуально приятна для импортов, union-типов и
коротких списков. Это ваш фирменный стиль.

**Рекомендация.** **KEEP WITH DIFFERENT OPTIONS**:

- `line-length` оставить для `sort-imports`, `sort-named-imports`,
  `sort-union-types`, `sort-heritage-clauses` (позиция почти не зависит от
  данных);
- для `sort-objects`, `sort-interfaces`, `sort-object-types`, `sort-classes`,
  `sort-enums`, `sort-jsx-props` — `type: 'natural'` +
  `partitionByNewLine: true`.

**Уверенность: средняя.** Это противоречит вашему дизайн-решению, и я это
понимаю.

### 4.16 Компактно — остальные спорные правила

| Правило / настройка                                                               | Проблема (доказательство)                                                                                                                                      | Рекомендация                                                                              | Увер.             |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------- |
| `strict: ['error','never']` (`core:786`)                                          | в `.cjs` требует удалить `'use strict'`, хотя там он меняет семантику (sloppy mode) [VERIFIED]                                                                 | `['error', 'safe']`                                                                       | выс.              |
| `no-unneeded-ternary { defaultAssignment: false }`                                | фикс `a ? a : b` → `a \|\| b` сразу нарушает `typescript/prefer-nullish-coalescing` [VERIFIED]                                                                 | `defaultAssignment: true`                                                                 | выс.              |
| `unicorn/prefer-at` (autofix)                                                     | `users[users.length - 1].name` → `users.at(-1).name` даёт TS2532 [VERIFIED]. Но исходный код падал бы на пустом массиве: правило вскрывает латентный баг       | **KEEP**, но знать, что fix в pre-commit может «сломать» tsc                              | выс.              |
| `jsdoc/require-description-complete-sentence`                                     | «etc. has» → «etc. Has» [VERIFIED]; этот артефакт есть в вашем исходнике: `a11y/index.ts:436`, `astro/index.ts:98`                                             | LOWER TO WARNING или `abbreviations: ['etc', 'e.g', 'i.e']`                               | выс.              |
| `typescript/explicit-member-accessibility` (default `explicit`)                   | `public` на каждом члене класса; 336 сообщений на zod v3 [VERIFIED]; шум без выигрыша                                                                          | `{ accessibility: 'no-public' }`                                                          | сред.             |
| `typescript/explicit-function-return-type`                                        | дублирует `explicit-module-boundary-types` на экспортах [VERIFIED]; внутри модуля заставляет писать `: React.JSX.Element` у каждого компонента                 | оставить только `explicit-module-boundary-types` (или `isolatedDeclarations` в tsconfig)  | сред.             |
| `promise/spec-only`                                                               | `Promise.try` (ES2025) помечен как «non-standard» [VERIFIED]                                                                                                   | `{ allowedMethods: ['try'] }` или REMOVE (TS и unicorn покрывают)                         | выс.              |
| `typescript/no-meaningless-void-operator`                                         | фикс `void z` → `z` сразу нарушает `typescript/no-unused-expressions` [VERIFIED] и противоречит `no-void { allowAsStatement: true }`                           | оставить одно намерение: если `void x;` — валидный идиом, правило off                     | сред.             |
| `slop/no-trivial-type-aliases`                                                    | `export type UserId = string` → ошибка [VERIFIED]; доменные алиасы документируют намерение в сигнатурах                                                        | REMOVE или LOWER TO WARNING                                                               | сред.             |
| `sonarjs/no-same-line-conditional`                                                | Prettier делает его невозможным                                                                                                                                | REMOVE                                                                                    | выс.              |
| `unicorn/prefer-minimal-ternary`                                                  | цепочка фиксов дала `send(id, ({ retry: !!urgent }))` + новую ошибку `no-unnecessary-type-conversion` [VERIFIED]                                               | LOWER TO WARNING                                                                          | сред.             |
| `unicorn/prefer-event-target`                                                     | в Node-библиотеках `EventEmitter` — идиоматичный API; `EventTarget` даёт другую семантику ошибок                                                               | off при `node: true`                                                                      | [LIKELY] сред.    |
| `no-await-in-loop`                                                                | легитимные последовательные операции (rate-limit, retry, пагинация) требуют disable                                                                            | KEEP, но кандидат в `warn`                                                                | [LIKELY]          |
| `typescript/class-methods-use-this` (defaults)                                    | false positives в overrides и реализациях интерфейсов (Lit, Angular, NestJS, React-классы)                                                                     | `{ ignoreOverrideMethods: true, ignoreClassesThatImplementAnInterface: 'public-fields' }` | [DOCUMENTED] выс. |
| `no-useless-assignment` off при react/astro/qwik **для всех файлов** (`core:640`) | в ESLint 10 правило корректно работает и в TSX, и во frontmatter Astro: true positives есть, false positives на паттерне «переменная в шаблоне» нет [VERIFIED] | вернуть `error` (минимум — off только для `*.astro`, если найдутся конкретные FP)         | выс.              |
| `typescript/no-floating-promises.allowForKnownSafeCalls: nanostores task`         | персональная настройка в публичном конфиге                                                                                                                     | вынести в опцию                                                                           | выс.              |
| `vue/require-default-prop`                                                        | в TS + props destructuring требует default для каждого optional prop [VERIFIED]                                                                                | off при `typescript`                                                                      | выс.              |

---

## 5. RULE CONFLICTS

Методика: фикстуры, многократный `--fix` с проверкой сходимости (`lintText` до 5
запусков подряд, каждый — до 10 внутренних проходов ESLint) и проверкой
результата через `tsc` и `vitest`.

### 5.1 Доказанные конфликты [VERIFIED]

| #   | Правила                                                                                                          | Триггер                                                   | Что происходит                                                                                                                                                            | Решение                                           |
| --- | ---------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| C1  | `prefer-destructuring` ↔ `unicorn/no-unreadable-array-destructuring`                                             | `let third = arr[2]`                                      | любой вариант — ошибка; выход только через `arr.at(2)`                                                                                                                    | `array: false` (§4.11)                            |
| C2  | `no-unneeded-ternary` ↔ `typescript/prefer-nullish-coalescing`                                                   | `a ? a : b`                                               | фикс первого (`a \|\| b`) нарушает второе; направление ведёт к **худшей** семантике (пустая строка)                                                                       | `defaultAssignment: true`                         |
| C3  | `typescript/strict-void-return` ↔ `no-misused-promises { checksVoidReturn: false }`                              | async-обработчик в `addEventListener`                     | одно правило разрешает, другое запрещает                                                                                                                                  | §4.13                                             |
| C4  | `sonarjs/no-undefined-argument` ↔ `unicorn/no-useless-undefined { checkArguments: false }`                       | `optional('a', undefined)`                                | исключение одного правила отменено другим                                                                                                                                 | убрать sonar-правило                              |
| C5  | `camelcase` ↔ Prettier `quoteProps: 'as-needed'`                                                                 | `{ grant_type: … }`                                       | правило принимает только кавычки, Prettier их снимает                                                                                                                     | `properties: 'never'`                             |
| C6  | `capitalized-comments` ↔ Prettier, webpack, Biome, cspell                                                        | `// prettier-ignore`                                      | фикс отключает директиву                                                                                                                                                  | §4.2                                              |
| C7  | `jsdoc/check-tag-names` + `jsdoc/valid-types` (mode `jsdoc`) ↔ `jsdoc/prefer-import-tag`                         | JS-файл, ссылка на импортированный тип                    | `@import` — «invalid tag», `import('./x').T` — «syntax error», а `prefer-import-tag` требует `@import`. В JS **нет** валидного способа сослаться на тип из другого модуля | `settings.jsdoc.mode: 'typescript'` и для JS      |
| C8  | `unicorn/prefer-add-event-listener` → `svelte/no-add-event-listener`                                             | `el.onclick = …` в `.svelte`                              | фикс первого создаёт нарушение второго                                                                                                                                    | off unicorn-правила в `*.svelte`                  |
| C9  | `react-dom/no-unknown-property` ↔ `qwik/no-react-props`                                                          | `react: true, qwik: true`, `<div class>`                  | одно требует `className`, другое запрещает                                                                                                                                | фреймворки должны иметь собственные `files` (§10) |
| C10 | `typescript/no-meaningless-void-operator` → `typescript/no-unused-expressions`; ↔ `no-void { allowAsStatement }` | `void value`                                              | фикс удаляет `void`, остаётся «unused expression»                                                                                                                         | выбрать одно намерение                            |
| C11 | `unicorn/prefer-minimal-ternary` → `no-unneeded-ternary` → `typescript/no-unnecessary-type-conversion`           | `urgent ? send(id,{retry:true}) : send(id,{retry:false})` | итог: `send(id, ({ retry: !!urgent }))` + новая ошибка; человек написал бы `{ retry: urgent }`                                                                            | prefer-minimal-ternary → warn                     |
| C12 | `slop/prefer-jsdoc` → `jsdoc/require-param`, `require-returns`, `require-param-description`                      | `// комментарий` над экспортом                            | каскад из 3 новых неисправимых ошибок                                                                                                                                     | §4.8                                              |
| C13 | unicorn modern-API rules ↔ `engines`                                                                             | `Buffer.from(x,'base64')` при Node 22                     | требование неисполнимо                                                                                                                                                    | §14.1                                             |
| C14 | `prefer-let` (autofix) ↔ компилятор TS                                                                           | `const order = 'asc'`                                     | TS2345 после фикса                                                                                                                                                        | §4.5                                              |
| C15 | `unicorn/prefer-at` (autofix) ↔ компилятор TS                                                                    | `arr[arr.length-1].x`                                     | TS2532 после фикса                                                                                                                                                        | §4.16                                             |
| C16 | `typescript/method-signature-style: method` ↔ `jsdoc/ts-method-signature-style` (property)                       | интерфейсы в TS и JSDoc-типы в JS                         | противоположные политики                                                                                                                                                  | `property` везде                                  |
| C17 | `unicorn/prefer-boolean-return` (fixer) ↔ стиль без `;`                                                          | `if (x) return true; return false`                        | фикс вставил `return flag.length > 0;` с точкой с запятой                                                                                                                 | косметика, исправит Prettier; сообщить upstream   |

### 5.2 Проверенные гипотезы, которые конфликтами **не** оказались [VERIFIED]

- `unicorn/escape-case`, `prefer-unicode-code-point-escapes`,
  `prefer-short-escape-sequences`, `prefer-literal-ascii` и
  `regexp/letter-case`, `unicode-escape`, `control-character-escape` (свежие
  правила из последних коммитов) сходятся за один проход, циклов нет. Есть лишь
  неканоничность: `'\xA9'` → `'\u{A9}'`, а `'©'` → `'©'`.
- `unicorn/prefer-block-statement-over-iife` ↔ `no-lone-blocks`: блок с `let` не
  считается «одиноким», конфликта нет.
- `unicorn/no-array-sort`, `no-array-reverse` не трогают сортировку на месте в
  statement-позиции.
- `unicorn/prefer-simple-condition-first` имеет защиту от небезопасной
  перестановки (отдельный messageId `/unsafe`).
- Импорты: `node/prefer-node-protocol`, `perfectionist/sort-imports`,
  `typescript/consistent-type-imports` и `import/first` сходятся.
- `.cjs` парсится как CommonJS, несмотря на
  `parserOptions.sourceType: 'module'`.
- Astro-правила `jsx-a11y` в реальных npm- и pnpm-проектах находят
  `eslint-plugin-jsx-a11y-x` через hoisting. Сработать могут только без hoisting
  (Yarn PnP, `hoist=false`) [LIKELY].

### 5.3 Взаимодействие с Prettier и порядок вычисления

- ESLint `--fix` → Prettier не сходится за один проход [VERIFIED]. На прототипе
  из §14.1 (6 TS-файлов, около 3 тыс. строк) цикл «`eslint --fix` →
  `prettier --write`» стабилизировался только на втором круге: после переносов
  Prettier следующий проход ESLint снова менял код. Бесконечного цикла не было.
  Какое именно правило дало второй круг (вероятный кандидат — `perfectionist` с
  `type: 'line-length'`), я не изолировал. Практический вывод: в `lint-staged` и
  CI запускать ESLint после Prettier, а не до него.
- `perfectionist/sort-exports`: порядок `export … from` определяет порядок
  вычисления модулей. Проблема только для модулей с side effects [SPECULATIVE].

---

## 6. RULE OPTIONS WORTH RECONSIDERING

Каждая рекомендация — точная конфигурация. Изменения «ради дефолтов» не
предлагаю.

```ts
// core/index.ts
'strict': ['error', 'safe'],                                          // вместо 'never' (CJS)
'camelcase': ['error', { properties: 'never', ignoreGlobals: true, ignoreImports: true }],
'no-unneeded-ternary': ['error', { defaultAssignment: true }],        // не конфликтует с ?? / ||
'prefer-destructuring': ['error', {
  VariableDeclarator: { array: false, object: true },
  AssignmentExpression: { array: false, object: false },
}, { enforceForRenamedProperties: false }],
'capitalized-comments': 'off',                                        // или вариант из §4.2
'jsdoc/require-description-complete-sentence': ['warn', { abbreviations: ['etc', 'e.g', 'i.e', 'vs'] }],
'unicorn/name-replacements': ['error', {
  allowList: { attrs: true, env: true, i: true, Props: true, props: true, Var: true, var: true, rel: true },
  replacements: { args: false, ctx: false, env: false, fn: false, params: false, ref: false, refs: false },
  ignore: [String.raw`next-env\.d\.ts$`],
}],
'unicorn/prefer-dom-node-html-methods': ['error', { checkSetHTML: false }],  // setHTML: Safari — нет
'promise/spec-only': ['error', { allowedMethods: ['try'] }],
'no-useless-assignment': 'error',                                     // без условия на react/astro/qwik

settings: { jsdoc: { mode: 'typescript' } },                          // и для JS (C7)
```

```ts
// typescript/index.ts
'typescript/method-signature-style': ['error', 'property'],
'typescript/explicit-member-accessibility': ['error', { accessibility: 'no-public' }],
'typescript/explicit-function-return-type': 'off',                    // остаётся explicit-module-boundary-types
'typescript/class-methods-use-this': ['error', {
  ignoreOverrideMethods: true,
  ignoreClassesThatImplementAnInterface: 'public-fields',
}],
'typescript/no-misused-promises': ['error', { checksVoidReturn: { attributes: false } }],
'typescript/strict-void-return': 'off',                               // либо оно, либо исключение выше
'typescript/restrict-template-expressions': ['error', { allowNullish: false }], // ловит "undefined" в UI-строках
'typescript/no-floating-promises': ['error', { checkThenables: true, ignoreIIFE: true, ignoreVoid: true }],
'typescript/prefer-destructuring': [/* как core выше */],

// core-правила, которые дублирует компилятор (eslint-recommended из typescript-eslint):
'no-redeclare': 'off', 'no-throw-literal': 'off', 'prefer-promise-reject-errors': 'off',
'constructor-super': 'off', 'getter-return': 'off', 'no-class-assign': 'off', 'no-const-assign': 'off',
'no-dupe-args': 'off', 'no-dupe-keys': 'off', 'no-func-assign': 'off', 'no-import-assign': 'off',
'no-new-native-nonconstructor': 'off', 'no-obj-calls': 'off', 'no-setter-return': 'off',
'no-this-before-super': 'off', 'no-unreachable': 'off', 'no-unsafe-negation': 'off', 'no-with': 'off',
'unicorn/no-invalid-argument-count': 'off', 'unicorn/no-undeclared-class-members': 'off',
'unicorn/prefer-includes-over-repeated-comparisons': 'off',          // narrowing (§4.12)
'jsdoc/require-param': 'off', 'jsdoc/require-returns': 'off',         // типы уже в сигнатуре
```

```ts
// vitest/index.ts
files: ['**/*.{test,spec}.{js,cjs,mjs,ts,cts,mts,jsx,tsx}', '**/{test,tests,__tests__}/**/*.{js,cjs,mjs,ts,cts,mts,jsx,tsx}'],
'vitest/prefer-to-be-falsy': 'off',
'vitest/prefer-to-be-truthy': 'off',
'vitest/prefer-called-with': 'off',
'vitest/prefer-strict-boolean-matchers': 'error',
'vitest/expect-expect': 'error',
```

```ts
// perfectionist/index.ts
settings: { perfectionist: { type: 'line-length', order: 'desc', partitionByNewLine: true } },
'perfectionist/sort-decorators': 'off',
'perfectionist/sort-sets': 'off',
'perfectionist/sort-maps': 'off',
'perfectionist/sort-objects': ['error', { type: 'natural', order: 'asc' }],      // опционально (§4.15)
'perfectionist/sort-interfaces': ['error', { type: 'natural', order: 'asc' }],   // опционально
```

```ts
// react/index.ts
settings: { 'react-x': { version: 'detect' } },   // вместо мёртвого settings.react
```

```ts
// vue/index.ts
'vue/no-undef-components': ['error', { ignorePatterns: [String.raw`^router-(link|view)$`, '^nuxt-', '^client-only$'] }],
'vue/require-default-prop': config.typescript ? 'off' : 'error',
```

**Практический эффект:**

- исчезают все доказанные «тупики» (C1–C7), то есть места, где корректный код
  невозможно написать без `eslint-disable`;
- уходит около 20 дублирующих сообщений на типичный файл;
- type safety интерфейсов восстанавливается;
- тесты перестают молча ослабляться.

Строгость в части корректности не снижается.

---

## 7. MISSING HIGH-VALUE RULES

Все предложенные правила существуют в **установленных** версиях плагинов
[VERIFIED: `appendix-b-unconfigured.md`]. Новых зависимостей ни одна
рекомендация первого и второго уровня не требует.

### 7.1 Essential (корректность)

| Правило                                                                                                              | Проблема                                                                                                                                                 | Пример                                                        | Конфиг                                                                                     | Почему не дубликат                            | Минусы                              | Увер. / приоритет |
| -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------- | ----------------------------------- | ----------------- |
| `react-x/no-missing-key`                                                                                             | список без `key`: потеря state, лишние ремаунты                                                                                                          | `items.map(i => <li>{i}</li>)` — сейчас **молчит** [VERIFIED] | `'error'`                                                                                  | `qwik/jsx-key` действует только при Qwik      | нет                                 | выс. / P1         |
| `react-x/no-leaked-conditional-rendering` (typed)                                                                    | `{count && <X/>}` рендерит `0` (а в React Native — crash)                                                                                                | сейчас молчит, правило находит [VERIFIED]                     | `'error'`                                                                                  | ничем не покрыто                              | нужен type info (есть)              | выс. / P1         |
| `vitest/expect-expect`                                                                                               | тест без assertions всегда зелёный                                                                                                                       | `it('…', () => { fn() })` — молчит [VERIFIED]                 | `['error', { assertFunctionNames: ['expect', 'expectTypeOf', 'assert*'] }]`                | —                                             | хелперы-ассерты надо перечислить    | выс. / P1         |
| `typescript/switch-exhaustiveness-check`                                                                             | новый член union незаметно проваливается в `default` или игнорируется                                                                                    | `switch (shape.kind)` без нового `case`                       | `['error', { considerDefaultExhaustiveForUnions: true }]`                                  | TS этого не делает без `never`-трюка          | typed (есть)                        | выс. / P1         |
| `typescript/no-deprecated`                                                                                           | использование `@deprecated` API (Node, React, свои)                                                                                                      | `ReactDOM.render`, `url.parse`                                | `'error'`                                                                                  | `node/no-deprecated-api` — только Node core   | ~2–4 % времени typed-линта [LIKELY] | выс. / P1         |
| `typescript/ban-ts-comment`                                                                                          | сейчас `@ts-ignore` разрешён без ограничений                                                                                                             | `// @ts-ignore`                                               | `['error', { 'ts-expect-error': 'allow-with-description', minimumDescriptionLength: 10 }]` | —                                             | —                                   | выс. / P1         |
| `typescript/return-await`                                                                                            | `return promise` внутри `try` — `catch` не сработает                                                                                                     | `try { return fetchX() } catch {}`                            | `['error', 'error-handling-correctness-only']`                                             | —                                             | —                                   | выс. / P1         |
| `typescript/no-unsafe-enum-comparison`, `no-redundant-type-constituents`                                             | рекомендованные typescript-eslint, пропущены                                                                                                             | `type T = string \| 'a'`                                      | `'error'`                                                                                  | —                                             | —                                   | выс. / P2         |
| `import/no-duplicates`                                                                                               | два импорта из одного модуля не сливаются [VERIFIED]                                                                                                     | `import {a} from './x'` ×2                                    | `'error'` (совместим с `prefer-top-level` type imports)                                    | perfectionist не сливает                      | —                                   | выс. / P2         |
| `regexp/no-misleading-unicode-character`, `regexp/no-extra-lookaround-assertions`                                    | рекомендованные regexp, пропущены. `no-misleading-character-class` (core) тоже выключен, так что `/[👍🏻]/u` и ZWJ-последовательности не проверяются вовсе | `/^[❇️]$/u`                                                   | `'error'`                                                                                  | —                                             | —                                   | выс. / P2         |
| `node/no-extraneous-import`                                                                                          | вы проверяете `require` на undeclared deps, но не `import` — асимметрия                                                                                  | `import x from 'not-in-deps'`                                 | `'error'`                                                                                  | `node/no-extraneous-require` — только CJS     | монорепо: нужен `resolvePaths`      | выс. / P2         |
| `jsx-a11y/click-events-have-key-events`, `control-has-associated-label`, `no-distracting-elements` (+ astro-аналоги) | входят в recommended jsx-a11y, пропущены                                                                                                                 | `<div onClick>` без клавиатуры                                | `'error'`                                                                                  | `no-static-element-interactions` ловит не всё | —                                   | выс. / P2         |
| `astro/no-set-html-directive`                                                                                        | `set:html` = XSS. В Vue (`no-v-html`) и Svelte (`no-at-html-tags`) аналог включён, в Astro — нет                                                         | `<div set:html={userInput}/>`                                 | `'error'`                                                                                  | —                                             | —                                   | выс. / P2         |

### 7.2 High-value maintainability и корректность (unicorn и sonarjs, которые у вас **не** подключены)

Правила unicorn ниже помечены в самом плагине как `recommended` и имеют
`type: problem`. Я проверил их существование и описания, но **не** измерял
частоту false positives. Перед включением прогоните их на своих проектах.

| Правило                                                                                      | Что ловит                                                                                              |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| `unicorn/no-thenable`                                                                        | объект с `then` случайно становится thenable (`await obj` зависает)                                    |
| `unicorn/no-accessor-recursion`                                                              | `get x() { return this.x }` — бесконечная рекурсия                                                     |
| `unicorn/no-invalid-well-known-symbol-methods`                                               | неверные `[Symbol.iterator]` и `[Symbol.toPrimitive]`                                                  |
| `unicorn/no-uncalled-method`                                                                 | `if (user.isAdmin)` вместо `user.isAdmin()`                                                            |
| `unicorn/no-mismatched-map-key`                                                              | `if (map.has(a)) map.get(b)`                                                                           |
| `unicorn/no-incorrect-template-string-interpolation`                                         | `'Hello ${name}'` в обычных кавычках (`no-template-curly-in-string` есть, это расширение)              |
| `unicorn/no-constant-zero-expression`, `no-useless-compound-assignment`                      | `x * 0`, `x += 0`                                                                                      |
| `unicorn/require-proxy-trap-boolean-return`                                                  | `set`-trap без `return true` → TypeError в strict mode                                                 |
| `unicorn/no-optional-chaining-on-undeclared-variable`                                        | `foo?.bar` при необъявленном `foo` — всё равно ReferenceError                                          |
| `unicorn/require-post-message-target-origin`                                                 | `postMessage(data)` без `targetOrigin` (безопасность)                                                  |
| `sonarjs/no-element-overwrite`, `no-empty-collection`, `no-unused-collection`                | перезапись `arr[i]` подряд, чтение пустой коллекции, коллекция только пишется                          |
| `sonarjs/no-use-of-empty-return-value`, `no-invariant-returns`, `no-all-duplicated-branches` | использование результата `void`-функции, функция всегда возвращает одно значение, все ветки одинаковые |
| `sonarjs/no-try-promise` (typed), `no-in-misuse` (typed)                                     | `try` вокруг неawait-нутого промиса; `'x' in array`                                                    |
| `sonarjs/no-incompatible-assertion-types`, `no-same-argument-assert` (тесты)                 | `expect(1).toBe('1')`, `expect(a).toBe(a)`                                                             |
| `typescript/unbound-method` (typed) + `vitest/unbound-method` в тестах                       | `const { log } = console` → потеря `this`                                                              |
| `typescript/no-misused-spread`                                                               | spread строки в массив, промиса в объект                                                               |
| `typescript/consistent-type-assertions`                                                      | `{} as User` — ложь компилятору                                                                        | `{ assertionStyle: 'as', objectLiteralTypeAssertions: 'allow-as-parameter' }` |

**Конфигурация конфига:**

```ts
linterOptions: { reportUnusedDisableDirectives: 'error', reportUnusedInlineConfigs: 'error' }
```

Сейчас стоит ESLint-дефолт `warn`. При политике «всё — error» это единственное
место, где мёртвые `eslint-disable` не ломают CI.

### 7.3 Useful opinionated

- `eslint-comments/require-description`: каждый `eslint-disable` с причиной.
- `unicorn/consistent-function-scoping`: выносит функции, не захватывающие
  scope.
- `vue/eqeqeq`, `vue/no-constant-condition`, `vue/no-useless-concat`,
  `vue/prefer-template`, `vue/dot-notation`, `vue/object-shorthand`,
  `vue/no-sparse-arrays`, `vue/no-loss-of-precision`: core-правила для выражений
  в шаблонах. Сейчас `v-if="title == 'x'"` проходит, хотя в `<script>` `eqeqeq`
  строг [VERIFIED].
- `sonarjs/cognitive-complexity` как **warn** (порог 15). Единственная метрика
  сложности, которая коррелирует с реальной читаемостью.
- `@eslint/json` и `@eslint/markdown` (новая зависимость): README предлагает
  линтить `**/*.json`, но конфиг знает только `package.json`.

### 7.4 Экспериментальное

- `typescript/strict-boolean-expressions`: дорогое по трению; только как opt-in.
- `typescript/no-unsafe-type-assertion`: шумно, но ловит `as` поверх `unknown`.
- `unicorn/no-top-level-side-effects`: полезно для библиотек с
  `sideEffects: false`.

### 7.5 Не стоит вводить

- `no-magic-numbers`: шум. `unicorn/no-null` и `no-array-reduce`: вкусовщина,
  противоречит вашему стилю.
- `typescript/prefer-readonly-parameter-types`: неприменимо на практике.
- `import/no-cycle`: в `import-lite` его нет. Добавлять ради него тяжёлый
  `import-x` — дорого (полный resolver на каждый файл).
- `complexity`, `max-lines`, `max-statements`: менее точны, чем cognitive
  complexity.
- `unicorn/prefer-queue-microtask`: автофикс `setTimeout(fn, 0)` →
  `queueMicrotask(fn)` меняет macrotask на microtask, то есть семантику
  планирования [LIKELY].
- `unicorn/prefer-temporal`: даже там, где Temporal поддерживается (Node 26),
  это смена парадигмы, а не замена API. Автофикс `Date` → `Temporal` опасен.

---

## 8. FRAMEWORK-SPECIFIC FINDINGS

### 8.1 TypeScript

**Сильные стороны:**

- project service (`projectService: true`) — правильный современный выбор;
- typed-правила строго ограничены TS-файлами;
- полный набор `no-unsafe-*`, `no-floating-promises` с `checkThenables`,
  `no-unnecessary-condition`, `consistent-type-imports/exports`,
  `no-import-type-side-effects`.

**Проблемы:**

1. **`tsconfigRootDir: process.cwd()`** (`typescript/index.ts:60`, а также в
   astro, svelte, vue). Если ESLint запущен не из корня
   (`cd src && npx eslint a.ts`, IDE с другим `workingDirectory`, lint-staged в
   монорепо), typed-линтинг падает с
   `Parsing error: … was not found by the project service` на **каждом** файле
   [VERIFIED]. ESLint 10 ищет конфиг от файла, а `process.cwd()` захвачен при
   создании конфига.
2. **Нет `allowDefaultProject`.** Файлы вне `tsconfig.include` (корневые
   `vite.config.ts`, `eslint.config.ts`) дают parsing error [VERIFIED].
3. `method-signature-style: 'method'` (§4.4) и `no-redeclare` (§3.4) — главные
   ошибки модуля.
4. **Пропущены:** `switch-exhaustiveness-check`, `no-deprecated`,
   `ban-ts-comment`, `return-await`, `no-unsafe-enum-comparison`,
   `no-redundant-type-constituents`, `unbound-method`, `no-misused-spread`,
   `consistent-type-assertions` (§7).
5. Правила, поощряющие лишние аннотации: `explicit-function-return-type` поверх
   `explicit-module-boundary-types` (§4.16).
6. `consistent-type-definitions` (interface) рядом с
   `slop/no-trivial-type-aliases` и `consistent-indexed-object-style: record`:
   согласованно, вопросов нет.
7. `typescript/naming-convention` настроен минимально (import и typeLike) —
   разумно. Стоит добавить
   `{ selector: 'objectLiteralProperty', modifiers: ['requiresQuotes'], format: null }`,
   если переходите от `camelcase` к naming-convention.
8. Миграция astro на `project` вместо `projectService` (`astro/index.ts:41-43`)
   обоснована проблемами парсера, но
   `project: path.join(process.cwd(), 'tsconfig.json')` наследует проблему cwd и
   не работает с project references.

**Рекомендация по typed-линтингу:**

```ts
parserOptions: {
  projectService: { allowDefaultProject: ['*.js', '*.mjs', '*.cjs', '*.config.ts', '*.config.mts'] },
  tsconfigRootDir: options.tsconfigRootDir ?? process.cwd(), // новая опция; в README: import.meta.dirname
}
```

### 8.2 React

**Состояние [VERIFIED]:** модуль в v2.99.0 неработоспособен (P0-1, P0-2, P0-3).

**Архитектурные проблемы:**

- **Три источника compiler-правил:** `react-compiler` (последний релиз
  19.1.0-rc.2, август 2025; README `react-hooks@7` включает compiler-правила в
  `recommended`), `react-hooks` (используются только `rules-of-hooks` и
  `exhaustive-deps`) и `react-x` (`immutability`, `set-state-in-effect`,
  `use-memo`). Одна ошибка даёт 2–3 сообщения [VERIFIED].
- **`react-perf` устарел** (§4.6).
- **Пропущены базовые correctness-правила:** `react-x/no-missing-key`,
  `no-leaked-conditional-rendering` (оба [VERIFIED] ловят баги),
  `no-direct-mutation-state`, `no-unstable-default-props`,
  `no-unsafe-component-will-mount` и `no-unsafe-component-will-receive-props`
  (включено только `…-will-update` — непоследовательно), `no-forward-ref`,
  `no-context-provider` (React 19), `no-children-prop` (`react-jsx`),
  `no-comment-textnodes`, `no-leaked-semicolon`.
- `react-x/no-use-context` и `react-dom/no-use-form-state` предполагают
  React 19. Без проверки версии React 18-проекты получают невыполнимые
  требования. Решение — `settings['react-x'].version: 'detect'`; правила с
  проверкой версии, такие как `no-forward-ref`, учитывают её [DOCUMENTED].
- `settings.react` мёртвый (§2.4).

**Рекомендуемая структура:**

1. Удалить `react-compiler` и `react-perf`.
2. Взять compiler-правила из **одного** источника. Предлагаю `react-hooks`
   (официальный, синхронизирован с компилятором), его `configs.recommended` — 16
   правил [VERIFIED]: `rules-of-hooks`, `exhaustive-deps`, `purity`, `refs`,
   `immutability`, `set-state-in-effect`, `set-state-in-render`,
   `static-components`, `use-memo`, `globals`, `error-boundaries`,
   `unsupported-syntax`, `incompatible-library`, `preserve-manual-memoization`,
   `config`, `gating`.
3. Из `react-x` оставить то, чего нет в react-hooks: `no-missing-key`,
   `no-leaked-conditional-rendering`, `no-duplicate-key`,
   `no-nested-component-definitions`, `no-array-index-key`,
   `no-unstable-context-value`, `no-unstable-default-props`, `no-unused-props`,
   `no-access-state-in-setstate`, `no-direct-mutation-state`,
   `no-class-component`, deprecated lifecycle-правила, `use-state`.
4. Убрать `react-x/immutability`, `set-state-in-effect`, `use-memo` (дубли).

### 8.3 Vue

**Сильные стороны:**

- полный набор deprecated-правил Vue 3;
- `no-ref-object-reactivity-loss`, `no-setup-props-reactivity-loss`;
- `require-explicit-slots`, `require-typed-ref`;
- `no-undef-properties`;
- парсер и TS-парсер подключены верно [VERIFIED: `.vue` с
  `<script setup lang="ts">` линтится].

**Проблемы [VERIFIED]:**

- `vue/no-undef-components` помечает `<router-link>`, то есть ложные
  срабатывания в каждом приложении с Vue Router; в Nuxt с auto-import — ещё
  больше [LIKELY].
- `vue/require-default-prop` в TS + destructure.
- Выражения в шаблоне не проверяются core-правилами (`==` проходит).

**Спорное:**

- `component-name-in-template-casing: kebab-case` и
  `component-definition-name-casing: kebab-case` противоречат официальному style
  guide (PascalCase в SFC). Это ваш выбор, но его стоит задокументировать.
- `vue/require-name-property` с `<script setup>` не срабатывает [VERIFIED], ок.

**Пропущены:**

- из recommended/essential: `vue/no-arrow-functions-in-watch`,
  `vue/no-import-compiler-macros`, `vue/no-unused-refs`,
  `vue/no-deprecated-model-definition` (включено),
  `vue/multi-word-component-names` (опционально);
- extension-правила для шаблона (§7.3).

### 8.4 Svelte

**Сильные стороны:**

- парсер, TS-интеграция и процессор работают (`.svelte` с runes — 0 ложных
  срабатываний [VERIFIED]);
- security-правила: `no-at-html-tags`, `no-target-blank`;
- runes-правила: `prefer-writable-derived`, `prefer-svelte-reactivity`.

**Проблемы:**

- **Пропущено 12 рекомендованных правил плагина** [DOCUMENTED, meta
  `recommended: true`]: `no-not-function-handler`, `no-reactive-reassign`,
  `no-store-async`, `no-unused-props`, `no-unnecessary-state-wrap`,
  `no-useless-children-snippet`, `valid-prop-names-in-kit-pages`,
  `no-export-load-in-svelte-module-in-kit-pages`,
  `no-navigation-without-resolve`, `no-raw-special-elements`,
  `no-reactive-literals`, `require-event-dispatcher-types`.
- `unicorn/prefer-add-event-listener` конфликтует с
  `svelte/no-add-event-listener` (C8).
- `svelte/valid-compile` не включён. Это спорно: оно дублирует компилятор, но
  ловит предупреждения компилятора в CI.

### 8.5 Astro

- **Клиентские `<script>` вообще не линтятся** [VERIFIED: `var`,
  `eval(location.search)` и `innerHTML = location.hash` — 0 ошибок]. Нужен
  `processor: 'astro/client-side-ts'` (или
  `astroPlugin.processors['client-side-ts']`) плюс конфиг для виртуальных файлов
  `**/*.astro/*.ts`.
- `astro/no-set-html-directive` не включён, хотя аналоги в Vue и Svelte включены
  (§7.1).
- `astro/no-unsafe-inline-scripts`, `astro/no-prerender-export-outside-pages`
  (recommended) пропущены.
- `typescript/no-unsafe-assignment` выключается **во всех файлах**, если включён
  Astro (`typescript/index.ts:373-375`), а не только в `*.astro`. Ради одного
  issue в парсере проект теряет правило в обычных `.ts`.
- `no-useless-assignment` во frontmatter работает корректно [VERIFIED],
  глобальное выключение устарело.
- `eslint-plugin-astro@3.2.1` требует Node `^22.22.3 || ^24.16.0 || >=26.3.0`,
  хотя это хард-зависимость даже для проектов без Astro (§9).

### 8.6 Qwik

- Без TypeScript: `.jsx` не парсится (P0-3) [VERIFIED].
- `qwik/valid-lexical-scope` требует type info. В JS-режиме, даже после
  исправления парсинга, оно упадёт или будет no-op [LIKELY].
- Зависимость `eslint-plugin-qwik@2.0.0-beta.21` закреплена точно, при том что
  stable — 1.20.2 [VERIFIED npm]. Qwik 1-проекты получают правила для v2-beta;
  peer `eslint ^8.57 || ^9` даёт warning [VERIFIED].
- Пропущены `qwik/jsx-no-script-url` (recommended `error`),
  `qwik/scope-use-task` (recommended).
- Совместное включение с React даёт конфликт C9.
- `jsx-a11y` для Qwik работает плохо: обработчики `onClick$` не распознаются как
  интерактивные [LIKELY].
- Зрелость: низкая; для Qwik-модуля стоит пометить «experimental» в README.

### 8.7 Vitest

**Сильные стороны:** `no-focused-tests`, `no-disabled-tests`,
`no-identical-title`, `valid-expect`, `valid-expect-in-promise`,
`no-standalone-expect`, `prefer-hooks-on-top`.

**Проблемы:**

- **Небезопасные фиксы** (§4.1).
- **`files` слишком узкие:** `test/nested/*.ts`, `*.spec.ts` и `__tests__/` —
  без vitest-правил [VERIFIED].
- **Пропущены:** `expect-expect`, `valid-title`,
  `no-unneeded-async-expect-function`, `require-awaited-expect-poll`,
  `hoisted-apis-on-top`, `unbound-method` (typed),
  `require-mock-type-parameters`, `prefer-strict-boolean-matchers`.
- Нет ослаблений для тестов. Это скорее сила: тесты — тоже код. Но `max-params`,
  `sonarjs/no-identical-functions` и `id-length` в тестах часто мешают. Минимум
  — `sonarjs/no-identical-functions: off` в тестах (повторяющиеся фабрики
  фикстур) [LIKELY].
- Опинионированность (`require-top-level-describe`, `prefer-lowercase-title`,
  `consistent-test-it: it`, `no-conditional-in-test`, `prefer-expect-resolves`,
  `warn-todo` как error) — приемлема, это ваш стиль.

### 8.8 Node.js

- Хорошо: `no-deprecated-api`, `prefer-node-protocol`, `prefer-global/*`,
  `process-exit-as-throw`, `hashbang`.
- Асимметрия: есть `no-extraneous-require`, нет `no-extraneous-import`
  [VERIFIED].
- Пропущено `no-unsupported-features/node-builtins`. В связке с гейтингом
  (§14.1) стоит передавать вычисленную версию в `settings.node.version`.
- `node/handle-callback-err`: legacy callback-стиль, для современного кода почти
  бесполезно, но безвредно.
- **Глобальные переменные:** `core` **всегда** добавляет `globals.browser` и
  `globals.node` (`core/index.ts:62-64`). `no-undef` в JS не поймает `process` в
  браузерном коде и `window` в Node-коде, а опция `node` на глобалы не влияет
  [VERIFIED code].

### 8.9 Package JSON

- Хорошо: `valid-*` для ключевых полей, `no-redundant-files`,
  `specify-peers-locally`, `depend/ban-dependencies`.
- **Непоследовательная выборка:** валидируются `author`, `description`,
  `keywords`, но **не** `exports`, `engines`, `type`, `repository`,
  `peerDependencies`, `sideEffects`, `workspaces`, `bugs`, `main`,
  `packageManager`. Все они есть в `recommended` плагина [DOCUMENTED].
- `require-author`, `require-engines`, `require-description` (по умолчанию
  `ignorePrivate: false`) требуют поля и у приватных приложений. Для
  монорепо-корней и приложений это шум [DOCUMENTED, schema].
- `order-properties: sort-package-json` + `sort-collections` совместимы с npm и
  pnpm, конфликтов нет.

**Рекомендация:** взять `packageJson.configs.recommended` как базу и добавить
ваши стилевые правила поверх. Это меньше кода и автоматически подхватывает новые
`valid-*`.

### 8.10 Accessibility (JSX и Astro)

- Хорошо: 32 правила, включая `no-noninteractive-element-interactions` (поймал
  `<li onClick>` [VERIFIED]).
- Пропущены `click-events-have-key-events`, `control-has-associated-label`,
  `no-distracting-elements`, `anchor-ambiguous-text` (последнее опционально).
- `no-autofocus` без `ignoreNonDOM: true` срабатывает и на кастомных
  компонентах. Это стоит настроить [DOCUMENTED].

### 8.11 Perfectionist

- Сильная сторона — консистентность импортов и union-типов.
- Слабые: семантические сортировки (§4.3) и data-dependent порядок (§4.15).
- `sort-variable-declarations` при `one-var: { initialized: 'never' }`
  применяется только к `let a, b` без инициализации — почти мёртвое правило.
- `sort-array-includes` + `unicorn/prefer-includes-over-repeated-comparisons`
  согласованы.
- Не подключены `sort-import-attributes`, `sort-export-attributes` (recommended
  в 5.x) [DOCUMENTED].
- Стоимость: `sort-objects`, `sort-modules` и `sort-union-types` — 2.9 с из 38
  на корпусе.

---

## 9. PERFORMANCE AND DEPENDENCIES

### 9.1 Бенчмарк [VERIFIED]

Корпус — `zod@3.25.76/src`: 241 файл, около 53k строк, один процесс, Node 22,
`{ typescript, perfectionist, node }`.

| Режим                       |      Всего | Парсинг + project service | Время правил |     RSS | Сообщений |
| --------------------------- | ---------: | ------------------------: | -----------: | ------: | --------: |
| только `no-debugger` (база) |  **6.1 с** |                     4.3 с |           ~0 |  977 MB |         — |
| все правила                 | **53.9 с** |                     4.3 с |       38.1 с | 1.46 GB |    62 818 |
| без type-aware правил       | **36.6 с** |                     4.0 с |       23.7 с | 1.49 GB |    20 098 |

**Время правил по плагинам (полный режим):**

| Плагин        |  Время | Плагин    |          Время |
| ------------- | -----: | --------- | -------------: |
| typescript    | 12.9 с | regexp    |          0.8 с |
| unicorn       | 10.5 с | promise   |          0.3 с |
| jsdoc         |  4.6 с | node      |          0.3 с |
| perfectionist |  4.0 с | остальные | < 0.1 с каждый |
| core          |  2.9 с |           |                |
| sonarjs       |  1.7 с |           |                |

- **Самые дорогие правила:** `typescript/no-unsafe-assignment` 1.7 с,
  `no-floating-promises` 1.4 с, `no-unsafe-argument` 1.2 с,
  `perfectionist/sort-objects` 1.1 с, `perfectionist/sort-modules` 1.0 с,
  `typescript/strict-void-return` 0.96 с, `jsdoc/check-access` 0.6 с,
  `sonarjs/arguments-order` 0.56 с, `regexp/confusing-quantifier` 0.55 с,
  `unicorn/no-invalid-argument-count` 0.38 с.
- **Загрузка конфига:** статические импорты core-плагинов — около 1.7 с и 220 MB
  RSS даже для `{}`; со всеми опциями — ещё около 1.7 с. По отдельности: astro
  1.08 с, unicorn 0.73 с, typescript-eslint 0.72 с, sonarjs 0.59 с, react-x 0.58
  с, svelte 0.46 с, n 0.41 с, react-compiler 0.34 с.
- **Установка у потребителя (npm, только `eslint@10` + конфиг):** **402 пакета,
  172 MB** `node_modules`, ERESOLVE-warnings от `eslint-plugin-qwik` и
  `eslint-plugin-react-perf` [VERIFIED].

### 9.2 Выводы (числа — измерения, интерпретация — моя)

1. **Типизированный линт стоит около 17 с из 54**, и стоит своих денег: он даёт
   основную ценность (`no-floating-promises`, `no-unsafe-*`). Экономить на нём
   не нужно. Нужно лишь убрать `strict-void-return` (≈ 1 с, конфликт C3).
2. **unicorn — второй по стоимости (около 10 с):** 247 правил, каждое —
   отдельный визитёр. Удаление 10–15 дублей и мёртвых в TS правил (§3, §12) даст
   1–1.5 с. Остальное — честная цена ценности.
3. **jsdoc — около 4.6 с на кодовой базе почти без JSDoc.** Каждое из 47 правил
   заново обходит комментарии. В TS-режиме не меньше восьми правил
   гарантированно no-op: `ts-*`, `require-template-description`,
   `check-template-names`, `no-undefined-types` (off), `require-*-type`.
   Сокращение до ~25 осмысленных правил даст около 2 с [LIKELY].
4. **SonarJS:** 0.59 с загрузки, 13 MB пакет, 1.7 с работы ради 22 правил, из
   которых 8 — дубли. Либо курировать: убрать дубли и добавить bug-detectors
   (§7.2) — тогда плагин оправдан. Либо удалить полностью и потерять около 6
   уникальных правил (`no-identical-functions`, `arguments-order`,
   `reduce-initial-value`, `prefer-immediate-return`, `no-collapsible-if`,
   `for-in`). Рекомендую курировать.
5. **Хард-зависимости всех фреймворков:** потребитель «чистого TS» ставит Vue,
   Svelte, Astro, Qwik, React-плагины и парсеры. Ключевой эффект не в размере, а
   в **требованиях к Node**: `eslint-plugin-astro` диктует
   `^22.22.3 || ^24.16.0` всем. Альтернатива — `peerDependenciesMeta.optional`
   для фреймворк-плагинов с понятной ошибкой «установите `eslint-plugin-vue`»
   (так делает `@antfu/eslint-config`). Минус — хуже DX установки. Решение за
   вами; при сохранении хард-зависимостей обязательно исправить `engines`.
6. **Обслуживание плагинов:**

   | Плагин                         | Статус                                   |
   | ------------------------------ | ---------------------------------------- |
   | `eslint-plugin-react-compiler` | заменён react-hooks 7                    |
   | `eslint-plugin-react-perf`     | не обновлялся с 2024, peer до ESLint 9   |
   | `eslint-plugin-qwik`           | beta                                     |
   | `eslint-plugin-prefer-let`     | обновлён в 2026, без peer eslint         |
   | `eslint-plugin-slop`           | 0.1.x — молодой, правила будут меняться  |
   | `eslint-plugin-promise`        | отстаёт (`Promise.try` = «non-standard») |

   Остальные активно поддерживаются.

7. **`--concurrency auto`:** typed-линт в каждом worker'е создаёт свой
   TS-проект. RSS около 1.5 GB на процесс означает, что на 8 ядрах легко
   получить 8+ GB. Для CI стоит документировать `--concurrency 4` [LIKELY].

---

## 10. CONFIGURATION ARCHITECTURE

### 10.1 Слабости дизайна

1. **Нет тестов конфигурации — корневая причина всех P0.** CI запускает
   `eslint .` на собственном коде, где нет JSX, Vue, Svelte и Astro. ESLint
   валидирует правила только для реально линтуемых файлов, поэтому 19
   несуществующих правил прошли незамеченными [VERIFIED]. Минимальный тест,
   который поймал бы это:

   ```ts
   // test/smoke.test.ts (vitest)
   import { ESLint } from 'eslint'
   import createConfig from '../index'

   const ALL = {
     perfectionist: true,
     typescript: true,
     svelte: true,
     vitest: true,
     astro: true,
     react: true,
     qwik: true,
     node: true,
     vue: true,
   }
   const FILES = [
     'a.js',
     'a.cjs',
     'a.ts',
     'a.tsx',
     'a.jsx',
     'a.test.ts',
     'a.vue',
     'a.svelte',
     'a.astro',
     'package.json',
   ]

   for (const options of [
     {},
     { typescript: true },
     { react: true },
     { react: true, typescript: true },
     ALL,
   ]) {
     it(`resolves ${JSON.stringify(options)}`, async () => {
       let eslint = new ESLint({
         overrideConfigFile: true,
         overrideConfig: await createConfig(options),
         cwd: fixtureDir,
       })
       for (let file of FILES) {
         await eslint.calculateConfigForFile(file)
       } // бросает на несуществующих правилах
       let results = await eslint.lintFiles(['fixtures/**/*']) // ловит parse errors (.jsx без TS)
       expect(results.flatMap(r => r.messages).filter(m => m.fatal)).toEqual([])
     })
   }
   ```

   Плюс тест «`--fix` идемпотентен и не меняет снапшот». Плюс `npm pack` →
   установка в чистый каталог через npm **и** pnpm (это поймало бы P0-2).

2. **`engines` и `peerDependencies` не соответствуют зависимостям**
   (`package.json:111-116`). Реальный минимум: `node: "^22.22.3 || >=24.16.0"`,
   `eslint: ">=10.4.0"` (unicorn 77) [VERIFIED].
3. **Глобальные side effects в shareable config:**
   - `benchmark/**/*` игнорируется у **всех** потребителей (`index.ts:113-121`):
     проект с реальным кодом в `benchmark/` молча не линтится;
   - `nanostores` в `no-floating-promises`;
   - browser- и node-глобалы всегда.

   Персональные потребности автора стоит переносить в собственный
   `eslint.config.ts` репозитория через `extends`.

4. **`tsconfigRootDir: process.cwd()`** в четырёх местах (§8.1).
5. **API `extends`:**
   - пример в README (`readme.md:126-134`, `extends: [{ 'no-undef': 'off' }]`)
     падает с `ConfigError: Unexpected key "no-undef"` [VERIFIED];
   - название конфликтует с понятием `extends` из `defineConfig` ESLint 9.22+;
   - инжекция **всех** плагинов в пользовательский объект (`index.ts:91-104`)
     сломается с `Cannot redefine plugin`, если пользователь передаст свою
     версию плагина [LIKELY].

   Альтернатива: документировать стандартную композицию
   `[...await config(), { rules }]` и оставить `extends` как sugar.

6. **Фреймворки не изолированы по путям.** `react` и `qwik` (как и `vue`)
   применяются ко всем файлам своего расширения. Монорепо «React-приложение +
   Qwik-приложение» невозможно без конфликтов (C9). Предложение:
   `react: true | { files: string[] }`.
7. **Дублирование `files`-логики:** core, node, perfectionist и typescript
   содержат один и тот же построитель globs. Вынести в `getSourceFiles(config)`.
8. **Пустые объекты `{}`** для выключенных модулей попадают в итоговый массив.
   Безвредно, но засоряет config-inspector; стоит фильтровать.
9. **Legacy-форма** `parserOptions.ecmaVersion/sourceType` вместо
   `languageOptions.*` — косметика.
10. **Нет ни одного `warn`.** Для опинионированного конфига это решение, но оно
    лишает потребителя градации «баг» и «стиль». Вариант: `error` для
    `type: problem`, `warn` для части `type: suggestion` без автофикса. Или
    опция `severity: 'strict' | 'balanced'`.
11. **README устарел:** список плагинов упоминает `@eslint/js` (не используется)
    и `eslint-plugin-import-x` (используется `import-lite`) [VERIFIED].

### 10.2 Что в архитектуре хорошо

- Ленивые импорты фреймворков и `Promise.all`.
- Один объект на модуль с понятным `name`.
- Корректный порядок для парсеров: typescript до vue, svelte, astro.
- `defineConfig`, `eslint-config-flat-gitignore`.
- Сборка через Vite с `preserveModules` — tree-shaking по модулям.
- Хорошие типы `ConfigOptions`.

### 10.3 Предлагаемые улучшения (только решающие реальные проблемы)

1. Smoke-тесты и тест упаковки (P0).
2. Опции `tsconfigRootDir` и `targets` (§14.1).
3. Перенос персональных настроек в собственный конфиг репозитория.
4. `files` для фреймворков.
5. Фильтрация пустых объектов и вынос builder'а globs.

### 10.4 Сравнение с экосистемой (идеи, а не копирование)

Источники:

- README `@antfu/eslint-config` (проверен 2026-10-11);
- `eslint-recommended` из установленного typescript-eslint 8.71.1;
- recommended-флаги из метаданных установленных плагинов.

| Аспект             | @antfu/eslint-config                                                            | typescript-eslint presets                              | @azat-io                                                 | Вывод                                                                                                                            |
| ------------------ | ------------------------------------------------------------------------------- | ------------------------------------------------------ | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Фреймворк-плагины  | опциональные peer, «npx eslint should prompt you to install»                    | —                                                      | хард-зависимости (402 пакета)                            | у antfu дешевле установка; у вас проще DX, но дороже `engines`                                                                   |
| Typed-линт         | opt-in через `tsconfigPath`, отдельные `overridesTypeAware`                     | `recommendedTypeChecked` + `disableTypeChecked` для JS | всегда включён для TS, `cwd`-зависимый                   | ваш вариант строже (это хорошо), но нужна опция `tsconfigRootDir`                                                                |
| Редактор           | `isInEditor`: часть фиксов (`unused-imports`, `prefer-const`) non-fixable в IDE | —                                                      | нет                                                      | идея полезна для `perfectionist`, `prefer-let`, `name-replacements` — фиксы, переставляющие и переименовывающие код под курсором |
| Core vs TS         | выключает дублируемые компилятором                                              | `eslint-recommended` выключает 19 core-правил          | выключает 17, но не `no-redeclare` и др.                 | заимствовать список typescript-eslint целиком                                                                                    |
| Типы файлов        | JSON, YAML, TOML, Markdown                                                      | —                                                      | только `package.json`                                    | добавить `@eslint/json` и markdown — опционально                                                                                 |
| Переопределения    | `overrides` на интеграцию, `.override('name')`                                  | —                                                      | глобальный `extends`                                     | стоит добавить `overrides` на модуль                                                                                             |
| Опинионированность | флаг `lessOpinionated`                                                          | —                                                      | нет                                                      | аналог `severity: 'balanced'` снизил бы барьер входа                                                                             |
| React              | `@eslint-react` + `react-refresh`                                               | —                                                      | eslint-react + react-hooks + react-compiler + react-perf | у вас избыточно и частично устарело                                                                                              |

**Где ваш подход лучше:**

1. Покрытие API-misuse (unicorn `no-invalid-*`) и regexp. У antfu заметно меньше
   bug-detectors.
2. Type-aware по умолчанию: ценность выше, чем у opt-in.
3. Явная строгость `no-unsafe-*`.

---

## 11. WHAT SHOULD DEFINITELY STAY

1. **«Invalid-API»-семейство unicorn.** `no-invalid-fetch-options`,
   `no-invalid-intl-options`, `no-invalid-response-options`,
   `no-invalid-url-protocol-comparison`, `no-invalid-dom-token`,
   `no-invalid-style-set-property`, `no-invalid-property-descriptor`,
   `no-invalid-temporal-arithmetic`, `no-invalid-remove-event-listener`,
   `no-late-current-target-access`, `no-late-event-control`,
   `no-prevent-default-in-passive-listener`,
   `no-unsafe-promise-all-settled-values`, `no-loop-iterable-mutation`,
   `no-misrefactored-assignment`, `no-accidental-bitwise-operator`,
   `no-chained-comparison`, `no-xor-as-exponentiation`,
   `no-impossible-length-comparison`, `no-unused-iterator-helper`,
   `no-unsafe-json-serialization`, `no-boolean-sort-comparator`,
   `require-css-escape`, `no-incorrect-query-selector`,
   `no-url-in-search-params`, `no-unsafe-buffer-conversion`,
   `no-array-fill-with-reference-type`. Это самый ценный уникальный актив
   конфига: TS эти ошибки не ловит, а в runtime они реальны.
2. **`eslint-plugin-regexp`** почти целиком, особенно
   `no-super-linear-backtracking`, `no-misleading-capturing-group`,
   `no-useless-assertions`, `no-contradiction-with-assertion`,
   `no-potentially-useless-backreference`, `no-missing-g-flag`,
   `require-unicode-regexp`.
3. **Type-aware ядро:** `no-floating-promises` (`checkThenables: true`),
   `no-misused-promises`, `await-thenable`, `no-unsafe-*`,
   `no-unnecessary-condition`, `only-throw-error`, `restrict-plus-operands`,
   `no-base-to-string`, `require-array-sort-compare`,
   `prefer-nullish-coalescing`, `prefer-optional-chain`,
   `no-unnecessary-type-assertion`, `consistent-type-imports/exports`,
   `no-import-type-side-effects`.
4. **Современные core-правила:** `no-constant-binary-expression`,
   `no-unsafe-optional-chaining`, `no-unassigned-vars`, `preserve-caught-error`,
   `no-template-curly-in-string`, `no-self-compare`,
   `no-unmodified-loop-condition`, `no-unreachable-loop`,
   `no-promise-executor-return`, `use-isnan` (с `enforceForIndexOf`),
   `valid-typeof` (`requireStringLiterals`), `eqeqeq`, `curly: all` (с
   prettier-plugin-curly).
5. **Отказ от мутаций** (`no-array-sort`, `no-array-reverse`, `no-array-splice`
   — только при доступности `toSorted`, §14.1) и `no-for-each` / `no-for-loop`.
   Последовательная, защищаемая философия.
6. **`eslint-comments/*`:** гигиена отключений.
7. **Vue:** deprecated-правила, `no-ref-object-reactivity-loss`,
   `no-setup-props-reactivity-loss`, `no-undef-properties`,
   `require-explicit-slots`, `require-typed-ref`.
8. **Svelte security и runes-правила; Astro deprecated-правила.**
9. **React (после чистки):** `react-dom/*` security-правила
   (`no-dangerously-set-innerhtml`, `no-script-url`, `no-unsafe-target-blank`,
   `no-unsafe-iframe-sandbox`), шесть существующих `react-web-api/no-leaked-*`,
   `react-x/no-nested-component-definitions`, `no-duplicate-key`,
   `no-array-index-key`, `no-unstable-context-value`.
10. **`perfectionist/sort-imports`, `sort-named-imports`, `sort-union-types`:**
    консистентность без семантических рисков.
11. **`func-style: declaration` + `prefer-arrow-callback` +
    `func-names: never`:** согласованная, понятная политика функций.
12. **`depend/ban-dependencies`** и **`package-json/valid-*`**.
13. **Архитектура:** ленивые импорты, typed-правила только для TS, корректный
    порядок парсеров, CI hardening.

---

## 12. WHAT SHOULD BE REMOVED

Приоритет — по эффекту на качество кода.

| #   | Что удалить                                                                                                                                                                                                                                                                                                                                                                             | Почему лучше без него                                           | Что теряется                                        | Чем покрыто                       |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------- | --------------------------------- |
| 1   | 19 несуществующих React-правил                                                                                                                                                                                                                                                                                                                                                          | ESLint падает                                                   | ничего                                              | —                                 |
| 2   | `eslint-plugin-react-compiler`                                                                                                                                                                                                                                                                                                                                                          | заменён `react-hooks@7`, ломает npm-установку (P0-2), дублирует | ничего                                              | `react-hooks` compiler-правила    |
| 3   | `vitest/prefer-to-be-falsy`, `prefer-to-be-truthy`, `prefer-called-with`                                                                                                                                                                                                                                                                                                                | автофикс ослабляет или ломает тесты                             | ничего полезного                                    | `prefer-strict-boolean-matchers`  |
| 4   | `eslint-plugin-react-perf`                                                                                                                                                                                                                                                                                                                                                              | противоречит React и Compiler, шум, peer ≤ ESLint 9             | «оптимизации», которые не измерялись                | `react-x/no-unstable-*`           |
| 5   | `capitalized-comments`                                                                                                                                                                                                                                                                                                                                                                  | ломает директивы инструментов                                   | эстетику комментариев                               | — (или вариант §4.2)              |
| 6   | `perfectionist/sort-decorators`, `sort-maps`, `sort-sets`                                                                                                                                                                                                                                                                                                                               | меняют семантику                                                | порядок в коллекциях                                | —                                 |
| 7   | `slop/no-em-dash`                                                                                                                                                                                                                                                                                                                                                                       | ложные срабатывания в строках (русская типографика)             | —                                                   | `slop/no-jargon` для комментариев |
| 8   | `no-redeclare` в TS (+ 15 правил, дублируемых компилятором)                                                                                                                                                                                                                                                                                                                             | ложные срабатывания на overloads и merging; лишнее время        | ничего: TS2451/TS2300 ловит компилятор              | компилятор                        |
| 9   | `typescript/strict-void-return` (или исключение в `no-misused-promises`)                                                                                                                                                                                                                                                                                                                | взаимное противоречие                                           | value-returning функции в void-позиции (редкий баг) | `no-misused-promises`             |
| 10  | Core-дубли: `no-else-return`, `no-useless-concat`, `prefer-named-capture-group`, `no-invalid-regexp`, `no-empty-character-class`, `no-control-regex`, `no-regex-spaces`, `no-useless-backreference`, `no-undef-init`; в TS — `no-throw-literal`, `prefer-promise-reject-errors`                                                                                                         | двойные сообщения                                               | ничего                                              | unicorn, regexp, TS-аналоги       |
| 11  | Плагинные дубли: `import/no-named-default`, `promise/no-multiple-resolved`, `typescript/no-this-alias`, `typescript/prefer-for-of`, `unicorn/no-static-only-class`, `sonarjs/prefer-single-boolean-return`, `no-inverted-boolean-check`, `no-misleading-array-reverse`, `array-callback-without-return`, `no-identical-conditions`, `no-same-line-conditional`, `no-undefined-argument` | двойные сообщения, противоречия                                 | ничего                                              | см. §3                            |
| 12  | В TS: `unicorn/no-unnecessary-boolean-comparison`, `unicorn/no-useless-template-literals`, `unicorn/no-invalid-argument-count`, `unicorn/no-undeclared-class-members`, `unicorn/prefer-includes-over-repeated-comparisons`                                                                                                                                                              | дубли type-aware правил, дубли компилятора, потеря narrowing    | ничего                                              | TS-аналоги и компилятор           |
| 13  | `settings.react`, глобальный ignore `benchmark/**`, `nanostores`                                                                                                                                                                                                                                                                                                                        | мёртвое или персональное                                        | —                                                   | собственный конфиг репозитория    |
| 14  | `promise/spec-only` (или `allowedMethods`)                                                                                                                                                                                                                                                                                                                                              | ложное срабатывание на ES2025                                   | —                                                   | TS-типы, unicorn                  |
| 15  | `typescript/explicit-function-return-type` (опционально)                                                                                                                                                                                                                                                                                                                                | дубль на экспортах, шум внутри модулей                          | явные типы у внутренних функций                     | `explicit-module-boundary-types`  |
| 16  | `prefer-let` (решение за вами; минимум — off в TS)                                                                                                                                                                                                                                                                                                                                      | автофикс ломает компиляцию, теряются literal types              | стилистическую консистентность                      | —                                 |

Edge cases, которые при этом остаются без покрытия: после удаления `react-perf`
— нестабильные ссылки в Context value и default props, но они покрыты `react-x`.
Остальные удаления не открывают дыр: у каждого удаляемого правила есть рабочий
аналог.

---

## 13. WHAT SHOULD BE ADDED

**Essential correctness:** `react-x/no-missing-key`,
`react-x/no-leaked-conditional-rendering`, `vitest/expect-expect`,
`typescript/switch-exhaustiveness-check`, `typescript/no-deprecated`,
`typescript/ban-ts-comment`, `typescript/return-await`
(`error-handling-correctness-only`), compiler-правила `react-hooks` (`purity`,
`refs`, `immutability`, `set-state-in-render`, `static-components`, …),
`astro/no-set-html-directive`, Astro-процессор для клиентских скриптов,
`linterOptions.reportUnusedDisableDirectives: 'error'`.

**High-value maintainability:** `import/no-duplicates`,
`node/no-extraneous-import`, `regexp/no-misleading-unicode-character`,
`regexp/no-extra-lookaround-assertions`, `typescript/no-unsafe-enum-comparison`,
`typescript/no-redundant-type-constituents`, `typescript/unbound-method`,
`typescript/no-misused-spread`, `typescript/consistent-type-assertions`,
`jsx-a11y/click-events-have-key-events`,
`jsx-a11y/control-has-associated-label`, `jsx-a11y/no-distracting-elements`, 12
рекомендованных Svelte-правил (§8.4), `vue/no-arrow-functions-in-watch`,
`vue/no-import-compiler-macros`, `vue/no-unused-refs`, `qwik/jsx-no-script-url`,
`qwik/scope-use-task`, `package-json` recommended `valid-*`, unicorn
correctness-правила из §7.2 (после прогона на реальном коде), sonarjs
bug-detectors из §7.2.

**Useful opinionated:** `eslint-comments/require-description`,
`unicorn/consistent-function-scoping`, Vue extension-правила для шаблонов,
`sonarjs/cognitive-complexity` (warn), `vitest/prefer-strict-boolean-matchers`,
`vitest/valid-title`, `vitest/no-unneeded-async-expect-function`,
`vitest/require-awaited-expect-poll`.

**Experimental:** `typescript/strict-boolean-expressions` (opt-in),
`typescript/no-unsafe-type-assertion`, `unicorn/no-top-level-side-effects` (для
библиотек), `@eslint/json` и `@eslint/markdown`, runtime-gated unicorn-правила
(§14.1).

---

## 14. PROPOSED IDEAL CONFIGURATION

### Принципы следующей итерации

1. **Каждое правило должно оправдать место.** Перед добавлением — проверка на
   дубли (как в §3) и на конфликт с существующими опциями.
2. **Автофикс обязан сохранять семантику.** Правило с автофиксом, который может
   изменить поведение, либо выключается, либо ограничивается опциями, либо
   помечается non-fixable в редакторе (как `isInEditor` у antfu).
3. **Цели среды выполнения — вход конфигурации**, а не неявное «самое новое»:
   опция `targets` (§14.1).
4. **Конфиг доказывает свою работоспособность тестами** на всех типах файлов и
   комбинациях опций, а также установкой из tarball через npm и pnpm.
5. **TS-файлы получают TS-набор, а не «core + исключения».** Применить список
   `eslint-recommended` typescript-eslint, выключить синтаксические
   unicorn-дубли type-aware правил.
6. **Персональное отделено от публичного:** benchmark, nanostores, специфичные
   стили — в собственный `eslint.config.ts`.
7. **Градация severity — опционально.** Ваша стратегия «всё — error»
   последовательна. Но при ней каждое правило с false positives становится
   блокером CI. Если оставляете — тем строже должно быть курирование.

### Конкретные изменения (сверх §6)

```ts
// index.ts — новые опции
type RawConfigOptions = {
  targets?: RuntimeTargets | 'auto' // §14.1
  tsconfigRootDir?: string
  react?: boolean | { files?: string[] }
  qwik?: boolean | { files?: string[] }
  extends?: Linter.Config[] | Linter.Config
  // ...
}

// удалить глобальный ignore 'benchmark/**/*' — перенести в собственный eslint.config.ts
```

```ts
// core: JSX для espree, когда TS выключен (P0-3)
languageOptions: {
  parserOptions: { ecmaFeatures: { jsx: config.react || config.qwik } },
  globals: { ...(config.node ? globals.node : {}), ...(hasBrowserFramework ? globals.browser : {}) }, // опционально
},
```

```ts
// react/index.ts — после чистки
plugins: { 'react-dom': …, 'react-hooks': …, 'react-jsx': …, 'react-naming-convention': …, 'react-web-api': …, 'react-x': … },
rules: {
  ...reactHooksPlugin.configs.recommended.rules, // 16 правил: rules-of-hooks, exhaustive-deps + compiler-правила
                                                  // ('recommended-latest' по README — «bleeding edge experimental»)
  'react-x/no-missing-key': 'error',
  'react-x/no-leaked-conditional-rendering': 'error',
  'react-x/no-direct-mutation-state': 'error',
  'react-x/no-unstable-default-props': 'error',
  'react-x/use-state': 'error',                 // было react-naming-convention/use-state
  'react-jsx/no-key-after-spread': 'error',     // было react-x/no-key-after-spread
  'react-jsx/no-children-prop': 'error',
  'react-jsx/no-comment-textnodes': 'error',
  'react-jsx/no-leaked-semicolon': 'error',
  // + существующие react-dom/*, 6 react-web-api/*, react-x/* без immutability/set-state-in-effect/use-memo
},
settings: { 'react-x': { version: 'detect' } },
```

```ts
// astro/index.ts
processor: 'astro/client-side-ts',          // или astroPlugin.processors['client-side-ts']
// + отдельный объект для '**/*.astro/*.ts' с TS-парсером без type info
'astro/no-set-html-directive': 'error',
'astro/no-unsafe-inline-scripts': 'error',
```

### 14.1 Ответ на идею: включать и выключать unicorn-правила по `engines` и `browserslist`

**Коротко:** идея правильная, и у неё **две** стороны, а не одна.

- **Включить** хорошие правила, которые сейчас не подключены из-за поддержки,
  когда цели это позволяют.
- **Выключить** уже включённые правила, требующие API новее целей. Сейчас конфиг
  требует `Uint8Array.fromBase64` (Node 25) и `getOrInsertComputed` (Node 26) от
  проектов на Node 22 и 24 [VERIFIED, §4.7]. Это даже важнее первой стороны.

#### Данные: минимальные версии (MDN BCD 8.1.5) [VERIFIED]

**A. Сейчас включены → должны гейтиться**

| Правило                                                                                                               | Node     | Chrome | Firefox | Safari                  | Фикс                                                                      |
| --------------------------------------------------------------------------------------------------------------------- | -------- | ------ | ------- | ----------------------- | ------------------------------------------------------------------------- |
| `prefer-get-or-insert-computed`                                                                                       | **26.0** | 145    | 144     | 26.2                    | autofix                                                                   |
| `prefer-uint8array-base64`                                                                                            | **25.0** | 140    | 133     | 18.2                    | autofix + sugg                                                            |
| `prefer-dom-node-html-methods` (`setHTML`)                                                                            | —        | 146    | 148     | **нет**                 | autofix (`getHTML`: C125/FF128/S18)                                       |
| `prefer-iterator-helpers` / `prefer-iterator-to-array`                                                                | 22.0     | 122    | 131     | 18.4                    | sugg / autofix                                                            |
| `prefer-set-methods`                                                                                                  | 22.0     | 122    | 127     | 17                      | autofix                                                                   |
| `prefer-abort-signal-any`                                                                                             | 20.3     | 116    | 124     | 17.4                    | sugg                                                                      |
| `prefer-json-import` (import attributes)                                                                              | 20.10    | 123    | **138** | 17.2                    | sugg                                                                      |
| `prefer-import-meta-properties`                                                                                       | 20.11    | —      | —       | —                       | autofix                                                                   |
| `no-array-sort`, `no-array-reverse`, `no-array-splice` (`toSorted`/`toSpliced`)                                       | 20.0     | 110    | 115     | 16                      | sugg                                                                      |
| `prefer-url-can-parse`                                                                                                | 19.9     | 120    | 115     | 17                      | autofix                                                                   |
| `prefer-array-last-methods` (`findLast`)                                                                              | 18.0     | 97     | 104     | 15.4                    | sugg                                                                      |
| `prefer-structured-clone`                                                                                             | 17.0     | 98     | 94      | 15.4                    | sugg                                                                      |
| `prefer-at`                                                                                                           | 16.6     | 92     | 90      | 15.4                    | autofix                                                                   |
| `prefer-object-has-own`, `unicorn/no-computed-property-existence-check`, `unicorn/dom-node-dataset` (`Object.hasOwn`) | 16.9     | 93     | 92      | 15.4                    | autofix / sugg                                                            |
| `unicorn/prefer-modern-dom-apis` (`replaceChildren`)                                                                  | —        | 86     | 78      | 14                      | autofix                                                                   |
| `unicorn/prefer-string-replace-all`, `unicorn/prefer-single-replace` (`replaceAll`)                                   | 15.0     | 85     | 77      | 13.1                    | autofix                                                                   |
| `regexp/prefer-lookaround` (lookbehind)                                                                               | 8.10     | 62     | 78      | **16.4**                | autofix — синтаксис регулярок, транспайлеры его не переписывают           |
| `prefer-named-capture-group`, `regexp/prefer-named-capture-group`                                                     | 10.0     | 64     | 78      | 11.1                    | sugg                                                                      |
| `sonarjs/no-misleading-array-reverse` (`toSorted`/`toReversed` в сообщении и suggestion)                              | 20.0     | 110    | 115     | 16                      | sugg                                                                      |
| `unicorn/prefer-top-level-await`                                                                                      | 14.8     | 89     | 89      | 15 (MDN: partial до 27) | sugg — транспайлеры не понижают                                           |
| `preserve-caught-error`, `unicorn/custom-error-definition` (`{ cause }`)                                              | 16.9     | 93     | 91      | 15                      | sugg / autofix                                                            |
| `logical-assignment-operators` (`\|\|=`, `&&=`, `??=`)                                                                | 15.0     | 85     | 79      | 14                      | autofix — гейтится только для Node: браузерный код проходит через бандлер |
| `unicorn/prefer-export-from` (`export * as ns from`)                                                                  | 13.2     | 72     | 80      | 14.1                    | autofix — только для Node, как выше                                       |
| `unicorn/require-css-escape` (`CSS.escape`)                                                                           | —        | 46     | 31      | 10.1                    | autofix — браузерное правило: при чисто Node-целях выключается            |

**B. Сейчас не подключены → включать при достаточных целях**

| Правило                                         | Node    | Chrome | Firefox | Safari  | Рек. в unicorn | Фикс                                                     |
| ----------------------------------------------- | ------- | ------ | ------- | ------- | -------------- | -------------------------------------------------------- |
| `prefer-response-static-json`                   | 18.3    | 105    | 115     | 17      | unopinionated  | autofix                                                  |
| `prefer-group-by`                               | 21.0    | 117    | 119     | 17.4    | ✔              | autofix                                                  |
| `prefer-promise-with-resolvers`                 | 22.0    | 119    | 121     | 17.4    | unopinionated  | autofix                                                  |
| `prefer-array-from-async`                       | 22.0    | 121    | 115     | 16.4    | ✔              | autofix + sugg                                           |
| `prefer-promise-try`                            | 23.0    | 128    | 134     | 18.2    | ✔              | autofix                                                  |
| `prefer-regexp-escape`                          | 24.0    | 136    | 134     | 18.2    | —              | autofix + sugg                                           |
| `prefer-error-is-error`                         | 24.3    | 134    | 138     | 18.4    | —              | autofix                                                  |
| `prefer-dispose` (`using`)                      | 24.0    | 134    | 141     | preview | —              | sugg (+ нужен TS ≥ 5.2)                                  |
| `prefer-uint8array-hex`                         | 25.0    | 140    | 133     | 18.2    | —              | autofix                                                  |
| `prefer-iterator-concat`                        | 26.0    | 146    | 147     | 26.4    | —              | autofix                                                  |
| `prefer-iterator-zip`                           | **нет** | 153    | 148     | preview | ✔              | sugg                                                     |
| `prefer-temporal`, `prefer-temporal-conversion` | 26.0    | 144    | 139     | preview | —              | autofix — **не гейтить автоматически** (смена парадигмы) |

**Важно:** `promise/spec-only` сейчас ругается на `Promise.try` [VERIFIED].
Включение `prefer-promise-try` без его настройки создаёт новый конфликт.

#### Дизайн, который я бы предложил

1. **Источник целей — с явным приоритетом, без магии по умолчанию:**
   1. явная опция `targets: { node: '22.12', browsers: ['defaults'] }`;
   2. `'auto'`: `browserslist` (поле `browserslist` в package.json или
      `.browserslistrc`) и `engines.node` из `package.json` рядом с
      `tsconfigRootDir`/`root`, **не** `process.cwd()`, иначе та же проблема,
      что в §8.1;
   3. если ничего не найдено — консервативная база (например, «Node текущий
      Maintenance LTS + Baseline widely available»), **а не** «всё включено».
2. **Минимальная версия из диапазона:** `semver.minVersion('>=18')` → 18.0.0,
   `semver.minVersion('^20.19 || >=22.12')` → 20.19.0.
3. **Браузеры:**
   - `browserslist(query, { path: root })` →
     `['chrome 120', 'safari 17.4', 'ios_saf 17.4-17.7', 'op_mini all', …]`;
   - маппинг имён на ключи BCD: `ios_saf` → `safari_ios`, `and_chr` →
     `chrome_android`, `samsung` → `samsunginternet_android`;
   - `op_mini` и `dead` игнорировать: иначе `defaults` выключит почти всё;
   - для каждого браузера взять минимальную версию;
   - неизвестный браузер → консервативно «не поддерживается».
4. **Данные — кодогенерация на этапе сборки.** Скрипт из
   `@mdn/browser-compat-data` (devDependency) пишет маленький
   `runtime-features.json` вида
   `{ "unicorn/prefer-promise-try": { "node": "23.0.0", "chrome": 128, … } }`. В
   runtime BCD не нужен. Runtime-зависимости: `semver` (маленький) и
   `browserslist` (опционально через `import()`; если не установлен — браузерные
   цели не учитываются, с понятным предупреждением в README).
5. **SSR-фреймворки** (Astro, SvelteKit, Next): одни и те же файлы исполняются и
   на сервере, и в браузере. По умолчанию — **пересечение** целей (минимум по
   всем). Продвинутый режим — `targets` как массив с `files`:

   ```ts
   targets: [
     { files: ['apps/api/**'], node: '24' },
     { files: ['apps/web/**'], browsers: 'baseline widely available' },
   ]
   ```

   Фабрика генерирует отдельные объекты конфигурации с `files` и вычисленными
   severity. Это решает и монорепо.

6. **Реализация в core — тернарник, как вы и предложили, но через helper, чтобы
   не размножать логику:**

   ```ts
   import features from './runtime-features.json' with { type: 'json' }

   function supported(rule: keyof typeof features, targets: ResolvedTargets): boolean {
     let min = features[rule]
     return Object.entries(targets).every(([engine, version]) =>
       min[engine] !== undefined && compareVersions(version, min[engine]) >= 0)
   }

   let gated = (rule: keyof typeof features): 'error' | 'off' =>
     supported(rule, targets) ? 'error' : 'off'

   // в rules:
   'unicorn/prefer-promise-try': gated('unicorn/prefer-promise-try'),
   'unicorn/prefer-uint8array-base64': gated('unicorn/prefer-uint8array-base64'),
   'unicorn/no-array-sort': gated('unicorn/no-array-sort'),
   ```

7. **Согласованность с другими плагинами:**
   - вычисленную Node-версию передавать в `settings.node.version`
     (`eslint-plugin-n`), чтобы `no-unsupported-features/*` и unicorn смотрели
     на одну цифру;
   - `promise/spec-only` получает `allowedMethods: ['try', …]` по тем же данным;
   - для regexp: `regexp/require-unicode-sets-regexp` (флаг `v`: Node 20,
     Safari 17) можно гейтить так же.
8. **TypeScript `lib`.** Runtime-поддержка не гарантирует наличие типов: при
   `lib: ['ES2022']` `Iterator#toArray` — ошибка TS. Варианты:
   - (а) задокументировать;
   - (б) в режиме `'auto'` дополнительно читать `compilerOptions.lib`/`target`
     через `ts.readConfigFile` и брать минимум.

   Рекомендую (а) в первой итерации.

9. **Полифиллы:** пользователь с `core-js` должен иметь способ включить правило
   вопреки целям. Достаточно стандартного переопределения severity через
   `extends` или опцию `targets.polyfilled: ['unicorn/prefer-set-methods']`.
10. **Опинионированность отдельно от поддержки.** Поддерживаемость API —
    необходимое, но не достаточное условие. `prefer-temporal`, `prefer-dispose`,
    `prefer-queue-microtask` (меняет семантику планирования) не должны
    включаться только потому, что цель новая.
11. **Детерминизм и кэш.** Конфиг зависит от `package.json` проекта, но ESLint
    `--cache` учитывает хеш конфига: смена `engines` инвалидирует кэш
    автоматически [LIKELY]. Нужно задокументировать, что изменение `engines` или
    `browserslist` меняет набор правил.
12. **Тесты:**
    - unit-тесты резолвера на фикстурах (`engines: ">=18"`,
      `"^20.19 || >=22.12"`, browserslist `defaults`, `last 2 chrome versions`,
      SSR-пересечение);
    - снапшот списка включённых правил для 3–4 типовых целей.
13. **Предусловие:** сначала исправить собственный `engines` пакета (`>=18` →
    реальный минимум). Иначе гейтинг в вашем же репозитории выключит половину
    правил.

**Ожидаемый эффект:**

- проекты на Node 22/24 перестают получать невыполнимые требования (A);
- проекты на Node 24+ / Baseline 2025 получают 6–9 полезных правил с безопасными
  автофиксами (B);
- поведение конфига становится объяснимым («правило выключено, потому что ваш
  `engines` — `>=20`»).

**Обновление после прототипа.** Дизайн проверен прототипом:
[`runtime-targets/`](../runtime-targets/readme.md), 85 тестов, 45 правил в
таблице, четыре раунда состязательной проверки (подтверждено 34 + 33 + 22 + 16
проблем, все исправлены). Четвёртый раунд нашёл правила того же класса вне
unicorn (`sonarjs`, ядро ESLint): проверка покрытия должна обходить все плагины,
а не только unicorn. Что изменилось относительно списка выше:

- При отсутствии `engines` Node-цель берётся не «как повезёт», а из пола
  (`DEFAULT_NODE_FLOOR = 22.0.0`). У `eslint-plugin-n` такой пол — `>=16.0.0`, и
  в репозитории прототипа он ругался на `Object.hasOwn`, пока в `package.json`
  не появился `engines` [VERIFIED].
- Неизвестный браузер или непригодный `engines` выключает зависящие правила, а
  не бросает исключение.
- UC и QQ проверяются через версию движка, KaiOS — через Gecko.
- Правило с безопасной опцией (`prefer-array-find` → `checkFromLast: false`) не
  выключается, а получает эту опцию поверх настроенных.
- Отдельный блок для tooling-файлов (`*.config.*`, `scripts/**`), которые всегда
  исполняются в Node.
- Объём кода оказался больше оценки: около 1,45 тыс. строк резолвера, 600 строк
  генератора (большая часть — таблица правил), 400 строк gate.

**Сложность:** средняя — около 200–300 строк кода плюс генератор и тесты (по
факту прототипа больше, см. выше). **Риск:** низкий при консервативном fallback.
**Breaking:** да для пользователей, у которых сейчас включены правила группы A,
но они станут менее строгими, а не более.

---

## 15. PRIORITIZED ACTION PLAN

Обозначения: Impact / Effort / Risk — H/M/L; Conf — уверенность; Br. — breaking
change для потребителей.

### P0 — критическая корректность и совместимость

| #    | Действие                                                                                                                                                                             | Impact | Effort | Risk | Conf | Evidence                                                       | Br.                            |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------ | ------ | ---- | ---- | -------------------------------------------------------------- | ------------------------------ |
| P0-1 | Исправить React-модуль: удалить 17 несуществующих правил, `react-naming-convention/use-state` → `react-x/use-state`, `react-x/no-key-after-spread` → `react-jsx/no-key-after-spread` | H      | L      | L    | выс. | VERIFIED: TypeError в pnpm-потребителе с опубликованной 2.99.0 | нет (сейчас не работает вовсе) |
| P0-2 | Удалить `eslint-plugin-react-compiler` (npm-установка падает на `zod-validation-error/v4`)                                                                                           | H      | L      | L    | выс. | VERIFIED: чистая npm-установка                                 | нет                            |
| P0-3 | `ecmaFeatures.jsx` для espree при `react`/`qwik` без TS                                                                                                                              | H      | L      | L    | выс. | VERIFIED: `Parsing error: Unexpected token <`                  | нет                            |
| P0-4 | Исправить `engines` (`^22.22.3 \|\| >=24.16.0`) и `peerDependencies.eslint` (`>=10.4.0`); решить судьбу `react-perf`/`qwik` с peer ≤ ESLint 9                                        | H      | L      | M    | выс. | VERIFIED: метаданные пакетов, ERESOLVE                         | формально да (честнее)         |
| P0-5 | Smoke-тесты: `calculateConfigForFile` для всех типов файлов × комбинаций опций, lint фикстур, установка tarball через npm и pnpm                                                     | H      | M      | L    | выс. | VERIFIED: CI зелёный при сломанном React                       | нет                            |
| P0-6 | Исправить пример `extends` в README                                                                                                                                                  | M      | L      | L    | выс. | VERIFIED: ConfigError                                          | нет                            |

### P1 — высокий эффект

| #     | Действие                                                                                                                                                        | Impact | Effort | Risk                            | Conf | Evidence                      | Br.        |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ | ------------------------------- | ---- | ----------------------------- | ---------- |
| P1-1  | Убрать `vitest/prefer-to-be-falsy`, `prefer-to-be-truthy`, `prefer-called-with`; добавить `prefer-strict-boolean-matchers`, `expect-expect`; расширить `files`  | H      | L      | L                               | выс. | VERIFIED vitest run           | да (мягко) |
| P1-2  | `capitalized-comments` — off или безопасные опции                                                                                                               | H      | L      | L                               | выс. | VERIFIED Prettier             | нет        |
| P1-3  | `method-signature-style: 'property'`                                                                                                                            | H      | L      | M (массовый фикс)               | выс. | VERIFIED tsc                  | да         |
| P1-4  | В TS: `no-redeclare` off + список `eslint-recommended`; core-дубли `no-throw-literal`, `prefer-promise-reject-errors`                                           | H      | L      | L                               | выс. | VERIFIED (57 FP на zod)       | нет        |
| P1-5  | Perfectionist: off `sort-decorators`, `sort-maps`, `sort-sets`; `partitionByNewLine: true`                                                                      | H      | L      | L                               | выс. | VERIFIED семантика            | да (мягко) |
| P1-6  | React: compiler-правила из `react-hooks.configs.recommended`, убрать `react-perf` и дубли react-x, добавить `no-missing-key`, `no-leaked-conditional-rendering` | H      | M      | M                               | выс. | VERIFIED                      | да         |
| P1-7  | Опции `tsconfigRootDir` и `allowDefaultProject`                                                                                                                 | H      | L      | L                               | выс. | VERIFIED parsing errors       | нет        |
| P1-8  | Гейтинг modern-API правил по `targets` (§14.1). Как временная мера — off для `prefer-uint8array-base64`, `prefer-get-or-insert-computed`, `checkSetHTML: false` | H      | M      | L                               | выс. | VERIFIED BCD                  | да (мягче) |
| P1-9  | Убрать доказанные дубли (§12, п. 10–12)                                                                                                                         | M      | L      | L                               | выс. | VERIFIED                      | нет        |
| P1-10 | Разрешить противоречия: `strict-void-return` ↔ `checksVoidReturn`, `sonarjs/no-undefined-argument` ↔ `checkArguments`, `no-unneeded-ternary.defaultAssignment`  | M      | L      | L                               | выс. | VERIFIED                      | нет        |
| P1-11 | Тупики: `prefer-destructuring { array: false }`, `camelcase { properties: 'never' }`, `jsdoc mode: 'typescript'` для JS                                         | M      | L      | L                               | выс. | VERIFIED                      | нет        |
| P1-12 | TS-correctness: `switch-exhaustiveness-check`, `no-deprecated`, `ban-ts-comment`, `return-await`                                                                | H      | L      | M (новые ошибки у потребителей) | выс. | DOCUMENTED                    | да         |
| P1-13 | Astro: процессор `client-side-ts`, `no-set-html-directive`                                                                                                      | H      | M      | L                               | выс. | VERIFIED: скрипты не линтятся | да         |

### P2 — ценно, но не срочно

| #     | Действие                                                                                                                                      | Impact | Effort | Risk | Conf  | Evidence              | Br.                         |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------ | ---- | ----- | --------------------- | --------------------------- |
| P2-1  | Решение по `prefer-let` в TS (минимум — без автофикса)                                                                                        | M      | L      | L    | сред. | VERIFIED TS2345       | да                          |
| P2-2  | Каскад комментариев: в TS off `jsdoc/require-param` и `require-returns`; off `slop/no-em-dash`; пересмотреть `slop/prefer-jsdoc`              | M      | L      | L    | выс.  | VERIFIED              | нет                         |
| P2-3  | `strict: 'safe'`; `no-useless-assignment` без глобального off                                                                                 | M      | L      | L    | выс.  | VERIFIED              | нет                         |
| P2-4  | `import/no-duplicates`, `node/no-extraneous-import`, regexp-рекомендованные                                                                   | M      | L      | L    | выс.  | VERIFIED / DOCUMENTED | да                          |
| P2-5  | Svelte: 12 рекомендованных правил; Vue: extension-правила для шаблонов, `no-undef-components.ignorePatterns`, `require-default-prop` off в TS | M      | L      | L    | выс.  | DOCUMENTED / VERIFIED | да                          |
| P2-6  | `package-json`: база `configs.recommended`                                                                                                    | M      | L      | L    | выс.  | DOCUMENTED            | да                          |
| P2-7  | jsx-a11y: `click-events-have-key-events`, `control-has-associated-label`, `no-distracting-elements`                                           | M      | L      | L    | выс.  | DOCUMENTED            | да                          |
| P2-8  | Перенести `benchmark/**`, `nanostores` в собственный конфиг; убрать `settings.react`                                                          | M      | L      | L    | выс.  | VERIFIED              | да (для тех, кто полагался) |
| P2-9  | `unicorn/name-replacements`: `env`, `replacements` для `ref`/`fn`/`args`/`params`                                                             | M      | L      | L    | выс.  | VERIFIED              | нет                         |
| P2-10 | Курирование SonarJS: −8 дублей, +6–8 bug-detectors                                                                                            | M      | M      | M    | сред. | VERIFIED / DOCUMENTED | да                          |
| P2-11 | `linterOptions.reportUnusedDisableDirectives: 'error'`                                                                                        | M      | L      | L    | выс.  | DOCUMENTED            | да                          |
| P2-12 | `files` для фреймворков (React + Qwik в монорепо)                                                                                             | M      | M      | L    | выс.  | VERIFIED C9           | нет                         |

### P3 — опционально и экспериментально

| #    | Действие                                                                                      | Impact | Effort | Risk                   | Conf     |
| ---- | --------------------------------------------------------------------------------------------- | ------ | ------ | ---------------------- | -------- |
| P3-1 | `type: 'natural'` для объектов и интерфейсов в Perfectionist (§4.15)                          | M      | L      | M (массовый перестрой) | сред.    |
| P3-2 | `isInEditor`-подобный режим: non-fixable в IDE для перестраивающих и переименовывающих правил | L      | M      | L                      | сред.    |
| P3-3 | Опция `severity: 'strict' \| 'balanced'` (warn для стиля)                                     | M      | M      | L                      | сред.    |
| P3-4 | Опциональные peer-зависимости фреймворков                                                     | M      | M      | M                      | сред.    |
| P3-5 | Сокращение jsdoc-набора в TS до ~25 правил (≈ −2 с на 50k строк)                              | L      | L      | L                      | [LIKELY] |
| P3-6 | `@eslint/json`, `@eslint/markdown`                                                            | L      | M      | L                      | сред.    |
| P3-7 | unicorn correctness-правила из §7.2 после прогона на реальных проектах                        | M      | L      | M                      | сред.    |
| P3-8 | `sonarjs/cognitive-complexity` как warn                                                       | L      | L      | L                      | сред.    |

---

## 16. TOP 20 MOST IMPORTANT FINDINGS

Ранжировано по реальной ценности: положительные находки отмечены ✅,
отрицательные — ⛔.

1. ⛔ **React-модуль v2.99.0 нерабочий.** 19 несуществующих правил → `TypeError`
   на любом `.jsx`/`.tsx` (проверено в pnpm-потребителе с опубликованным пакетом
   и с eslint-react 5.26.0). **P0.**
2. ⛔ **У npm-потребителей `react: true` роняет ESLint ещё при загрузке
   конфига** — конфликт `zod-validation-error` между deprecated
   `eslint-plugin-react-compiler` и `react-hooks@7`. Лекарство — удалить
   устаревший плагин. **P0.**
3. ⛔ **Нет тестов конфигурации.** CI зелёный, потому что в репозитории нет
   файлов фреймворков, а ESLint валидирует правила лениво. Все P0 — следствие
   этого. Одна smoke-матрица ловит всё.
4. ✅ **Unicorn «invalid-API»-семейство и regexp** — сильнейшая часть конфига:
   реальные runtime-баги, которые TS не видит. Беречь.
5. ⛔ **Vitest-автофиксы меняют результат тестов:** `toBe(false)` →
   `toBeFalsy()` скрывает баг, `toHaveBeenCalled()` → `toHaveBeenCalledWith()`
   ломает корректный тест (проверено `vitest run`).
6. ⛔ **`capitalized-comments` отключает `prettier-ignore`, webpack magic
   comments, `biome-ignore`** (проверено Prettier).
7. ⛔ **`typescript/method-signature-style: 'method'` отключает проверку
   вариантности** — компилируется код, падающий в runtime. Комментарий в конфиге
   утверждает обратное.
8. ⛔ **Perfectionist меняет семантику:** порядок декораторов, порядок итерации
   Map и Set, порядок вычисления значений с side effects.
9. ⛔ **`.jsx` без TypeScript не парсится** (React и Qwik) — нет
   `ecmaFeatures.jsx` для espree.
10. ⛔ **`engines: ">=18"` ложен:** реальный минимум — Node
    `^22.22.3 || ^24.16.0` (astro, jsdoc, package-json, unicorn), ESLint
    `>=10.4`.
11. ⛔ **Unicorn требует API новее LTS** (`Uint8Array.fromBase64` — Node 25,
    `getOrInsertComputed` — Node 26, `setHTML` — нет в Safari), и
    `eslint-plugin-n` не страхует. Ваша идея с гейтингом по `engines` и
    `browserslist` — правильное решение, причём в обе стороны (§14.1).
12. ⛔ **`no-redeclare` в TS даёт ложные срабатывания** на overloads и
    value+type merging (57 на zod v3). typescript-eslint сам рекомендует его
    выключать.
13. ⛔ **React без `no-missing-key` и `no-leaked-conditional-rendering`**, зато
    с `react-perf`, который противоречит React Compiler, и тройными дублями
    compiler-правил.
14. ✅ **Type-aware ядро typescript-eslint** настроено строго и правильно
    ограничено TS-файлами. Это стоит ~17 с из 54 на 53k строк и полностью
    окупается.
15. ⛔ **Около 20 доказанных пар-дубликатов** и 4 противоречия опций: правила из
    разных плагинов отменяют исключения друг друга (`checkArguments`,
    `checksVoidReturn`, `defaultAssignment`, `allowAsStatement`).
16. ⛔ **Доказанные тупики**, где корректный код невозможен без
    `eslint-disable`: `prefer-destructuring` ↔
    `no-unreadable-array-destructuring`; `camelcase` ↔ ваш Prettier; JSDoc
    `@import` в JS-режиме.
17. ⛔ **Кластер «наказания за комментарии»:** однострочный `//` после `--fix`
    превращается в JSDoc-заготовку с тремя неисправимыми ошибками;
    `slop/no-em-dash` запрещает тире в русских UI-строках. Экономический стимул
    — удалить комментарий.
18. ⛔ **`prefer-let` в TypeScript:** автофикс ломает компиляцию (literal
    widening) и даёт самый частый автофикс на чужом коде (1292 из 20 888
    сообщений на zod v3). Осознанное решение, но цена измерима.
19. ⛔ **Typed-линтинг хрупок:** `tsconfigRootDir: process.cwd()` ломает его при
    запуске не из корня; нет `allowDefaultProject` для корневых `*.config.ts`. В
    Astro клиентские `<script>` вообще не линтятся.
20. ✅ **Архитектура в целом здоровая**: модули с ленивыми импортами, правильный
    порядок парсеров, CI hardening, фиксы сходятся без циклов (проверено на
    escape-последовательностях, импортах и упрощениях выражений). Чтобы стать
    отличной, ей нужны тесты, опции `targets`/`tsconfigRootDir` и отделение
    персонального от публичного.

**Наибольший эффект на качество кода потребителей** дадут, по убыванию:

1. P0-1…P0-5 (конфиг вообще работает);
2. безопасность автофиксов (P1-1, P1-2, P1-5, P2-1);
3. `method-signature-style: property` и TS-correctness правила (P1-3, P1-12);
4. React-correctness (P1-6);
5. гейтинг по целям (P1-8).

---

## 17. AUDIT COVERAGE AND LIMITATIONS

**Модули:** прочитаны полностью все 12 модулей (`core` — все 2693 строки), а
также `index.ts`, `utilities.ts`, `eslint.config.ts`, `environment.d.ts`,
`package.json`, `pnpm-workspace.yaml`, `vite.config.ts`, `tsconfig.json`,
README, все 4 workflow и 3 composite actions. Lockfile — через установленные
версии (`pnpm install --frozen-lockfile`).

**Разрешённые конфигурации** (`calculateConfigForFile`):

- наборы опций `{}`, `{typescript, perfectionist, node}`,
  `{typescript, perfectionist, react, vitest, node}`, все опции;
- файлы `.js/.cjs/.mjs/.jsx/.ts/.cts/.mts/.tsx/.d.ts`, `*.test.ts`, `*.spec.ts`,
  `*.test.tsx`, `test/a.ts`, `test/nested/b.ts`, `.vue`, `.svelte`, `.astro`,
  `package.json`, `.json`.

Проверено существование всех 1134 настроенных правил и их метаданные (fixable,
suggestions, typed, deprecated).

**Эксперименты:**

1. Дубликаты на общих фикстурах (`dups.ts`, `dups.js`, `reexport.js`,
   `simplify.ts`).
2. Сходимость `--fix` (escape-последовательности, импорты, упрощения,
   Perfectionist, комментарии, unicorn modern-API, vitest, Svelte).
3. Компиляция результатов фиксов через `tsc --strict`: `prefer-at`, `includes`,
   `let`-widening, вариантность методов.
4. Запуск vitest до и после фиксов.
5. Prettier с вашим `@azat-io/prettier-config` (`prettier-ignore`, `quoteProps`,
   артефакт «etc. Has»).
6. Чистые потребители: npm (402 пакета, 172 MB) и pnpm 12 с опубликованным
   2.99.0.
7. React (с `@types/react@19`), Vue, Svelte, Astro, Qwik на фикстурах.
8. Бенчмарк на `zod@3.25.76` (241 файл, 53k строк): полный режим, без
   typed-правил, база парсинга; per-rule stats; время импорта плагинов.
9. Частоты сообщений на zod v3 (83 файла).
10. MDN BCD 8.1.5 для минимальных версий API.
11. `npm view` для статуса пакетов.

**Не проверено или ограничения:**

- Частота false positives предложенных unicorn и sonarjs правил (§7.2) — только
  по метаданным, на реальных проектах не прогонялись.
- Node 24/26 и браузеры не запускались; данные о поддержке — из BCD.
- `--concurrency auto` и память в многопоточном режиме не измерялись.
- Nuxt, SvelteKit, Next не разворачивались целиком; выводы о
  `vue/no-undef-components` в Nuxt — [LIKELY].
- Поведение в IDE (VS Code ESLint) не тестировалось; проблема `cwd`
  воспроизведена через API.
- Корпус zod не написан под этот конфиг: числа сообщений показывают стоимость
  внедрения и распределение шума, а не качество zod.
- Происхождение артефактов «with.» и «which will. Likely» в комментариях
  репозитория не установлено: ни ESLint, ни Prettier в текущих версиях их не
  воспроизвели. Воспроизведён только «etc. Has».
- Сравнение с `@antfu/eslint-config` — по его README на дату аудита; исходный
  код не изучался.
- Для анализа React использовалась копия `dist` с исправленными именами правил
  (в scratchpad); репозиторий не изменялся.
