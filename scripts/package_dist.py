import os
from pathlib import Path
import tempfile
from zipfile import ZIP_DEFLATED, ZipFile

root = Path(__file__).resolve().parents[1]
dist = root / "dist"
if not (dist / "index.html").is_file():
    raise SystemExit("缺少 dist/index.html，请先执行 build:only")
with tempfile.NamedTemporaryFile(dir=root, suffix=".zip", delete=False) as tmp:
    archive = Path(tmp.name)
try:
    with ZipFile(archive, "w", compression=ZIP_DEFLATED) as out:
        for file in sorted(dist.rglob("*")):
            if file.is_file():
                out.write(file, file.relative_to(dist).as_posix())
    archive.chmod(0o644)
    os.replace(archive, root / "AISOL_EnvBookingWeb.zip")
finally:
    if archive.exists():
        archive.unlink()
print("AISOL_EnvBookingWeb.zip")
