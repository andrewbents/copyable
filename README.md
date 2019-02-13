<p align="center">
  <img src=".github/logo.svg" width="300" alt="logo">
  <p align="center"><i><a href="https://www.flaticon.com/free-icon/cell-division_1394456">Original image</a></i></p>
</p>

Immutable data objects with type safe `.copy()`, `.map()` and `.equals()` inspired by `case class` in Scala and `data class` in Kotlin

- [Installation](#installation)
- [Usage](#usage)
- [Type safety](#type-safety)
- [API Reference](#api-reference)
  - [`copy`](#-copy-)
  - [`map`](#-map-)
  - [`equals`](#-equals-)
  - [`toString`](#-tostring-)
- [Can I use it with JavaScript?](#can-i-use-it-with-javascript-)
- [Prior art](#prior-art)

## Installation

```sh
yarn add copyable
```

TypeScript >= 2.8 required.

## Usage

```typescript
import { Copyable } from 'copyable';

class Person extends Copyable {
  constructor(readonly name: string, readonly age: number) {
    super();
  }
}

const person1 = new Person('John', 25);

const person2 = person1.copy({ name: 'James', age: 20 });
// -> Person(name="James", age=20)
person1.copy('age', 30);
// -> Person(name="John", age=30)

person1.map({
  name: name => 'Older ' + name,
  age: age => age + 20
});
// -> Person(name="Older John", age=45)
person1.map('age', age => age + 20);
// -> Person(name="John", age=45)

person1.equals(person2); // false
person1.equals(new Persion('John', 25)); // true

person1.toString();
/* -> 
  Person(
    name="John",
    age=25
  )
*/
```

## Type safety

```typescript
person1.copy({ age: '20' }); // compile error: Types of property 'age' are incompatible. Type 'string' is not assignable to type 'number'.

person1.copy({ notAPropertyOfPerson: 20 }); // compile error: Object literal may only specify known properties

person1.copy({ equals: () => false }); // Nope. Can't replace methods.
```

## API Reference

### `copy`

- `copy(patch?: Patch<this>): this`

  Returns a copy of the object.

  Accepts an object that contains new values for specified properties

  ```typescript
  import { Copyable } from 'copyable';

  class Person extends Copyable {
    constructor(readonly name: string, readonly age: number) {
      super();
    }
  }

  const person1 = new Person('John', 25);
  person1.copy({ name: 'James', age: 20 });
  // -> Person(name="James", age=20)
  ```

  #### Parameters

  - `(Optional)` patch: `Patch<this>`

  #### Returns

  `typeof this`

- `copy<K extends PatchKey<this>>(key: K, val: this[K]): this`

  Returns a copy of the object.

  Accepts a key and a new value for it

  ```typescript
  import { Copyable } from 'copyable';

  class Book extends Copyable {
    constructor(readonly title: string) {
      super();
    }
  }

  const book1 = new Book('TypeScript Deep Dive');
  book1.copy('title', 'TypeScript handbook');
  // -> Book(title="TypeScript handbook")
  ```

  #### Parameters

  - key: `K extends PatchKey<this>`
  - value: `this[key]`

  #### Returns

  `typeof this`

### `map`

- `map(patchMap: MapPatch<this>): this`

  Maps the object. Allows to copy the object based on its current values.

  Accept an object that contains mapper for specified properties.

  ```typescript
  const person1 = new Person('John', 25);
  // John got older
  person1.map({
    name: name => 'Older ' + name,
    age: age => age + 20
  });
  // -> Person(name="Older John", age=45)
  ```

  #### Parameters

  - `(Optional)` patchMap: `MapPatch<this>`

  #### Returns

  `typeof this`

- `map<K extends PatchKey<this>>(key: K, mapper: Mapper<this[K]>): this`

  Maps the object. Allows to copy the object based on its current values.

  Accept a key and a mapper for it.

  ```typescript
  import { Copyable } from 'copyable';

  class Book extends Copyable {
    constructor(readonly title: string) {
      super();
    }
  }

  const book1 = new Book('TypeScript Deep Dive');
  book1.map('title', title => title + ' Part 2');
  // -> Book(title="TypeScript Deep Dive Part 2")
  ```

#### Parameters

- key: `K extends PatchKey<this>`
- mapper: `Mapper<this[K]>`

#### Returns

`typeof this`

### `equals`

`equals(other: this | null | undefined): boolean`

Checks for structural equality

> **Note** that the comparision is shallow!

```typescript
const book1 = new Book('TypeScript Deep Dive');
const book2 = new Book('TypeScript handbook');

book1.equals(book2); // false
book1.equals(new Book('TypeScript Deep Dive')); // true
```

#### Returns

`boolean`

### `toString`

`toString(): string`

Returns a string representation of the object that is a bit nicer than the default one (`'[object Object]'`)

```typescript
const person = new Person('John', 25);
person.toString();
// Person(
//   name="John",
//   age=25
// )
```

#### Returns

`string`

## Can I use it with JavaScript?

Yes! You won't have any type checking, of course, so you risk shooting yourself in a foot.

## Prior art

Inspired by [Case Classes](https://docs.scala-lang.org/tour/case-classes.html) in Scala and [Data Classes](https://kotlinlang.org/docs/reference/data-classes.html) in Kotlin.

Implementation influenced by [ts-copyable](https://github.com/nwtgck/ts-copyable-npm) and [dataclass](https://github.com/alexeyraspopov/dataclass).
