export interface VilleData {
  nom: string
  slug: string
  population: string
  nbEntrepreneurs: string
  region: string
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

export const VILLES_LIST = Object.values(VILLES)
