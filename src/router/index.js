import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Discover from '../views/Discover.vue';
import Reflect from '../views/Reflect.vue';
import Connect from '../views/Connect.vue';
import Refer from '../views/Refer.vue';
import Results from '../views/Results.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Admin from '../views/Admin.vue';
import Reviews from '../views/Reviews.vue'; // 会在下一节创建

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/discover', name: 'Discover', component: Discover },
  { path: '/reflect', name: 'Reflect', component: Reflect },
  { path: '/connect', name: 'Connect', component: Connect },
  { path: '/refer', name: 'Refer', component: Refer },
  { path: '/results', name: 'Results', component: Results, meta: { requiresAuth: true, roles: ['user','admin'] } },
  { path: '/reviews', name: 'Reviews', component: Reviews, meta: { requiresAuth: true, roles: ['user','admin'] } },
  { path: '/admin', name: 'Admin', component: Admin, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/login', component: Login, meta: { public: true } },
  { path: '/register', component: Register, meta: { public: true } },
  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({ history: createWebHistory(), routes, scrollBehavior:()=>({top:0}) });

import { useAuth } from '../store/auth';
router.beforeEach((to) => {
  const { isAuthed, role } = useAuth();
  if (to.meta?.public) return true;
  if (to.meta?.requiresAuth && !isAuthed.value) {
    return { path: '/login', query: { redirect: to.fullPath } };
  }
  if (to.meta?.roles && !to.meta.roles.includes(role.value)) {
    return { path: '/' };
  }
  return true;
});

export default router;