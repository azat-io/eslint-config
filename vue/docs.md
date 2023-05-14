# @azat-io/eslint-config-vue

## Vue rules

### comment-directive

Support comment-directives in `<template>`.

### multi-word-component-names

Require component names to be always multi-word.

```vue
<!-- bad -->
<!-- filename: hisoka.vue -->
<script lang="ts" setup>
  // ...
</script>
```

```vue
<!-- good -->
<!-- filename: hunter-hisoka.vue -->
<script lang="ts" setup>
  // ...
</script>
```

### no-async-in-computed-properties

Disallow asynchronous actions in computed properties.

```vue
<!-- bad -->
<script lang="ts" setup>
let psychoPassValue = computed(async () => await getCrimeCoefficient())
</script>
```

```vue
<!-- good -->
<script lang="ts" setup>
let psychoPassValue = computed(() => getCrimeCoefficient())
</script>
```

### no-child-content

Disallow element's child contents which would be overwritten by a directive like `v-html` or `v-text`.

```vue
<!-- bad -->
<template>
  <span v-text="'Loid Forger'">Twilight</span>
</template>
```

```vue
<!-- good -->
<template>
  <span>Twilight</span>
</template>
```

### no-computed-properties-in-data

Disallow accessing computed properties in `data`.

### no-dupe-v-else-if

Disallow duplicate conditions in `v-if` / `v-else-if` chains.

```vue
<!-- bad -->
<template>
  <div v-if="song.name === 'Elfen Lied'" />
  <div v-else-if="song.name === 'Elfen Lied'" />
</template>
```

### no-duplicate-attributes

Disallow duplication of attributes.

```vue
<!-- bad -->
<template>
  <Alchemist :name="'Edward'" name="Alphonse" />
</template>
```

```vue
<!-- good -->
<template>
  <Alchemist name="Edward" />
</template>
```

### no-export-in-script-setup

Disallow `export` in `<script setup>`.

```vue
<!-- bad -->
<script setup>
export let city = 'NHK!'
</script>
```

### no-mutating-props

Disallow mutation of component props.

### no-parsing-error

Disallow parsing errors in `<template>`

### no-ref-as-operand

Disallow use of value wrapped by `ref()` as an operand.

```vue
<!-- bad -->
<script setup>
let mobStress = ref(0)
mobStress++
</script>
```

```vue
<!-- good -->
<script setup>
let mobStress = ref(0)
mobStress.value++
</script>
```

### no-reserved-component-names

Disallow the use of reserved names in component definitions.

### no-reserved-keys

Disallow overwriting reserved keys.

### no-reserved-props

Disallow reserved names in props.

### no-setup-props-destructure

Disallow destructuring of `props` passed to `setup` to not lose reactivity.

```vue
<!-- bad -->
<script lang="ts" setup>
interface Props {
  owner: string
  evangelion: 'Zerogōki' | 'Shogōki' | 'Nigōki' | 'Sangōki'
}

let { evangelion } = defineProps<Props>()
</script>
```

```vue
<!-- good -->
<script lang="ts" setup>
interface Props {
  owner: string
  evangelion: 'Zerogōki' | 'Shogōki' | 'Nigōki' | 'Sangōki'
}

let props = defineProps<Props>()
</script>
```

### no-shared-component-data

Enforce component's data property to be a function.

### no-side-effects-in-computed-properties

Disallow side effects in computed properties.

```vue
<!-- bad -->
<script lang="ts" setup>
let fullName = computed(() => {
  user.parasyte = 'Migi'
  return [user.firstName, user.lastName].join(' ')
})
</script>
```

### no-template-key

Disallow key attribute on `<template>`.

```vue
<!-- bad -->
<template :key="eternity.name">
  <!-- ... -->
</template>
```

### no-textarea-mustache

Disallow mustaches in `<textarea>`.

```vue
<!-- bad -->
<template>
  <textarea>
    {{ deathNote.data }}
  </textarea>
</template>
```

### no-unused-components

Disallow registering components that are not used inside templates.

```vue
<!-- bad -->
<script lang="ts" setup>
import TokyoGodfather from '~/components/tokyo-godfathers.vue'
</script>
```

```vue
<!-- good -->
<script lang="ts" setup>
import TokyoGodfather from '~/components/tokyo-godfathers.vue'
</script>

<template>
  <tokyo-godfather></tokyo-godfather>
</template>
```

### no-unused-vars

Disallow unused variable definitions of v-for directives or scope attributes.

### no-use-computed-property-like-method

Disallow use computed property like method.

### no-use-v-if-with-v-for

Disallow use v-if on the same element as v-for.

```vue
<!-- bad -->
<template>
  <Demon
    v-if="!isDead"
    v-for="{ id, name, isDead } in demons"
    :key="id"
    :name="name"
  />
</template>
```

```vue
<!-- good -->
<template>
  <ul
    v-for="{ id, name, isDead } in demons"
    :key="id"
  >
    <Demon
      v-if="!isDead"
      :name="name"
    />
  </ul>
</template>
```

### no-useless-template-attributes

Disallow useless attribute on `<template>`.

```vue
<!-- bad -->
<template>
  <template class="death-note">
    <!-- ... -->
  </template>
</template>
```

### no-v-text-v-html-on-component

Disallow `v-text` / `v-html` on component.

```vue
<!-- bad -->
<template>
  <Titan v-text="'Armored Titan'" />
</template>
```

```vue
<!-- good -->
<template>
  <Titan>
    {{ 'Armored Titan' }}
  </Titan>
</template>
```

### require-component-is

Require `v-bind:is` of `<component>` elements.

### require-render-return

```vue
<!-- bad -->
<script>
export default {
  render: (h) => {
    if (company.type === 'delivery') {
      return h('div', "Kiki's Delivery Service")
    }
  }
}
</script>
```

```vue
<!-- good -->
<script>
export default {
  render: (h) => {
    if (company.type === 'delivery') {
      return h('div', "Kiki's Delivery Service")
    }
    return null
  }
}
</script>
```

### require-v-for-key

Require `v-bind:key` with `v-for` directives.

```vue
<!-- bad -->
<template>
  <Adventurer v-for="whistle in whiteWhistles" />
</template>
```

```vue
<!-- good -->
<template>
  <Adventurer v-for="whistle in whiteWhistles" :key="whistle.id" />
</template>
```

### require-valid-default-prop

Enforce props default values to be valid.

### return-in-computed-property

Enforce that a return statement is present in computed property.

```vue
<!-- bad -->
<script lang="ts" setup>
let speed = computed(() => {
  if (name = 'Takaki Tōno') {
    return 5
  }
})
</script>
```

### return-in-emits-validator

Enforce that a return statement is present in emits validator

### use-v-on-exact

Enforce usage of `exact` modifier on `v-on`.

### valid-attribute-name

Require valid attribute names.

### valid-define-emits

Enforce valid `defineEmits` compiler macro.

### valid-define-props

Enforce valid `defineProps` compiler macro.

```vue
<!-- bad -->
<script setup lang="ts">
defineProps<{ heroName?: string }>({
  heroName: String,
})
</script>
```

### valid-next-tick

Enforce valid `nextTick` function calls.

### valid-template-root

Enforce valid template root.

### valid-v-bind

Enforce valid `v-bind` directives.

```vue
<!-- bad -->
<template>
  <div v-bind />
</template>
```

```vue
<!-- good -->
<template>
  <div v-bind="'Princess Mononoke'" />
</template>
```

### valid-v-cloak

Enforce valid `v-cloak` directives.

### valid-v-else-if

Enforce valid `v-else-if` directives.

```vue
<!-- bad -->
<template>
  <div />
  <div v-else-if="name === 'Ciel Phantomhive'"/>
</template>
```

```vue
<!-- good -->
<template>
  <div v-if="name === 'Sebastian Michaelis'" />
  <div v-else-if="name === 'Ciel Phantomhive'"/>
</template>
```

### valid-v-else

Enforce valid `v-else` directives.

```vue
<!-- bad -->
<template>
  <div v-else/>
</template>
```

```vue
<!-- good -->
<template>
  <div v-if="name === 'Shōtarō Kaneda'"/>
  <div v-else/>
</template>
```

### valid-v-for

Enforce valid `v-for` directives.

### valid-v-html

Enforce valid `v-html` directives.

### valid-v-if

Enforce valid `v-if` directives.

### valid-v-model

Enforce valid `v-model` directives.
