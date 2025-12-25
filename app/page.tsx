'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Trophy, Sparkles } from 'lucide-react';
import ShareButton from '@/components/ShareButton';

interface Challenge {
  day: number;
  puzzles: {
    hanzi: {
      question: string;
      answer: string;
      options: string[];
    };
    slang: {
      question: string;
      answer: string;
      options: string[];
    };
    emoji: {
      question: string;
      answer: string;
      options: string[];
    };
  };
}

type PuzzleType = 'hanzi' | 'slang' | 'emoji';

interface AnswerResult {
  correct: boolean;
  selected: string;
  correctAnswer: string;
}

export default function Home() {
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [answers, setAnswers] = useState<AnswerResult[]>([]);
  const [gameComplete, setGameComplete] = useState(false);

  const puzzleTypes: PuzzleType[] = ['hanzi', 'slang', 'emoji'];
  const totalQuestions = 3;

  // 获取挑战数据
  useEffect(() => {
    async function fetchChallenge() {
      try {
        setLoading(true);
        const response = await fetch('/api/challenge');
        const data = await response.json();

        if (data.success) {
          setChallenge(data.challenge);
        } else {
          setError(data.message || '获取挑战失败');
        }
      } catch (err) {
        setError('网络错误，请稍后重试');
        console.error('Error fetching challenge:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchChallenge();
  }, []);

  // 获取当前问题
  const getCurrentPuzzle = () => {
    if (!challenge) return null;
    const type = puzzleTypes[currentQuestion];
    return challenge.puzzles[type];
  };

  // 处理答案选择
  const handleAnswerSelect = (option: string) => {
    if (showResult || gameComplete) return;

    setSelectedAnswer(option);
    const puzzle = getCurrentPuzzle();
    if (!puzzle) return;

    const isCorrect = option === puzzle.answer;
    setShowResult(true);

    // 保存答案结果
    const newAnswer: AnswerResult = {
      correct: isCorrect,
      selected: option,
      correctAnswer: puzzle.answer,
    };
    setAnswers([...answers, newAnswer]);

    // 延迟后进入下一题或结束游戏
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      } else {
        setGameComplete(true);
      }
    }, 2000);
  };

  // 重新开始
  const handleRestart = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setAnswers([]);
    setGameComplete(false);
  };

  // 计算分数
  const score = answers.filter((a) => a.correct).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-900 dark:to-slate-800">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-primary-700 dark:text-primary-300 text-lg">加载挑战中...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-slate-900 dark:to-slate-800 p-4">
        <div className="text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">出错了</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  if (!challenge) {
    return null;
  }

  const puzzle = getCurrentPuzzle();
  if (!puzzle) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary-600" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              Daily Chinese Challenge
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">第 {challenge.day} 天</p>
        </motion.div>

        {!gameComplete ? (
          <>
            {/* 进度条 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-8"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  问题 {currentQuestion + 1} / {totalQuestions}
                </span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {score} / {currentQuestion}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-primary-500 to-primary-600 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            {/* 问题卡片 */}
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 md:p-8 mb-6"
            >
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                {puzzle.question}
              </h2>

              {/* 选项 */}
              <div className="space-y-3">
                <AnimatePresence>
                  {puzzle.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = option === puzzle.answer;
                    const showCorrect = showResult && isCorrect;
                    const showIncorrect = showResult && isSelected && !isCorrect;

                    return (
                      <motion.button
                        key={option}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => handleAnswerSelect(option)}
                        disabled={showResult}
                        className={`w-full p-4 rounded-xl text-left font-medium transition-all duration-200 ${
                          showCorrect
                            ? 'bg-green-100 dark:bg-green-900 border-2 border-green-500 text-green-900 dark:text-green-100'
                            : showIncorrect
                            ? 'bg-red-100 dark:bg-red-900 border-2 border-red-500 text-red-900 dark:text-red-100'
                            : isSelected
                            ? 'bg-primary-100 dark:bg-primary-900 border-2 border-primary-500 text-primary-900 dark:text-primary-100'
                            : 'bg-gray-50 dark:bg-slate-700 border-2 border-transparent text-gray-900 dark:text-white hover:border-primary-300 dark:hover:border-primary-600'
                        } ${showResult ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-[1.02] active:scale-[0.98]'}`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{option}</span>
                          {showResult && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                            >
                              {showCorrect ? (
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                              ) : showIncorrect ? (
                                <XCircle className="w-6 h-6 text-red-600" />
                              ) : null}
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </motion.div>
          </>
        ) : (
          /* 游戏完成界面 */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            >
              <Trophy className="w-20 h-20 text-yellow-500 mx-auto mb-4" />
            </motion.div>

            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              挑战完成！
            </h2>

            <div className="mb-6">
              <p className="text-2xl font-semibold text-primary-600 dark:text-primary-400 mb-2">
                得分: {score} / {totalQuestions}
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                {score === totalQuestions
                  ? '🎉 完美！'
                  : score >= totalQuestions / 2
                  ? '👍 不错！'
                  : '💪 继续努力！'}
              </p>
            </div>

            {/* 答案回顾 */}
            <div className="mb-6 space-y-2">
              {answers.map((answer, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg ${
                    answer.correct
                      ? 'bg-green-50 dark:bg-green-900/20'
                      : 'bg-red-50 dark:bg-red-900/20'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {answer.correct ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      问题 {index + 1}: {answer.correct ? '正确' : '错误'}
                      {!answer.correct && ` (正确答案: ${answer.correctAnswer})`}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 分享按钮 */}
            <div className="mb-6">
              <ShareButton
                score={score}
                total={totalQuestions}
                day={challenge.day}
                answers={answers}
              />
            </div>

            {/* 重新开始按钮 */}
            <button
              onClick={handleRestart}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              再来一次
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

