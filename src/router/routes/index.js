const modules = import.meta.glob(['./*.js', '!./index.js'], { eager: true, import: 'default' })

export const pages = Object.values(modules).sort((a, b) => a.meta.order - b.meta.order)
