import { create } from 'zustand'

interface ResultState {
  score: number | null
  maxScore: number | null
  percentage: number | null
  rank: number | null
  setResult: (result: { score: number; maxScore: number; percentage: number; rank: number }) => void
  reset: () => void
}

export const useResultStore = create<ResultState>((set) => ({
  score: null,
  maxScore: null,
  percentage: null,
  rank: null,
  setResult: (result) => set({
    score: result.score,
    maxScore: result.maxScore,
    percentage: result.percentage,
    rank: result.rank
  }),
  reset: () => set({
    score: null,
    maxScore: null,
    percentage: null,
    rank: null
  })
}))
