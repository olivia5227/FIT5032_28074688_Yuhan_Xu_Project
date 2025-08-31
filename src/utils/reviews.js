const KEY = 'reviews_v1';

export function loadReviews() {
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
export function saveReviews(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}
export function addReview(review) {
  const list = loadReviews();
  const r = {
    id: `${Date.now()}_${Math.random()}`,
    rating: clamp(Number(review.rating), 1, 5),
    comment: String(review.comment || '').slice(0, 300),
    user: review.user || 'anonymous',
    ts: review.ts || Date.now()
  };
  list.unshift(r);
  saveReviews(list);
  return list;
}
export function updateReview(id, patch) {
  const list = loadReviews();
  const i = list.findIndex(x => x.id === id);
  if (i === -1) return list;
  if (patch.rating != null) list[i].rating = clamp(Number(patch.rating), 1, 5);
  if (patch.comment != null) list[i].comment = String(patch.comment).slice(0, 300);
  list[i].tsUpdated = Date.now();
  saveReviews(list);
  return list;
}
export function deleteReview(id) {
  let list = loadReviews().filter(x => x.id !== id);
  saveReviews(list);
  return list;
}
export function clearReviews() {
  localStorage.removeItem(KEY);
}
export function reviewsByUser(email) {
  const list = loadReviews();
  return list.filter(r => r.user === email);
}

function clamp(n, a, b){ return Math.max(a, Math.min(b, n)); }