# @azat-io/eslint-config-astro

This config extends `@azat-io/eslint-config-typescript`.

## Astro rules

### no-conflict-set-directives

Disallow conflicting set directives and child contents.

```astro
{/* bad */}
<p set:html={'Gon Freecss'}>Hisoka Morow</p>
```

```astro
{/* good */}
<p set:html={'Gon Freecss'}></p>
```

### no-deprecated-astro-canonicalurl

Disallow using deprecated `Astro.canonicalURL`.

### no-deprecated-astro-fetchcontent

Disallow using deprecated `Astro.fetchContent()`.

### no-deprecated-astro-resolve

Disallow using deprecated `Astro.resolve()`.

### no-deprecated-getentrybyslug

Disallow using deprecated `getEntryBySlug()`.

### no-set-text-directive

Disallow use of `set:text`.

### no-unused-css-selector

Disallow selectors defined in `style` tag that don’t use in HTML.

```astro
{/* bad */}
<div class="foo">
</div>

<style>
  .unused {
    color: red;
  }
</style>
```

### no-unused-define-vars-in-style

Disallow unused `define:vars={...}` in style tag.

```astro
{/* bad */}
<style define:vars={{ foregroundColor, backgroundColor }}>
  h1 {
    background-color: var(--background);
    color: var(--foreground);
  }
</style>
```

```astro
{/* good */}
<style define:vars={{ foregroundColor, backgroundColor }}>
  h1 {
    background-color: var(--backgroundColor);
    color: var(--foregroundColor);
  }
</style>
```

### prefer-class-list-directive

Require `class:list` directives instead of class with expressions.

### prefer-object-class-list

Require use object instead of ternary expression in `class:list`.

```astro
{/* bad */}
<div class:list={"a " + (num > 0 ? 'b' : '') + ' ' + (c ? 'c' : '')}></div>
```

```astro
{/* good */}
<div class:list={["a", { b: num > 0, c }]}></div>
```

### prefer-split-class-list

Require use split array elements in `class:list`.

### valid-compile

Disallow warnings when compiling.

## JSX a11y rules

### alt-text

Check if `<img>`, `<area>`, `<input type="image">`, and `<object>` has `alt` attribute.

### anchor-has-content

Enforce that anchors have content.

### anchor-is-valid

Check if anchor has `href` attribute.

### aria-props

Validate that `aria-*` property is listed in [WAI-ARIA States and Properties spec](https://www.w3.org/TR/wai-aria/).

### aria-proptypes

Validate aria state and property values.

### aria-role

Validate aria roles.

### heading-has-content

Enforce that heading elements have content.

### no-aria-hidden-on-focusable

Enforce that `aria-hidden="true"` is not set on focusable elements.

### prefer-tag-over-role

Enforce to use semantic DOM elements over the ari role property.
