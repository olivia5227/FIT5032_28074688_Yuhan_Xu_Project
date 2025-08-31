const KEY = 'reviews_v1';

export function loadReviews(){
  try { return JSON.parse(localStorage.getItem(KEY)) || []; }
  catch { return []; }
}
export function saveReviews(list){
  localStorage.setItem(KEY, JSON.stringify(list));
}
export function addReview(review){
  const list = loadReviews();
  list.unshift({ id: `${Date.now()}_${Math.random()}`, ...review });
  saveReviews(list);
  return list;
}
export function clearReviews(){
  localStorage.removeItem(KEY);
}