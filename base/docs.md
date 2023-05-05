# @azat-io/eslint-config

## Base rules

### array-bracket-spacing

Disallow spaces inside array brackets.

```js
// bad
let heroAssociation = [ 'Saitama', 'Genos', 'King', 'Bang' ]
```

```js
// good
let heroAssociation = ['Saitama', 'Genos', 'King', 'Bang']
```

### array-callback-return

Require `return` statements in callbacks of array methods.

```js
// bad
let titansList = titans.reduce((accumulator, titan, index) => {
  accumulator[titan] = index
}, {})
```

```js
// good
let titansList = titans.reduce((accumulator, titan, index) => {
  accumulator[titan] = index
  return accumulator
}, {})
```

### arrow-body-style

Require braces around arrow function bodies only if needed.

```js
// bad
let getGeneiRedanLeader = () => {
  return 'Chrollo Lucilfer'
}
```

```js
// good
let getGeneiRedanLeader = () => 'Chrollo Lucilfer'
```

### arrow-spacing

Require to add spacing before and after the arrow in arrow functions.

```js
// bad
let countSeriesLength = (episodes, duration)=>{
  return episodes * duration
}
```

```js
// good
let countSeriesLength = (episodes, duration) => {
  return episodes * duration
}
```

### block-spacing

Require spaces inside of blocks.

```js
// bad
let checkIfSerialIsEcchi = () => {return true}
```

```js
// good
let checkIfSerialIsEcchi = () => { return true }
```

### brace-style

Declare brace style for blocks.

```js
// bad
let getPreviewMessage = isHentai =>
{
  if (isHentai) {
    showAgeWarning()
  }
  else {
    showEnjoyWatchingMessage()
  }
}
```

```js
// good
let getPreviewMessage = isHentai => {
  if (isHentai) {
    showAgeWarning()
  } else {
    showEnjoyWatchingMessage()
  }
}
```

### camelcase

Require to use camelcase.

```js
// bad
let spirited_away
```

```js
// good
let spiritedAway
```

### comma-dangle

Require to add trailing commas when the last element or property is in a different line.

```js
// bad
let titans = [
  'Founding Titan',
  'Beast Titan',
  'Armored Titan',
  'Colossal Titan'
]
```

```js
// good
let titans = [
  'Founding Titan',
  'Beast Titan',
  'Armored Titan',
  'Colossal Titan',
]
```

### comma-spacing

Disallow spaces before commas and require after.

```js
// bad
let team = ['Tanjiro' ,'Nezuko' ,'Zenitsu' ,'Inosuke']
```

```js
// good
let team = ['Tanjiro', 'Nezuko', 'Zenitsu', 'Inosuke']
```

### comma-style

Require to add comma after and on the same line.

```js
// bad
let travelers = [
  'Riko'
  , 'Reg'
  , 'Nanachi'
]
```

```js
// good
let travelers = [
  'Riko',
  'Reg',
  'Nanachi',
]
```

### computed-property-spacing

Disallow to add spaces inside computed property brackets.

```js
// bad
miyazakiTitles[ 'my-neighbor-totoro' ]
```

```js
// good
miyazakiTitles['my-neighbor-totoro']
```

### consistent-return

Require `return` statements to either always or never specify values

```js
// bad
let isThisDream = (peopleAround) => {
  if (peopleAround.includes('Paprika')) {
    return true
  }
  return
}
```

```js
// good
let isThisDream = (peopleAround) => {
  if (peopleAround.includes('Paprika')) {
    return true
  }
  return false
}
```

### constructor-super

Require `super()` calls in constructors.

```js
// bad
class CowboyBebop {
  constructor() {
    super()
  }
}

class CowboyBebop extends Anime {
  constructor() {
  }
}
```

```js
// good
class CowboyBebop {
  constructor() {
  }
}

class CowboyBebop extends Anime {
  constructor() {
    super()
  }
}
```

### curly

Require to use curly braces.

```js
// bad
if (error) mobStressLevel++
```

```js
// good
if (error) {
  mobStressLevel++
}
```

### default-case-last

Require `default` clauses in `switch` statements to be last.

```js
// bad
switch (demonName) {
  default:
    power = 1
  case 'Yahaba':
    power = 30
    break
  case 'Susamaru':
    power = 25
    break
}
```

```js
// good
switch (demonName) {
  case 'Yahaba':
    power = 30
    break
  case 'Susamaru':
    power = 25
    break
  default:
    power = 1
}
```

### dot-notation

Require to use dot notation whenever possible.

```js
// bad
dramas['dororo']
```

```js
// good
dramas.dororo
```

### eqeqeq

Require the use of `===` and `!==`

```js
// bad
if (name == 'Akane Tsunemori') {
  crimeCoefficient = 32.5
}
```

### func-call-spacing

Disallow spacing between function identifiers and their invocations.

```js
// bad
getRandomMechaSeries ()
```

```js
// good
getRandomMechaSeries()
```

### generator-star-spacing

Require to add spaces before and after `*` operators in generator functions.

```js
// bad
function* stressMob() {
  yield "40"
  yield "80"
  yield "100"
}
```

```js
// good
function * stressMob() {
  yield "40"
  yield "80"
  yield "100"
}
```

### key-spacing

Require to add no space before colon and add space after colon.

```js
// bad
let edward = {
  firstName : 'Edward',
  lastName : 'Elric',
  gender : 'Male',
  abilities : ['Alchemy', 'High intelligence'],
}
```

```js
// good
let edward = {
  firstName: 'Edward',
  lastName: 'Elric',
  gender: 'Male',
  abilities: ['Alchemy', 'High intelligence'],
}
```

### keyword-spacing

Require to add spaces before and after keywords.

```js
// bad
let harvestOfWheat
if(spiritName === 'Holo'){
  harvestOfWheat = true
}else{
  harvestOfWheat = false
}
```

```js
// good
let harvestOfWheat
if (spiritName === 'Holo') {
  harvestOfWheat = true
} else {
  harvestOfWheat = false
}
```

### lines-between-class-members

Require to add an empty lines between class members.

```js
// bad
class DeathNote {
  notes = []
  addNote(name, causeOfDeath) {
    this.notes.push({
      addedAt: new Date(),
      causeOfDeath,
      name,
    })
  }
  showDeadPeopleList() {
    this.notes.forEach(({ name }) => {
      console.log(name)
    })
  }
}
```

```js
// good
class DeathNote {
  notes = []

  addNote(name, causeOfDeath) {
    this.notes.push({
      addedAt: new Date(),
      causeOfDeath,
      name,
    })
  }

  showDeadPeopleList() {
    this.notes.forEach(({ name }) => {
      console.log(name)
    })
  }
}
```

### new-cap

Require constructor names to begin with a capital letter.

```js
// bad
let femaleTitan = new titan('Annie Leonhart', 'Female Titan')
```

```js
// good
let femaleTitan = new Titan('Annie Leonhart', 'Female Titan')
```

### new-parens

Require to use parentheses when invoking a constructor with no arguments.

```js
// bad
let cyberImplant = new Implant
```

```js
// good
let cyberImplant = new Implant()
```

### no-array-constructor

Disallow to use `Array` constructors.

```js
// bad
let children = new Array('Emma', 'Norman', 'Ray', 'Don', 'Gilda')
```

```js
// good
new Array(100)
```

### no-async-promise-executor

Disallow to use async function as a Promise executor.

```js
// bad
let animeOfTheDay = new Promise(async (resolve, reject) => {
  resolve(await loadRandomAnime);
})
```

```js
// good
let animeOfTheDay = Promise.resolve(loadRandomAnime)
```

### no-caller

Disallow the use of `arguments.caller` or `arguments.callee`.

### no-case-declarations

Disallow lexical declarations in case clauses.

```js
// bad
switch (number) {
  case 4:
    let name = 'Seijūrō Akashi'
    break
  case 5:
    let name = 'Atsushi Murasakibara'
    break
  default:
    break
}
```

```js
// good
switch (number) {
  case 4: {
    let name = 'Seijūrō Akashi'
    break
  }
  case 5: {
    let name = 'Atsushi Murasakibara'
    break
  }
  default:
    break
}
```

### no-class-assign

Disallow to reassign class members.

```js
// bad
class Hero {
  constructor(name) {
    this.name = name
  }

  check() {
    if (this.name === 'Muzan Kibutsuji') {
      Hero = Demon
    }
  }
}
```

```js
// good
let Hero = class {
  constructor(name) {
    this.name = name
  }

  check() {
    if (this.name === 'Muzan Kibutsuji') {
      Hero = Demon
    }
  }
}
```

### no-compare-neg-zero

Disallow comparing against -0.

### no-console

Disallow to use `console`.

### no-cond-assign

Disallow assignment operators in conditional expressions.

```js
// bad
let dogName
let owner
if (dogName = 'Pochita') {
  owner = 'Denji'
}
```

```js
// good
let dogName = 'Pochita'
let owner
if (dogName === 'Pochita') {
  owner = 'Denji'
}
```

### no-const-assign

Disallow to reassign `const` variables.

```js
// bad
const HERO = 'Eren Jaeger'
HERO = 'Founding Titan'
```

### no-constant-condition

Disallow constant expressions in conditions.

```js
// bad
if (true) {
  deliver(['food'])
}
```

```js
// good
if (witchName === 'Kiki') {
  deliver(['food'])
}
```

### no-control-regex

Disallow control characters in regular expressions.

### no-debugger

Disallow the use of `debugger`.

```js
// bad
let getAbyssLevel = (position) => {
    debugger
    let { level } = getPositionData(position)
    return level
}
```

```js
// good
let getAbyssLevel = (position) => {
    let { level } = getPositionData(position)
    return level
}
```

### no-dupe-args

Disallow duplicate arguments in `function` definitions.

### no-dupe-class-members

Disallow duplicate class members.

```js
// bad
class Diclonius {
  kill() {
    console.log('Nya')
  }

  kill() {
    console.log('Nyu')
  }
}
```

```js
// good
class Diclonius {
  kill() {
    console.log('Nya')
  }
}
```

### no-dupe-else-if

Disallow duplicate conditions in if-else-if chains.

### no-dupe-keys

Disallow duplicate keys in object literals.

```js
// bad
let person = {
  name: 'Makima',
  name: 'Nayuta'
}
```

```js
// good
let person = {
  name: 'Makima',
}
```

### no-duplicate-case

Disallow duplicate case labels.

```js
// bad
let isOrb
switch (character) {
  case 'Fushi':
    isOrb = true
    break
  case 'Beholder':
    isOrb = false
    break
  case 'Gugu':
    isOrb = true
    break
  case 'Fushi':
    isOrb = true
    break
  default
    isOrb = false
}
```

```js
// good
let isOrb
switch (character) {
  case 'Fushi':
    isOrb = true
    break
  case 'Beholder':
    isOrb = false
    break
  case 'Gugu':
    isOrb = true
    break
  default
    isOrb = false
}
```

### no-else-return

Disallow `else` blocks after return statements in `if` statements

```js
// bad
let authInPrisonSchool = (user) => {
  if (user.gender === 'male') {
    return 'arrested'
  } else {
    return 'free'
  }
}
```

```js
// good
let authInPrisonSchool = (user) => {
  if (user.gender === 'male') {
    return 'arrested'
  }
  return 'free'
}
```

### no-empty

Disallow empty block statements.

```js
// bad
if (character.isDemon) {
}
```

```js
// good
if (character.isDemon) {
  waterWheelAttack(character)
}
```

### no-empty-character-class

Disallow empty character classes in regular expressions.

### no-empty-pattern

Disallow empty destructuring patterns.

```js
// bad
let { abilities: [] } = titan;
```

```js
// good
let { abilities = [] } = titan;
```

### no-eval

`eval()` is evil

### no-ex-assign

Disallow reassigning exceptions in `catch` clauses.

### no-extend-native

Disallow extending native types.

```js
// bad
Object.prototype.parasyte = 'Migi'
```

### no-extra-bind

Disallow unnecessary calls to `.bind()`.

### no-extra-boolean-cast

Disallow unnecessary boolean casts.

```js
// bad
if (!!!!!!!caveRaider.isWhiteWhistles) {
  caveRaider.die()
}
```

```js
// good
if (!caveRaider.isWhiteWhistles) {
  caveRaider.die()
}
```

### no-extra-parens

Disallow unnecessary parentheses.

```js
// bad
typeof (hero)
```

```js
// good
typeof hero
```

### no-fallthrough

Disallow fallthrough of `case` statements.

```js
// bad
switch(name) {
  case 'Tsubomi Takane':
    inviteToADate()

  case 'Tome Kurata':
    decline()
}
```

```js
// good
switch(name) {
  case 'Tsubomi Takane':
    inviteToADate()
    break

  case 'Tome Kurata':
    decline()
    break
}
```

### no-floating-decimal

Disallow leading or trailing decimal points in numeric literals.

### no-func-assign

Disallow reassigning function declarations.

### no-global-assign

Disallow assignments to native objects or read-only global variables.

```js
// bad
spy = 'Twilight'
```

```js
// good
let spy = 'Twilight'
```

### no-implied-eval

Disallow the use of eval()-like methods.

### no-import-assign

Disallow assigning to imported bindings.

```js
// bad
import { horrors } from './data'

horrors = ['When the Cicadas Cry']
```

### no-invalid-regexp

Disallow invalid regular expression strings in `RegExp` constructors.

### no-irregular-whitespace

Disallow irregular whitespace.

```js
// bad
let getBlackButlerCharacters = async (   ) => {
  let response = await fetch('/data/black-butler')
  let json = await response.json()
  return json.characters
}
```

```js
// good
let getBlackButlerCharacters = async () => {
  let response = await fetch('/data/black-butler')
  let json = await response.json()
  return json.characters
}
```

### no-iterator

Disallow the use of the `__iterator__` property.

### no-labels

Disallow labeled statements

### no-mixed-operators

Disallow mixed binary operators.

### no-multi-spaces

Disallow multiple spaces.

```js
// bad
if (  user.name === 'Odokawa' &&  user.role === 'Taxi driver'   ) {
}
```

```js
// good
if (user.name === 'Odokawa' && user.role === 'Taxi driver') {
}
```

### no-multi-str

Disallow multiline strings.

```js
// bad
let obj = 'Anya Forger \
        Test Subject "007"'
```

### no-multiple-empty-lines

Disallow multiple empty lines.

```js
// bad
let name = 'David Martinez'


let age = 18
```

### no-nested-ternary

Disallow nested ternary expressions.

### no-new

Disallow `new` operators outside of assignments or comparisons.

```js
// bad
new Bartender('Decim')
```

```js
// good
let bartender = new Bartender('Decim')
```

### no-new-func

Disallow new operators with the `Function` object.

### no-new-object

Disallow `Object` constructors.

```js
// bad
let student = new Student({
  name: 'Shōko Nishimiya',
  birthday: 'June 7th'
})
```

```js
// good
let student = {
  name: 'Shōko Nishimiya',
  birthday: 'June 7th'
}
```

### no-new-symbol

Disallow `new` operators with the `Symbol` object.

### no-new-wrappers

Disallow `new` operators with the `String`, `Number`, and `Boolean` objects.

```js
// bad
let protagonist = new String('Amano Hina')
```

```js
// good
let protagonist = 'Amano Hina'
```

### no-obj-calls

Disallow calling global object properties as functions.

### no-octal

Disallow octal literals

### no-octal-escape

Disallow octal escape sequences in string literals.

### no-proto

Disallow the use of the `__proto__` property.

### no-regex-spaces

Disallow multiple spaces in regular expressions.

### no-return-assign

Disallow assignment operators in `return` statements.

```js
// bad
let head = {
  name: 'Levi Ackerman',
  isInjured: false
}

let getDeputy = () => {
  return head = {
    name: 'Hange Zoë',
    isInjured: false
  }
}
```

```js
// good
let head = {
  name: 'Levi Ackerman',
  isInjured: false
}

let getDeputy = () => {
  head = {
    name: 'Hange Zoë',
    isInjured: false
  }
  return head
}
```

### no-self-assign

Disallow assignments where both sides are exactly the same.

### no-self-compare

Disallow comparisons where both sides are exactly the same.

### no-shadow-restricted-names

Disallow identifiers from shadowing restricted names.

### no-sparse-arrays

Disallow sparse arrays.

```js
// bad
let myBand = ['Haruhi Suzumiya', 'Mikuru Asahina', , 'Yuki Nagato']
```

### no-tabs

Disallow all tabs.

### no-template-curly-in-string

Disallow template literal placeholder syntax in regular strings.

### no-this-before-super

Disallow `this`/`super` before calling `super()` in constructors.

### no-trailing-spaces

Disallow trailing whitespace at the end of lines.

### no-undef

Disallow the use of undeclared variables.

```js
// bad
startEva()
```

```js
// good
let startEva = () => {
  // ...
}

startEva()
```

### no-undef-init

```js
// bad
let demonSlayerSquad = undefined
```

```js
// good
let demonSlayerSquad
```

### no-unexpected-multiline

Disallow confusing multiline expressions.

### no-unneeded-ternary

Disallow ternary operators when simpler alternatives exist.

```js
// bad
let isBeastTitan = character.name === 'Zeke Yeager' ? true : false
```

```js
// good
let isBeastTitan = character.name === 'Zeke Yeager'
```

### no-unreachable

Disallow unreachable code after `return`, `throw`, `continue`, and `break` statements.

```js
// bad
let getProtagonist = () => {
  return 'Shinichi Izumi'
  age = 18

}
```

### no-unreachable-loop

Disallow loops with a body that allows only one iteration.

```js
// bad
let enforcers = [
  'Shinya Kogami',
  'Tomomi Masaoka',
  'Yayoi Kunizuka',
  'Shusei Kagari',
]
for (let i = 0; i < enforcers.length; i++) {
  if (enforcers[i] === 'Nobuchika Ginoza') {
    addToTeam(arr[i])
  }
  break
}
```

### no-unsafe-finally

Disallow control flow statements in `finally` blocks.

### no-unsafe-negation

Disallow negating the left operand of relational operators.

```js
// bad
if (!student in uAHighSchool) {
}
```

```js
// good
if (!(student in uAHighSchool)) {
}
```

### no-unsafe-optional-chaining

Disallow use of optional chaining in contexts where the `undefined` value is not allowed

### no-unused-expressions

Disallow unused expressions.

```js
// bad
let mobPowerLevel = 0
let incrementPower = () => {
  mobPowerLevel += 10
}
incrementPower()
```

```js
// good
let mobPowerLevel = 0
let incrementPower = () => {
  mobPowerLevel += 10
  return mobPowerLevel
}
incrementPower()
```

### no-unused-vars

Disallow unused variables and unused function args.

```js
// bad
let isKayoHinazukiDead = false
let getCurrentStatus = (name, sex, isDead) => {
  console.log(`${name} is dead`)
}
```

```js
// good
let isKayoHinazukiDead = false
let getCurrentStatus = (name, sex, isDead) => {
  console.log(`${name} is ${isDead ? 'dead' : 'not dead'}`)
}
getCurrentStatus('Kayo', 'female', isKayoHinazukiDead)
```

### no-use-before-define

Disallow to use variables before they are defined.

```js
// bad
console.log(`Remaining survivors in the Kurta clan: ${kurtaClanMembers.length}`)
let kurtaClanMembers = ['Kurapika']
```

```js
// good
let kurtaClanMembers = ['Kurapika']
console.log(`Remaining survivors in the Kurta clan: ${kurtaClanMembers.length}`)
```

### no-useless-backreference

Disallow useless backreferences in regular expressions.

## no-useless-call

Disallow unnecessary calls to `.call()` and `.apply()`.

### no-useless-catch

Disallow unnecessary `catch` clauses.

```js
// bad
try {
  startBebop()
} catch (error) {
  throw error
}
```

```js
// good
try {
  startBebop()
} catch (error) {
  handleSpaceshipCrash()
}
```

### no-useless-computed-key

Disallow unnecessary computed property keys in objects and classes.

```js
// bad
let family {
  ['father']: 'Loid Forger',
  ['mother']: 'Yor Forger',
  ['daughter']: 'Anya Forger',
}
```

```js
// bad
let family {
  father: 'Loid Forger',
  mother: 'Yor Forger',
  daughter: 'Anya Forger',
}
```

### no-useless-constructor

Disallow unnecessary constructors.

```js
// bad
class Akame {
  constructor () {
  }
}
```

```js
// good
class Akame {
}
```

### no-useless-escape

Disallow unnecessary escape characters.

```js
// bad
let title = 'Z\ankyou no Terror'
```

### no-useless-rename

Disallow renaming import, export, and destructured assignments to the same name.

```js
// bad
import { RizeKamishiro as RizeKamishiro } from 'ghoul'
```

### no-useless-return

Disallow redundant return statements.

```js
// bad
let assessRisks = () => {
  countNumberOfTitans()
  return
}
```

```js
// good
let assessRisks = () => {
  countNumberOfTitans()
}
```

### no-var

Require let or const instead of var.

```js
// bad
var name = 'Shinji Ikari'
```

```js
// good
let name = 'Shinji Ikari'
```

### no-void

Disallow `void` operators

### no-whitespace-before-property

Disallow whitespace before properties.

```js
// bad
zenitsuAgatsuma .godspeed() .thunderclap()
```

```js
// good
zenitsuAgatsuma.godspeed().thunderclap()
```

### no-with

Disallow `with` statements.

### object-curly-spacing

Require to add spacing inside braces.

```js
// bad
let cowboy = {name: 'Spike Spiegel', age: 27}
```

```js
// good
let cowboy = { name: 'Spike Spiegel', age: 27 }
```

### object-property-newline

Require to place object properties on separate lines or one line.

```js
// bad
let newFamily = {
  father: 'Paul Greyrat',
  mother: 'Zenith Greyrat', son: 'Rudeus Greyrat'
}
```

```js
// good
let newFamily = {
  father: 'Paul Greyrat',
  mother: 'Zenith Greyrat',
  son: 'Rudeus Greyrat'
}
```

### object-shorthand

Require method and property shorthand syntax for object literals.

```js
// bad
let user = {
  name: name,
  age: age,
}
```

```js
// good
let user = {
  name,
  age,
}
```

### one-var

Require to declare variables separately.

```js
// bad
let rintarou = new Character('Rintarou Okabe'),
  kurisu = new Character('Kurisu Makise')
```

```js
// good
let rintarou = new Character('Rintarou Okabe')
let kurisu = new Character('Kurisu Makise')
```

### operator-linebreak

Enforce consistent linebreak style for operators.

### padded-blocks

Disallow padding within blocks.

```js
// bad
if (tokyoGodfathers.hasChild) {

  tokyoGodfathers.findParents()

}
```

```js
// good
if (tokyoGodfathers.hasChild) {
  tokyoGodfathers.findParents()
}
```

### padding-line-between-statements

Require padding lines between statements

```js
// bad
let getDoesNotExistName = () => {
  let name = 'Mei Misaki'
  return name
}
```

```js
// good
let getDoesNotExistName = () => {
  let name = 'Mei Misaki'

  return name
}
```

### prefer-destructuring

Require destructuring from arrays and objects.

```js
// bad
let haibaneAge = raka.haibaneAge
```

```js
// good
let { haibaneAge } = raka
```

### prefer-exponentiation-operator

Disallow the use of `Math.pow` in favor of the `**` operator

### prefer-promise-reject-errors

Require using Error objects as Promise rejection reasons.

```js
// bad
Promise.reject('There was a murder in Hinamizawa')
```

```js
// good
Promise.reject(new Error('There was a murder in Hinamizawa'))
```

### prefer-regex-literals

Disallow to use `RegExp` constructor in favor of regular expression literals.

### prefer-rest-params

Require to use rest parameters instead of `arguments`.

### quote-props

Disallow to add quotes around object literal property names that are not strictly required.

```js
// bad
let mushishi = {
  'name': 'Ginko'
  'is-alive': true
}
```

```js
// good
let mushishi = {
  name: 'Ginko'
  'is-alive': true
}
```

### quotes

Require to use single quotes.

```js
// bad
let graceFieldMama = "Isabella"
```

```js
// bad
let graceFieldMama = 'Isabella'
```

### rest-spread-spacing

Disallow to add space before rest and spread operators.

```js
// bad
marleyArmy.add(... titans)
```

```js
// good
marleyArmy.add(...titans)
```

### semi

Disallow to use semicolons.

```js
// bad
let users = ['Gon Freecss', 'Killua Zoldyck', 'Leorio Paradinight'];
```

```js
// good
let users = ['Gon Freecss', 'Killua Zoldyck', 'Leorio Paradinight']
```

### space-before-blocks

Require to add space before code blocks.

```js
// bad
if (numberOwner === 'Hisoka Morow'){
  setExamPhase(5)
}
```

```js
// good
if (numberOwner === 'Hisoka Morow') {
  setExamPhase(5)
}
```

### space-before-function-paren

Require to add space before `function` definition opening parenthesis.

```js
// bad
function getStudentName(id) {
  let student = findStudentById(id)
  return student.name ?? 'Mei Misaki'
}
```

```js
// good
function getStudentName (id) {
  let student = findStudentById(id)
  return student.name ?? 'Mei Misaki'
}
```

### space-in-parens

Disallow to add spaces in function parenthesis.

```js
// bad
cowboyBebop.addFuel( 200 )
```

```js
// good
cowboyBebop.addFuel( 200 )
```

### space-infix-ops

Require to add spaces around infix operators.

### space-unary-ops

Require to add space after word unary operators and not to add after non word operator.

### spaced-comment

Require to add space after `//` or `/*` in a comment.

### template-curly-spacing

Disallow to add spaces around embedded expressions of template strings.

```js
// bad
console.log(`We welcome the new member of hero association ${ name }`)
```

```js
// good
console.log(`We welcome the new member of hero association ${ name }`)
```

### template-tag-spacing

Disallow to add space between template tags and their literals.

### use-isnan

Require calls to `isNaN()` when checking for `NaN`.

```js
// bad
if (income === NaN) {
  throw new Error('Cannot check odd taxi salary')
}
```

```js
// good
if (isNaN(income)) {
  throw new Error('Cannot check odd taxi salary')
}
```

### valid-typeof

Validate `typeof` expressions.

```js
// bad
typeof meruemName === 'strnig'
```

```js
// good
typeof meruemName === 'string'
```

### wrap-iife

Require to add parentheses around immediate function invocations.

### yoda

Disallow "Yoda" conditions.

```js
// bad
if ('Tatsuhiro Satō' === name) {
}
```

```js
// good
if (name === 'Tatsuhiro Satō') {
}
```

## Import rules

### consistent-type-specifier-style

Require that type-only named specifiers be written only as part of high-level type-only imports and never with an embedded marker.

```js
// bad
import { type Titan } from 'titans'
```

```js
// good
import type { Titan } from 'titans'
```

### export

Forbid any invalid exports.

```js
// bad
export let couple = 'Mitsuki Hayase'
let harukaSuzumiya = 'Haruka Suzumiya'
export { harukaSuzumiya as couple }
```

```js
// good
export let mitsukiHayase = 'Mitsuki Hayase'
let harukaSuzumiya = 'Haruka Suzumiya'
export { harukaSuzumiya as couple }
```

### first

Require all imports appear before other statements.

### named

Verify that named imports correspond to a named export in the remote file.

```js
// spirits-and-such-consultation-office.js
export let arataka = 'Arataka Reigen'
export let shigeo = 'Shigeo Kageyama'
export let ekubo = 'Ekubo'
```

```js
// bad
import { toichiro } from './spirits-and-such-consultation-office'
```

```js
// good
import { arataka, shigeo } from './spirits-and-such-consultation-office'
```

### newline-after-import

Require to add newline after imports.

### no-absolute-path

Disallow to use absolute paths in imports.

```js
// bad
import { kanta } from '/Users/azat/Developer/app/giovanni-no-shima'
```

```js
// good
import { kanta } from './giovanni-no-shima'
```

### no-duplicates

Forbid repeated import of the same module in multiple places.

```js
// bad
import { shoutarou } from 'akira'
import { tetsuo } from 'akira'
```

```js
// good
import { shoutarou, tetsuo } from 'akira'
```

### no-empty-named-blocks

Forbid empty named import blocks.

### no-named-default

Forbid named default exports.

```js
// bad
import { default as Shigure } from 'fruits-basket'
```

```js
// good
import Shigure from 'fruits-basket'
```

### no-self-import

Forbid a module from importing itself.

### no-useless-path-segments

Forbid unnecessary path segments in import and require statements.

### no-webpack-loader-syntax

Forbid webpack loader syntax in imports.

```js
// bad
import colors from 'style!css!./theme.css';
```

### order

Set a convention in module import order.

```js
// bad
import { wallMaria, wallRose } from '~/lib/walls'
import { eldiaPeople } from 'eldia'
import type { Titan } from 'attack-on-titan'
import { marleyPeople } from 'marley'
import './equipment'
import { erenYeager, mikasaAckerman } from '~/survey-corps/data'
```

```js
// good
import type { Titan } from 'attack-on-titan'

import { marleyPeople } from 'marley'
import { eldiaPeople } from 'eldia'

import { erenYeager, mikasaAckerman } from '~/survey-corps/data'
import { wallMaria, wallRose } from '~/lib/walls'

import './equipment'
```

## N rules

### handle-callback-err

Require error handling in callbacks.

```js
// bad
let handleDororoCurse = (error, partOfBody) => {
  updateBody(partOfBody)
}
```

```js
// good
let handleDororoCurse = (error, partOfBody) => {
  if (error) {
    handleError(error)
  }
  updateBody(partOfBody)
}
```

### no-deprecated-api

Disallow deprecated APIs.

### no-exports-assign

Disallow the assignment to exports.

### no-path-concat

Disallow string concatenation with `__dirname` and `__filename`.

```js
// bad
let fullPath = __dirname + '/singular-point'
```

```js
// good
import path from 'path'

let fullPath = path.join(__dirname, '/singular-point')
```

### process-exit-as-throw

Require that `process.exit()` expressions use the same code path as throw.

## Prefer arrow rules

### prefer-arrow-functions

Require to use arrow functions.

```js
// bad
function checkInventory() {
  if (!guts.inventory.has('Dragon Slayer')) {
    throw new Error('Sword not found')
  }
  return true
}
```

```js
// good
let checkInventory = () => {
  if (!guts.inventory.has('Dragon Slayer')) {
    throw new Error('Sword not found')
  }
  return true
}
```

## Prefer let rules

### prefer-let

Encourage semantic of usage of `let` and `const`.

## Promise rules

### no-multiple-resolved

Disallow to create new promises with paths that resolve multiple times.

```js
// bad
new Promise((resolve, reject) => {
  findAskeladd((error, value) => {
    if (error) {
      reject(error)
    }
    resolve(value)
  })
})
```

```js
// good
new Promise((resolve, reject) => {
  findAskeladd((error, value) => {
    if (error) {
      reject(error)
    } else {
      resolve(value)
    }
  })
})
```

### no-nesting

Disallow nested `then()` or `catch()` statements.

### no-promise-in-callback

Disallow to use promises inside of callbacks

### param-names

Enforce consistent param names and ordering when creating new promises.

### prefer-await-to-callbacks

Prefer `async`/`await` to the callback pattern.

### prefer-await-to-then

Prefer `await` to `then()`/`catch()`/`finally()` for reading Promise values.

```js
// bad
let passExam = () => {
  return tunnelPhase.then(viscaForestPhase).then(trickTowerPhase)
}
```

```js
// good
let passExam = async () => {
  let tunnelPhaseResult = await tunnelPhase()
  let viscaForestPhaseResult = await viscaForestPhase(tunnelPhaseResult)
  let trickTowerPhaseResult = await trickTowerPhase(viscaForestPhaseResult)
  return trickTowerPhaseResult
}
```

### valid-params

Check number of arguments are passed to Promise functions.

## Unicorn rules

### better-regex

Improve regexp by making them shorter, consistent, and safer.

### catch-error-name

Enforce a specific parameter name in catch clauses.

```js
// bad
try {
  let killedUser = deathNoteRequest(userId)
  users = users.filter(user => user.id === killedUser.id)
} catch (notFoundUserMessage) {
  console.log(notFoundUserMessage)
}
```

```js
// bad
try {
  let killedUser = deathNoteRequest(userId)
  users = users.filter(user => user.id === killedUser.id)
} catch (error) {
  console.log(error)
}
```

### custom-error-definition

Enforce correct `Error` subclassing.

### no-for-loop

Disallow to use `for` loop.

```js
// bad
for (let index = 0; index < cards.length; index++) {
  let card = cards[index]
  if (greedIslandBook.findIndex(card) !== -1) {
    greedIslandBook.push(card)
  }
}
```

```js
// good
for (let card of cards) {
  if (greedIslandBook.findIndex(card) !== -1) {
    greedIslandBook.push(card)
  }
}
```

### no-instanceof-array

Require `Array.isArray()` instead of `instanceof Array`.

### no-invalid-remove-event-listener

Prevent calling `EventTarget#removeEventListener()` with the result of an expression.

### no-typeof-undefined

Disallow comparing `undefined` using `typeof`.

```js
// bad
if (typeof aratakaReigen.power === 'undefined') {
}
```

```js
// good
if (aratakaReigen.power === undefined) {
}
```

### no-unnecessary-await

Disallow awaiting non-promise values.

### no-unused-properties

Disallow unused object properties.

```js
// bad
let elias = {
  name: 'Elias Ainsworth',
  isHuman: false,
}
console.log(elias.name)
```

### no-useless-spread

Disallow unnecessary spread

```js
// bad
let titans = new Set([...titans])
```

```js
// good
let titans = new Set(titans)
```

### no-useless-undefined

Disallow useless `undefined`.

```js
// bad
let namelessBoy = undefined
```

```js
// good
let namelessBoy
```

### prefer-add-event-listener

Prefer `.addEventListener()` and `.removeEventListener()` over `on`-functions.

### prefer-array-index-of

Prefer `Array#{indexOf,lastIndexOf}()` over `Array#{findIndex,findLastIndex}()` when looking for the index of an item.

```js
// bad
let index = hashiraTeam.find(warrior => warrior === 'Giyu Tomioka')
```

```js
// good
let index = hashiraTeam.indexOf('Giyu Tomioka')
```

### prefer-array-some

Prefer `.some(…)` over `.filter(…).length` check and `.{find,findLast}(…)`.

```js
// bad
let hasShadows = hitogashimaIsland.filter(villager => isShadow(villager)).length > 0;
```

```js
// good
let hasShadows = hitogashimaIsland.some(villager => isShadow(villager))
```

### prefer-at

Prefer `.at()` method for index access.

```js
// bad
let reiAyanamiEva = evangelionUnit[0]
```

```js
// good
let reiAyanamiEva = evangelionUnit.at(0)
```

### prefer-date-now

Prefer `Date.now()` to get the number of milliseconds since the Unix Epoch.

### prefer-default-parameters

Prefer default parameters over reassignment.

```js
// bad
let getBelcheroOrphanageAttendant = (currentAttendant) => {
  currentAttendant = currentAttendant || 'Jiruo'
  return currentAttendant
}
```

```js
// good
let getBelcheroOrphanageAttendant = (currentAttendant = 'Jiruo') => currentAttendant
```

### prefer-includes

Prefer `.includes()` over `.indexOf()` and `Array#some()` when checking for existence or non-existence.

### prefer-keyboard-event-key

Prefer `KeyboardEvent#key` over `KeyboardEvent#keyCode`.

### prefer-logical-operator-over-ternary

Prefer using a logical operator over a ternary.

```js
// bad
migi ? migi : shinichiIzumi
```

```js
// good
migi ?? shinichiIzumi
```

### prefer-string-replace-all

Prefer `String#replaceAll()` over regex searches with the global flag.

### prefer-string-slice

Prefer `String#slice()` over `String#substr()` and `String#substring()`.

### prefer-string-starts-ends-with

Prefer String#startsWith() & String#endsWith() over RegExp#test()

```js
// bad
let isTitan = /titan$/.test(cartTitan)
```

```js
// good
let isTitan = cartTitan.endsWith('titan')
```

## Vitest

### consistent-test-filename

Forbidden `.spec` test file pattern.

### consistent-test-it

Prefer `it` over `test`.

### expect-expect

Enforce having expectation in test body.

```js
// bad
it('myLogic', () => {
	chihiroOgino.visit('Amusement park')
})
```

```js
// good
it('myLogic', () => {
	chihiroOgino.visit('Amusement park')
  expect(ghosts.get()).not.toHaveLength(0)
})
```

### no-alias-methods

Disallow alias methods.

# no-commented-out-tests

Disallow commented out tests.

```js
// bad
// expect(gon.father.name).toBe('Ging')
```

```js
// good
expect(gon.father.name).toBe('Ging')
```

### no-conditional-expect

Disallow conditional expects.

### no-conditional-in-test

Disallow conditional tests.

### no-conditional-tests

Disallow conditional tests.

### no-disabled-tests

Disallow disabled tests.

```js
// bad
it.skip('holo transforms to wolf', () => {})
```

### no-duplicate-hooks

Disallow duplicate hooks and teardown hooks.

```js
// bad
it('evangelion starts successfully', () => {
  beforeEach(() => {
    prepareEva()
  })
  beforeEach(() => {
    callAsuka()
  })
})
```

```js
// good
it('evangelion starts successfully', () => {
  beforeEach(() => {
    prepareEva()
    callAsuka()
  })
})
```

### no-focused-tests

Disallow focused tests.

```js
// bad
it.only('colors grelle sutcliff to red', () => {})
```

### no-identical-title

Disallow identical titles.

### no-standalone-expect

Disallow using `expect` outside of `it` blocks.

### no-test-return-statement

```js
// bad
it('checks lil slugger inventory', () => {
  return expect(lilSlugger.inventory).toContain('baseball bat')
})
```

```js
// good
it('checks lil slugger inventory', () => {
  expect(lilSlugger.inventory).toContain('baseball bat')
})
```

### prefer-comparison-matcher

Suggest using the built-in comparison matchers

```js
// bad
expect(tanjiroSquad.length > 3).toBe(true)
```

```js
// good
expect(tanjiroSquad.length).toBeGreaterThan(3)
```

### prefer-expect-resolves

Suggest using `expect().resolves` over `expect(await ...)` syntax.

```js
// bad
it('checks job', async () => {
  expect(await getJob('Shibazaki Kenjirou')).toBe('Police officer')
})
```

```js
// good
it('checks job', async () => {
  await expect(getJob('Shibazaki Kenjirou')).resolves.toBe('Police officer')
})
```

### prefer-hooks-in-order

Prefer having hooks in consistent order: `beforeAll`, `beforeEach`, `afterEach`, `afterAll`.

### prefer-hooks-on-top

Suggest having hooks before any test cases.

### prefer-lowercase-title

Enforce lowercase titles.

```js
// bad
it('Runs Cowboy Bebop', () => {})
```

```js
// good
it('runs cowboy bebop', () => {})
```

### prefer-spy-on

Suggest using `vi.spyOn`.

### prefer-to-be-falsy

Suggest using `toBeFalsy()`

```js
// bad
expect(isChitoLoseDiary).toBe(false)
```

```js
// good
expect(isChitoLoseDiary).toBeFalsy()
```

### prefer-to-be-truthy

Suggest using `toBeTruthy()`

```js
// bad
expect(isGirlLeaptThroughTime).toBe(true)
```

```js
// bad
expect(isGirlLeaptThroughTime).toBeTruthy()
```

### prefer-to-be

Suggest using `toBe()`.

### prefer-to-contain

Prefer using `toContain()`.

```js
// bad
expect(edgerunnersOfNightCity.includes('Rebecca')).toBe(true)
```

```js
// good
expect(edgerunnersOfNightCity).toContain('Rebecca')
```

### prefer-to-have-length

Suggest using `toHaveLength()`.

```js
// bad
expect(bebopPassengers.length).toBe(5)
```

```js
// good
expect(bebopPassengers).toHaveLength(5)
```

### require-top-level-describe

Enforce that all tests are in a top-level describe.

### valid-describe-callback

Enforce valid describe callback.

### valid-expect

Enforce valid `expect()` usage.
