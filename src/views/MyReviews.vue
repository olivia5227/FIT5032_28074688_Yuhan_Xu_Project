<script setup>
import { ref } from 'vue';
import { useAuth } from '../store/auth';
import { reviewsByUserFiltered, hideReviewForUser } from '../utils/reviews';

const { state } = useAuth();
const email = state.user?.email || '';
const list = ref(email ? reviewsByUserFiltered(email) : []);

function fmt(ts){ try{ return new Date(ts).toLocaleString(); } catch { return ts; } }

function loadReviews() {
  if (email) {
    list.value = reviewsByUserFiltered(email);
  }
}

function deleteReview(reviewId) {
  if (confirm('Are you sure you want to delete this review? This will only hide it from your view.')) {
    if (email) {
      hideReviewForUser(reviewId, email);
      loadReviews(); // Refresh the list after hiding
    }
  }
}
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">My Reviews</h2>
    <div v-if="!email" class="card">Please login to view your reviews.</div>
    <div v-else-if="!list.length" class="card">You have not submitted any reviews yet.</div>
    <div v-else class="grid">
      <div v-for="r in list" :key="r.id" style="grid-column:span 12">
        <article class="card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start;">
            <div style="flex: 1;">
              <strong>{{ r.rating }} stars</strong>
              <span class="helper"> • {{ r.user }} • {{ fmt(r.ts) }}</span>
              <p v-if="r.comment" style="margin:.5rem 0 0">{{ r.comment }}</p>
            </div>
            <button
              class="delete-btn"
              @click="deleteReview(r.id)"
              title="Delete this review"
              style="margin-left: 1rem; flex-shrink: 0;"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                <path d="M5.5 1a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v1H14a.5.5 0 0 1 0 1v11.5a1.5 1.5 0 0 1-1.5 1.5h-9A1.5 1.5 0 0 1 2 13.5V3a.5.5 0 0 1 0-1h2.5V1zM3 3v10.5a.5.5 0 0 0 .5.5h9a.5.5 0 0 0 .5-.5V3H3z"/>
                <path d="M6.5 5.5a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0v-6zm3 0a.5.5 0 0 1 1 0v6a.5.5 0 0 1-1 0v-6z"/>
              </svg>
            </button>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<style scoped>
.delete-btn {
  background: transparent;
  border: 2px solid #ef4444;
  color: #ef4444;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-btn:hover {
  background: #ef4444;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.3);
}

.delete-btn:active {
  transform: scale(0.98);
}
</style>