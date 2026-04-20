export interface VilleData {
  nom: string
  slug: string
  population: string
  nbEntrepreneurs: string
  region: string
}

export interface MrcData {
  nom: string
  slug: string
  nbEntrepreneurs: string
  region: string
  villesPrincipales: string[]
}

export const VILLES: Record<string, VilleData> = {
  montreal: { nom: 'Montréal', slug: 'montreal', population: '1,9 million', nbEntrepreneurs: '5 200+', region: 'Montréal' },
  laval: { nom: 'Laval', slug: 'laval', population: '458 000', nbEntrepreneurs: '2 600+', region: 'Laval' },
  quebec: { nom: 'Québec', slug: 'quebec', population: '588 000', nbEntrepreneurs: '2 200+', region: 'Capitale-Nationale' },
  terrebonne: { nom: 'Terrebonne', slug: 'terrebonne', population: '126 000', nbEntrepreneurs: '1 150+', region: 'Lanaudière' },
  longueuil: { nom: 'Longueuil', slug: 'longueuil', population: '268 000', nbEntrepreneurs: '1 030+', region: 'Montérégie' },
  gatineau: { nom: 'Gatineau', slug: 'gatineau', population: '304 000', nbEntrepreneurs: '960+', region: 'Outaouais' },
  sherbrooke: { nom: 'Sherbrooke', slug: 'sherbrooke', population: '183 000', nbEntrepreneurs: '850+', region: 'Estrie' },
  levis: { nom: 'Lévis', slug: 'levis', population: '158 000', nbEntrepreneurs: '830+', region: 'Chaudière-Appalaches' },
  mirabel: { nom: 'Mirabel', slug: 'mirabel', population: '66 000', nbEntrepreneurs: '800+', region: 'Laurentides' },
  'saint-jean-sur-richelieu': { nom: 'Saint-Jean-sur-Richelieu', slug: 'saint-jean-sur-richelieu', population: '100 000', nbEntrepreneurs: '760+', region: 'Montérégie' },
  'trois-rivieres': { nom: 'Trois-Rivières', slug: 'trois-rivieres', population: '149 000', nbEntrepreneurs: '650+', region: 'Mauricie' },
  saguenay: { nom: 'Saguenay', slug: 'saguenay', population: '151 000', nbEntrepreneurs: '615+', region: 'Saguenay–Lac-Saint-Jean' },
  'saint-jerome': { nom: 'Saint-Jérôme', slug: 'saint-jerome', population: '82 000', nbEntrepreneurs: '555+', region: 'Laurentides' },
  blainville: { nom: 'Blainville', slug: 'blainville', population: '70 000', nbEntrepreneurs: '555+', region: 'Laurentides' },
  repentigny: { nom: 'Repentigny', slug: 'repentigny', population: '87 000', nbEntrepreneurs: '540+', region: 'Lanaudière' },
  mascouche: { nom: 'Mascouche', slug: 'mascouche', population: '55 000', nbEntrepreneurs: '535+', region: 'Lanaudière' },
  drummondville: { nom: 'Drummondville', slug: 'drummondville', population: '83 000', nbEntrepreneurs: '400+', region: 'Centre-du-Québec' },
  granby: { nom: 'Granby', slug: 'granby', population: '72 000', nbEntrepreneurs: '385+', region: 'Montérégie' },
  brossard: { nom: 'Brossard', slug: 'brossard', population: '96 000', nbEntrepreneurs: '360+', region: 'Montérégie' },
  'saint-hyacinthe': { nom: 'Saint-Hyacinthe', slug: 'saint-hyacinthe', population: '59 000', nbEntrepreneurs: '345+', region: 'Montérégie' },
  'saint-eustache': { nom: 'Saint-Eustache', slug: 'saint-eustache', population: '47 000', nbEntrepreneurs: '340+', region: 'Laurentides' },
  boisbriand: { nom: 'Boisbriand', slug: 'boisbriand', population: '30 000', nbEntrepreneurs: '270+', region: 'Laurentides' },
  boucherville: { nom: 'Boucherville', slug: 'boucherville', population: '44 000', nbEntrepreneurs: '260+', region: 'Montérégie' },
  chateauguay: { nom: 'Châteauguay', slug: 'chateauguay', population: '50 000', nbEntrepreneurs: '255+', region: 'Montérégie' },
  'salaberry-de-valleyfield': { nom: 'Salaberry-de-Valleyfield', slug: 'salaberry-de-valleyfield', population: '43 000', nbEntrepreneurs: '255+', region: 'Montérégie' },
  victoriaville: { nom: 'Victoriaville', slug: 'victoriaville', population: '50 000', nbEntrepreneurs: '250+', region: 'Centre-du-Québec' },
  'saint-georges': { nom: 'Saint-Georges', slug: 'saint-georges', population: '36 000', nbEntrepreneurs: '240+', region: 'Chaudière-Appalaches' },
  'vaudreuil-dorion': { nom: 'Vaudreuil-Dorion', slug: 'vaudreuil-dorion', population: '55 000', nbEntrepreneurs: '235+', region: 'Montérégie' },
  shawinigan: { nom: 'Shawinigan', slug: 'shawinigan', population: '50 000', nbEntrepreneurs: '225+', region: 'Mauricie' },
  rimouski: { nom: 'Rimouski', slug: 'rimouski', population: '50 000', nbEntrepreneurs: '195+', region: 'Bas-Saint-Laurent' },
}

export const MRCS: Record<string, MrcData> = {
  'mrc-de-memphremagog': { nom: 'MRC de Memphrémagog', slug: 'mrc-de-memphremagog', nbEntrepreneurs: '350+', region: 'Estrie', villesPrincipales: ['Magog', 'Sainte-Catherine-de-Hatley', 'Austin'] },
  'mrc-du-granit': { nom: 'MRC du Granit', slug: 'mrc-du-granit', nbEntrepreneurs: '180+', region: 'Estrie', villesPrincipales: ['Lac-Mégantic', 'East-Angus'] },
  'mrc-de-l-assomption': { nom: "MRC de L'Assomption", slug: 'mrc-de-l-assomption', nbEntrepreneurs: '420+', region: 'Lanaudière', villesPrincipales: ["L'Assomption", 'Lavaltrie', 'Saint-Sulpice'] },
  'mrc-de-montcalm': { nom: 'MRC de Montcalm', slug: 'mrc-de-montcalm', nbEntrepreneurs: '280+', region: 'Lanaudière', villesPrincipales: ['Saint-Lin-Laurentides', 'Sainte-Julienne'] },
  'mrc-de-roussillon': { nom: 'MRC de Roussillon', slug: 'mrc-de-roussillon', nbEntrepreneurs: '450+', region: 'Montérégie', villesPrincipales: ['Candiac', 'Delson', 'Saint-Constant'] },
  'mrc-de-marguerite-d-youville': { nom: "MRC de Marguerite-D'Youville", slug: 'mrc-de-marguerite-d-youville', nbEntrepreneurs: '310+', region: 'Montérégie', villesPrincipales: ['Varennes', 'Verchères', 'Saint-Amable'] },
  'mrc-de-vallee-du-richelieu': { nom: 'MRC de Vallée-du-Richelieu', slug: 'mrc-de-vallee-du-richelieu', nbEntrepreneurs: '360+', region: 'Montérégie', villesPrincipales: ['Belœil', 'McMasterville', 'Saint-Mathieu-de-Belœil'] },
  'mrc-des-chenaux': { nom: 'MRC des Chenaux', slug: 'mrc-des-chenaux', nbEntrepreneurs: '180+', region: 'Mauricie', villesPrincipales: ['Sainte-Anne-de-la-Pérade', 'Batiscan', 'Saint-Luc-de-Vincennes'] },
  'mrc-de-portneuf': { nom: 'MRC de Portneuf', slug: 'mrc-de-portneuf', nbEntrepreneurs: '190+', region: 'Capitale-Nationale', villesPrincipales: ['Cap-Santé', 'Saint-Raymond', 'Donnacona'] },
  'mrc-de-charlevoix': { nom: 'MRC de Charlevoix', slug: 'mrc-de-charlevoix', nbEntrepreneurs: '120+', region: 'Capitale-Nationale', villesPrincipales: ['Baie-Saint-Paul', 'La Malbaie'] },
  'mrc-de-l-islet': { nom: "MRC de L'Islet", slug: 'mrc-de-l-islet', nbEntrepreneurs: '95+', region: 'Chaudière-Appalaches', villesPrincipales: ['Saint-Jean-Port-Joli', 'La Pocatière'] },
  'mrc-de-montmagny': { nom: 'MRC de Montmagny', slug: 'mrc-de-montmagny', nbEntrepreneurs: '110+', region: 'Chaudière-Appalaches', villesPrincipales: ['Montmagny'] },
  'mrc-de-bellechasse': { nom: 'MRC de Bellechasse', slug: 'mrc-de-bellechasse', nbEntrepreneurs: '130+', region: 'Chaudière-Appalaches', villesPrincipales: ['Sainte-Claire', 'Saint-Anselme'] },
  'mrc-de-kamouraska-riviere-du-loup': { nom: 'MRC de Kamouraska—Rivière-du-Loup', slug: 'mrc-de-kamouraska-riviere-du-loup', nbEntrepreneurs: '140+', region: 'Bas-Saint-Laurent', villesPrincipales: ['Rivière-du-Loup', 'Saint-Pascal'] },
  'mrc-de-la-mitis': { nom: 'MRC de La Mitis', slug: 'mrc-de-la-mitis', nbEntrepreneurs: '80+', region: 'Bas-Saint-Laurent', villesPrincipales: ['Mont-Joli'] },
  'mrc-de-temiscouata': { nom: 'MRC de Témiscouata', slug: 'mrc-de-temiscouata', nbEntrepreneurs: '90+', region: 'Bas-Saint-Laurent', villesPrincipales: ['Témiscouata-sur-le-Lac', 'Dégelis'] },
  'mrc-de-papineau': { nom: 'MRC de Papineau', slug: 'mrc-de-papineau', nbEntrepreneurs: '150+', region: 'Outaouais', villesPrincipales: ['Thurso', 'Saint-André-Avelin', 'Papineauville'] },
  'mrc-des-collines-de-l-outaouais': { nom: "MRC des Collines-de-l'Outaouais", slug: 'mrc-des-collines-de-l-outaouais', nbEntrepreneurs: '200+', region: 'Outaouais', villesPrincipales: ['Chelsea', 'Wakefield', 'Cantley'] },
  'mrc-du-fjord-du-saguenay': { nom: 'MRC du Fjord-du-Saguenay', slug: 'mrc-du-fjord-du-saguenay', nbEntrepreneurs: '160+', region: 'Saguenay–Lac-Saint-Jean', villesPrincipales: ['La Baie', "Saint-Félix-d'Otis"] },
  'mrc-de-lac-saint-jean-est': { nom: 'MRC du Lac-Saint-Jean-Est', slug: 'mrc-de-lac-saint-jean-est', nbEntrepreneurs: '200+', region: 'Saguenay–Lac-Saint-Jean', villesPrincipales: ['Alma', 'Sainte-Marthe-du-Cap'] },
}

export const VILLES_LIST = Object.values(VILLES)
export const MRCS_LIST = Object.values(MRCS)