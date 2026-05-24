from __future__ import annotations

import argparse
import shutil
from datetime import datetime
from pathlib import Path

from backend.app.core.db import DB_PATH


def create_backup(destination_dir: Path) -> Path:
    destination_dir.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    backup_path = destination_dir / f"smokwit_totem-{stamp}.db"
    shutil.copy2(DB_PATH, backup_path)
    return backup_path


def main() -> None:
    parser = argparse.ArgumentParser(description="Create timestamped SQLite backup")
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=Path("backend/data/backups"),
        help="Directory where backup files are written",
    )
    args = parser.parse_args()

    if not DB_PATH.exists():
        raise SystemExit(f"Database not found at: {DB_PATH}")

    backup_path = create_backup(args.out_dir)
    print(str(backup_path))


if __name__ == "__main__":
    main()

