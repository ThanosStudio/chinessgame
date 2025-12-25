import { OpenRouter } from '@openrouter/sdk';

// OpenRouter API 配置
function getApiKey(): string {
  const API_KEY = process.env.OPENROUTER_API_KEY;
  if (!API_KEY) {
    throw new Error('OPENROUTER_API_KEY environment variable is not set. Please set it in your Vercel environment variables.');
  }
  return API_KEY;
}

// 初始化 OpenRouter 客户端
function getOpenRouterClient() {
  const apiKey = getApiKey();
  return new OpenRouter({
    apiKey,
  });
}

// 挑战数据结构
export interface Challenge {
  day: number;
  puzzles: {
    hanzi: {
      question: string; // 例如："拆解汉字：'明' 由哪两个部分组成？"
      answer: string; // 例如："日和月"
      options: string[]; // 4个选项
    };
    slang: {
      question: string; // 例如："'躺平' 是什么意思？"
      answer: string; // 例如："放弃努力，接受现状"
      options: string[]; // 4个选项
    };
    emoji: {
      question: string; // 例如："🐉🐯 代表哪个成语？"
      answer: string; // 例如："龙腾虎跃"
      options: string[]; // 4个选项
    };
  };
}

// 系统提示词 - 用于生成每日挑战
const SYSTEM_INSTRUCTION = `你是一个专业的中文语言学习内容生成器。你的任务是生成每日中文挑战，包含3个不同类型的谜题：

1. **汉字拆解 (Hanzi Deconstruction)**: 选择一个常用汉字，要求用户识别其组成部分。提供4个选项，其中一个是正确答案。

2. **俚语翻译 (Slang Translation)**: 选择一个现代中文俚语或网络用语，要求用户选择正确的英文翻译或解释。提供4个选项。

3. **表情符号成语 (Emoji Idiom)**: 用表情符号表示一个中文成语，要求用户猜出成语。提供4个选项。

要求：
- 所有内容必须准确、教育性强
- 难度适中，适合中文学习者
- 选项要具有迷惑性，但正确答案必须明确
- 使用简体中文
- 返回严格的JSON格式

返回格式：
{
  "day": 数字（从1开始递增）,
  "puzzles": {
    "hanzi": {
      "question": "问题文本",
      "answer": "正确答案",
      "options": ["选项1", "选项2", "选项3", "选项4"]
    },
    "slang": {
      "question": "问题文本",
      "answer": "正确答案",
      "options": ["选项1", "选项2", "选项3", "选项4"]
    },
    "emoji": {
      "question": "表情符号问题",
      "answer": "正确答案",
      "options": ["选项1", "选项2", "选项3", "选项4"]
    }
  }
}`;

/**
 * 生成每日中文挑战
 * @param dayNumber 日期编号（用于确保同一天生成相同内容）
 * @returns Promise<Challenge>
 */
export async function generateDailyChallenge(dayNumber: number): Promise<Challenge> {
  // 获取 OpenRouter 客户端
  const openrouter = getOpenRouterClient();

  const prompt = `今天是第 ${dayNumber} 天的挑战。请生成今天的3个谜题。

${SYSTEM_INSTRUCTION}

请确保：
- 选项数组必须包含正确答案
- 所有选项长度相似，避免明显提示
- 汉字拆解题要选择常用字
- 俚语要选择真实存在且常用的
- 表情符号成语要清晰易懂

请直接返回 JSON 格式，不要包含任何其他文本或 markdown 代码块。`;

  try {
    console.log(`[OpenRouter] Generating challenge for day ${dayNumber}...`);
    
    // 使用 OpenRouter SDK 调用 API
    const response = await openrouter.chat.send({
      model: 'google/gemini-2.0-flash-001', // OpenRouter 模型名称格式，也可以使用 'google/gemini-2.0-flash'
      messages: [
        {
          role: 'system',
          content: SYSTEM_INSTRUCTION,
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      maxTokens: 2048,
      responseFormat: { type: 'json_object' }, // 请求 JSON 格式输出
      stream: false, // 非流式响应
    });

    // OpenRouter SDK 返回格式：{ choices: [{ message: { content: "..." } }] }
    const messageContent = response.choices?.[0]?.message?.content;
    
    if (!messageContent) {
      console.error('[OpenRouter] Invalid response structure:', JSON.stringify(response).substring(0, 500));
      throw new Error('Invalid response structure from OpenRouter API');
    }
    
    // 处理 content 可能是字符串或数组的情况
    let text: string;
    if (typeof messageContent === 'string') {
      text = messageContent;
    } else if (Array.isArray(messageContent)) {
      // 如果是数组，提取所有文本内容
      text = messageContent
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text)
        .join('');
    } else {
      throw new Error('Unexpected content format from OpenRouter API');
    }
    
    if (!text) {
      console.error('[OpenRouter] No text content in response:', JSON.stringify(messageContent).substring(0, 500));
      throw new Error('No text content in OpenRouter API response');
    }
    
    console.log(`[OpenRouter] Received response, length: ${text.length}`);
    
    // 解析JSON响应（可能需要清理 markdown 代码块）
    let cleanText = text.trim();
    // 移除可能的 markdown 代码块标记
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }
    
    let challenge: Challenge;
    try {
      challenge = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('[OpenRouter] JSON parse error:', parseError);
      console.error('[OpenRouter] Response text:', cleanText.substring(0, 500));
      throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`);
    }
    
    // 验证数据结构
    if (!challenge.puzzles || !challenge.puzzles.hanzi || !challenge.puzzles.slang || !challenge.puzzles.emoji) {
      console.error('[OpenRouter] Invalid challenge structure:', challenge);
      throw new Error('Invalid challenge structure from AI - missing required puzzle types');
    }

    // 确保答案在选项中
    ['hanzi', 'slang', 'emoji'].forEach((type) => {
      const puzzle = challenge.puzzles[type as keyof typeof challenge.puzzles];
      if (!puzzle.options || !Array.isArray(puzzle.options)) {
        throw new Error(`Invalid options array for ${type}`);
      }
      if (!puzzle.options.includes(puzzle.answer)) {
        puzzle.options.push(puzzle.answer);
        // 打乱选项顺序
        puzzle.options = shuffleArray(puzzle.options);
      }
    });

    challenge.day = dayNumber;
    console.log(`[OpenRouter] Successfully generated challenge for day ${dayNumber}`);
    return challenge;
  } catch (error) {
    // 记录详细错误信息
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('[OpenRouter] Error generating challenge:', {
      message: errorMessage,
      stack: errorStack,
      dayNumber,
    });
    
    // 如果是 API Key 相关的错误，直接抛出，不要返回默认挑战
    if (errorMessage.includes('OPENROUTER_API_KEY') || errorMessage.includes('API key') || errorMessage.includes('401') || errorMessage.includes('403')) {
      throw error;
    }
    
    // 其他错误也抛出，让调用者决定如何处理
    throw new Error(`Failed to generate challenge: ${errorMessage}`);
  }
}

/**
 * 打乱数组顺序（Fisher-Yates算法）
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 默认挑战（当AI生成失败时使用）
 */
export function getDefaultChallenge(dayNumber: number): Challenge {
  return {
    day: dayNumber,
    puzzles: {
      hanzi: {
        question: "拆解汉字：'明' 由哪两个部分组成？",
        answer: "日和月",
        options: shuffleArray(["日和月", "木和日", "水和月", "火和日"]),
      },
      slang: {
        question: "'躺平' 是什么意思？",
        answer: "放弃努力，接受现状",
        options: shuffleArray([
          "放弃努力，接受现状",
          "平躺在床上",
          "努力工作",
          "积极进取"
        ]),
      },
      emoji: {
        question: "🐉🐯 代表哪个成语？",
        answer: "龙腾虎跃",
        options: shuffleArray([
          "龙腾虎跃",
          "龙飞凤舞",
          "虎头蛇尾",
          "画龙点睛"
        ]),
      },
    },
  };
}

