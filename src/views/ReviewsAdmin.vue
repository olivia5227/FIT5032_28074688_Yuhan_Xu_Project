<script setup>
import { ref, computed } from 'vue';
import { loadReviews, updateReview, deleteReview } from '../utils/reviews';

const list = ref(loadReviews());
const editingId = ref(null);
const editRating = ref(5);
const editComment = ref('');

function startEdit(r){
  editingId.value = r.id;
  editRating.value = r.rating;
  editComment.value = r.comment || '';
}
function cancelEdit(){ editingId.value = null; }
function saveEdit(){
  list.value = updateReview(editingId.value, {
    rating: Number(editRating.value),
    comment: editComment.value
  });
  editingId.value = null;
}
function remove(id){
  if (!confirm('Delete this review?')) return;
  list.value = deleteReview(id);
}
const count = computed(()=> list.value.length);
const avg = computed(()=>{
  if (!count.value) return '—';
  const s = list.value.reduce((a,b)=> a + Number(b.rating||0), 0);
  return (s / count.value).toFixed(2);
});
function fmt(ts){ try{ return new Date(ts).toLocaleString(); } catch { return ts; } }
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">Ratings (Admin)</h2>

    <div class="card" style="display:flex;gap:1rem;align-items:center;flex-wrap:wrap">
      <div><strong>Average:</strong> {{ avg }} <span class="helper">({{ count }} reviews)</span></div>
    </div>

    <div class="grid" style="margin-top:1rem">
      <div v-for="r in list" :key="r.id" style="grid-column:span 12">
        <article class="card">
          <template v-if="editingId === r.id">
            <div style="display:flex;gap:.6rem;flex-wrap:wrap;align-items:center">
              <select class="input" style="max-width:120px" v-model.number="editRating">
                <option v-for="n in [5,4,3,2,1]" :key="n" :value="n">{{ n }} stars</option>
              </select>
              <textarea class="input" v-model.trim="editComment" maxlength="300" style="flex:1" />
            </div>
            <div style="display:flex;gap:.5rem;margin-top:.6rem">
              <button class="btn" @click="saveEdit">Save</button>
              <button class="btn ghost" @click="cancelEdit">Cancel</button>
            </div>
          </template>

          <template v-else>
            <strong>{{ r.rating }} stars</strong>
            <span class="helper"> • {{ r.user }} • {{ fmt(r.ts) }}</span>
            <p v-if="r.comment" style="margin:.5rem 0 0">{{ r.comment }}</p>
            <div style="display:flex;gap:.5rem;margin-top:.6rem">
              <button class="btn" @click="startEdit(r)">Edit</button>
              <button class="btn ghost" @click="remove(r.id)">Delete</button>
            </div>
          </template>
        </article>
      </div>
    </div>
  </section>
</template>