import { NextResponse } from 'next/server';
import Redis from 'ioredis';

// Redis Container එකට කනෙක්ට් වෙනවා
const redis = new Redis({ host: 'redis', port: 6379 });

export async function GET() {
    try {
        const data = await redis.get('website_status');
        return NextResponse.json(data ? JSON.parse(data) : []);
    } catch (error) {
        return NextResponse.json({ error: 'Redis connection failed' }, { status: 500 });
    }
}