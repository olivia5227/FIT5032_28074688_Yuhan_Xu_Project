import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './styles/theme.css'
import './firebase/init';

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.use(router)
app.mount('#app')

//createApp(App).mount('#app')

//createApp(App).use(router).mount('#app')