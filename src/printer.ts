import { Copyable } from './copyable';
import { getConstructor } from './utils';

interface ObjectPrinterOptions {
  /**
   * Open parenthesis that is printed before object properties.
   */
  openParen: string;
  /**
   * Close parenthesis that is printed after object properties.
   */
  closeParen: string;
  /**
   * Delimiter for object properties.
   */
  delimiter: string;
  /**
   * Number of spaces to indent object properties with.
   */
  indent: number;
  /**
   * Printed before the value of a property.
   */
  eq: string;
}

/**
 * Print instance of Copyable object with the following format:
 *    Classname(
 *      property1=value1,
 *      property2="value2",
 *      property3=true
 *    )
 */
export const copyablePrinter = objectPrinter({
  openParen: '(\n',
  closeParen: '\n)',
  delimiter: ',\n',
  indent: 2,
  eq: '='
});

/**
 * Print instance of any other object with the following format:
 *    OtherObject { property1: value1, property2: "value2", property3: true }
 */
const objPrinter = objectPrinter({
  openParen: ' { ',
  closeParen: ' }',
  delimiter: ', ',
  indent: 0,
  eq: ': '
});

/**
 * Indents a string with the given number of spaces.
 * Bypasses the string if size=0.
 */
const indentString = (str: string, size = 2) =>
  size === 0 ? str : str.replace(/^(?!\s*$)/gm, ' '.repeat(size));

/**
 * Return a function that prints object instance with the given options.
 */
function objectPrinter(options: ObjectPrinterOptions) {
  return <T extends {}>(obj: T): string => {
    const className = getConstructor(obj).name;
    const properties = indentString(
      printObjectProperties(obj, options),
      options.indent
    );
    return `${className}${options.openParen}${properties}${options.closeParen}`;
  };
}

/**
 * Prints object own properties with the given options.
 */
function printObjectProperties<T extends {}>(
  obj: T,
  { eq, delimiter }: ObjectPrinterOptions
): string {
  const ownPropertyNames = Object.getOwnPropertyNames(obj);
  const last = ownPropertyNames.length - 1;
  return ownPropertyNames.reduce(
    (acc, key, i) =>
      acc + `${key}${eq}${printVal(obj[key])}${i === last ? '' : delimiter}`,
    ``
  );
}

/**
 * Prints a value:
 *   If the value is a string, wraps it with ""
 *   If the value is a Copyable object, delegates it to copyablePrinter
 *   If the value is an object, delegates it to objPrinter
 *   Otherwise the value is converted to a string.
 */
function printVal(val: any): string {
  if (typeof val === 'object' && val != null) {
    return val instanceof Copyable ? copyablePrinter(val) : objPrinter(val);
  }
  return typeof val === 'string' ? `"${val}"` : `${val}`;
}
