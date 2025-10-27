const API_BASE = 'https://kodikapi.com';
const KODIK_TOKEN = '30a2f51e04139f4251a375c824707833';

export async function getPlayerLink(shikimoriId: string): Promise<string | null> {
  if (!KODIK_TOKEN) {
    console.error("Kodik API token is not set.");
    return null;
  }

  try {
    const url = `${API_BASE}/search?token=${KODIK_TOKEN}&shikimori_id=${shikimoriId}&with_episodes=true&with_material_data=true`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Kodik API error: ${response.statusText}`);
    }
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      const resultWithPlayer = data.results.find(r => r.link);
      if (resultWithPlayer) {
          return `https:${resultWithPlayer.link}`;
      }
    }
    console.warn(`No Kodik player found for shikimori_id: ${shikimoriId}`);
    return null;
  } catch (error) {
    console.error("Failed to fetch from Kodik API", error);
    return null;
  }
}
