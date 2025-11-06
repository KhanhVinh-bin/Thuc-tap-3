// AdminLayout component
'use client';

import '../shared-styles.css';
import { useEffect } from 'react';
import { useAdminLayout } from '../layout';

export default function AdminLayout({ children, title, description, headerLeftExtras, headerRightActions }) {
  const { setHeaderState } = useAdminLayout();

  useEffect(() => {
    setHeaderState({
      title,
      description,
      headerLeftExtras,
      headerRightActions,
    });
    // Optional: clean up header when unmount
    return () => {
      setHeaderState({});
    };
  }, [title, description, headerLeftExtras, headerRightActions, setHeaderState]);

  // Không render Sidebar, không bọc admin-layout/main-content
  return (
    <>
      {children}
    </>
  );
}