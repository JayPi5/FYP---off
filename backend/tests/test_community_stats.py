import tempfile
import unittest
from pathlib import Path

import backend.app.core.db as db_module
from backend.app.core.community_stats import fetch_community_stats
from backend.app.core.config import Settings
from backend.app.core.db import get_conn, init_db


class CommunityStatsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._tmp = tempfile.TemporaryDirectory()
        db_module.DB_PATH = Path(cls._tmp.name) / "test_smokwit.db"

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()

    def setUp(self):
        init_db()
        conn = get_conn()
        conn.execute("DELETE FROM help_events;")
        conn.execute("DELETE FROM qr_scans;")
        conn.commit()
        conn.close()

    def test_counts_session_offers_and_abandon_events(self):
        conn = get_conn()
        cur = conn.cursor()
        cur.executemany(
            "INSERT INTO help_events (event_kind, points) VALUES (?, ?);",
            [
                ("session_complete", 0),
                ("session_complete", 0),
                ("offers", 0),
                ("abandon", 0),
                ("progress", 2),
            ],
        )
        conn.commit()
        conn.close()

        conn = get_conn()
        stats = fetch_community_stats(conn.cursor(), Settings())
        conn.close()

        self.assertEqual(stats["completed5A_24h"], 2)
        self.assertEqual(stats["offers_24h"], 1)
        self.assertEqual(stats["abandons_24h"], 1)
        self.assertEqual(stats["help_points_8h"], 2)

    def test_scan_percent_caps_at_100(self):
        conn = get_conn()
        cur = conn.cursor()
        cur.executemany(
            "INSERT INTO qr_scans (totem_id, user_agent, ip_hash) VALUES (?, ?, ?);",
            [("T1", "", "")] * 25,
        )
        conn.commit()
        conn.close()

        conn = get_conn()
        stats = fetch_community_stats(conn.cursor(), Settings(scan_percent_per_scan=5))
        conn.close()

        self.assertEqual(stats["scans_8h"], 25)
        self.assertEqual(stats["scan_percent_8h"], 100)


if __name__ == "__main__":
    unittest.main()
