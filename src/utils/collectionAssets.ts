// 宠物素材
import petOrangecat from '../assets/collection/pet-orangecat-120.png'
import petBluecat from '../assets/collection/pet-bluecat-120.png'
import petSilvershaded from '../assets/collection/pet-silvershaded-120.png'
import petRagdoll from '../assets/collection/pet-ragdoll-120.png'
import petCorgi from '../assets/collection/pet-corgi-120.png'
import petShiba from '../assets/collection/pet-shiba-120.png'
import petPoodle from '../assets/collection/pet-poodle-120.png'
import petGoldenretriever from '../assets/collection/pet-goldenretriever-120.png'
import petHusky from '../assets/collection/pet-husky-120.png'
import petSamoyed from '../assets/collection/pet-samoyed-120.png'
import petBordercollie from '../assets/collection/pet-bordercollie-120.png'
import petHamster from '../assets/collection/pet-hamster-120.png'
import petLoprabbit from '../assets/collection/pet-loprabbit-120.png'
import petChinchilla from '../assets/collection/pet-chinchilla-120.png'
import petRedpanda from '../assets/collection/pet-redpanda-120.png'
import petPenguin from '../assets/collection/pet-penguin-120.png'

// NBA 球星素材
import nbaCurry from '../assets/collection/nba-curry-120.png'
import nbaDurant from '../assets/collection/nba-durant-120.png'
import nbaLebron from '../assets/collection/nba-lebron-120.png'
import nbaDoncic from '../assets/collection/nba-doncic-120.png'
import nbaSga from '../assets/collection/nba-sga-120.png'
import nbaLillard from '../assets/collection/nba-lillard-120.png'
import nbaHarden from '../assets/collection/nba-harden-120.png'
import nbaGiannis from '../assets/collection/nba-giannis-120.png'
import nbaEmbiid from '../assets/collection/nba-embiid-120.png'
import nbaEdwards from '../assets/collection/nba-edwards-120.png'
import nbaJokic from '../assets/collection/nba-jokic-120.png'
import nbaMorant from '../assets/collection/nba-morant-120.png'

const COLLECTION_IMAGES: Record<string, string> = {
  // pets
  'pet-orangecat-120.png': petOrangecat,
  'pet-bluecat-120.png': petBluecat,
  'pet-silvershaded-120.png': petSilvershaded,
  'pet-ragdoll-120.png': petRagdoll,
  'pet-corgi-120.png': petCorgi,
  'pet-shiba-120.png': petShiba,
  'pet-poodle-120.png': petPoodle,
  'pet-goldenretriever-120.png': petGoldenretriever,
  'pet-husky-120.png': petHusky,
  'pet-samoyed-120.png': petSamoyed,
  'pet-bordercollie-120.png': petBordercollie,
  'pet-hamster-120.png': petHamster,
  'pet-loprabbit-120.png': petLoprabbit,
  'pet-chinchilla-120.png': petChinchilla,
  'pet-redpanda-120.png': petRedpanda,
  'pet-penguin-120.png': petPenguin,
  // nba stars
  'nba-curry-120.png': nbaCurry,
  'nba-durant-120.png': nbaDurant,
  'nba-lebron-120.png': nbaLebron,
  'nba-doncic-120.png': nbaDoncic,
  'nba-sga-120.png': nbaSga,
  'nba-lillard-120.png': nbaLillard,
  'nba-harden-120.png': nbaHarden,
  'nba-giannis-120.png': nbaGiannis,
  'nba-embiid-120.png': nbaEmbiid,
  'nba-edwards-120.png': nbaEdwards,
  'nba-jokic-120.png': nbaJokic,
  'nba-morant-120.png': nbaMorant,
}

export function getCollectionImageUrl(imageUrl: string): string {
  const fileName = imageUrl.split('/').pop() || 'pet-orangecat-120.png'
  return COLLECTION_IMAGES[fileName] || COLLECTION_IMAGES['pet-orangecat-120.png']
}
