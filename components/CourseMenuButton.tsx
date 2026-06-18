'use client';
import { useEffect, useState } from 'react';

/* Course-units menu toggle. Lives in the header (top-left on mobile); the
   drawer itself is owned by <Sidebar/>, so we talk to it via a window event
   and mirror its open state for aria-expanded. Hidden on desktop where the
   sidebar is permanent. */
export default function CourseMenuButton() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const onState = (e: Event) => setOpen((e as CustomEvent<boolean>).detail);
    window.addEventListener('vb-nav-state', onState);
    return () => window.removeEventListener('vb-nav-state', onState);
  }, []);

  return (
    <button
      id="navToggle"
      className="course-menu-btn"
      aria-label="Course menu"
      aria-controls="sidebar"
      aria-expanded={open}
      onClick={() => window.dispatchEvent(new CustomEvent('vb-nav-toggle'))}
    >
      <svg className="course-menu-icon" width="20" height="14" viewBox="0 0 20 14" aria-hidden="true">
        <rect y="0" width="20" height="2.4" rx="1.2" />
        <rect y="5.8" width="20" height="2.4" rx="1.2" />
        <rect y="11.6" width="20" height="2.4" rx="1.2" />
      </svg>
      <span className="course-menu-label">Menu</span>
    </button>
  );
}
