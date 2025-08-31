import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Discover from '../views/Discover.vue';
import Reflect from '../views/Reflect.vue';
import Connect from '../views/Connect.vue';
import Refer from '../views/Refer.vue';
import Results from '../views/Results.vue';   // ← make sure this line exists

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/discover', name: 'Discover', component: Discover },
  { path: '/reflect', name: 'Reflect', component: Reflect },
  { path: '/connect', name: 'Connect', component: Connect },
  { path: '/refer', name: 'Refer', component: Refer },
  { path: '/results', name: 'Results', component: Results },  // ← and this entry
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});