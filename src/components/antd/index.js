import {
  Alert, Button, Card, ConfigProvider, Form, Input, Layout, Modal,
  Popconfirm, Space, Table, Tag
} from 'ant-design-vue'

const components = [
  Alert, Button, Card, ConfigProvider, Form, Input, Layout, Modal,
  Popconfirm, Space, Table, Tag
]

export default {
  install(app) {
    components.forEach(component => app.use(component))
  },
}
