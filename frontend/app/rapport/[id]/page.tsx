'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  MapPin,
  Phone,
  Calendar,
  Printer,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  TrendingUp,
  Award,
  Network,
  TriangleAlert,
  ArrowLeft,
  Building2,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'

interface Signal {
  type: string
  points: number
  details: string
}

interface EntrepriseLiee {
  id: number
  nom: string
  ville: string | null
  licence_rbq: string | null
  statut_rbq: string | null
  statut_req: string | null
  score: number | null
  date_fondation: string | null
  lien: string
  lien_details: string[]
  alerte: boolean
  points_lien: number
}

interface Reseau {
  risque_phenix: boolean
  score_phenix: number
  niveau_risque: string
  nb_entreprises_liees: number
  signaux: Signal[]
  entreprises: EntrepriseLiee[]
}

interface Report {
  contractor: {
    id: number
    nom_legal: string
    neq: string | null
    licence_rbq: string | null
    adresse: string | null
    ville: string | null
    telephone: string | null
    statut_rbq: string | null
    statut_req: string | null
    categories_rbq: string[]
    date_fondation: string | null
    score: number | null
    score_label: string
    score_breakdown: Array<{ label: string; points: number; type: 'positive' | 'negative' | 'neutral' }>
  }
  events: Array<{
    type: string
    date: string | null
    montant: number | null
    description: string | null
    source: string | null
  }>
  litiges: Array<{
    tribunal: string | null
    date: string | null
    type: string | null
    issue: string | null
    montant: number | null
    url: string | null
    description: string | null
    source: string | null
  }>
  contrats_publics: Array<{
    titre: string | null
    organisme: string | null
    montant: number | null
    date: string | null
  }>
}

export default function ReportPage() {
  const params = useParams()
  const [report, setReport] = useState<Report | null>(null)
  const [reseau, setReseau] = useState<Reseau | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  useEffect(() => {
    fetchReport()
  }, [params.id])

  const fetchReport = async () => {
    try {
      const [reportRes, reseauRes] = await Promise.all([
        fetch(`${API}/api/report/${params.id}`),
        fetch(`${API}/api/report/${params.id}/reseau`),
      ])
      if (reportRes.status === 404) throw new Error('Entrepreneur non trouvé')
      if (!reportRes.ok) throw new Error('Erreur lors du chargement du rapport')
      const [reportData, reseauData] = await Promise.all([reportRes.json(), reseauRes.json()])
      setReport(reportData)
      setReseau(reseauData)
    } catch (err: any) {
      setError(err.message === 'Load failed' ? 'Impossible de joindre le serveur' : err.message)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-400'
    if (score >= 85) return 'text-emerald-400'
    if (score >= 70) return 'text-amber-400'
    if (score >= 50) return 'text-orange-400'
    return 'text-red-400'
  }

  const getScoreBg = (score: number | null) => {
    if (score === null) return 'bg-slate-800 border-slate-700'
    if (score >= 85) return 'bg-emerald-500/10 border-emerald-500/20'
    if (score >= 70) return 'bg-amber-500/10 border-amber-500/20'
    if (score >= 50) return 'bg-orange-500/10 border-orange-500/20'
    return 'bg-red-500/10 border-red-500/20'
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-3xl space-y-6">
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </main>
    )
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle size={40} className="text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">{error || 'Rapport non trouvé'}</h1>
          <Link href="/">
            <Button variant="accent">Retour à la recherche</Button>
          </Link>
        </div>
      </main>
    )
  }

  const c = report.contractor

  return (
    <main className="min-h-screen">
      {/* Dark hero header */}
      <section className="bg-slate-900 py-10 lg:py-14">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-orange-500/5 via-transparent to-transparent" aria-hidden="true" />

        <div className="relative max-w-3xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8 print:hidden">
            <Link href="/" className="text-sm font-medium text-slate-400 hover:text-white transition-colors flex items-center gap-2 cursor-pointer">
              <ArrowLeft size={16} />
              Retour aux résultats
            </Link>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2 border-slate-700 text-slate-400 hover:text-white hover:border-slate-600">
              <Printer size={16} />
              Imprimer / PDF
            </Button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="space-y-3">
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">{c.nom_legal}</h1>
              <div className="flex flex-wrap gap-2 items-center text-sm text-slate-400">
                <span className="font-medium text-slate-300">RBQ {c.licence_rbq || 'N/A'}</span>
                <span className="opacity-30">|</span>
                <span>NEQ {c.neq || 'N/A'}</span>
                <span className="opacity-30">|</span>
                <span>{c.ville || 'Lieu non spécifié'}</span>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Badge variant={c.statut_rbq === 'valide' ? 'success' : 'danger'} icon={c.statut_rbq === 'valide' ? ShieldCheck : AlertTriangle}>
                  Licence RBQ {c.statut_rbq?.toUpperCase() || 'INCONNUE'}
                </Badge>
                {(c.statut_req === 'radié' || c.statut_req === 'faillite') && (
                  <Badge variant="danger" className="bg-red-600 text-white border-red-500" icon={AlertTriangle}>
                    REQ {c.statut_req === 'faillite' ? 'EN FAILLITE' : 'RADIÉ'}
                  </Badge>
                )}
              </div>
            </div>

            <div className={`flex flex-col items-center p-5 rounded-2xl border self-start min-w-[8rem] ${getScoreBg(c.score)}`}>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Score</div>
              <div className={`text-4xl font-black ${getScoreColor(c.score)}`}>
                {c.score ?? '?'}
              </div>
              <div className="text-[10px] font-medium text-slate-500 mt-1">{c.score_label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Score Breakdown */}
        {c.score_breakdown && c.score_breakdown.length > 0 && (
          <div className="bg-white rounded-xl shadow-saas border border-slate-100 p-6 mb-6">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
              <TrendingUp size={14} />
              Analyse du score
            </div>
            <div className="flex flex-wrap gap-2">
              {c.score_breakdown.map((f, i) => (
                <div
                  key={i}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    f.type === 'positive' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                    f.type === 'negative' ? 'bg-red-50 text-red-700 border-red-100' :
                    'bg-slate-50 text-slate-600 border-slate-100'
                  }`}
                >
                  <span className="font-bold">{f.type === 'positive' ? '+' : ''}{f.points}</span>
                  <span className="ml-1 opacity-80">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Award size={20} className="text-orange-500" />
              Informations Générales
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><MapPin size={16} /></div>
                <div>
                  <div className="text-xs text-slate-400 font-medium uppercase">Adresse</div>
                  <div className="text-sm font-medium text-slate-700">{c.adresse || 'Non disponible'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Phone size={16} /></div>
                <div>
                  <div className="text-xs text-slate-400 font-medium uppercase">Téléphone</div>
                  <div className="text-sm font-medium text-slate-700">{c.telephone || 'Non disponible'}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-slate-100 rounded-lg text-slate-500"><Calendar size={16} /></div>
                <div>
                  <div className="text-xs text-slate-400 font-medium uppercase">Date de fondation</div>
                  <div className="text-sm font-medium text-slate-700">{c.date_fondation || 'Non disponible'}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <ShieldCheck size={20} className="text-orange-500" />
              Spécialités RBQ
            </h2>
            <div className="flex flex-wrap gap-2">
              {c.categories_rbq && c.categories_rbq.length > 0 ? (() => {
                const groups: Record<string, string[]> = {}
                const cats = c.categories_rbq
                for (let i = 0; i + 1 < cats.length; i += 2) {
                  const type = cats[i], code = cats[i + 1]
                  if (!groups[type]) groups[type] = []
                  groups[type].push(code)
                }
                return Object.entries(groups).map(([type, codes]) => (
                  <div key={type} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                    <span className="font-bold text-slate-700">{type === 'Generale' ? 'Gén.' : type === 'Specialisee' ? 'Spéc.' : type}</span>
                    <span className="text-slate-500">{codes.join(', ')}</span>
                  </div>
                ))
              })() : <span className="text-slate-400 text-sm italic">Aucune catégorie enregistrée</span>}
            </div>
          </Card>
        </div>

        {/* Events / Litiges / Contrats */}
        <div className="space-y-8">
          {report.events.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-orange-500" />
                  Événements RBQ
                </h2>
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-md">{report.events.length}</span>
              </div>
              <div className="space-y-3">
                {report.events.map((event, i) => {
                  const labelMap: Record<string, { label: string; color: 'success' | 'warning' | 'danger' | 'neutral' }> = {
                    'réclamation':          { label: 'Réclamation cautionnement', color: 'danger' },
                    'defaut_cotisation':    { label: 'Défaut cotisation CNESST',  color: 'warning' },
                    'cnesst_infraction':    { label: 'Infraction CNESST',         color: 'danger' },
                    'decision_suspension':  { label: 'Suspension de licence',     color: 'danger' },
                    'decision_annulation':  { label: 'Annulation de licence',     color: 'danger' },
                    'decision_condition':   { label: 'Condition sur licence',     color: 'warning' },
                    'decision_regisseurs':  { label: 'Décision Bureau des régisseurs', color: 'warning' },
                  }
                  const meta = labelMap[event.type] ?? { label: event.type, color: 'neutral' }
                  const pdfMatch = event.description?.match(/\| PDF: (https?:\/\/\S+)$/)
                  const pdfUrl = pdfMatch?.[1] ?? null
                  const descText = pdfMatch ? event.description!.replace(/ \| PDF: https?:\/\/\S+$/, '').trim() : event.description

                  return (
                    <div key={i} className="group relative bg-white p-4 rounded-xl border border-slate-100 shadow-saas hover:border-orange-300/50 transition-all">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <Badge variant={meta.color} icon={meta.color === 'danger' ? AlertTriangle : ShieldCheck}>{meta.label}</Badge>
                          {descText && <p className="text-sm text-slate-600 leading-relaxed">{descText}</p>}
                          {pdfUrl && (
                            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-orange-600 font-semibold hover:underline cursor-pointer">
                              <ExternalLink size={12} />
                              {event.source === 'canlii' ? 'Voir sur CanLII' : 'Consulter le PDF officiel'}
                            </a>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          {event.montant && <div className="text-sm font-bold text-slate-900">{event.montant.toLocaleString('fr-CA')} $</div>}
                          <div className="text-[10px] font-medium text-slate-400 uppercase">{event.date || 'Date inconnue'}</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {report.litiges.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <Building2 size={20} className="text-orange-500" />
                  Décisions judiciaires
                </h2>
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-md">{report.litiges.length}</span>
              </div>
              <div className="space-y-3">
                {report.litiges.map((litige, i) => {
                  const typeLabels: Record<string, { label: string; color: 'danger' | 'warning' | 'neutral' }> = {
                    'decision_annulation': { label: 'Annulation de licence', color: 'danger' },
                    'decision_suspension': { label: 'Suspension de licence', color: 'danger' },
                    'decision_condition':  { label: 'Condition sur licence', color: 'warning' },
                    'decision_regisseurs': { label: 'Décision Bureau des régisseurs', color: 'warning' },
                  }
                  const meta = typeLabels[litige.type ?? ''] ?? { label: litige.type || 'Décision', color: 'neutral' }
                  return (
                    <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 shadow-saas">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1.5">
                          <Badge variant={meta.color} icon={AlertTriangle}>{meta.label}</Badge>
                          <p className="text-xs text-slate-500">{litige.tribunal}</p>
                          {litige.description && (
                            <p className="text-xs text-slate-600 leading-relaxed">{litige.description}</p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0 ml-4">
                          <span className="text-[10px] font-medium text-slate-400">{litige.date || 'Date inconnue'}</span>
                          {litige.url && (
                            <a href={litige.url} target="_blank" rel="noopener noreferrer"
                               className="inline-flex items-center gap-1 text-xs text-orange-600 font-semibold hover:underline cursor-pointer">
                              <ExternalLink size={12} />
                              Voir sur CanLII
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {report.contrats_publics.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-500" />
                  Contrats Publics SEAO
                </h2>
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 text-xs font-bold rounded-md border border-emerald-100">Signaux Positifs</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {report.contrats_publics.map((contrat, i) => (
                  <div key={i} className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 hover:bg-emerald-50 transition-colors">
                    <div className="font-bold text-slate-900 text-sm mb-1 line-clamp-2">{contrat.titre || 'Contrat non titré'}</div>
                    <div className="text-xs text-slate-500 mb-3">{contrat.organisme}</div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black text-emerald-700">{contrat.montant?.toLocaleString('fr-CA')} $</span>
                      <span className="text-[10px] text-emerald-600/60 font-medium">{contrat.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Réseau d'entreprises / Connexions à risque */}
        {reseau && reseau.nb_entreprises_liees > 0 && (
          <section className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Network size={20} className="text-orange-500" />
                Entreprises liées
              </h2>
              <div className="flex items-center gap-2">
                {reseau.score_phenix > 20 && (
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    reseau.niveau_risque === 'avéré' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    reseau.niveau_risque === 'probable' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    reseau.niveau_risque === 'suspect' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    Risque {reseau.niveau_risque} · {reseau.score_phenix}/100
                  </span>
                )}
                <span className="px-2 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-md">
                  {reseau.nb_entreprises_liees}
                </span>
              </div>
            </div>

            {reseau.score_phenix > 20 && (
              <div className={`flex items-start gap-3 p-4 mb-4 rounded-xl border ${
                reseau.niveau_risque === 'avéré' ? 'bg-red-50 border-red-300' :
                reseau.niveau_risque === 'probable' ? 'bg-red-50 border-red-200' :
                reseau.niveau_risque === 'suspect' ? 'bg-orange-50 border-orange-200' :
                'bg-amber-50 border-amber-200'
              }`}>
                <TriangleAlert size={20} className={`shrink-0 mt-0.5 ${
                  reseau.niveau_risque === 'avéré' || reseau.niveau_risque === 'probable' ? 'text-red-600' :
                  reseau.niveau_risque === 'suspect' ? 'text-orange-600' :
                  'text-amber-600'
                }`} />
                <div>
                  <p className={`font-bold text-sm ${
                    reseau.niveau_risque === 'avéré' || reseau.niveau_risque === 'probable' ? 'text-red-800' :
                    reseau.niveau_risque === 'suspect' ? 'text-orange-800' :
                    'text-amber-800'
                  }`}>
                    {reseau.niveau_risque === 'avéré' ? 'Connexions à risque élevé détectées' :
                     reseau.niveau_risque === 'probable' ? 'Liens probables avec entreprises fermées' :
                     reseau.niveau_risque === 'suspect' ? 'Connexions à vérifier' :
                     'Entreprises liées dans le réseau'}
                  </p>
                  <p className={`text-xs mt-0.5 ${
                    reseau.niveau_risque === 'avéré' || reseau.niveau_risque === 'probable' ? 'text-red-700' :
                    reseau.niveau_risque === 'suspect' ? 'text-orange-700' :
                    'text-amber-700'
                  }`}>
                    Score de connexion : {reseau.score_phenix}/100.
                    {reseau.niveau_risque === 'avéré' || reseau.niveau_risque === 'probable'
                      ? ' Des signaux forts indiquent un lien avec des entreprises ayant eu des difficultés.'
                      : ' Consultez le détail ci-dessous et vérifiez si ces entités partagent les mêmes dirigeants.'}
                  </p>
                </div>
              </div>
            )}

            {reseau.signaux.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {reseau.signaux.map((s, i) => (
                  <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                    s.points >= 20 ? 'bg-red-50 text-red-700 border-red-100' :
                    s.points >= 10 ? 'bg-orange-50 text-orange-700 border-orange-100' :
                    'bg-amber-50 text-amber-700 border-amber-100'
                  }`}>
                    {s.type} (+{s.points})
                  </span>
                ))}
              </div>
            )}

            <div className="space-y-2">
              {reseau.entreprises.map((e) => (
                <Link
                  key={e.id}
                  href={`/rapport/${e.id}`}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer ${
                    e.alerte
                      ? 'bg-red-50 border-red-200 hover:border-red-400'
                      : 'bg-white border-slate-100 hover:border-orange-300/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      e.alerte ? 'bg-red-500' :
                      (e.score ?? 0) >= 85 ? 'bg-emerald-500' :
                      (e.score ?? 0) >= 70 ? 'bg-amber-500' :
                      'bg-orange-500'
                    }`} />
                    <div className="min-w-0">
                      <span className={`font-semibold text-sm truncate block ${e.alerte ? 'text-red-900' : 'text-slate-900'}`}>
                        {e.nom}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <span>{e.ville || '—'}</span>
                        {e.date_fondation && <><span>·</span><span>Fondée {e.date_fondation}</span></>}
                        {e.statut_req && e.statut_req !== 'actif' && (
                          <span className="text-red-500 font-medium uppercase">· REQ {e.statut_req}</span>
                        )}
                        {e.statut_rbq && e.statut_rbq !== 'valide' && (
                          <span className="text-red-500 font-medium uppercase">· RBQ {e.statut_rbq}</span>
                        )}
                      </div>
                      {e.lien_details.length > 1 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {e.lien_details.map((l, i) => (
                            <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                              l === 'même téléphone' ? 'bg-blue-50 text-blue-600' :
                              l === 'même adresse' ? 'bg-violet-50 text-violet-600' :
                              l === 'même code postal' ? 'bg-teal-50 text-teal-600' :
                              l === 'temporalité critique' ? 'bg-red-50 text-red-600' :
                              l === 'nom similaire' ? 'bg-slate-50 text-slate-600' :
                              l === 'nom secondaire' ? 'bg-slate-50 text-slate-600' :
                              l === 'catégories similaires' ? 'bg-emerald-50 text-emerald-600' :
                              l === 'jeunesse + négatif' ? 'bg-orange-50 text-orange-600' :
                              'bg-gray-50 text-gray-600'
                            }`}>
                              {l}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {e.points_lien > 0 && (
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        e.points_lien >= 40 ? 'bg-red-100 text-red-800' :
                        e.points_lien >= 20 ? 'bg-orange-100 text-orange-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {e.points_lien} pts
                      </span>
                    )}
                    {e.score !== null && (
                      <span className={`text-sm font-black ${
                        (e.score ?? 0) >= 85 ? 'text-emerald-600' :
                        (e.score ?? 0) >= 70 ? 'text-amber-600' :
                        (e.score ?? 0) >= 50 ? 'text-orange-600' :
                        'text-red-600'
                      }`}>{e.score}</span>
                    )}
                    <ExternalLink size={14} className="text-slate-300" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12 pt-8 border-t border-slate-100 text-center text-sm text-slate-400 print:hidden">
          <p>Rapport généré le {new Date().toLocaleDateString('fr-CA')}</p>
          <p className="mt-1">Données certifiées issues du registre RBQ, REQ, OPC, CanLII et SEAO.</p>
        </div>
      </div>
    </main>
  )
}