import { NextRequest, NextResponse } from 'next/server';
import { generateDailyChallenge } from '@/lib/gemini';

// 简单的内存缓存（生产环境建议使用 Redis 或 Vercel KV）
const cache = new Map<string, { data: any; timestamp: number }>();

// 缓存有效期：24小时（毫秒）
const CACHE_DURATION = 24 * 60 * 60 * 1000;

/**
 * 获取当前日期的唯一标识符（UTC日期字符串）
 */
function getDateKey(): string {
  const now = new Date();
  const utcDate = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate()
  ));
  return utcDate.toISOString().split('T')[0]; // 格式：YYYY-MM-DD
}

/**
 * 计算从固定起始日期到今天的天数
 */
function getDayNumber(): number {
  const startDate = new Date('2024-01-01'); // 固定起始日期
  const today = new Date();
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // 从1开始
}

/**
 * GET /api/challenge
 * 获取今日挑战，使用24小时缓存策略
 */
export async function GET(request: NextRequest) {
  try {
    const dateKey = getDateKey();
    const dayNumber = getDayNumber();

    // 检查缓存
    const cached = cache.get(dateKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      // 返回缓存的数据
      return NextResponse.json({
        success: true,
        challenge: cached.data,
        cached: true,
      });
    }

    // 生成新的挑战
    const challenge = await generateDailyChallenge(dayNumber);

    // 更新缓存
    cache.set(dateKey, {
      data: challenge,
      timestamp: now,
    });

    // 清理过期缓存（可选，防止内存泄漏）
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp >= CACHE_DURATION) {
        cache.delete(key);
      }
    }

    return NextResponse.json({
      success: true,
      challenge,
      cached: false,
    });
  } catch (error) {
    console.error('Error in /api/challenge:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate challenge',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// 允许所有HTTP方法（如果需要）
export const runtime = 'nodejs';

