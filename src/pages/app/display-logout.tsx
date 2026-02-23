import { useEffect } from 'react';
import { useDisplayStore } from '@/store';

export default function DisplayLogout() {
  const { signOut } = useDisplayStore();

  useEffect(() => {
    signOut();
  }, [signOut]);

  return null;
}
