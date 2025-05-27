import { useState, useEffect } from 'react';

/**
 * Custom hook to manage sidebar collapsed state with localStorage persistence
 * @param defaultValue The default state if nothing is stored in localStorage
 * @param storageKey The key to use for localStorage
 * @returns [collapsed, toggleCollapsed, setCollapsed]
 */
export function useSidebarState(defaultValue = false, storageKey = 'sidebarCollapsed') {
  const [collapsed, setCollapsed] = useState(defaultValue);

  // Load from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem(storageKey);
    if (savedState !== null) {
      setCollapsed(savedState === 'true');
    }
  }, [storageKey]);

  // Toggle collapsed state and save to localStorage
  const toggleCollapsed = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    localStorage.setItem(storageKey, newState.toString());
  };

  // Function to directly set state and save to localStorage
  const setSidebarState = (state: boolean) => {
    setCollapsed(state);
    localStorage.setItem(storageKey, state.toString());
  };

  return [collapsed, toggleCollapsed, setSidebarState] as const;
}
