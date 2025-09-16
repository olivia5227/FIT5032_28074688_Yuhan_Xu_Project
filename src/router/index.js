import { createRouter, createWebHistory } from 'vue-router';

import Home     from '../views/Home.vue';
import Reflect  from '../views/Reflect.vue';
import Connect  from '../views/Connect.vue';
import Results  from '../views/Results.vue';        // Result View (history)

import Login    from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';
import Admin    from '../views/Admin.vue';
import MyAccount from '../views/MyAccount.vue';

import Reviews       from '../views/Reviews.vue';        // user rating form
import MyReviews     from '../views/MyReviews.vue';      // user-only list
import ReviewsAdmin  from '../views/ReviewsAdmin.vue';   // admin manage ratings

const routes = [
  { path: '/',           name: 'Home',     component: Home },
  { path: '/reflect',    name: 'Reflect',  component: Reflect },
  { path: '/connect',    name: 'Connect',  component: Connect },


  // ===== Role protected =====
  { path: '/results',        name: 'Results',       component: Results,      meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/reviews',        name: 'Reviews',       component: Reviews,      meta: { requiresAuth: true, roles: ['user'] } },
  { path: '/my-reviews',     name: 'MyReviews',     component: MyReviews,    meta: { requiresAuth: true, roles: ['user'] } },
  { path: '/my-account',     name: 'MyAccount',     component: MyAccount,    meta: { requiresAuth: true, roles: ['user'] } },
  { path: '/reviews-admin',  name: 'ReviewsAdmin',  component: ReviewsAdmin, meta: { requiresAuth: true, roles: ['admin'] } },
  { path: '/admin',          name: 'Admin',         component: Admin,        meta: { requiresAuth: true, roles: ['admin'] } },

  // ===== Auth pages =====
  { path: '/FireLogin',    name: 'FireLogin',    component: Login,    meta: { public: true } },
  { path: '/FireRegister', name: 'FireRegister', component: Register, meta: { public: true } },

  { path: '/:pathMatch(.*)*', redirect: '/' },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
});

// guard
import { useAuth } from '../store/auth';
router.beforeEach((to) => {
  const { isAuthed, role } = useAuth();
  if (to.meta?.public) return true;
  if (to.meta?.requiresAuth && !isAuthed.value) {
    return { path: '/FireLogin', query: { redirect: to.fullPath } };
  }
  if (to.meta?.roles && !to.meta.roles.includes(role.value)) {
    return { path: '/' };
  }
  return true;
});

export default router;