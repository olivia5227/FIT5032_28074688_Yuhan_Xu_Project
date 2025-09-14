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
import { getAnonymizedStats } from '../utils/history';
import { useAuth } from '../store/auth';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, LineElement, PointElement);

const reviews = ref([]);
const historyStats = ref({});

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

// Mood distribution data (using anonymized stats)
const moodDistribution = computed(() => {
  const moodCounts = historyStats.value.moodDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return {
    labels: ['Very Low', 'Low', 'OK', 'Good', 'Great'],
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

// Mood line chart data (using anonymized stats)
const moodLineData = computed(() => {
  const moodCounts = historyStats.value.moodDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

  return {
    labels: ['Very Low', 'Low', 'OK', 'Good', 'Great'],
    datasets: [{
      label: 'Number of People',
      data: [moodCounts[1], moodCounts[2], moodCounts[3], moodCounts[4], moodCounts[5]],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      borderWidth: 3,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8,
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

const moodLineChartOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    title: {
      display: true,
      text: 'Mood Distribution Trend'
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      title: {
        display: true,
        text: 'Number of People'
      }
    },
    x: {
      title: {
        display: true,
        text: 'Mood Level'
      }
    }
  }
};

onMounted(() => {
  reviews.value = loadReviews();
  historyStats.value = getAnonymizedStats();
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

      <!-- Mood Line Chart -->
      <div class="card">
        <Line :data="moodLineData" :options="moodLineChartOptions" />
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
          <strong>Total Self-Check Submissions:</strong> {{ historyStats.totalSubmissions || 0 }}
        </div>
        <div>
          <strong>Average Rating:</strong>
          {{ reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(2) : 'N/A' }}
        </div>
        <div>
          <strong>Average Mood:</strong>
          {{ historyStats.averageMood ? historyStats.averageMood.toFixed(2) : 'N/A' }}
        </div>
        <div>
          <strong>Average Sleep:</strong>
          {{ historyStats.averageSleep ? historyStats.averageSleep.toFixed(1) + 'h' : 'N/A' }}
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