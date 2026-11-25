# 预约台 Web 前端

使用 Node.js 20.19+、npm 10+ 和 Python 3（交付打包）。本仓库承载共享联调环境预约台。跨仓库验收由同级 `qa` 仓维护。

## 开发与构建

```sh
npm ci
VUE_APP_BASE_API_TARGET=http://127.0.0.1:8080 npm start
npm run lint
npm run build
```

默认入口是 `http://127.0.0.1:5173/aisol-env-booking-web/`。页面地址以 `#/bookings`、`#/maintenance`、`#/waitlist` 结尾。开发服务器和配置了 history fallback 的旧部署还可接收项目原有的非 hash 页面链接。

`.env` 定义站点名、会话缓存前缀、开发入口、API 前缀和代理目标，`.env.local` 可覆盖默认值。已有 `VITE_API_PREFIX` 和 `DEV_API_TARGET` 优先于新配置项。生产包 `AISOL_EnvBookingWeb.zip` 的根目录与 `dist/` 一致。将其解压到网关静态目录，从目录入口（带尾部斜杠）打开。静态资源使用相对路径，默认 `/api` 从站点根由网关转发。

## API 响应与重试

- 三页调用各模块的 POST `list`、`create`。列表与创建发送 `{env,start,end}`，时间为 UTC 秒，区间为左闭右开。预约和维护的 POST `cancel` 发送 JSON 整数，保留响应中的字符串 ID 的全部十进制位。
- API 成功和业务失败都返回 HTTP 200。请求层只在字符串 `code` 为 `"000000"` 时返回业务包。失败时使用后端 `desc` 作为消息，保留错误 `code`。请求超时为 30 秒。列表切换与离开页面时中止请求，过期创建和取消的结果不会更新当前视图。
- 创建按模块、身份、环境和规范化后的 UTC 时段保留幂等键。断网、超时、无效业务包或结果不明时，当前浏览器页面中同一请求重试沿用原键。成功或明确拒绝后释放键，拒绝时保留表单输入。
- 页面选择身份后使用现有 `X-User` 契约。预约只有所属用户可见取消入口，维护只有 `admin` 可见创建和撤销入口。API 守卫校验实际权限。

## 平台规范适配

| 平台 Vue 2 基线 | 本仓 Vue 3 实现 |
| --- | --- |
| vue-cli 4 / webpack 4，`require.context` | Vite 6 / Vue 插件，路由使用 `import.meta.glob` 按模块收集并懒加载 |
| Vue 2 实例、Vue Router 3 | Vue 3 Options API、`createApp`、Router 4 hash 路由 |
| Vuex 3 的命名空间模块 | Pinia 3 Options store，跨页只共享环境、身份和主题 |
| Ant Design Vue 1，`a-form-model`、`.sync`、`scopedSlots` | Ant Design Vue 4 按需注册，用 `a-form`、命名 `v-model`、`bodyCell` 插槽 |
| 主题 Less `modifyVars`、`/deep/` | Ant Design 4 ConfigProvider token 与明暗算法，沿用已有 scoped Sass |
| vue-cli `process.env`、`publicPath` | Vite 读取 `.env`，按需注入客户端变量，构建 `base: './'` |
| 动态菜单、单点登录、keepAlive、服务端分页 | 保留三页静态菜单、经 API 校验的身份和按钮权限、会话查询范围。列表显示 API 返回的完整区间结果 |
| webpack ZIP 插件 | Vite 构建加 Python 打包，ZIP 根目录为 dist 内容，超过 10 KiB 的 JS/CSS 带 gzip 副本 |
