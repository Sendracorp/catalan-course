import { ImageResponse } from 'next/og';

// Square (1:1) logo asset for Google Ads — the "Vb" brand mark centered with
// margin so a circular crop is safe. Download from /logo-square.
export const contentType = 'image/png';

export function GET() {
  return new ImageResponse(
    (
      <div style={{
        width: '100%', height: '100%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', background: '#FFFFFF',
      }}>
        <div style={{
          position: 'relative', width: 660, height: 660, borderRadius: 182,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'linear-gradient(135deg, #E0D5F2 0%, #D3CBEC 55%, #C7DCEE 100%)',
        }}>
          <div style={{ display: 'flex', fontSize: 320, fontWeight: 800, letterSpacing: -8, color: '#2A2438', fontFamily: 'sans-serif' }}>Vb</div>
          <div style={{ position: 'absolute', top: 120, right: 150, width: 28, height: 28, borderRadius: 14, background: '#2A2438', opacity: 0.45 }} />
        </div>
      </div>
    ),
    { width: 1200, height: 1200 },
  );
}
