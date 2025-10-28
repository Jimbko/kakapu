import { NextRequest, NextResponse } from 'next/server';

const API_BASE = 'https://kodikapi.com';
let cachedToken: string | null = null;

async function getKodikToken(): Promise<string> {
    if (cachedToken) {
        return cachedToken;
    }

    try {
        const response = await fetch('https://kodik.info/');
        const html = await response.text();
        
        const tokenMatch = html.match(/(?:token|api_token):\s*['"]([a-f0-9]{32})['"]/i);
        
        if (tokenMatch && tokenMatch[1]) {
            cachedToken = tokenMatch[1];
            console.log('✅ Токен Kodik успешно получен автоматически');
            return cachedToken;
        }

        const scriptMatches = html.match(/<script[^>]+src=["']([^"']+\.js)["']/gi);
        
        if (scriptMatches) {
            for (const scriptTag of scriptMatches.slice(0, 5)) {
                const srcMatch = scriptTag.match(/src=["']([^"']+)["']/);
                if (srcMatch) {
                    let scriptUrl = srcMatch[1];
                    if (scriptUrl.startsWith('//')) {
                        scriptUrl = 'https:' + scriptUrl;
                    } else if (scriptUrl.startsWith('/')) {
                        scriptUrl = 'https://kodik.info' + scriptUrl;
                    }

                    try {
                        const scriptResponse = await fetch(scriptUrl);
                        const scriptText = await scriptResponse.text();
                        const scriptTokenMatch = scriptText.match(/(?:token|api_token):\s*['"]([a-f0-9]{32})['"]/i);
                        
                        if (scriptTokenMatch && scriptTokenMatch[1]) {
                            cachedToken = scriptTokenMatch[1];
                            console.log('✅ Токен Kodik найден в скрипте');
                            return cachedToken;
                        }
                    } catch (e) {
                        continue;
                    }
                }
            }
        }

        console.warn('⚠️ Не удалось получить токен автоматически, использую резервный');
        cachedToken = '3f72e96c268b3c43694060851e331b2c';
        return cachedToken;

    } catch (error) {
        console.error('❌ Ошибка при получении токена:', error);
        cachedToken = '3f72e96c268b3c43694060851e331b2c';
        return cachedToken;
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { shikimori_id, title } = body;

        if (!shikimori_id && !title) {
            return NextResponse.json(
                { error: 'shikimori_id or title is required' },
                { status: 400 }
            );
        }

        const token = await getKodikToken();
        const params = new URLSearchParams({ token });
        
        if (shikimori_id) {
            params.set('shikimori_id', String(shikimori_id));
        } else if (title) {
            params.set('title', title);
        }

        console.log(`🔍 Поиск в Kodik: ${params.toString()}`);

        const response = await fetch(`${API_BASE}/search?${params.toString()}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`❌ Kodik API error: ${response.status}`, errorText);
            return NextResponse.json(
                { error: 'Kodik API error', details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log(`✅ Найдено результатов: ${data.results?.length || 0}`);

        return NextResponse.json(data);

    } catch (error) {
        console.error('❌ Server error:', error);
        return NextResponse.json(
            { error: 'Internal server error', details: String(error) },
            { status: 500 }
        );
    }
}