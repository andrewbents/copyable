import { copyablePrinter } from './printer';
import { getConstructor } from './utils';

type NonFunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? never : K
}[keyof T];
type NonFunctionProperties<T> = Pick<T, NonFunctionPropertyNames<T>>;

type Patch<T> = Partial<NonFunctionProperties<T>>;
type PatchKey<T> = keyof Patch<T>;

type Mapper<V> = (val: V) => V;
type MapPatch<T> = { [K in PatchKey<T>]?: Mapper<T[K]> };

export class Copyable {
  /**
   * Returns a copy of the object.
   * Has two overloads that accept
   *   1. An object that contains new values for specified properties:
   *
   *     class Person extends Copyable {
   *       constructor(readonly name: string, readonly age: number) {
   *         super()
   *       }
   *     }
   *
   *     const person1 = new Person('John', 25);
   *     person1.copy({ name: 'James', age: 20 });
   *     // -> Person(name="James", age=20)
   *
   *   2. A key and a new value for it:
   *
   *     class Book extends Copyable {
   *       constructor(readonly title: string) {
   *         super()
   *       }
   *     }
   *
   *     const book1 = new Book('TypeScript Deep Dive');
   *     book1.copy('title', 'TypeScript handbook');
   *     // -> Book(title="TypeScript handbook")
   */
  copy(patch?: Patch<this>): this;
  copy<K extends PatchKey<this>>(key: K, val: this[K]): this;
  copy(patchOrKey?: any, val?: any): this {
    if (arguments.length < 2) {
      const constructor = getConstructor(this);
      return Object.assign(new constructor(), this, patchOrKey);
    }

    const copy = this.copy();
    copy[patchOrKey] = val;
    return copy;
  }

  /**
   * Maps the object.
   * Allows to copy the object based on its current values.
   * Has two overloads that accept
   *   1. An object that contains mapper for specified properties:
   *
   *     const person1 = new Person('John', 25);
   *     // John got older
   *     const person2 = person1.map({
   *       name: name => 'Older ' + name,
   *       age: age => age + 20
   *     });
   *     // -> Person(name="Older John", age=45)
   *
   *   2. A key and a mapper for it:
   *
   *     const book1 = new Book('TypeScript Deep Dive');
   *     book1.map('title', title => title + ' Part 2');
   *     // -> Book(title="TypeScript Deep Dive Part 2")
   */
  map(patchMap?: MapPatch<this>): this;
  map<K extends PatchKey<this>>(key: K, mapper: Mapper<this[K]>): this;
  map(patchMapOrKey: any, mapper?: any): this {
    const copy = this.copy();

    if (arguments.length === 2) {
      const key = patchMapOrKey;
      copy[key] = mapper(copy[key]);
    } else {
      const patchMap = patchMapOrKey;
      for (const key in patchMap) {
        if (patchMap.hasOwnProperty(key)) {
          copy[key] = patchMap[key](copy[key]);
        }
      }
    }

    return copy;
  }

  /**
   * Checks for structural equality:
   *
   *   const book1 = new Book('TypeScript Deep Dive');
   *   const book2 = new Book('TypeScript handbook');
   *
   *   book1.equals(book2); // false
   *   book1.equals(new Book('TypeScript Deep Dive')); // true
   *
   * Note that the comparision is shallow!
   */
  equals(other: this | null | undefined): other is this {
    return (
      other != null &&
      (this === other ||
        Object.getOwnPropertyNames(this).every(p =>
          other[p] instanceof Copyable && this[p] instanceof Copyable
            ? this[p].equals(other[p])
            : other[p] === this[p]
        ))
    );
  }

  /**
   * Returns a string representation of the object that is a bit nicer
   * than the default one (`'[object Object]'`):
   *
   *   const person = new Person('John', 25);
   *   person.toString();
   *   // Person(
   *   //   name="John",
   *   //   age=25
   *   // )
   */
  toString(): string {
    return copyablePrinter(this);
  }
}
