import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// Python is also the skill's generator dependency. ZIP layout is identical on Windows and Unix.
const root = fileURLToPath(new URL('../', import.meta.url))
const candidates = process.env.PYTHON ? [[process.env.PYTHON]] :
  process.platform === 'win32' ? [['py', '-3'], ['python']] : [['python3']]
for (const [program, ...prefix] of candidates) {
  const run = spawnSync(program, [...prefix, 'scripts/package_dist.py'], { cwd: root, stdio: 'inherit' })
  if (run.error?.code === 'ENOENT') continue
  if (run.error) throw run.error
  process.exit(run.status ?? 1)
}
throw new Error('打包需要 Python 3，可用 PYTHON 指定解释器路径')
