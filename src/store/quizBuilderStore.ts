import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface Question {
  id: string
  question_type: 'essay' | 'multiple_choice'
  prompt: string
  position: number
  required: boolean
  points: number
  options?: Array<{
    id: string
    option_text: string
    position: number
    is_correct?: boolean
  }>
}

interface QuizBuilderState {
  title: string
  description: string
  questions: Question[]
  theme: any
  setTitle: (title: string) => void
  setDescription: (description: string) => void
  setQuestions: (questions: Question[]) => void
  addQuestion: (question: Question) => void
  updateQuestion: (id: string, updates: Partial<Question>) => void
  deleteQuestion: (id: string) => void
  reorderQuestions: (questions: Question[]) => void
  setTheme: (theme: any) => void
  reset: () => void
}

export const useQuizBuilderStore = create<QuizBuilderState>()(
  persist(
    (set) => ({
      title: '',
      description: '',
      questions: [],
      theme: null,
      setTitle: (title) => set({ title }),
      setDescription: (description) => set({ description }),
      setQuestions: (questions) => set({ questions }),
      addQuestion: (question) => set((state) => ({ 
        questions: [...state.questions, question] 
      })),
      updateQuestion: (id, updates) => set((state) => ({
        questions: state.questions.map(q => 
          q.id === id ? { ...q, ...updates } : q
        )
      })),
      deleteQuestion: (id) => set((state) => ({
        questions: state.questions.filter(q => q.id !== id)
      })),
      reorderQuestions: (questions) => set({ questions }),
      setTheme: (theme) => set({ theme }),
      reset: () => set({
        title: '',
        description: '',
        questions: [],
        theme: null
      })
    }),
    {
      name: 'quiz-builder-storage',
    }
  )
)
