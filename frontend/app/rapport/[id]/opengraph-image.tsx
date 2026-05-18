import { ImageResponse } from '@vercel/og'

export const runtime = 'edge'
export const alt = 'Rapport Batiscore'
export const contentType = 'image/png'
export const size = {
  width: 1200,
  height: 630,
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function getReport(id: string) {
  try {
    const res = await fetch(`${API}/api/report/${id}`, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default async function Image({ params }: { params: { id: string } }) {
  const report = await getReport(params.id)

  const c = report?.contractor
  const nom = c?.nom_legal ?? 'Entrepreneur'
  const score = c?.score ?? null
  const scoreLabel = c?.score_label ?? ''
  const ville = c?.ville ?? ''
  const licence = c?.licence_rbq ?? ''
  const statut = c?.statut_rbq ?? ''

  const scoreNum = typeof score === 'number' ? score : null

  const scoreColor =
    scoreNum !== null && scoreNum >= 85 ? '#10b981' :
    scoreNum !== null && scoreNum >= 70 ? '#f59e0b' :
    scoreNum !== null && scoreNum >= 50 ? '#f97316' :
    scoreNum !== null ? '#ef4444' :
    '#64748b'

  const scoreText = scoreNum !== null ? String(scoreNum) : '?'

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0f172a',
          padding: 60,
          fontFamily: 'Inter, sans-serif',
        }}
      >
        {/* Header brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 8,
              backgroundColor: '#f97316',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 900,
              fontSize: 22,
            }}
          >
            B
          </div>
          <span style={{ color: '#94a3b8', fontSize: 22, fontWeight: 700 }}>
            Batiscore
          </span>
        </div>

        {/* Main content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: 1 }}>
          <h1
            style={{
              color: 'white',
              fontSize: 56,
              fontWeight: 800,
              lineHeight: 1.15,
              maxWidth: 900,
              margin: 0,
            }}
          >
            {nom}
          </h1>

          {ville && (
            <p style={{ color: '#94a3b8', fontSize: 28, margin: 0 }}>
              {ville}
            </p>
          )}

          {licence && (
            <p style={{ color: '#64748b', fontSize: 22, margin: 0 }}>
              Licence RBQ {licence}
            </p>
          )}
        </div>

        {/* Footer: score + statut */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 120,
                height: 120,
                borderRadius: 24,
                border: `4px solid ${scoreColor}`,
                backgroundColor: `${scoreColor}15`,
                color: scoreColor,
                fontSize: 52,
                fontWeight: 900,
              }}
            >
              {scoreText}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#94a3b8', fontSize: 18, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 2 }}>
                Niveau de confiance
              </span>
              {scoreLabel && (
                <span style={{ color: scoreColor, fontSize: 32, fontWeight: 800 }}>
                  {scoreLabel}
                </span>
              )}
            </div>
          </div>

          {statut && (
            <div
              style={{
                padding: '12px 24px',
                borderRadius: 12,
                backgroundColor: statut === 'valide' ? '#10b98120' : '#ef444420',
                color: statut === 'valide' ? '#10b981' : '#ef4444',
                fontSize: 22,
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              Licence {statut}
            </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
