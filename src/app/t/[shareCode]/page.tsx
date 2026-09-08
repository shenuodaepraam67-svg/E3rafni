import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import QuizInteractive from '@/components/quiz/QuizInteractive'
import { getQuizByShareCodeServer } from '@/lib/api/server'

interface PageProps {
  params: {
    shareCode: string
  }
}

// Generate dynamic metadata for each quiz
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const quizData = await getQuizByShareCodeServer(params.shareCode)

  if (!quizData) {
    return {
      title: 'الاختبار غير موجود | اعرفني',
      description: 'هذا الاختبار غير موجود أو تم إيقافه.',
    }
  }

  const title = `${quizData.test.title} | اعرفني`
  const description = quizData.test.description || 'اختبر معرفتك بأصدقائك على منصة اعرفني'

  return {
    title,
    description,
    alternates: {
      canonical: `/t/${params.shareCode}`,
    },
    openGraph: {
      title,
      description,
      url: `https://e3rafni.vercel.app/t/${params.shareCode}`,
      siteName: 'اعرفني',
      locale: 'ar_AR',
      type: 'website',
    },
  }
}

export default async function PublicQuizPage({ params }: PageProps) {
  const quizData = await getQuizByShareCodeServer(params.shareCode)

  // Handle not found case
  if (!quizData) {
    notFound()
  }

  return (
    <QuizInteractive 
      initialQuizData={quizData} 
      shareCode={params.shareCode}
    />
  )
}