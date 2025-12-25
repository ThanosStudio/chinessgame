import { GoogleGenerativeAI } from '@google/generative-ai';

// Gemini API 配置
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

const genAI = new GoogleGenerativeAI(API_KEY);

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
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    generationConfig: {
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 2048,
      responseMimeType: 'application/json',
    },
  });

  const prompt = `今天是第 ${dayNumber} 天的挑战。请生成今天的3个谜题。

${SYSTEM_INSTRUCTION}

请确保：
- 选项数组必须包含正确答案
- 所有选项长度相似，避免明显提示
- 汉字拆解题要选择常用字
- 俚语要选择真实存在且常用的
- 表情符号成语要清晰易懂`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // 解析JSON响应
    const challenge: Challenge = JSON.parse(text);
    
    // 验证数据结构
    if (!challenge.puzzles || !challenge.puzzles.hanzi || !challenge.puzzles.slang || !challenge.puzzles.emoji) {
      throw new Error('Invalid challenge structure from AI');
    }

    // 确保答案在选项中
    ['hanzi', 'slang', 'emoji'].forEach((type) => {
      const puzzle = challenge.puzzles[type as keyof typeof challenge.puzzles];
      if (!puzzle.options.includes(puzzle.answer)) {
        puzzle.options.push(puzzle.answer);
        // 打乱选项顺序
        puzzle.options = shuffleArray(puzzle.options);
      }
    });

    challenge.day = dayNumber;
    return challenge;
  } catch (error) {
    console.error('Error generating challenge:', error);
    // 返回一个默认挑战作为后备
    return getDefaultChallenge(dayNumber);
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
function getDefaultChallenge(dayNumber: number): Challenge {
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

