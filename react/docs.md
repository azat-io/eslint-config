# @azat-io/eslint-config-react

This config extends `@azat-io/eslint-config-typescript`.

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
<Hero name={ name } />
```

```tsx
// good
<Hero name={name} />
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
<Student name="Shinichi Izumi" name="Migi" />
```

```tsx
// good
<Student name="Shinichi Izumi" />
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

## Testing library rules

### await-async-query

Ensure that promises returned by async queries are handled properly.

```ts
// bad
let hunters = findAllByRole('hunter')
```

```ts
// good
let hunters = await findAllByRole('hunter')
```

### await-async-utils

Ensure that promises returned by async utils are handled properly.

```ts
// bad
test('something incorrectly', async () => {
  let [ownerElement, evangelionElement] = waitFor(
    () => [
      getByLabelText(container, 'Owner'),
      getByLabelText(container, 'Evangelion'),
    ],
    { container }
  )
})
```

```ts
// good
test('something incorrectly', async () => {
  let [ownerElement, evangelionElement] = await waitFor(
    () => [
      getByLabelText(container, 'Owner'),
      getByLabelText(container, 'Evangelion'),
    ],
    { container }
  )
})
```

### no-await-sync-events

Disallow unnecessary await for sync events.

```ts
// bad
let abyssLevels = async () => {
  await userEvent.tab()
}
```

```ts
// good
let abyssLevels = () => {
  userEvent.tab()
}
```

### no-await-sync-query

Disallow unnecessary `await` for sync queries:

- `getBy*`
- `getByAll*`
- `queryBy*`
- `queryAllBy*`

```ts
// bad
let button = await getByText('One punch button')
```

```ts
// good
let button = getByText('One punch button')
```

### no-container

Disallow the use of `container` methods.

```tsx
// bad
let { container } = render(<GiovannisIsland />)
let father = container.querySelector('#tatsuo-senou')
```

```tsx
// good
render(<GiovannisIsland />)
let father = container.getByLabelText('Tatsuo Senou')
```

### no-debugging-utils

Disallow the use of debugging utilities like `debug`.

### no-dom-import

Disallow importing from DOM Testing Library.

### no-global-regexp-flag-in-query

Disallow the use of the global RegExp flag (/g) in queries.

```ts
// bad
screen.getByText(/odd-taxi-passenger/gi)
```

```ts
// good
screen.getByText(/odd-taxi-passenger/i)
```

### no-render-in-setup

Disallow the use of `render` in testing frameworks setup functions.

### no-unnecessary-act

Disallow wrapping Testing Library utils or empty callbacks in `act`.

### no-wait-for-empty-callback

Disallow empty callbacks for `waitFor` and `waitForElementToBeRemoved`.

```ts
// bad
await waitFor(() => {})
```

```ts
// good
await waitFor(() => {
  screen.getByText('Suzume Iwato')
})
```

### no-wait-for-multiple-assertions

Disallow the use of multiple `expect` calls inside `waitFor`.

### no-wait-for-side-effects

Disallow the use of side effects in `waitFor`.

```ts
// bad
await waitFor(() => {
  fireEvent.keyDown(input, { key: 'ArrowDown' })
  expect(hero.name).toBe('Saitama')
})
```

```ts
// good
fireEvent.keyDown(input, { key: 'ArrowDown' })

await waitFor(() => {
  expect(hero.name).toBe('Saitama')
})
```

### prefer-find-by

Suggest to use `find(All)By*` query instead of `waitFor` + `get(All)By*` to wait for elements.

```ts
// bad
let startBebop = await waitFor(() =>
  screen.getByRole('button', { name: 'Start' })
)
```

```ts
// good
let startBebop = await findByText('Start')
```

### prefer-presence-queries

Ensure appropriate `get*`/`query*` queries are used with their respective matchers.

```ts
// bad
expect(screen.queryByText('Mushi-Shi')).toBeInTheDocument()
```

```ts
// good
expect(screen.getByText('Mushi-Shi')).toBeInTheDocument()
```

### prefer-query-by-disappearance

Suggest using `queryBy*` queries when waiting for disappearance.

```ts
await waitForElementToBeRemoved(screen.getByText('Parasyte'))
```

```ts
await waitForElementToBeRemoved(screen.queryByText('Parasyte'))
```

### prefer-screen-queries

Suggest to use `screen` while querying.

```tsx
// bad
let { getByText } = render(<MugenTrain />)
getByText('Enmu')
```

```tsx
// good
render(<MugenTrain />)
screen.getByText('Enmu')
```

### prefer-user-event

Suggest to use `userEvent` over `fireEvent` for simulating user interactions.

```ts
// bad
import { fireEvent } from '@testing-library/dom'

fireEvent.click(screen.getByText('Run chainsaw'))
```

```ts
// good
import userEvent from '@testing-library/user-event'

userEvent.click(screen.getByText('Run chainsaw'))
```
