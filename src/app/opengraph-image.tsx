import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Hershey Goldberger'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  const interBold = fetch(
    new URL('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf')
  ).then((res) => res.arrayBuffer())

  const interRegular = fetch(
    new URL('https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf')
  ).then((res) => res.arrayBuffer())

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0D1B2A',
          fontFamily: 'Inter',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 160,
            height: 160,
            border: '3px solid #1E3A5F',
            borderRadius: 8,
            marginBottom: 40,
          }}
        >
          <span
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '0.05em',
            }}
          >
            HG
          </span>
        </div>
        <span
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#FFFFFF',
            letterSpacing: '0.1em',
            marginBottom: 16,
          }}
        >
          HERSHEY GOLDBERGER
        </span>
        <span
          style={{
            fontSize: 20,
            color: '#CBD5E1',
            maxWidth: 600,
            textAlign: 'center',
            lineHeight: 1.5,
          }}
        >
          Agentic AI systems and full-stack products. Production-grade. One engineer.
        </span>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: 'Inter',
          data: await interBold,
          style: 'normal',
          weight: 700,
        },
        {
          name: 'Inter',
          data: await interRegular,
          style: 'normal',
          weight: 400,
        },
      ],
    }
  )
}
