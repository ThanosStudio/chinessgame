import { NextRequest, NextResponse } from 'next/server';
import { generateDailyChallenge, getDefaultChallenge } from '@/lib/gemini';

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
  // 立即输出日志，确保函数被执行
  console.log('=== API CHALLENGE ROUTE CALLED ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
  console.log('API Key length:', process.env.GEMINI_API_KEY?.length || 0);
  
  try {
    const dateKey = getDateKey();
    const dayNumber = getDayNumber();

    console.log(`[API] Request for challenge - Date: ${dateKey}, Day: ${dayNumber}`);

    // 检查缓存
    const cached = cache.get(dateKey);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log(`[API] Returning cached challenge for ${dateKey}`);
      // 返回缓存的数据
    const response = NextResponse.json({
      success: true,
      challenge: cached.data,
      cached: true,
    });
    // 禁用 Vercel CDN 缓存
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
    }

    console.log(`[API] Generating new challenge for day ${dayNumber}...`);
    
    // 生成新的挑战
    let challenge;
    let isDefaultChallenge = false;
    
    try {
      challenge = await generateDailyChallenge(dayNumber);
      
      // 检查是否是默认挑战（通过检查问题内容）
      isDefaultChallenge = 
        challenge.puzzles.hanzi.question === "拆解汉字：'明' 由哪两个部分组成？" ||
        challenge.puzzles.slang.question === "'躺平' 是什么意思？" ||
        challenge.puzzles.emoji.question === "🐉🐯 代表哪个成语？";
      
      if (isDefaultChallenge) {
        console.warn(`[API] Generated challenge appears to be default challenge`);
      }
    } catch (genError) {
      console.error('[API] Failed to generate challenge, using default:', genError);
      // 如果生成失败，使用默认挑战（但不缓存）
      challenge = getDefaultChallenge(dayNumber);
      isDefaultChallenge = true;
    }

    // 只有在成功生成真实挑战时才缓存（不缓存默认挑战）
    if (!isDefaultChallenge) {
      console.log(`[API] Caching generated challenge for ${dateKey}`);
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
    } else {
      console.warn(`[API] Not caching default challenge`);
    }

    const response = NextResponse.json({
      success: true,
      challenge,
      cached: false,
    });
    // 禁用 Vercel CDN 缓存
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    return response;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('[API] Error in /api/challenge:', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });

    // 检查是否是 API Key 错误
    if (errorMessage.includes('OPENROUTER_API_KEY') || errorMessage.includes('401') || errorMessage.includes('403')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration Error',
          message: 'OPENROUTER_API_KEY is not set or invalid. Please configure it in your Vercel environment variables.',
          details: 'Visit your Vercel project settings > Environment Variables to add OPENROUTER_API_KEY',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to generate challenge',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// 禁用 Next.js 的静态优化和缓存
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// 允许所有HTTP方法（如果需要）
export const runtime = 'nodejs';

