const GRADIENTS: [string, string][] = [
  ['#8E2DE2', '#4A00E0'],
  ['#E50914', '#7A0C13'],
  ['#F2994A', '#F2C94C'],
  ['#134E5E', '#71B280'],
  ['#0F2027', '#2C5364'],
  ['#8360C3', '#2EBF91'],
  ['#C31432', '#240B36'],
  ['#1D976C', '#93F9B9'],
  ['#3A1C71', '#D76D77'],
  ['#141E30', '#243B55'],
];

export function gradientFor(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export function gradientCss(seed: string): string {
  const [from, to] = gradientFor(seed);
  return `linear-gradient(135deg, ${from}, ${to})`;
}
