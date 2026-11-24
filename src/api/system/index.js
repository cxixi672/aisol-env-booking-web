import { useAxios } from '@/api/fetch'

export const getSystemStatus = () => useAxios({ url: '/system/status', method: 'get' })
