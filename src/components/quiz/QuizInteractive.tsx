'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { AdPlaceholder } from '@/components/ui/AdPlaceholder'
import { useActiveQuizStore } from '@/store/activeQuizStore'
import { useAttemptStore } from '@/store/attemptStore'
import { useResultStore } from '@/store/resultStore'
import { api } from '@/lib/api'

type QuizStep = 'welcome' | 'quiz' | 'result'

interface QuizInteractiveProps {
  initialQuizData: {
    test: {
      id: string
      title: string
      description: string
      share_code: string
    }
    questions: Array<{
      id: string
      prompt: string
      question_type: string
      points: number
      required: boolean
      position: number
      options: Array<{
        id: string
        option_text: string
        position: number
      }>
    }>
  }
  shareCode: string
}

export default function QuizInteractive({ initialQuizData, shareCode }: QuizInteractiveProps) {
  const router = useRouter()
  
  const { setTest, setQuestions, reset: resetQuiz } = useActiveQuizStore()
  const { setAttemptId, setParticipantToken, setAnswer, reset: resetAttempt, participantToken } = useAttemptStore()
  const { setResult, reset: resetResult } = useResultStore()
  
  const [step, setStep] = useState<QuizStep>('welcome')
  const [participantName, setParticipantName] = useState('')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [essayAnswer, setEssayAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [attemptId, setAttemptIdState] = useState<string>('')
  const [quizData, setQuizData] = useState(() => {
    // Transform initial data to match component structure
    return {
      test: initialQuizData.test,
      questions: initialQuizData.questions.map(q => ({
        ...q,
        order: q.position || (q as any).order, // Keep order for component logic
        options: q.options.map(o => ({
          ...o,
          order: o.position || (o as any).order // Keep order for component logic
        }))
      }))
    }
  })

  // Initialize stores with server-fetched data
  useEffect(() => {
    setTest(initialQuizData.test)
    // Transform data to match store interface (order -> position, type casting)
    const transformedQuestions = initialQuizData.questions.map(q => ({
      ...q,
      position: q.position || (q as any).order,
      question_type: q.question_type as 'essay' | 'multiple_choice',
      options: q.options.map(o => ({
        ...o,
        position: o.position || (o as any).order
      }))
    }))
    setQuestions(transformedQuestions)
  }, [initialQuizData, setTest, setQuestions])

  const handleStartQuiz = async () => {
    if (!participantName.trim()) {
      setError('الاسم مطلوب')
      return
    }

    setError('')
    setLoading(true)
    
    try {
      const attemptData = await api.startAttempt(shareCode, participantName.trim())
      const attemptId = attemptData.attempt_id
      const participantToken = attemptData.participant_token
      
      setAttemptIdState(attemptId)
      setAttemptId(attemptId)
      setParticipantToken(participantToken)
      
      sessionStorage.setItem('attempt_id', attemptId)
      sessionStorage.setItem('participant_token', participantToken)
      
      setStep('quiz')
    } catch (err: any) {
      console.error('Start attempt error:', err)
      setError(err.message || 'حدث خطأ أثناء بدء الاختبار')
    } finally {
      setLoading(false)
    }
  }

  const handleNextQuestion = async () => {
    const currentQuestion = quizData.questions[currentQuestionIndex]
    
    if (currentQuestion.question_type === 'multiple_choice' && selectedOption) {
      setAnswer(currentQuestion.id, {
        question_id: currentQuestion.id,
        selected_option_id: selectedOption
      })
      await api.saveAnswer(attemptId, currentQuestion.id, { selected_option_id: selectedOption }, participantToken || '')
    } else if (currentQuestion.question_type === 'essay' && essayAnswer.trim()) {
      setAnswer(currentQuestion.id, {
        question_id: currentQuestion.id,
        answer_text: essayAnswer.trim()
      })
      await api.saveAnswer(attemptId, currentQuestion.id, { answer_text: essayAnswer.trim() }, participantToken || '')
    }

    setSelectedOption(null)
    setEssayAnswer('')

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      handleSubmitQuiz()
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitQuiz = async () => {
    setLoading(true)
    
    try {
      const result = await api.submitQuiz(attemptId, participantToken || '')
      
      setResult({
        score: result.score,
        maxScore: result.max_score,
        percentage: result.percentage,
        rank: result.rank
      })
      
      setStep('result')
    } catch (err: any) {
      console.error('Submit quiz error:', err)
      setError(err.message || 'حدث خطأ أثناء إرسال الاختبار')
    } finally {
      setLoading(false)
    }
  }

  const getResultLevel = (percentage: number) => {
    if (percentage <= 20) return "لا تعرفني خالص 😂"
    if (percentage <= 40) return "معرفة ضعيفة"
    if (percentage <= 60) return "معرفة متوسطة"
    if (percentage <= 80) return "تعرفني كويس"
    if (percentage <= 95) return "معرفة ممتازة"
    return "أنت حافظني 😂🏆"
  }

  const currentQuestion = quizData?.questions[currentQuestionIndex]
  const { score, maxScore, percentage, rank } = useResultStore()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Step 1: Welcome & Name Entry */}
      {step === 'welcome' && (
        <div className="min-h-screen flex items-center justify-center px-4 py-8">
          <Card className="w-full max-w-md">
            <CardHeader>
              <h1 className="text-2xl font-bold text-center mb-2">{quizData?.test.title || 'تحميل...'}</h1>
              <p className="text-gray-600 text-center">{quizData?.test.description || ''}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Input
                  label="أدخل اسمك لبدء الاختبار"
                  placeholder="اسمك"
                  value={participantName}
                  onChange={(e) => setParticipantName(e.target.value)}
                  required
                />
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" dir="rtl">
                    {error}
                  </div>
                )}
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleStartQuiz}
                  className="w-full"
                  disabled={!participantName.trim() || loading}
                  isLoading={loading}
                >
                  ابدأ الاختبار
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Quiz Interface */}
      {step === 'quiz' && currentQuestion && (
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Progress Header */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">
                  السؤال {currentQuestionIndex + 1} من {quizData?.questions.length || 0}
                </span>
                <span className="text-sm text-gray-600">
                  {Math.round(((currentQuestionIndex + 1) / (quizData?.questions.length || 1)) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{ width: `${((currentQuestionIndex + 1) / (quizData?.questions.length || 1)) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Question Card */}
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">{currentQuestion.prompt}</h2>
                {currentQuestion.required && (
                  <span className="text-sm text-red-600">مطلوب</span>
                )}
                <span className="text-sm text-gray-600">{currentQuestion.points} نقطة</span>
              </CardHeader>
              <CardContent>
                {currentQuestion.question_type === 'multiple_choice' && currentQuestion.options && (
                  <div className="space-y-3">
                    {currentQuestion.options.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setSelectedOption(option.id)}
                        className={`w-full text-right p-4 rounded-lg border-2 transition-all ${
                          selectedOption === option.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {option.option_text}
                      </button>
                    ))}
                  </div>
                )}

                {currentQuestion.question_type === 'essay' && (
                  <textarea
                    value={essayAnswer}
                    onChange={(e) => setEssayAnswer(e.target.value)}
                    placeholder="اكتب إجابتك هنا..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[150px]"
                    dir="rtl"
                  />
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mt-4" dir="rtl">
                    {error}
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex gap-3 mt-6">
                  {currentQuestionIndex > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreviousQuestion}
                      className="flex-1"
                    >
                      السابق
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleNextQuestion}
                    className="flex-1"
                    isLoading={loading}
                    disabled={
                      currentQuestion.question_type === 'multiple_choice' ? !selectedOption : !essayAnswer.trim()
                    }
                  >
                    {currentQuestionIndex === (quizData?.questions.length || 0) - 1 ? 'إرسال الإجابات' : 'التالي'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Step 3: Result Page */}
      {step === 'result' && (
        <div className="min-h-screen px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <div className="text-center">
                  <div className="text-6xl mb-4">🎉</div>
                  <h1 className="text-2xl font-bold mb-2">اكتمل الاختبار!</h1>
                  <p className="text-gray-600">إليك نتيجتك</p>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-center">
                  {/* Result Level */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-2xl font-bold text-blue-600">
                      {getResultLevel(percentage || 0)}
                    </p>
                  </div>

                  {/* Score Details */}
                  <div className="space-y-2">
                    <p className="text-lg">
                      <span className="font-bold">{score || 0}</span> / <span className="font-bold">{maxScore || 0}</span>
                    </p>
                    <p className="text-3xl font-bold text-blue-600">
                      {percentage || 0}%
                    </p>
                    <p className="text-gray-600">
                      ترتيبك: <span className="font-bold">#{rank || 1}</span> 🏆
                    </p>
                  </div>

                  {/* Ad Placement */}
                  <AdPlaceholder placement="result_bottom" />

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href)
                        alert('تم نسخ الرابط!')
                      }}
                      className="w-full"
                    >
                      مشاركة النتيجة
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => router.push('/create')}
                      className="w-full"
                    >
                      اعمل اختبارك أنت
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push('/')}
                      className="w-full"
                    >
                      العودة للرئيسية
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
