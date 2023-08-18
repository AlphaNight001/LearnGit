import { createApp } from 'vue'

import App from './App.vue'
import router from "./Routers/MainRouter.js"
import { Button, message } from 'ant-design-vue';
const app = createApp(App);
app.use(router)
app.use(Button,message)
app.mount('#app')


