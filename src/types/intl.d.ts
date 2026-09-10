declare namespace Intl {
  /** ES2022; absent on the older runtimes this app compiles for. Feature-detect before calling. */
  function supportedValuesOf(key: 'timeZone'): string[];
}
