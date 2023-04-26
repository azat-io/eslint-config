# @azat-io/eslint-config-react

This config extends `@azat-io/eslint-config-typescript`.

## Base rules

### jsx-quotes

Require to use double quotes in JSX attributes.

```tsx
// bad
<Implant name='Sandevistan' />
```

```tsx
// good
<Implant name="Sandevistan" />
```

## React rules

### boolean-prop-naming

Require name boolean props with is- or had- prefix.

```tsx
// bad
interface MariaWallProps {
  broken: boolean
}

let MariaWall: FC<MariaWallProps> = ({ broken }) => (
  {/* ... */}
)
```

```tsx
// good
interface MariaWallProps {
  isBroken: boolean
}

let MariaWall: FC<MariaWallProps> = ({ isBroken }) => (
  {/* ... */}
)
```

### function-component-definition

Require function components to be arrow function.

```tsx
// bad
let DemonSlayer = function (props) {
  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

```tsx
// good
let DemonSlayer = props => (
  <div>
    {/* ... */}
  </div>
)
```

### hook-use-state

Ensure symmetric naming of `useState` hook value and setter variables.

```tsx
// bad
let PsychoPass: FC = () => {
  let [crimeCoefficient, updateCrimeCoefficient] = useState(0)
  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

```tsx
// good
let PsychoPass: FC = () => {
  let [crimeCoefficient, setCrimeCoefficient] = useState(0)
  return (
    <div>
      {/* ... */}
    </div>
  )
}
```

### jsx-boolean-value

Enforce boolean attributes notation in JSX.

```tsx
// bad
let Bebop: FC = () => <Spaceship isRed={true} />
```

```tsx
// good
let Bebop: FC = () => <Spaceship isRed />
```

### jsx-child-element-spacing

Enforce spaces inside of curly braces in JSX attributes and expressions.

### jsx-closing-bracket-location

Require to align closing tag with the opening tag.

```tsx
// bad
let HowlsMovingCastle = ({ speed }) => (
  <Castle
    name="Howl's"
    speed={speed}
    />
)
```

```tsx
// good
let HowlsMovingCastle = ({ speed }) => (
  <Castle
    name="Howl's"
    speed={speed}
  />
)
```

### jsx-closing-tag-location

Enforce closing tag location for multiline JSX.

```tsx
// bad
<Wolf>
  Holo
</Wolf>
```

```tsx
// good
<Wolf>
  Holo
</Wolf>
```

### jsx-curly-brace-presence

Disallow unnecessary JSX expressions when literals alone are sufficient.

```tsx
// bad
<Abyss depth={'13000 meters'} />
```

```tsx
// good
<Abyss depth="13000 meters" />
```

### jsx-curly-spacing

Disallow to add spaces inside of curly braces in JSX.

```tsx
// bad
<Hero name={ name } />;
```

```tsx
// good
<Hero name={name} />;
```

### jsx-equals-spacing

Disallow to add spaces around equal signs in JSX attributes.

```tsx
// bad
<Eternity name = {'Joaan'} />
```

```tsx
// good
<Eternity name={'Joaan'} />
```

### jsx-filename-extension

Allow to use JSX only in `.jsx` and `.tsx` files.

### jsx-fragments

Require to use shorthand for React fragments.

```tsx
// bad
<Fragment>
  <Girl name="Chito" />
  <Girl name="Yuuri" />
</Fragment>
```

```tsx
// good
<>
  <Girl name="Chito" />
  <Girl name="Yuuri" />
</>
```

### jsx-handler-names

Require to add prefix for component methods used as event handlers with `handle` and props that are used as event handlers with `on`.

```tsx
// bad
<CyberpunkBody onChange={updateImplantsList} />
```

```tsx
// good
<CyberpunkBody onChange={handleChange} />
```

### jsx-indent-props

Set props indentation style to 2 spaces.

```tsx
// bad
<Godzilla
height={80}
length={180}
/>
```

```tsx
// good
<Godzilla
  height={80}
  length={180}
/>
```

### jsx-indent

Set indentation style to 2 spaces.

```tsx
// bad
<Takaramachi>
<Tekkonkinkreet />
</Takaramachi>
```

```tsx
// good
<Takaramachi>
  <Tekkonkinkreet />
</Takaramachi>
```

### jsx-key

Disallow missing `key` props in iterators/collection literals.

```tsx
// bad
graceFieldHouseChildren.map(child => <Orphan {...child} />)
```

```tsx
// good
graceFieldHouseChildren.map(child => <Orphan key={child.id} {...child} />)
```

### jsx-no-comment-textnodes

Disallow comments from being inserted as text nodes.

### jsx-no-duplicate-props

Disallow duplicate properties in JSX.

```tsx
// bad
<Student name="Shinichi Izumi" name="Migi" />;
```

```tsx
// good
<Student name="Shinichi Izumi" />;
```

### jsx-no-leaked-render

Disallow problematic leaked values from being rendered.

```tsx
// bad
{0 && <MobPsycho />}
```

```tsx
// good
{stressLevel && <MobPsycho />}
```

### jsx-no-target-blank

Disallow `target="_blank"` attribute without `rel="noreferrer"`.

### jsx-no-undef

Disallow undeclared variables in JSX

### jsx-no-useless-fragment

Disallow unnecessary fragments.

```tsx
// bad
<>
  <ChainsawMan />
</>
```

```tsx
// good
<ChainsawMan />
```

### jsx-pascal-case

Enforce PascalCase for user-defined JSX components.

```tsx
// bad
<Weathering_with_You />
```

```tsx
// good
<WeatheringWithYou />
```

### jsx-props-no-multi-spaces

Disallow multiple spaces between inline JSX props.

```tsx
// bad
<Odokawa    role="taxi driver" />
```

```tsx
// good
<Odokawa role="taxi driver" />
```

### jsx-space-before-closing

Enforce spacing before closing bracket in JSX.

```tsx
// bad
<TerrorInResonance/>
```

```tsx
// good
<TerrorInResonance />
```

### jsx-tag-spacing

Enforce whitespace in and around the JSX opening and closing brackets.

```tsx
// bad
<TokyoGodfather/ >
```

```tsx
// good
<TokyoGodfather />
```

### react/jsx-uses-vars

Disallow variables used in JSX to be incorrectly marked as unused.

### no-children-prop

Disallow passing of children as props.

```tsx
// bad
<Neighbor children="Totoro" />
```

```tsx
// good
<Neighbor>
  Totoro
</Neighbor>
```

### no-deprecated

Disallow usage of deprecated methods.

### no-unescaped-entities

Disallow unescaped HTML entities from appearing in markup.

### no-unknown-property

Disallow usage of unknown DOM property.

```tsx
// bad
<div class="abyss"></div>
```

```tsx
// good
<div className="abyss"></div>
```

### self-closing-comp

Require to empty component tags to be self-closed.

```tsx
// bad
<DeliveryService creator="Kiki"></DeliveryService>
```

```tsx
// good
<DeliveryService creator="Kiki" />
```

### style-prop-object

Require that the value of the prop `style` be an object or a variable that is an object.

```tsx
// bad
<DeathParade style="position: absolute; bottom: -100vb" />
```

```tsx
// good
<DeathParade
  style={{
    position: 'absolute',
    bottom: '-100vb',
  }}
/>
```

### react/void-dom-elements-no-children

Disallow void DOM elements (e.g. `<img />`, `<br />`) from receiving children.

## React hooks rules

### rules-of-hooks

Check rules of Hooks.

### exhaustive-deps

Check effect dependencies.

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

