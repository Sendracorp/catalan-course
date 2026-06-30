import { ImageResponse } from 'next/og';

// Square (1:1) branded image for ad assets — matches the OpenGraph card.
// Download from /og-square to upload as a Google Ads 1:1 image asset.
export const contentType = 'image/png';

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '110px', fontFamily: 'sans-serif',
          background: 'linear-gradient(135deg, #F3FAF9 0%, #BFE9D8 55%, #CBCEF8 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          <div style={{
            width: 120, height: 120, borderRadius: 30, display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 64, fontWeight: 800, color: '#2A2438',
            background: 'linear-gradient(135deg, #E0D5F2, #C7DCEE)',
          }}>Vb</div>
          <div style={{ fontSize: 58, fontWeight: 800, color: '#1F2A30' }}>Verbadium</div>
        </div>
        <div style={{ fontSize: 104, fontWeight: 800, color: '#1F2A30', marginTop: 60, lineHeight: 1.05 }}>
          Learn Catalan online
        </div>
        <div style={{ fontSize: 40, color: '#1F2A30', opacity: 0.78, marginTop: 34, lineHeight: 1.3 }}>
          Interactive A1 exam course · native audio · IPA · 100+ exercises · mock exam
        </div>
      </div>
    ),
    { width: 1200, height: 1200 },
  );
}
