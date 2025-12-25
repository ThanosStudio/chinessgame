'use client';

import { useState } from 'react';
import { Copy, Check, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShareButtonProps {
  score: number;
  total: number;
  day: number;
  answers: { correct: boolean }[];
}

/**
 * 生成Reddit格式的分享文本
 */
function generateRedditShareText(score: number, total: number, day: number, answers: { correct: boolean }[]): string {
  const emojiResults = answers.map((a) => (a.correct ? '🟩' : '🟥')).join('');
  const percentage = Math.round((score / total) * 100);
  
  const answerDetails = answers.map((a, i) => 
    `Question ${i + 1}: ${a.correct ? 'Correct' : 'Incorrect'}`
  ).join('\n');
  
  // 获取当前域名
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://your-domain.vercel.app';
  
  return `🀄 Daily Chinese Challenge #${day}

${emojiResults}

Score: ${score}/${total} (${percentage}%)

>!${answerDetails}!<

Try it yourself: [Daily AI Chinese Challenge](${baseUrl})`;
}

export default function ShareButton({ score, total, day, answers }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const shareText = generateRedditShareText(score, total, day, answers);
    
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // 降级方案：使用文本区域
      const textArea = document.createElement('textarea');
      textArea.value = shareText;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  return (
    <motion.button
      onClick={handleCopy}
      className="relative flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <AnimatePresence mode="wait">
        {copied ? (
          <motion.div
            key="check"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>已复制！</span>
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            <span>分享到 Reddit</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

