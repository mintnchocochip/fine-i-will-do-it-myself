// Explicitly maps week identifiers to the localized PDF files in the /public/Materials folder.
export const weekToMaterialMap = {
  week1: '/Materials/Week 01 Lecture Material.pdf',
  week2: '/Materials/Week 02 Lecture Material.pdf',
  week3: '/Materials/Week 3_ Lecture Material.pdf',
  week4: '/Materials/Week 4_ Lecture Material.pdf',
  week5: '/Materials/Week 5_ Lecture Material.pdf',
  week6: '/Materials/Week 6_ Lecture Material.pdf',
  week7: '/Materials/week 7 Lecture Material.pdf',
  week8: '/Materials/week 8 Lecture Material.pdf',
  week9: '/Materials/week 9 Lecture Material.pdf',
  week10: '/Materials/week10 _46 to 50_Lecture Material.pdf',
  week11: '/Materials/week11 _ 51 to 55_Lecture Material.pdf',
  week12: '/Materials/week12_56 to 61_Lecture Material.pdf',
}

// Helper to fetch the base64 string directly from local URL
export async function fetchMaterialBase64(url) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to load expected material file at ${url}`)
  }
  
  const arrayBuffer = await response.arrayBuffer()
  
  // Convert ArrayBuffer to Base64 without crashing stack size limits on large PDFs
  let binary = ''
  const bytes = new Uint8Array(arrayBuffer)
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}
