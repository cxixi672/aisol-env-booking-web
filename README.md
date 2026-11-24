# 预约台 Web 前端

本仓库承载共享联调环境预约台的 Web 页面。跨仓库验收在同级 `qa` 仓库维护。

## 开发入口

运行 `npm ci` 后用 `DEV_API_TARGET=http://127.0.0.1:8080 npm run dev` 启动，按 API 实际端口调整代理地址。应用入口为 `/aisol-env-booking-web/`，子路由为 `bookings`、`maintenance`、`waitlist`。`npm run build` 生成 `AISOL_EnvBookingWeb.zip`。

## API 响应与重试

- 管理 API 的成功和业务失败均返回 HTTP 200。请求层仅在字符串 `code` 等于 `"000000"` 时返回业务包，页面读取 `res.data`。其他字符串业务码保留在错误的 `code` 字段，页面通过 `error.message` 展示服务端的 `desc`。
- 预约、维护和候补创建各自按身份、环境及规范化后的 UTC 起止时间保留待确认的幂等键。同一页面内，超时、断网、异常 HTTP 响应、无效业务包以及结果不明的服务端错误均可使用原键重试。更换身份、环境或时段会使用对应请求自己的键。
- 成功或收到明确拒绝（如 `BOOKING_CONFLICT`、`SLOT_AVAILABLE`、`ALREADY_WAITING` 或 `KEY_REUSED`）后释放该键，下次有效提交生成新键。拒绝时保留表单输入供修改或重试。
