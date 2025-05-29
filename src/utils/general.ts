export const generateMasjidCode = () => {
  return Math.random().toString(36).substring(2, 9);
};

export const isNullOrUndefined = <T>(value: T | null | undefined): value is null | undefined => {
  return value === null || value === undefined;
};
