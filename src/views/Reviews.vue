<script setup>
import { ref, computed } from 'vue';
import { useAuth } from '../store/auth';
import { loadReviews, addReview } from '../utils/reviews';

const { state } = useAuth();

const reviews = ref(loadReviews());
const rating  = ref(5);
const comment = ref('');
const err     = ref('');
const ok      = ref(false);

const count = computed(() => reviews.value.length);
const avg = computed(() => {
  if (!count.value) return '—';
  const s = reviews.value.reduce((a,b)=> a + Number(b.rating||0), 0);
  return (s / count.value).toFixed(2);
});

function submit(){
  err.value = ''; ok.value = false;
  if (!rating.value || rating.value < 1 || rating.value > 5) { err.value='Rating must be 1–5'; return; }
  reviews.value = addReview({
    rating: rating.value,
    comment: comment.value,
    user: state.user?.email || 'anonymous'
  });
  comment.value = '';
  ok.value = true;
}
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">Reviews</h2>

    <div class="card" style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
      <div><strong>Average:</strong> {{ avg }} <span class="helper">({{ count }} reviews)</span></div>
    </div>

    <div class="card" style="margin-top:1rem;max-width:680px">
      <h3 style="margin-top:0">Leave a rating</h3>
      <label class="helper">Rating</label>
      <select class="input" v-model.number="rating" aria-label="rating 1-5">
        <option v-for="n in [5,4,3,2,1]" :key="n" :value="n">{{ n }} stars</option>
      </select>

      <label class="helper" style="margin-top:.5rem">Feedback (optional)</label>
      <textarea class="input" v-model.trim="comment" maxlength="300" placeholder="Your feedback… (≤300 chars)" />

      <div class="error" v-if="err" style="margin-top:.5rem">{{ err }}</div>
      <div class="card peach" v-if="ok" style="margin-top:.5rem"><strong>Thanks!</strong> Your rating was submitted.</div>

      <button class="btn" style="margin-top:.75rem" @click="submit">Submit</button>
    </div>

    <p class="helper" style="margin-top:1rem">You can view your own submissions on <strong>My Reviews</strong>.</p>
  </section>
</template>