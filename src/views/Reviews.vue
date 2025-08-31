<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '../store/auth';
import { loadReviews, addReview, clearReviews } from '../utils/reviews';

const { state } = useAuth();
const reviews = ref(loadReviews());
const rating = ref(5);
const comment = ref('');
const err = ref('');

const count = computed(()=> reviews.value.length);
const avg = computed(()=>{
  if (!reviews.value.length) return '—';
  const s = reviews.value.reduce((a,b)=> a + Number(b.rating || 0), 0);
  return (s / reviews.value.length).toFixed(2);
});
const dist = computed(()=>{
  const d = {1:0,2:0,3:0,4:0,5:0};
  reviews.value.forEach(r=>{ d[r.rating] = (d[r.rating]||0)+1; });
  return d;
});

function submit(){
  err.value = '';
  if (!rating.value || rating.value<1 || rating.value>5) { err.value='Rating 1–5'; return; }
  const rec = {
    rating: Number(rating.value),
    comment: (comment.value || '').slice(0, 300),
    user: state.user?.email || 'anonymous',
    ts: Date.now()
  };
  reviews.value = addReview(rec);
  comment.value = '';
}

function fmt(ts){ try { return new Date(ts).toLocaleString(); } catch { return ts; } }
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">Reviews</h2>

    <div class="card" style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
      <div><strong>Average:</strong> {{ avg }} <span class="helper">({{ count }} reviews)</span></div>
      <div class="helper" style="display:flex;gap:.75rem;flex-wrap:wrap">
        <span v-for="n in 5" :key="n">{{ n }}★ {{ dist[n] || 0 }}</span>
      </div>
    </div>

    <div class="card" style="margin-top:1rem;max-width:680px">
      <h3 style="margin-top:0">Leave a rating</h3>
      <label class="helper">Rating</label>
      <select class="input" v-model.number="rating">
        <option v-for="n in [5,4,3,2,1]" :key="n" :value="n">{{ n }} ★</option>
      </select>
      <label class="helper" style="margin-top:.5rem">Comment (optional)</label>
      <textarea class="input" v-model.trim="comment" maxlength="300" placeholder="Your feedback..." />
      <div class="error" v-if="err" style="margin-top:.5rem">{{ err }}</div>
      <button class="btn" style="margin-top:.75rem" @click="submit">Submit</button>
    </div>

    <div class="grid" style="margin-top:1rem">
      <div v-for="r in reviews" :key="r.id" style="grid-column:span 12">
        <article class="card">
          <strong>{{ r.rating }} ★</strong>
          <span class="helper"> • by {{ r.user }} • {{ fmt(r.ts) }}</span>
          <p v-if="r.comment" style="margin:.5rem 0 0">{{ r.comment }}</p>
        </article>
      </div>
    </div>
  </section>
</template>