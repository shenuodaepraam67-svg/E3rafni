import { create } from 'zustand'

interface Answer {
  question_id: string
  selected_option_id?: string
  answer_text?: string
}

interface AttemptState {
  attemptId: string | null
  participantToken: string | null
  answers: Record<string, Answer>
  setAttemptId: (attemptId: string) => void
  setParticipantToken: (token: string) => void
  setAnswer: (questionId: string, answer: Answer) => void
  reset: () => void
}

export const useAttemptStore = create<AttemptState>((set) => ({
  attemptId: null,
  participantToken: null,
  answers: {},
  setAttemptId: (attemptId) => set({ attemptId }),
  setParticipantToken: (token) => set({ participantToken: token }),
  setAnswer: (questionId, answer) => set((state) => ({
    answers: { ...state.answers, [questionId]: answer }
  })),
  reset: () => set({
    attemptId: null,
    participantToken: null,
    answers: {}
  })
}))
