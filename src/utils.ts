/**
 * Returns constructor function of an object instance.
 * Example:
 *   class User { }
 *
 *   const user = new User();
 *   getConstructor(user); // returns User
 */
export const getConstructor = <T extends Object>(obj: T) =>
  Object.getPrototypeOf(obj).constructor;
