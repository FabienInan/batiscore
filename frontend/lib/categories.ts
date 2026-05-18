export interface CategoryData {
  slug: string
  nom: string
  description: string
  metaTitle: string
  metaDescription: string
  codesRbq: string[]
  keywords: string[]
}

export const CATEGORIES: Record<string, CategoryData> = {
  'renovation-generale': {
    slug: 'renovation-generale',
    nom: 'Rénovation générale',
    description: 'Entrepreneurs en rénovation générale au Québec détenant une licence RBQ valide. Vérifiez leur fiabilité avant de confier vos travaux.',
    metaTitle: 'Vérifier un entrepreneur en rénovation générale au Québec',
    metaDescription: 'Trouvez et vérifiez la fiabilité des entrepreneurs en rénovation générale au Québec. Licence RBQ, score de confiance, plaintes OPC et connexions à risque.',
    codesRbq: ['1.1.1', '1.1.2', '1.2', '1.3', '1.4', '1.4G', '1.5', '1.5G', 'ADM', 'GPC'],
    keywords: ['entrepreneur rénovation générale', 'rénovation Québec', 'entrepreneur bâtiment Québec'],
  },
  plomberie: {
    slug: 'plomberie',
    nom: 'Plomberie',
    description: 'Plombiers licenciés RBQ au Québec. Vérifiez la validité de la licence et le score de fiabilité avant vos travaux de plomberie.',
    metaTitle: 'Vérifier un plombier au Québec — Licence RBQ',
    metaDescription: 'Trouvez des plombiers licenciés RBQ au Québec. Vérifiez leur licence, leur score de fiabilité et les éventuelles plaintes avant d\'engager.',
    codesRbq: ['15.5'],
    keywords: ['plombier Québec', 'plomberie licence RBQ', 'vérifier plombier'],
  },
  electricite: {
    slug: 'electricite',
    nom: 'Électricité',
    description: 'Électriciens licenciés RBQ au Québec. Vérifiez leur licence et leur fiabilité avant tout travail électrique.',
    metaTitle: 'Vérifier un électricien au Québec — Licence RBQ',
    metaDescription: 'Trouvez des électriciens licenciés RBQ au Québec. Vérifiez leur licence, score de fiabilité et antécédents avant d\'engager.',
    codesRbq: ['16'],
    keywords: ['électricien Québec', 'électricité licence RBQ', 'vérifier électricien'],
  },
  chauffage: {
    slug: 'chauffage',
    nom: 'Chauffage et ventilation',
    description: 'Entrepreneurs spécialisés en chauffage, ventilation et climatisation au Québec. Vérifiez leur licence RBQ et leur fiabilité.',
    metaTitle: 'Vérifier un entrepreneur en chauffage au Québec',
    metaDescription: 'Trouvez des entrepreneurs en chauffage et ventilation licenciés RBQ au Québec. Vérifiez leur fiabilité avant d\'engager.',
    codesRbq: ['10', '15.1', '15.4', '15.7', '15.8', '15.9', '15.10'],
    keywords: ['chauffage Québec', 'ventilation licence RBQ', 'entrepreneur chauffage'],
  },
  toiture: {
    slug: 'toiture',
    nom: 'Toiture et étanchéité',
    description: 'Couvreurs et entrepreneurs en toiture licenciés RBQ au Québec. Vérifiez leur licence et leur fiabilité.',
    metaTitle: 'Vérifier un couvreur / entrepreneur en toiture au Québec',
    metaDescription: 'Trouvez des couvreurs et entrepreneurs en toiture licenciés RBQ au Québec. Vérifiez leur licence et score de fiabilité.',
    codesRbq: ['7', '8'],
    keywords: ['couvreur Québec', 'toiture licence RBQ', 'étanchéité entrepreneur'],
  },
  maconnerie: {
    slug: 'maconnerie',
    nom: 'Maçonnerie',
    description: 'Maçons et entrepreneurs en maçonnerie licenciés RBQ au Québec. Vérifiez leur licence et leur fiabilité.',
    metaTitle: 'Vérifier un maçon au Québec — Licence RBQ',
    metaDescription: 'Trouvez des maçons et entrepreneurs en maçonnerie licenciés RBQ au Québec. Vérifiez leur fiabilité avant d\'engager.',
    codesRbq: ['4.1', '4.2'],
    keywords: ['maçon Québec', 'maçonnerie licence RBQ', 'vérifier maçon'],
  },
  excavation: {
    slug: 'excavation',
    nom: 'Excavation et terrassement',
    description: 'Entrepreneurs en excavation et terrassement licenciés RBQ au Québec.',
    metaTitle: 'Vérifier un entrepreneur en excavation au Québec',
    metaDescription: 'Trouvez des entrepreneurs en excavation et terrassement licenciés RBQ au Québec. Vérifiez leur licence et fiabilité.',
    codesRbq: ['2.5', '2.6', '2.7'],
    keywords: ['excavation Québec', 'terrassement licence RBQ', 'entrepreneur excavation'],
  },
  finition: {
    slug: 'finition',
    nom: 'Travaux de finition',
    description: 'Entrepreneurs en travaux de finition intérieure licenciés RBQ au Québec.',
    metaTitle: 'Vérifier un entrepreneur en finition au Québec',
    metaDescription: 'Trouvez des entrepreneurs en travaux de finition licenciés RBQ au Québec. Vérifiez leur licence et fiabilité.',
    codesRbq: ['9', '12'],
    keywords: ['finition Québec', 'travaux finition licence RBQ', 'entrepreneur finition'],
  },
  isolation: {
    slug: 'isolation',
    nom: 'Isolation',
    description: 'Entrepreneurs en isolation de bâtiments licenciés RBQ au Québec.',
    metaTitle: 'Vérifier un entrepreneur en isolation au Québec',
    metaDescription: 'Trouvez des entrepreneurs en isolation licenciés RBQ au Québec. Vérifiez leur licence et fiabilité.',
    codesRbq: ['7'],
    keywords: ['isolation Québec', 'isolation licence RBQ', 'entrepreneur isolation'],
  },
}

export const CATEGORIES_LIST = Object.values(CATEGORIES)
