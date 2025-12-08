import { NextResponse } from 'next/server';

export async function GET(request: Request, props: { params: Promise<{ ticker: string }> }) {
    const params = await props.params;
    const ticker = params.ticker;

    // Placeholder mock response
    return NextResponse.json(
        { error: `Data for ${ticker} not found` },
        { status: 404 }
    );
}
