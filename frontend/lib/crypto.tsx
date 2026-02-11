export async function encrypt(text: string) {
  return btoa(text); // simple for now, replace with AES later
}
