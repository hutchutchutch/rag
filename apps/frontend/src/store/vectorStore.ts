import { create } from "zustand"

type VectorStore = {
  id: string
  name: string
}

type VectorStoreState = {
  selected: VectorStore | null
  setSelected: (store: VectorStore) => void
}

export const useVectorStore = create<VectorStoreState>((set) => ({
  selected: null,
  setSelected: (store) => set({ selected: store }),
}))