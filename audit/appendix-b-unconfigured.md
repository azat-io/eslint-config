# Приложение B — правила установленных плагинов, которые не подключены

Сгенерировано по установленным версиям (lockfile v2.99.0). Учтены все плагины,
которые регистрирует конфиг со всеми опциями (для React — после исправления
имён). Пометки из метаданных правил: `rec:…` — входит в recommended плагина,
`typed` — нужна type information, `DEPRECATED`, `layout` — форматирование (зона
Prettier).

## eslint (52 unconfigured)

`block-scoped-var`, `complexity`, `consistent-this`, `default-case`,
`func-name-matching`, `grouped-accessor-pairs`, `guard-for-in`, `id-denylist`,
`id-match`, `init-declarations`, `max-classes-per-file`, `max-depth`,
`max-lines`, `max-lines-per-function`, `max-nested-callbacks`, `max-statements`,
`no-bitwise`, `no-continue`, `no-div-regex`, `no-duplicate-imports`,
`no-empty-function`, `no-eq-null`, `no-implicit-coercion`,
`no-implicit-globals`, `no-inline-comments`, `no-inner-declarations`,
`no-invalid-this`, `no-lonely-if`, `no-magic-numbers`,
`no-misleading-character-class`, `no-negated-condition`, `no-plusplus`,
`no-restricted-exports`, `no-restricted-globals`, `no-restricted-imports`,
`no-restricted-properties`, `no-restricted-syntax`, `no-script-url`,
`no-sequences`, `no-ternary`, `no-undefined`, `no-underscore-dangle`,
`no-warning-comments`, `prefer-const`, `radix`, `require-atomic-updates`,
`require-unicode-regexp`, `sort-imports`, `sort-keys`, `sort-vars`,
`unicode-bom(layout)`, `vars-on-top`

## de-morgan (0 unconfigured)

_все правила подключены_

## eslint-comments (4 unconfigured)

`no-restricted-disable`, `no-unused-disable` (DEPRECATED), `no-use`,
`require-description`

## import (5 unconfigured)

`exports-last`, `no-default-export`, `no-duplicates` (rec:true),
`no-mutable-exports`, `prefer-default-export`

## jsdoc (32 unconfigured)

`check-examples`, `check-indentation` (layout), `check-line-alignment` (layout),
`convert-to-jsdoc-comments`, `lines-before-block`, `match-description`,
`match-name`, `no-missing-syntax`, `no-restricted-syntax`,
`no-unnecessary-type-assertion`, `normalize-see-links`, `reject-any-type`,
`reject-function-type`, `require-example`, `require-file-overview`,
`require-jsdoc` (rec:true), `require-next-description`, `require-next-type`,
`require-rejects`, `require-tags`, `require-template`, `require-throws`,
`require-throws-description`, `require-throws-type`, `require-yields`,
`require-yields-description`, `require-yields-type`, `sort-tags`, `tag-lines`,
`text-escaping`, `ts-ban-ts-comment`, `type-formatting`

## prefer-let (0 unconfigured)

_все правила подключены_

## promise (5 unconfigured)

`always-return`, `prefer-await-to-callbacks`, `prefer-await-to-then`,
`no-native`, `avoid-new`

## regexp (9 unconfigured)

`grapheme-string-literal`, `hexadecimal-escape`,
`no-extra-lookaround-assertions` (rec:true), `no-misleading-unicode-character`
(rec:true), `no-super-linear-move`, `prefer-regexp-exec`, `prefer-regexp-test`,
`prefer-result-array-groups`, `require-unicode-sets-regexp`

## slop (0 unconfigured)

_все правила подключены_

## sonarjs (273 unconfigured)

`function-name`, `class-name` (rec:true), `max-lines`, `no-tab` (DEPRECATED),
`variable-name`, `comment-regex`, `no-commented-code`, `elseif-without-else`,
`no-fallthrough` (rec:true), `nested-control-flow`,
`too-many-break-or-continue-in-loop`, `max-lines-per-function`,
`no-nested-incdec`, `no-extra-arguments` (rec:true), `expression-complexity`,
`no-redundant-parentheses` (DEPRECATED), `no-labels` (rec:true),
`no-nested-assignment` (rec:true), `unused-import` (rec:true,typed), `fixme-tag`
(rec:true), `todo-tag` (rec:true), `useless-string-operation`
(DEPRECATED,typed), `no-unused-function-argument`, `no-duplicate-string`,
`no-case-label-in-switch` (rec:true), `no-parameter-reassignment` (rec:true),
`no-floating-point-equality` (rec:true), `prefer-while` (rec:true),
`no-sonar-comments`, `no-hardcoded-ip` (rec:true), `label-position` (rec:true),
`public-static-readonly` (rec:true), `file-header`, `call-argument-line`
(rec:true), `max-switch-cases` (rec:true), `no-unused-vars` (rec:true),
`function-inside-loop` (rec:true), `code-eval` (rec:true),
`no-variable-usage-before-declaration`, `future-reserved-words` (rec:true),
`array-constructor`, `bitwise-operators` (rec:true,typed),
`no-function-declaration-in-block`, `no-primitive-wrappers` (rec:true),
`cyclomatic-complexity`, `no-skipped-tests` (rec:true), `no-nested-switch`,
`constructor-for-side-effects` (rec:true), `no-dead-store` (rec:true),
`deprecation` (rec:true,typed), `misplaced-loop-counter` (rec:true),
`no-nested-functions` (rec:true), `no-hardcoded-passwords` (rec:true),
`sql-queries` (rec:true,typed), `insecure-cookie` (rec:true),
`no-useless-increment` (rec:true), `no-globals-shadowing` (rec:true),
`no-undefined-assignment`, `no-empty-test-file` (rec:true),
`no-wildcard-import`, `pseudo-random` (rec:true), `for-loop-increment-sign`
(rec:true), `null-dereference` (rec:true,typed), `no-selector-parameter`
(rec:true,typed), `updated-loop-counter` (rec:true), `block-scoped-var`
(rec:true), `no-built-in-override`, `prefer-object-literal`, `file-uploads`
(rec:true), `file-permissions` (rec:true), `no-empty-character-class`
(rec:true,typed), `no-unenclosed-multiline-block` (rec:true),
`index-of-compare-to-positive-number` (rec:true,typed), `assertions-in-tests`
(rec:true,typed), `no-implicit-global` (rec:true), `no-useless-catch`
(rec:true), `xml-parser-xxe` (rec:true), `non-existent-operator` (rec:true),
`web-sql-database` (DEPRECATED,typed), `post-message` (rec:true,typed),
`no-array-delete` (rec:true,typed), `no-alphabetical-sort` (rec:true,typed),
`no-fixed-wait-in-tests` (rec:true), `no-incomplete-assertions` (rec:true),
`no-global-this` (rec:true), `new-operator-misuse` (rec:true,typed),
`no-delete-var` (rec:true), `strings-comparison` (typed),
`file-name-differ-from-class`, `cookie-no-httponly` (rec:true),
`no-nested-conditional` (rec:true), `no-incorrect-string-concat` (typed),
`different-types-comparison` (rec:true,typed), `inverted-assertion-arguments`
(rec:true), `shorthand-property-grouping`, `updated-const-var` (rec:true),
`arguments-usage`, `destructuring-assignment-syntax`, `no-invariant-returns`
(rec:true), `arrow-function-convention`, `class-prototype` (typed),
`generator-without-yield` (rec:true), `no-require-or-define` (typed),
`no-associative-arrays` (rec:true,typed), `comma-or-logical-or-case` (rec:true),
`no-redundant-jump` (rec:true), `inconsistent-function-call` (rec:true),
`no-use-of-empty-return-value` (rec:true), `void-use` (rec:true,typed),
`operation-returning-nan` (typed), `values-not-convertible-to-numbers` (typed),
`non-number-in-arithmetic-expression` (typed), `cognitive-complexity`
(rec:true), `argument-type` (rec:true,typed), `in-operator-type-error`
(rec:true,typed), `declarations-in-global-scope`, `function-return-type`
(rec:true,typed), `no-inconsistent-returns` (typed), `no-reference-error`,
`no-all-duplicated-branches` (rec:true), `conditional-indentation` (DEPRECATED),
`no-collection-size-mischeck` (rec:true,typed), `no-unthrown-error` (rec:true),
`no-unused-collection` (rec:true), `no-os-command-from-path` (rec:true),
`no-for-in-iterable` (typed), `no-element-overwrite` (rec:true),
`no-empty-collection` (rec:true), `no-redundant-assignments` (rec:true),
`prefer-type-guard` (rec:true), `use-type-alias` (rec:true),
`no-return-type-any` (typed), `no-implicit-dependencies`,
`no-useless-intersection` (rec:true,typed), `weak-ssl` (rec:true),
`no-weak-keys` (rec:true), `csrf` (rec:true), `production-debug` (rec:true),
`prefer-default-last` (rec:true), `no-in-misuse` (rec:true,typed),
`no-duplicate-in-composite` (rec:true), `max-union-size`,
`no-nested-template-literals` (rec:true), `os-command` (DEPRECATED),
`no-redundant-optional` (rec:true,typed), `hashing` (rec:true),
`bool-param-default`, `no-try-promise` (rec:true,typed),
`unverified-certificate` (rec:true), `no-unsafe-unzip` (DEPRECATED), `cors`
(rec:true), `link-with-target-blank` (rec:true), `disabled-auto-escaping`
(rec:true,typed), `table-header` (rec:true), `no-table-as-layout` (rec:true),
`table-header-reference` (rec:true), `object-alt-content` (rec:true),
`no-clear-text-protocols` (rec:true), `publicly-writable-directories`
(rec:true), `unverified-hostname` (rec:true), `encryption-secure-mode`
(rec:true), `no-weak-cipher` (rec:true), `no-intrusive-permissions`
(DEPRECATED), `insecure-jwt-token` (rec:true), `x-powered-by` (rec:true),
`hidden-files` (DEPRECATED), `content-length` (rec:true),
`disabled-resource-integrity` (rec:true,typed), `content-security-policy`
(rec:true), `no-mixed-content` (DEPRECATED), `frame-ancestors` (DEPRECATED),
`no-mime-sniff` (rec:true), `no-referrer-policy` (rec:true),
`strict-transport-security` (rec:true), `confidential-information-logging`
(DEPRECATED), `no-ip-forward` (DEPRECATED), `empty-string-repetition`
(rec:true,typed), `regex-complexity` (rec:true,typed),
`no-incompatible-assertion-types` (rec:true,typed), `anchor-precedence`
(rec:true,typed), `slow-regex` (rec:true,typed), `no-invalid-regexp`
(rec:true,typed), `unused-named-groups` (rec:true,typed),
`no-same-argument-assert` (rec:true), `unicode-aware-regex` (typed),
`no-misleading-character-class` (rec:true,typed),
`duplicates-in-character-class` (rec:true,typed), `session-regeneration`
(rec:true), `prefer-specific-assertions` (rec:true), `no-trivial-assertions`
(rec:true), `test-check-exception` (rec:true), `stable-tests` (rec:true),
`parameterized-tests` (rec:true), `no-empty-after-reluctant` (rec:true,typed),
`single-character-alternation` (rec:true,typed), `no-code-after-done`
(rec:true), `disabled-timeout` (rec:true), `chai-determinate-assertion`
(rec:true), `aws-s3-bucket-insecure-http` (rec:true), `aws-s3-bucket-versioning`
(rec:true), `aws-s3-bucket-granted-access` (rec:true),
`no-angular-bypass-sanitization` (rec:true), `aws-iam-public-access` (rec:true),
`aws-ec2-unencrypted-ebs-volume` (rec:true), `aws-s3-bucket-public-access`
(rec:true), `aws-iam-all-privileges` (rec:true), `aws-rds-unencrypted-databases`
(rec:true), `aws-iam-all-resources-accessible`, `aws-opensearchservice-domain`
(rec:true), `aws-iam-privilege-escalation` (rec:true),
`aws-sagemaker-unencrypted-notebook` (rec:true),
`aws-restricted-ip-admin-access` (rec:true), `no-empty-alternatives`
(rec:true,typed), `no-control-regex` (rec:true,typed), `no-regex-spaces`
(rec:true,typed), `aws-sns-unencrypted-topics` (rec:true), `existing-groups`
(rec:true,typed), `aws-ec2-rds-dms-public` (rec:true),
`aws-sqs-unencrypted-queue` (rec:true), `no-empty-group` (rec:true,typed),
`aws-efs-unencrypted` (rec:true), `aws-apigateway-public-api` (rec:true),
`stateful-regex` (rec:true), `concise-regex` (rec:true,typed),
`single-char-in-character-classes` (rec:true,typed), `no-hardcoded-secrets`
(rec:true), `no-exclusive-tests` (rec:true), `hardcoded-secret-signatures`
(rec:true), `jsx-no-leaked-render` (rec:true,typed), `no-hook-setter-in-body`
(rec:true), `no-useless-react-setstate` (rec:true), `no-uniq-key` (rec:true),
`redundant-type-aliases` (rec:true), `prefer-regexp-exec` (rec:true,typed),
`no-internal-api-use` (rec:true), `prefer-read-only-props` (rec:true,typed),
`no-literal-call` (rec:true), `no-async-constructor` (rec:true,typed),
`review-blockchain-mnemonic` (rec:true), `dynamically-constructed-templates`
(rec:true), `no-session-cookies-on-static-assets` (rec:true),
`dompurify-unsafe-config` (rec:true,typed), `no-duplicate-test-title`
(rec:true), `async-test-assertions` (rec:true), `no-empty-test-title`
(rec:true), `hooks-before-test-cases` (rec:true),
`no-forced-browser-interaction` (rec:true), `assertions-in-test-cases`
(rec:true), `synchronous-suite-callback` (rec:true), `super-linear-regex`
(rec:true), `prefer-native-lodash-alternative` (rec:true),
`no-default-utility-imports` (rec:true), `memoize-cache-key` (rec:true),
`no-debug-commands-in-ui-tests` (rec:true), `no-mixed-completion-style`,
`no-interpolation-in-inline-snapshots` (rec:true), `explicit-test-skip`
(rec:true), `no-empty-parameterized-test-dataset` (rec:true),
`testing-library-query-assertion` (rec:true), `synchronous-exception-assertions`
(rec:true,typed), `composite-assertions`, `no-duplicate-parameterized-test-case`
(rec:true), `no-debounce-throttle-in-render` (rec:true),
`avoid-mutating-nested-properties-of-shallow-clones` (rec:true),
`prefer-native-jquery-alternative` (rec:true), `no-vue-class-component`
(rec:true), `no-vue-mixins` (rec:true),
`testing-library-prefer-query-by-disappearance` (rec:true),
`prefer-cypress-should` (rec:true), `no-mutate-reactive-state-in-updated-hook`
(rec:true), `vitest-mock-at-module-scope` (rec:true), `no-networkidle-wait`,
`prefer-native-axios-alternative` (rec:true)

## unicorn (147 unconfigured)

`class-reference-in-static-methods` (rec:true), `comma-spacing` (layout),
`comment-content`, `consistent-arrow-return-style`, `consistent-assert`
(rec:true), `consistent-boolean-name` (rec:true),
`consistent-class-member-order` (rec:true),
`consistent-export-decorator-position` (rec:"unopinionated"),
`consistent-function-scoping` (rec:true), `consistent-function-style`,
`consistent-optional-chaining` (rec:"unopinionated"), `default-export-style`
(rec:true), `empty-brace-spaces` (rec:true,layout), `expiring-todo-comments`
(rec:"unopinionated"), `id-match`, `import-style` (rec:"unopinionated"),
`indent` (layout), `isolated-functions` (rec:true), `key-name-casing`,
`logical-assignment-operators` (rec:true), `max-nested-calls` (rec:true),
`no-abusive-eslint-disable` (rec:"unopinionated"), `no-accessor-recursion`
(rec:"unopinionated"), `no-anonymous-default-export` (rec:"unopinionated"),
`no-array-callback-reference` (rec:true), `no-array-front-mutation`,
`no-array-reduce` (rec:true), `no-asterisk-prefix-in-documentation-comments`
(rec:true,layout), `no-async-iterator-callback` (rec:"unopinionated"),
`no-await-expression-member` (rec:true), `no-barrel-files`,
`no-break-in-nested-loop` (rec:true), `no-canvas-to-image`
(rec:"unopinionated"), `no-conflicting-constraints` (rec:"unopinionated"),
`no-console-spaces` (rec:"unopinionated"), `no-constant-zero-expression`
(rec:"unopinionated"), `no-document-cookie` (rec:"unopinionated"),
`no-empty-file` (rec:"unopinionated"), `no-empty-link-text`
(rec:"unopinionated"), `no-global-object-property-assignment`
(rec:"unopinionated"), `no-incorrect-template-string-interpolation` (rec:true),
`no-ineffective-csp-directives` (rec:"unopinionated"),
`no-invalid-file-input-accept`, `no-invalid-integrity` (rec:"unopinionated"),
`no-invalid-well-known-symbol-methods` (rec:"unopinionated"),
`no-javascript-url`, `no-keyword-prefix`, `no-leading-empty-lines`
(rec:true,layout), `no-lonely-if` (rec:"unopinionated"), `no-loss-of-precision`,
`no-magic-array-flat-depth` (rec:"unopinionated"),
`no-manually-wrapped-comments` (layout), `no-mismatched-map-key` (rec:true),
`no-missing-local-resource`, `no-nested-ternary` (rec:true),
`no-non-function-verb-prefix` (rec:true,typed),
`no-nonstandard-builtin-properties` (rec:"unopinionated"), `no-null` (rec:true),
`no-object-as-default-parameter` (rec:"unopinionated"),
`no-optional-chaining-on-undeclared-variable` (rec:true),
`no-shorthand-property-overrides` (rec:"unopinionated"), `no-thenable`
(rec:"unopinionated"), `no-this-outside-of-class` (rec:true),
`no-top-level-assignment-in-function` (rec:true), `no-top-level-side-effects`
(rec:"unopinionated"), `no-transition-all` (rec:"unopinionated"),
`no-uncalled-method` (rec:true), `no-unnecessary-array-flat-map` (rec:true),
`no-unnecessary-parameters` (rec:true), `no-unnecessary-polyfills`
(rec:"unopinionated"), `no-unsafe-property-key` (rec:true),
`no-unsafe-sqlite-interpolation` (rec:"unopinionated"),
`no-unsafe-string-replacement` (rec:true), `no-useless-compound-assignment`
(rec:"unopinionated"), `no-useless-error-capture-stack-trace`
(rec:"unopinionated"), `no-useless-override` (rec:"unopinionated"),
`no-using-resource-escape` (rec:"unopinionated"), `number-literal-case`
(rec:true), `operator-assignment` (rec:true), `prefer-array-from-async`
(rec:true), `prefer-code-point` (rec:"unopinionated"), `prefer-combined-guards`
(rec:true), `prefer-continue` (rec:true), `prefer-dispose`,
`prefer-early-return` (rec:"unopinionated"), `prefer-error-is-error`,
`prefer-flat-math-min-max` (rec:"unopinionated"),
`prefer-global-number-constants` (rec:"unopinionated"), `prefer-group-by`
(rec:true), `prefer-https` (rec:true),
`prefer-identifier-import-export-specifiers` (rec:"unopinionated"),
`prefer-iterator-concat`, `prefer-iterator-to-array-at-end`
(rec:"unopinionated"), `prefer-iterator-zip` (rec:true), `prefer-math-trunc`
(rec:"unopinionated"), `prefer-module` (rec:"unopinionated"),
`prefer-node-protocol` (rec:"unopinionated"), `prefer-number-coercion`
(rec:"unopinionated"), `prefer-optional-catch-binding` (rec:"unopinionated"),
`prefer-path2d` (rec:"unopinionated"), `prefer-private-class-fields` (rec:true),
`prefer-promise-static-methods` (rec:"unopinionated"), `prefer-promise-try`
(rec:true), `prefer-promise-with-resolvers` (rec:"unopinionated"),
`prefer-prototype-methods` (rec:"unopinionated"), `prefer-queue-microtask`
(rec:"unopinionated"), `prefer-reflect-apply` (rec:"unopinionated"),
`prefer-regexp-escape`, `prefer-response-static-json` (rec:"unopinionated"),
`prefer-short-arrow-method`, `prefer-simplified-conditions`
(rec:"unopinionated"), `prefer-temporal`, `prefer-temporal-conversion`
(rec:"unopinionated"), `prefer-ternary` (rec:"unopinionated"),
`prefer-then-catch` (rec:true), `prefer-type-literal-last` (rec:true),
`prefer-uint8array-hex`, `relative-url-style` (rec:"unopinionated"),
`require-array-sort-compare` (rec:"unopinionated"),
`require-frontmatter-fields`, `require-post-message-target-origin`,
`require-proxy-trap-boolean-return` (rec:"unopinionated"),
`require-text-decoder-streaming` (rec:"unopinionated"),
`single-line-block-comment-style` (rec:true,layout), `string-content`,
`switch-case-braces` (rec:true,layout), `try-complexity`,
`no-unused-array-method-return` (DEPRECATED), `better-regex` (DEPRECATED),
`no-instanceof-array` (DEPRECATED), `no-length-as-slice-end` (DEPRECATED),
`no-hex-escape` (DEPRECATED), `no-array-push-push` (DEPRECATED),
`prevent-abbreviations` (DEPRECATED), `prefer-json-parse-buffer` (DEPRECATED),
`prefer-dom-node-dataset` (DEPRECATED), `no-deprecated-css-features`
(DEPRECATED), `no-duplicate-css-selectors` (DEPRECATED),
`no-duplicate-font-family-names` (DEPRECATED), `no-invalid-media-features`
(DEPRECATED), `no-nesting-with-mixed-specificity` (DEPRECATED),
`no-redundant-nested-style-rules` (DEPRECATED), `no-unknown-css-annotations`
(DEPRECATED), `no-unknown-pseudo-selectors` (DEPRECATED),
`no-unscoped-css-nesting-selector` (DEPRECATED),
`prefer-explicit-viewport-units` (DEPRECATED),
`prefer-media-feature-range-syntax` (DEPRECATED)

## jsx-a11y (4 unconfigured)

`anchor-ambiguous-text`, `click-events-have-key-events`,
`control-has-associated-label`, `no-distracting-elements`

## react-compiler (0 unconfigured)

_все правила подключены_

## react-dom (1 unconfigured)

`no-string-style-prop`

## react-hooks (27 unconfigured)

`hooks`, `capitalized-calls`, `static-components` (rec:true), `use-memo`
(rec:true), `void-use-memo`, `preserve-manual-memoization` (rec:true),
`memo-dependencies`, `incompatible-library` (rec:true), `immutability`
(rec:true), `globals` (rec:true), `refs` (rec:true),
`memoized-effect-dependencies`, `exhaustive-effect-dependencies`,
`set-state-in-effect` (rec:true), `no-deriving-state-in-effects`,
`error-boundaries` (rec:true), `purity` (rec:true), `set-state-in-render`
(rec:true), `invariant`, `todo`, `syntax`, `unsupported-syntax` (rec:true),
`config` (rec:true), `gating` (rec:true), `rule-suppression`, `fbt`,
`component-hook-factories` (DEPRECATED)

## react-jsx (5 unconfigured)

`no-children-prop`, `no-children-prop-with-children`, `no-comment-textnodes`,
`no-leaked-dollar`, `no-leaked-semicolon`

## react-naming-convention (1 unconfigured)

`ref-name`

## react-perf (0 unconfigured)

_все правила подключены_

## react-web-api (0 unconfigured)

_все правила подключены_

## react-x (36 unconfigured)

`error-boundaries`, `exhaustive-deps` (rec:true), `globals`,
`no-children-count`, `no-children-for-each`, `no-children-map`,
`no-children-only`, `no-children-to-array`, `no-clone-element`,
`no-context-provider`, `no-create-ref`, `no-direct-mutation-state`,
`no-forward-ref`, `no-implicit-children`, `no-implicit-key`, `no-implicit-ref`,
`no-leaked-conditional-rendering`, `no-missing-component-display-name`,
`no-missing-context-display-name`, `no-missing-key`,
`no-misused-capture-owner-stack`, `no-nested-lazy-component-declarations`,
`no-set-state-in-component-did-mount`, `no-set-state-in-component-did-update`,
`no-set-state-in-component-will-update`, `no-unsafe-component-will-mount`,
`no-unsafe-component-will-receive-props`, `no-unstable-default-props`,
`no-unused-class-component-members`, `no-unused-state`, `purity`, `refs`,
`rules-of-hooks` (rec:true), `set-state-in-render`, `static-components`,
`unsupported-syntax`

## node (24 unconfigured)

`callback-return`, `exports-style`, `file-extension-in-import`,
`global-require`, `no-callback-literal`, `no-extraneous-import` (rec:true),
`no-missing-import` (rec:true), `no-missing-require` (rec:true),
`no-mixed-requires`, `no-process-env`, `no-process-exit` (rec:true),
`no-restricted-import`, `no-restricted-require`, `no-sync`,
`no-top-level-await`, `no-unpublished-import` (rec:true),
`no-unpublished-require` (rec:true), `no-unsupported-features/es-syntax`
(rec:true), `no-unsupported-features/node-builtins` (rec:true),
`prefer-import/assert-strict`, `prefer-process-get-builtin-module`,
`prefer-promises/dns`, `no-hide-core-modules` (DEPRECATED), `shebang`
(DEPRECATED)

## typescript (46 unconfigured)

`adjacent-overload-signatures` (rec:"stylistic"), `ban-ts-comment`
(rec:{"recommended":true,"strict":[{"minimumDescriptionLength":10}]}),
`ban-tslint-comment` (rec:"stylistic"), `consistent-return` (typed),
`consistent-type-assertions` (rec:"stylistic"), `init-declarations`,
`member-ordering`, `no-confusing-non-null-assertion` (rec:"stylistic"),
`no-confusing-void-expression` (rec:"strict",typed), `no-deprecated`
(rec:"strict",typed), `no-dupe-class-members`, `no-dynamic-delete`
(rec:"strict"), `no-empty-function` (rec:"stylistic"), `no-empty-interface`
(DEPRECATED), `no-extraneous-class` (rec:"strict"), `no-inferrable-types`
(rec:"stylistic"), `no-invalid-this`, `no-loop-func` (DEPRECATED),
`no-loss-of-precision` (DEPRECATED), `no-magic-numbers`, `no-misused-spread`
(rec:"strict",typed), `no-non-null-assertion` (rec:"strict"), `no-redeclare`,
`no-redundant-type-constituents` (rec:"recommended",typed),
`no-restricted-imports` (DEPRECATED), `no-restricted-types`, `no-type-alias`
(DEPRECATED), `no-unsafe-enum-assignment` (rec:"strict",typed),
`no-unsafe-enum-comparison` (rec:"recommended",typed),
`no-unsafe-type-assertion` (typed), `no-var-requires` (DEPRECATED),
`parameter-properties`, `prefer-find` (rec:"stylistic",typed), `prefer-includes`
(rec:"stylistic",typed), `prefer-readonly-parameter-types` (typed),
`prefer-regexp-exec` (rec:"stylistic",typed), `prefer-string-starts-ends-with`
(rec:"stylistic",typed), `prefer-ts-expect-error` (DEPRECATED),
`promise-function-async` (typed), `return-await`
(rec:{"strict":["error-handling-correctness-only"]},typed),
`sort-type-constituents` (DEPRECATED), `strict-boolean-expressions` (typed),
`switch-exhaustiveness-check` (typed), `typedef` (DEPRECATED), `unbound-method`
(rec:"recommended",typed), `use-unknown-in-catch-callback-variable`
(rec:"strict",typed)

## vitest (43 unconfigured)

`consistent-test-filename`, `consistent-vitest-vi`, `expect-expect`,
`hoisted-apis-on-top`, `max-expects`, `max-nested-describe`, `no-done-callback`
(DEPRECATED), `no-hooks`, `no-importing-vitest-globals`, `no-large-snapshots`,
`no-mocks-import`, `no-restricted-matchers`, `no-restricted-vi-methods`,
`no-test-prefixes`, `no-unneeded-async-expect-function`,
`padding-around-after-all-blocks`, `padding-around-after-each-blocks`,
`padding-around-all`, `padding-around-before-all-blocks`,
`padding-around-before-each-blocks`, `padding-around-describe-blocks`,
`padding-around-expect-groups`, `padding-around-test-blocks`,
`prefer-called-exactly-once-with`, `prefer-called-times`,
`prefer-describe-function-title`, `prefer-expect-assertions`,
`prefer-expect-type-of`, `prefer-import-in-mock`,
`prefer-mock-return-shorthand`, `prefer-snapshot-hint`,
`prefer-strict-boolean-matchers`, `prefer-strict-equal`,
`prefer-to-have-been-called-times`, `prefer-todo` (layout),
`require-awaited-expect-poll`, `require-hook`,
`require-local-test-context-for-concurrent-snapshots`,
`require-mock-type-parameters`, `require-test-timeout`,
`require-to-throw-message`, `unbound-method` (typed), `valid-title`

## astro (11 unconfigured)

`no-omitted-end-tags` (DEPRECATED,layout), `no-prerender-export-outside-pages`
(rec:true), `no-set-html-directive`, `no-unsafe-inline-scripts`,
`no-unused-css-selector`, `semi` (layout), `valid-compile` (DEPRECATED),
`jsx-a11y/anchor-ambiguous-text`, `jsx-a11y/click-events-have-key-events`,
`jsx-a11y/control-has-associated-label`, `jsx-a11y/no-distracting-elements`

## svelte (41 unconfigured)

`@typescript-eslint/no-unnecessary-condition` (DEPRECATED),
`consistent-selector-style`, `experimental-require-slot-types`,
`experimental-require-strict-events`, `first-attribute-linebreak` (layout),
`html-closing-bracket-new-line`, `html-closing-bracket-spacing` (layout),
`html-quotes` (layout), `html-self-closing` (layout), `indent` (layout),
`max-attributes-per-line` (layout), `max-lines-per-block`, `mustache-spacing`
(layout), `no-conflicting-module-names`, `no-dynamic-slot-name` (DEPRECATED),
`no-export-load-in-svelte-module-in-kit-pages` (rec:true),
`no-goto-without-base` (DEPRECATED), `no-inline-styles`,
`no-navigation-without-base` (DEPRECATED), `no-navigation-without-resolve`
(rec:true), `no-not-function-handler` (rec:true), `no-raw-special-elements`
(rec:true), `no-reactive-literals` (rec:true), `no-reactive-reassign`
(rec:true), `no-restricted-html-elements`,
`no-spaces-around-equal-signs-in-attribute` (layout), `no-store-async`
(rec:true), `no-trailing-spaces` (layout), `no-unnecessary-state-wrap`
(rec:true), `no-unused-class-name`, `no-unused-props` (rec:true),
`no-useless-children-snippet` (rec:true), `prefer-const`,
`require-event-dispatcher-types` (rec:true),
`require-optimized-style-attribute`, `require-store-callbacks-use-set-param`,
`sort-attributes` (layout), `spaced-html-comment` (layout), `valid-compile`,
`valid-prop-names-in-kit-pages` (rec:true), `valid-style-parse`

## qwik (4 unconfigured)

`jsx-no-script-url` (rec:"error"), `serializer-signal-usage`, `scope-use-task`
(rec:true), `use-async-top`

## vue (114 unconfigured)

`array-bracket-newline` (layout), `array-bracket-spacing` (layout),
`array-element-newline` (layout), `arrow-spacing` (layout), `attributes-order`,
`block-lang`, `block-spacing` (layout), `block-tag-newline` (layout),
`brace-style` (layout), `camelcase`, `comma-dangle` (layout), `comma-spacing`
(layout), `comma-style` (layout), `define-macros-order` (layout), `dot-location`
(layout), `dot-notation`, `eqeqeq`, `first-attribute-linebreak` (layout),
`func-call-spacing` (layout), `html-closing-bracket-newline` (layout),
`html-closing-bracket-spacing` (layout), `html-comment-content-newline`
(layout), `html-comment-content-spacing` (layout), `html-comment-indent`
(layout), `html-indent` (layout), `html-quotes` (layout), `html-self-closing`
(layout), `key-spacing` (layout), `keyword-spacing` (layout),
`match-component-file-name`, `match-component-import-name`,
`max-attributes-per-line` (layout), `max-len` (layout), `max-lines-per-block`,
`max-props`, `max-template-depth`, `multi-word-component-names`,
`multiline-html-element-content-newline` (layout), `multiline-ternary` (layout),
`mustache-interpolation-spacing` (layout),
`new-line-between-multi-line-property` (layout), `next-tick-style`,
`no-arrow-functions-in-watch`, `no-bare-strings-in-template`,
`no-boolean-default`, `no-console`, `no-constant-condition` (rec:true),
`no-custom-modifiers-on-v-model`, `no-empty-pattern` (rec:true),
`no-extra-parens` (layout), `no-implicit-coercion`, `no-import-compiler-macros`,
`no-irregular-whitespace`, `no-loss-of-precision` (rec:true), `no-multi-spaces`
(layout), `no-multiple-template-root`, `no-restricted-block`,
`no-restricted-call-after-await`, `no-restricted-class`,
`no-restricted-component-names`, `no-restricted-component-options`,
`no-restricted-custom-event`, `no-restricted-html-elements`,
`no-restricted-props`, `no-restricted-static-attribute`, `no-restricted-syntax`,
`no-restricted-v-bind`, `no-restricted-v-on`, `no-root-v-if`,
`no-spaces-around-equal-signs-in-attribute` (layout), `no-sparse-arrays`
(rec:true), `no-static-inline-styles`, `no-unsupported-features`,
`no-unused-properties`, `no-unused-refs`, `no-useless-concat`,
`no-v-for-template-key` (DEPRECATED), `no-v-model-argument` (DEPRECATED),
`no-v-text`, `object-curly-newline` (layout), `object-curly-spacing` (layout),
`object-property-newline` (layout), `object-shorthand`,
`one-component-per-file`, `operator-linebreak` (layout), `order-in-components`,
`padding-line-between-blocks` (layout), `padding-line-between-tags` (layout),
`padding-lines-in-component-definition` (layout),
`prefer-prop-type-boolean-first`, `prefer-template`, `prefer-use-template-ref`,
`quote-props`, `require-default-export`, `require-direct-export`,
`require-expose`, `require-prop-comment`, `require-prop-types`,
`require-typed-object-prop`, `restricted-component-names`, `script-indent`
(layout), `singleline-html-element-content-newline` (layout),
`slot-name-casing`, `sort-keys`, `space-in-parens` (layout), `space-infix-ops`
(layout), `space-unary-ops` (layout), `static-class-names-order`,
`template-curly-spacing` (layout), `v-for-delimiter-style` (layout),
`v-if-else-key`, `v-on-handler-style`, `valid-model-definition` (DEPRECATED),
`valid-v-bind-sync` (DEPRECATED)

## depend (0 unconfigured)

_все правила подключены_

## package-json (63 unconfigured)

`prefer-rolling-workspace-spec`, `require-attribution` (rec:true),
`require-package-json-export`, `require-bin`, `require-browser`, `require-bugs`,
`require-bundleDependencies`, `require-config`, `require-contributors`,
`require-cpu`, `require-dependencies`, `require-devDependencies`,
`require-devEngines`, `require-directories`, `require-exports` (rec:true),
`require-files` (rec:true), `require-funding`, `require-gypfile`,
`require-libc`, `require-license` (rec:true), `require-main`, `require-man`,
`require-module`, `require-optionalDependencies`, `require-os`,
`require-packageManager`, `require-peerDependencies`,
`require-peerDependenciesMeta`, `require-private`, `require-publishConfig`,
`require-sideEffects` (rec:true), `require-types`, `restrict-dependency-ranges`,
`restrict-dist-tags`, `restrict-private-properties`,
`restrict-top-level-properties`, `valid-browser` (rec:true), `valid-bugs`
(rec:true), `valid-bundleDependencies` (rec:true), `valid-config` (rec:true),
`valid-contributors` (rec:true), `valid-cpu` (rec:true), `valid-devDependencies`
(rec:true), `valid-devEngines` (rec:true), `valid-engines` (rec:true),
`valid-exports` (rec:true), `valid-gypfile` (rec:true), `valid-libc` (rec:true),
`valid-main` (rec:true), `valid-man` (rec:true), `valid-optionalDependencies`
(rec:true), `valid-os` (rec:true), `valid-packageManager` (rec:true),
`valid-peerDependencies` (rec:true), `valid-peerDependenciesMeta` (rec:true),
`valid-private` (rec:true), `valid-publishConfig` (rec:true), `valid-repository`
(rec:true), `valid-sideEffects` (rec:true), `valid-type` (rec:true),
`valid-workspaces` (rec:true), `valid-peerDependenciesMeta-relationship`
(rec:true), `valid-repository-directory` (rec:true)

## perfectionist (3 unconfigured)

`sort-import-attributes` (rec:true), `sort-export-attributes` (rec:true),
`sort-arrays`
