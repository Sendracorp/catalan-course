'use client';
/* Always-available IPA pronunciation reference: a tab fixed to the right
   edge of every page toggles a slide-out drawer with the condensed sound
   tables, so the student can check a symbol at any moment. */
import Link from 'next/link';
import { useEffect, useState } from 'react';
import SpeechScope from './SpeechScope';

export default function IpaDrawer({ html }: { html: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        id="ipaTab"
        className={`ipa-tab${open ? ' open' : ''}`}
        aria-expanded={open}
        aria-controls="ipaDrawer"
        title="IPA pronunciation reference"
        onClick={() => setOpen(o => !o)}
      >
        <span>IPA /ə/</span>
      </button>
      {/* always rendered (class-toggled) so the sibling list keeps a stable shape */}
      <div className={`ipa-backdrop${open ? ' show' : ''}`} id="ipaBackdrop" onClick={() => setOpen(false)} />
      <aside
        id="ipaDrawer"
        className={`ipa-drawer${open ? ' open' : ''}`}
        aria-label="IPA pronunciation reference"
        aria-hidden={!open}
      >
        <div className="ipa-drawer-head">
          <b>IPA quick reference</b>
          <span>
            <Link href="/ipa" onClick={() => setOpen(false)}>Full guide</Link>
            <button type="button" className="ipa-close" aria-label="Close" onClick={() => setOpen(false)}>×</button>
          </span>
        </div>
        <div className="ipa-drawer-body">
          {/* keyed remount keeps SpeechScope's one-shot enhancement valid */}
          <SpeechScope html={html} />
        </div>
      </aside>
    </>
  );
}
