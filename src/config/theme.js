import { theme } from 'ant-design-vue'

export function adminTheme(dark) {
  return {
    algorithm: dark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: { colorPrimary: '#1a5dfa', fontSize: 13, controlHeight: 28, borderRadius: 2 },
  }
}
