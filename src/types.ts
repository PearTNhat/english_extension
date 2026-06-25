export interface Vocabulary {
  id: string;
  word: string;
  meaning: string;
  pos: string;
  example: string;
  createdAt: number;
  correctCount?: number;
  wrongCount?: number;
}
