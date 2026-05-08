/**
 * `navigator.onLine` is false only when the OS reports no connection. It is a
 * best-effort signal — we treat true as "probably online" and false as a
 * definite "offline".
 */
export const isOnlineNow = (): boolean => {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine !== false;
};
