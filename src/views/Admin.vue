<script setup>
import { ref, computed, onMounted } from 'vue';
import { Bar, Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement
} from 'chart.js';
import { loadReviews } from '../utils/reviews';
import { loadHistory } from '../utils/history';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

const reviews = ref([]);
const history = ref([]);

// Rating distribution data
const ratingDistribution = computed(() => {
  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.value.forEach(review => {
    counts[review.rating] = (counts[review.rating] || 0) + 1;
  });

  return {
    labels: ['1 Star', '2 Stars', '3 Stars', '4 Stars', '5 Stars'],
    datasets: [{
      label: 'Number of Reviews',
      data: [counts[1], counts[2], counts[3], counts[4], counts[5]],
      backgroundColor: [
        '#ef4444', // red for 1 star
        '#f97316', // orange for 2 stars
        '#eab308', // yellow for 3 stars
        '#22c55e', // green for 4 stars
        '#16a34a'  // dark green for 5 stars
      ],
      borderColor: [
        '#dc2626',
        '#ea580c',
        '#ca8a04',
        '#16a34a',
        '#15803d'
      ],
      borderWidth: 1
    }]
  };
});

// Mood distribution data
const moodDistribution = computed(() => {
  const moodCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  history.value.forEach(entry => {
    moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
  });

  return {
    labels: ['Very Low 😞', 'Low 🙁', 'OK 🙂', 'Good 😃', 'Great 🤩'],
    datasets: [{
      label: 'Number of People',
      data: [moodCounts[1], moodCounts[2], moodCounts[3], moodCounts[4], moodCounts[5]],
      backgroundColor: [
        '#ef4444', // red for very low
        '#f97316', // orange for low
        '#eab308', // yellow for ok
        '#22c55e', // green for good
        '#16a34a'  // dark green for great
      ],
      borderColor: [
        '#dc2626',
        '#ea580c',
        '#ca8a04',
        '#16a34a',
        '#15803d'
      ],
      borderWidth: 1
    }]
  };
});

// Sleep time vs mood line chart data
const sleepMoodData = computed(() => {
  // Group data by sleep hours and calculate average mood
  const sleepGroups = {};

  history.value.forEach(entry => {
    const sleepHours = Math.round(entry.sleepHours);
    if (!sleepGroups[sleepHours]) {
      sleepGroups[sleepHours] = { totalMood: 0, count: 0 };
    }
    sleepGroups[sleepHours].totalMood += entry.mood;
    sleepGroups[sleepHours].count += 1;
  });

  // Convert to arrays for chart
  const sleepHours = Object.keys(sleepGroups).sort((a, b) => Number(a) - Number(b));
  const avgMoods = sleepHours.map(hours =>
    sleepGroups[hours].totalMood / sleepGroups[hours].count
  );

  return {
    labels: sleepHours.map(h => `${h} hrs`),
    datasets: [{
      label: 'Average Mood',
      data: avgMoods,
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4
    }]
  };
});

const chartOptions = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top'
    },
    title: {
      display: true
    }
  }
};

const ratingChartOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    title: {
      display: true,
      text: 'Rating Distribution (1-5 Stars)'
    }
  }
};

const moodChartOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    title: {
      display: true,
      text: 'Mood Distribution'
    }
  }
};

const sleepChartOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    title: {
      display: true,
      text: 'Average Mood by Sleep Hours'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 5,
      title: {
        display: true,
        text: 'Average Mood Score'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Sleep Hours'
      }
    }
  }
};

onMounted(() => {
  reviews.value = loadReviews();
  history.value = loadHistory();
});
</script>

<template>
  <section class="container" style="margin-top:1rem">
    <div class="card">
      <h2>Admin Area</h2>
      <p class="helper">Visible to admin role only.</p>
    </div>

    <!-- Charts Grid -->
    <div class="charts-grid" style="margin-top: 2rem; display: grid; gap: 2rem;">
      <!-- Rating Distribution Chart -->
      <div class="card">
        <Bar :data="ratingDistribution" :options="ratingChartOptions" />
      </div>

      <!-- Mood Distribution Chart -->
      <div class="card">
        <Bar :data="moodDistribution" :options="moodChartOptions" />
      </div>

      <!-- Sleep vs Mood Line Chart -->
      <div class="card">
        <Line :data="sleepMoodData" :options="sleepChartOptions" />
      </div>
    </div>

    <!-- Summary Statistics -->
    <div class="card" style="margin-top: 2rem;">
      <h3>Summary Statistics</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
        <div>
          <strong>Total Reviews:</strong> {{ reviews.length }}
        </div>
        <div>
          <strong>Total Self-Check Submissions:</strong> {{ history.length }}
        </div>
        <div>
          <strong>Average Rating:</strong>
          {{ reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : 'N/A' }}
        </div>
        <div>
          <strong>Average Mood:</strong>
          {{ history.length > 0 ? (history.reduce((sum, h) => sum + h.mood, 0) / history.length).toFixed(2) : 'N/A' }}
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.charts-grid {
  grid-template-columns: 1fr;
}

@media (min-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr 1fr;
  }

  .charts-grid > .card:last-child {
    grid-column: 1 / -1;
  }
}
</style>