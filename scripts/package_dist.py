import gzip
import os
import sys
from pathlib import Path
import tempfile
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
if not (dist / "index.html").is_file():
    raise SystemExit("缺少 dist/index.html，请先执行 build:only")
for file in dist.rglob("*"):
    if file.suffix in (".js", ".css") and file.stat().st_size > 10 * 1024:
        file.with_suffix(file.suffix + ".gz").write_bytes(gzip.compress(file.read_bytes(), mtime=0))

zip_name = f"{sys.argv[1]}.zip"
with tempfile.NamedTemporaryFile(dir=root, suffix=".zip", delete=False) as tmp:
    archive = Path(tmp.name)
try:
    with ZipFile(archive, "w", compression=ZIP_DEFLATED) as out:
        for file in sorted(dist.rglob("*")):
            if file.is_file():
                out.write(file, file.relative_to(dist).as_posix())
    archive.chmod(0o644)
    os.replace(archive, root / zip_name)
finally:
    if archive.exists():
        archive.unlink()
print(zip_name)
