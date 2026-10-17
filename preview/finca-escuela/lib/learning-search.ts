/** Accent-insensitive matching keeps searches natural on mobile keyboards. */
function normalize(value: string) { return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es").trim(); }
export function filterLearningArticles<T extends { title: string; description: string; category: string; keywords: string[] }>(articles: T[], query: string, category = ""): T[] {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return articles.filter(article => (!category || article.category === category) && terms.every(term => normalize([article.title, article.description, article.category, ...article.keywords].join(" ")).includes(term)));
}
