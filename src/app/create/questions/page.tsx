'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useQuizBuilderStore } from '@/store/quizBuilderStore'

interface QuestionForm {
  question_type: 'multiple_choice'
  prompt: string
  options: Array<{ id: string; option_text: string; is_correct?: boolean }>
  required: boolean
  points: number
}

export default function QuestionsPage() {
  const router = useRouter()
  const { questions, addQuestion, updateQuestion, deleteQuestion } = useQuizBuilderStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState<QuestionForm>({
    question_type: 'multiple_choice',
    prompt: '',
    options: [
      { id: '1', option_text: '', is_correct: false },
      { id: '2', option_text: '', is_correct: false },
    ],
    required: true,
    points: 1,
  })

  const resetForm = () => {
    setFormData({
      question_type: 'multiple_choice',
      prompt: '',
      options: [
        { id: '1', option_text: '', is_correct: false },
        { id: '2', option_text: '', is_correct: false },
      ],
      required: true,
      points: 1,
    })
    setEditingId(null)
    setShowForm(false)
    setError('')
  }

  const handleAddOption = () => {
    if (formData.options.length < 4) {
      setFormData({
        ...formData,
        options: [
          ...formData.options,
          { id: Date.now().toString(), option_text: '', is_correct: false }
        ]
      })
    }
  }

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index)
      setFormData({ ...formData, options: newOptions })
    }
  }

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options]
    newOptions[index].option_text = value
    setFormData({ ...formData, options: newOptions })
  }

  const handleSetCorrect = (index: number) => {
    const newOptions = formData.options.map((opt, i) => ({
      ...opt,
      is_correct: i === index
    }))
    setFormData({ ...formData, options: newOptions })
  }

  const handleSaveQuestion = () => {
    if (!formData.prompt.trim()) {
      setError('نص السؤال مطلوب')
      return
    }

    if (formData.question_type === 'multiple_choice') {
      const hasEmptyOptions = formData.options.some(opt => !opt.option_text.trim())
      if (hasEmptyOptions) {
        setError('جميع الخيارات يجب أن تحتوي على نص')
        return
      }

      const hasCorrectOption = formData.options.some(opt => opt.is_correct)
      if (!hasCorrectOption) {
        setError('يجب تحديد إجابة صحيحة واحدة على الأقل')
        return
      }
    }

    setError('')

    const questionData = {
      id: editingId || Date.now().toString(),
      question_type: formData.question_type,
      prompt: formData.prompt.trim(),
      position: questions.length + 1,
      required: formData.required,
      points: formData.points,
      ...(formData.question_type === 'multiple_choice' && {
        options: formData.options.map(opt => ({
          id: opt.id,
          option_text: opt.option_text.trim(),
          position: 0,
          is_correct: opt.is_correct
        }))
      })
    }

    if (editingId) {
      updateQuestion(editingId, questionData)
    } else {
      addQuestion(questionData)
    }

    resetForm()
  }

  const handleEditQuestion = (id: string) => {
    const question = questions.find(q => q.id === id)
    if (question) {
      setFormData({
        question_type: 'multiple_choice',
        prompt: question.prompt,
        options: question.options || [],
        required: question.required,
        points: question.points,
      })
      setEditingId(id)
      setShowForm(true)
    }
  }

  const handleNext = () => {
    if (questions.length === 0) {
      setError('يجب إضافة سؤال واحد على الأقل')
      return
    }
    setError('')
    router.push('/create/review')
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center mb-2">إضافة الأسئلة والخيارات</h1>
            <p className="text-gray-600 text-center">
              {questions.length === 0 ? 'لم تضف أي أسئلة بعد' : `عدد الأسئلة: ${questions.length}`}
            </p>
          </CardHeader>
          <CardContent>
            {!showForm ? (
              <Button
                type="button"
                variant="primary"
                onClick={() => setShowForm(true)}
                className="w-full"
              >
                + إضافة سؤال جديد
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    نوع السؤال: اختيار من متعدد
                  </div>
                </div>

                <Input
                  label="نص السؤال"
                  placeholder="اكتب سؤالك هنا..."
                  value={formData.prompt}
                  onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                  required
                />

                {formData.question_type === 'multiple_choice' && (
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الخيارات
                    </label>
                    {formData.options.map((option, index) => (
                      <div key={option.id} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="correct-option"
                          checked={option.is_correct}
                          onChange={() => handleSetCorrect(index)}
                          className="w-4 h-4 text-blue-600"
                        />
                        <Input
                          placeholder={`الخيار ${index + 1}`}
                          value={option.option_text}
                          onChange={(e) => handleOptionChange(index, e.target.value)}
                          className="flex-1"
                        />
                        {formData.options.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            حذف
                          </button>
                        )}
                      </div>
                    ))}
                    {formData.options.length < 4 && (
                      <button
                        type="button"
                        onClick={handleAddOption}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        + إضافة خيار
                      </button>
                    )}
                  </div>
                )}

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      النقاط
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 1 })}
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-6">
                    <input
                      type="checkbox"
                      id="required"
                      checked={formData.required}
                      onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="required" className="text-sm text-gray-700">
                      مطلوب
                    </label>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg" dir="rtl">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    className="flex-1"
                  >
                    إلغاء
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleSaveQuestion}
                    className="flex-1"
                  >
                    {editingId ? 'تحديث السؤال' : 'حفظ السؤال'}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {questions.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">الأسئلة المضافة</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {index + 1}
                          </span>
                          <span className="text-sm text-gray-600">
                            {question.question_type === 'multiple_choice' ? 'اختيار من متعدد' : 'مقال'}
                          </span>
                          <span className="text-sm text-gray-600">
                            {question.points} نقطة
                          </span>
                          {question.required && (
                            <span className="text-sm text-red-600">مطلوب</span>
                          )}
                        </div>
                        <p className="font-medium">{question.prompt}</p>
                        {question.question_type === 'multiple_choice' && question.options && (
                          <ul className="mt-2 text-sm text-gray-600 space-y-1">
                            {question.options.map((option) => (
                              <li key={option.id} className="flex items-center gap-2">
                                {option.is_correct && <span className="text-green-600">✓</span>}
                                {option.option_text}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleEditQuestion(question.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          تعديل
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteQuestion(question.id)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex gap-3 mt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/create')}
            className="flex-1"
          >
            السابق
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleNext}
            className="flex-1"
            disabled={questions.length === 0}
          >
            التالي
          </Button>
        </div>
      </div>
    </div>
  )
}
