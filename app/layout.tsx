import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Daily AI Chinese Challenge | 每日中文挑战',
  description: '每天3个中文谜题：汉字拆解、俚语翻译、表情符号成语。专为 Reddit r/ChineseLanguage 社区设计。',
  keywords: ['中文学习', '汉语挑战', 'Chinese Learning', 'Daily Challenge'],
  openGraph: {
    title: 'Daily AI Chinese Challenge',
    description: '每天3个中文谜题挑战',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0ea5e9',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>{children}</body>
    </html>
  );
}

