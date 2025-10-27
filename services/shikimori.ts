import { ShikimoriAnime } from '../types';

const API_BASE = 'https://shikimori.one/api';

export async function getAnimeList(listType: 'ongoing' | 'anons' | 'released', limit: number = 20): Promise<ShikimoriAnime[]> {
  try {
    const response = await fetch(`${API_BASE}/animes?status=${listType}&limit=${limit}&order=ranked`);
    if (!response.ok) throw new Error(`Shikimori API error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error("Failed to fetch anime list from Shikimori API", error);
    return [];
  }
}

export async function getAnimeById(id: string): Promise<ShikimoriAnime | null> {
  try {
    const response = await fetch(`${API_BASE}/animes/${id}`);
    if (!response.ok) throw new Error(`Shikimori API error: ${response.statusText}`);
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch anime ${id} from Shikimori API`, error);
    return null;
  }
}
