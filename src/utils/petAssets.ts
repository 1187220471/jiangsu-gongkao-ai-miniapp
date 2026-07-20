const PET_IMAGES: Record<string, string> = {
  'pet-orangecat-120.png': require('../assets/collection/pet-orangecat-120.png'),
  'pet-bluecat-120.png': require('../assets/collection/pet-bluecat-120.png'),
  'pet-silvershaded-120.png': require('../assets/collection/pet-silvershaded-120.png'),
  'pet-ragdoll-120.png': require('../assets/collection/pet-ragdoll-120.png'),
  'pet-corgi-120.png': require('../assets/collection/pet-corgi-120.png'),
  'pet-shiba-120.png': require('../assets/collection/pet-shiba-120.png'),
  'pet-poodle-120.png': require('../assets/collection/pet-poodle-120.png'),
  'pet-goldenretriever-120.png': require('../assets/collection/pet-goldenretriever-120.png'),
  'pet-husky-120.png': require('../assets/collection/pet-husky-120.png'),
  'pet-samoyed-120.png': require('../assets/collection/pet-samoyed-120.png'),
  'pet-bordercollie-120.png': require('../assets/collection/pet-bordercollie-120.png'),
  'pet-hamster-120.png': require('../assets/collection/pet-hamster-120.png'),
  'pet-loprabbit-120.png': require('../assets/collection/pet-loprabbit-120.png'),
  'pet-chinchilla-120.png': require('../assets/collection/pet-chinchilla-120.png'),
  'pet-redpanda-120.png': require('../assets/collection/pet-redpanda-120.png'),
  'pet-penguin-120.png': require('../assets/collection/pet-penguin-120.png'),
}

export function getPetImageUrl(imageUrl: string): string {
  const fileName = imageUrl.split('/').pop() || 'pet-orangecat-120.png'
  return PET_IMAGES[fileName] || PET_IMAGES['pet-orangecat-120.png']
}
