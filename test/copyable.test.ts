import { Copyable } from '../src/copyable';

describe('Copyable', () => {
  class Test extends Copyable {
    constructor(readonly num = 0) {
      super();
    }

    testMethod() {
      return 5;
    }
  }

  describe('basic', () => {
    it('should copy', () => {
      const test = new Test(2);

      const copy = test.copy({ num: 5 });
      expect(copy.num).toBe(5);
      expect(test.num).toBe(2);

      expect(() => copy.testMethod()).not.toThrow();
      expect(() => new Test().copy()).not.toThrow();
    });

    it('should copy by key', () => {
      const test1 = new Test(5);
      expect(test1.copy('num', 6).num).toBe(6);
    });

    it('should check equality', () => {
      const test1 = new Test(2);
      const test2 = new Test(2);
      const test3 = new Test(5);

      expect(test1.equals(test1)).toBeTruthy();
      expect(test1.equals(test1.copy())).toBeTruthy();

      expect(test1.equals(test2)).toBeTruthy();
      expect(test1.equals(test3)).not.toBeTruthy();
      expect(test1.equals(null)).not.toBeTruthy();
      expect(test1.equals(undefined)).not.toBeTruthy();
    });

    it('should check equality with nested copyable objects', () => {
      class WithNested extends Copyable {
        constructor(readonly bool: boolean, readonly nested: Test) {
          super();
        }
      }

      const withNested1 = new WithNested(true, new Test(5));
      const withNested2 = new WithNested(true, new Test(5));

      expect(withNested1.equals(withNested2)).toBe(true);

      expect(withNested1.equals(withNested1.copy('bool', false))).toBe(false);
    });

    it('should map', () => {
      const test1 = new Test(7);

      const copy = test1.map({ num: n => n + 2 });
      expect(copy.num).toBe(9);

      expect(test1.map().num).toBe(7);
    });

    it('should map by key', () => {
      const test1 = new Test(7);

      const copy = test1.map('num', num => num + 2);
      expect(copy.num).toBe(9);
    });
  });

  describe('inheritance', () => {
    class Derived extends Test {
      constructor(readonly field: string, num: number) {
        super(num);
      }

      method() {
        return 'method';
      }

      testMethod() {
        return 9;
      }
    }

    const derived = new Derived('test', 5);

    it('should create derived class instance', () => {
      expect(derived.field).toBe('test');
      expect(derived.num).toBe(5);
    });

    it('should copy', () => {
      const copy = derived.copy({ num: -5 });
      expect(copy.num).toBe(-5);
    });

    it('should have correct methods', () => {
      expect(derived.method()).toBe('method');
      expect(derived.testMethod()).toBe(9);
    });
  });

  describe('toString', () => {
    class Inner extends Copyable {
      constructor(readonly bool = true, readonly str = 'hello world') {
        super();
      }
    }

    class Outer extends Copyable {
      constructor(
        readonly num: number = 10,
        readonly innerObj = new Inner(),
        readonly falsy = undefined,
        readonly falsyNull = null,
        readonly plainObj = { a: 5, b: 6 }
      ) {
        super();
      }
    }

    it('should print copyable object', () => {
      expect(new Outer(10, new Inner()).toString()).toMatchSnapshot();
    });

    it('should correctly print subclasses', () => {
      class Derived extends Inner {
        constructor(bool = true, str = 'hello world', readonly derivedVal = 5) {
          super(bool, str);
        }
      }

      expect(new Derived().toString()).toMatchSnapshot();
    });
  });
});
