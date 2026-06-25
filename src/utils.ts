export const getPosColor = (pos: string) => {
  if (!pos) return 'bg-indigo-50 text-indigo-600 border-indigo-100';
  const p = pos.toLowerCase();
  
  if (p.includes('danh từ') || p.includes('noun')) return 'bg-emerald-50 text-emerald-600 border-emerald-100';
  if (p.includes('động từ') || p.includes('verb')) return 'bg-rose-50 text-rose-600 border-rose-100';
  if (p.includes('tính từ') || p.includes('adjective')) return 'bg-amber-50 text-amber-600 border-amber-100';
  if (p.includes('trạng từ') || p.includes('adverb')) return 'bg-purple-50 text-purple-600 border-purple-100';
  if (p.includes('giới từ') || p.includes('preposition')) return 'bg-cyan-50 text-cyan-600 border-cyan-100';
  if (p.includes('đại từ') || p.includes('pronoun')) return 'bg-pink-50 text-pink-600 border-pink-100';
  if (p.includes('liên từ') || p.includes('conjunction')) return 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100';
  
  // Default
  return 'bg-indigo-50 text-indigo-600 border-indigo-100';
};
