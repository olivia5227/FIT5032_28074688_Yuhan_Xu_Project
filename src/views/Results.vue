<script setup>
import { ref, computed } from 'vue';
import { loadHistory, clearHistory, removeEntry } from '../utils/history';

const history = ref(loadHistory()); // newest first
const pageSize = 10;
const page = ref(1);

const totalPages = computed(() => Math.max(1, Math.ceil(history.value.length / pageSize)));
const pageItems = computed(() => {
  const start = (page.value - 1) * pageSize;
  return history.value.slice(start, start + pageSize);
});

function setPage(p) { page.value = Math.min(totalPages.value, Math.max(1, p)); }

function delOne(id) {
  const next = removeEntry(id);
  history.value = next;
  if (page.value > totalPages.value) setPage(totalPages.value);
}

function delAll() {
  clearHistory();
  history.value = [];
  setPage(1);
}

function fmt(ts) { try { return new Date(ts).toLocaleString(); } catch { return ts; } }
function moodText(m) {
  const map = { 1:'Very low', 2:'Low', 3:'OK', 4:'Good', 5:'Great' };
  return map[Number(m)] ?? m;
}
</script>

<template>
  <section class="container">
    <h2 style="margin:1rem 0">Result View</h2>

    <div style="display:flex;justify-content:space-between;align-items:center;gap:.8rem;margin-bottom:.8rem">
      <div class="helper">Total: <strong>{{ history.length }}</strong></div>
      <button class="btn ghost" :disabled="!history.length" @click="delAll">Delete all</button>
    </div>

    <div v-if="!history.length" class="card">
      <p class="helper">No results yet. Submit a self-check on the Reflect page.</p>
    </div>

    <div v-else class="grid">
      <div v-for="item in pageItems" :key="item.id" style="grid-column:span 12">
        <article class="card">
          <div style="display:flex;justify-content:space-between;gap:.8rem;flex-wrap:wrap">
            <div><strong>{{ item.name }}</strong> • age {{ item.age }} • mood {{ item.mood }}
              <span class="helper">({{ moodText(item.mood) }})</span>
              <span class="helper" v-if="item.email"> • {{ item.email }}</span>
            </div>
            <div class="helper">Saved at {{ fmt(item.ts) }}</div>
          </div>

          <div class="helper" style="margin:.4rem 0 0">
            Sleep: <strong>{{ item.sleepHours }}</strong>
            <span v-if="item.notes"> • Notes: {{ item.notes }}</span>
          </div>

          <div class="card peach" style="margin-top:.6rem">
            <strong>Suggestions</strong>
            <ul>
              <li v-for="(t,i) in item.suggestions" :key="i">{{ t }}</li>
            </ul>
          </div>

          <div style="margin-top:.6rem;display:flex;justify-content:flex-end">
            <button class="btn ghost" @click="delOne(item.id)">Delete</button>
          </div>
        </article>
      </div>
    </div>

    <div v-if="history.length" style="display:flex;gap:.4rem;justify-content:center;margin-top:1rem;flex-wrap:wrap">
      <button class="btn ghost" :disabled="page===1" @click="setPage(page-1)">Prev</button>
      <button v-for="p in totalPages" :key="p" class="btn" :class="{ ghost: p !== page }" @click="setPage(p)">
        {{ p }}
      </button>
      <button class="btn ghost" :disabled="page===totalPages" @click="setPage(page+1)">Next</button>
    </div>
  </section>
</template>