import { create } from 'zustand'

interface Option {
  id: string
  option_text: string
  position: number
}

interface Question {
  id: string
  question_type: 'essay' | 'multiple_choice'
  prompt: string
  position: number
  required: boolean
  points: number
  options?: Option[]
}

interface ActiveQuizState {
  test: any
  questions: Question[]
  setTest: (test: any) => void
  setQuestions: (questions: Question[]) => void
  reset: () => void
}

export const useActiveQuizStore = create<ActiveQuizState>((set) => ({
  test: null,
  questions: [],
  setTest: (test) => set({ test }),
  setQuestions: (questions) => set({ questions }),
  reset: () => set({
    test: null,
    questions: []
  })
}))
