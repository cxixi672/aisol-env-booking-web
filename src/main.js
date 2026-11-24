import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import './ui/theme.scss'
import './ui/global.scss'
import App from './App.vue'
import router from './router'
import { bootstrap } from './bootstrap'

const app = createApp(App)
app.use(createPinia()).use(router).use(Antd)
bootstrap(app, router)
