import { NextRequest, NextResponse } from 'next/server';

const ANILIBRIA_API = 'https://api.anilibria.tv/v3';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const title = searchParams.get('title');

        if (!title) {
            return NextResponse.json(
                { error: 'title parameter is required' },
                { status: 400 }
            );
        }

        console.log(`🔍 Поиск в Anilibria: ${title}`);

        const response = await fetch(
            `${ANILIBRIA_API}/title/search?search=${encodeURIComponent(title)}&limit=1`
        );

        if (!response.ok) {
            console.error(`❌ Anilibria API error: ${response.status}`);
            return NextResponse.json(
                { error: 'Anilibria API error' },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log(`✅ Найдено результатов: ${data.list?.length || 0}`);

        return NextResponse.json(data);

    } catch (error) {
        console.error('❌ Server error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
