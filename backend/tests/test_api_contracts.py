import tempfile
import unittest
from pathlib import Path

import backend.app.core.db as db_module
import backend.app.core.qr_destinations as qr_dest_module
from fastapi.testclient import TestClient
from backend.app.main import app


class ApiContractsTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls._tmp = tempfile.TemporaryDirectory()
        db_module.DB_PATH = Path(cls._tmp.name) / "test_smokwit.db"
        cls._qr_json = Path(cls._tmp.name) / "qr_destinations.json"
        cls._qr_json.write_text(
            """
            {
              "default": "https://smokwit.ch/map",
              "agents": {
                "expert": "https://smokwit.ch/coaching",
                "smoker": "https://tribu.stop-tabac.ch/",
                "future": "https://tools.stop-tabac.ch/"
              },
              "offers": {
                "pharmacie": "https://www.pharmacieplus.ch/prestations/stop-tabac/",
                "stop": "https://www.stop-tabac.ch/",
                "cipret": "https://www.vivre-sans-fumer.ch/"
              }
            }
            """.strip(),
            encoding="utf-8",
        )
        qr_dest_module._PATH = cls._qr_json
        qr_dest_module._cached = None

    @classmethod
    def tearDownClass(cls):
        cls._tmp.cleanup()

    def setUp(self):
        self.client_ctx = TestClient(app)
        self.client = self.client_ctx.__enter__()

    def tearDown(self):
        self.client_ctx.__exit__(None, None, None)

    def test_health_endpoint_ok(self):
        r = self.client.get("/api/health")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.json(), {"ok": True})

    def test_discussion_invalid_event_shape(self):
        r = self.client.post("/api/discussion/help-event", json={"event_kind": "invalid"})
        self.assertEqual(r.status_code, 400)
        payload = r.json()
        self.assertFalse(payload["ok"])
        self.assertEqual(payload["error"]["code"], "invalid_event_kind")

    def test_discussion_invalid_points_shape(self):
        r = self.client.post("/api/discussion/help-event", json={"event_kind": "progress", "points": 9})
        self.assertEqual(r.status_code, 400)
        payload = r.json()
        self.assertFalse(payload["ok"])
        self.assertEqual(payload["error"]["code"], "invalid_points")

    def test_quiz_invalid_choice_shape(self):
        r = self.client.post("/api/quiz/answer", json={"question_id": 1, "chosen": "Z"})
        self.assertEqual(r.status_code, 400)
        payload = r.json()
        self.assertFalse(payload["ok"])
        self.assertEqual(payload["error"]["code"], "invalid_choice")

    def test_discussion_abandon_event_ok(self):
        r = self.client.post("/api/discussion/help-event", json={"event_kind": "abandon"})
        self.assertEqual(r.status_code, 200)
        self.assertTrue(r.json()["ok"])

    def test_community_stats_reflect_help_events(self):
        self.client.post("/api/discussion/help-event", json={"event_kind": "session_complete"})
        self.client.post("/api/discussion/help-event", json={"event_kind": "offers"})
        self.client.post("/api/discussion/help-event", json={"event_kind": "abandon"})

        r = self.client.get("/api/community/stats")
        self.assertEqual(r.status_code, 200)
        payload = r.json()
        self.assertGreaterEqual(payload["completed5A_24h"], 1)
        self.assertGreaterEqual(payload["offers_24h"], 1)
        self.assertGreaterEqual(payload["abandons_24h"], 1)

    def test_community_stats_contract(self):
        r = self.client.get("/api/community/stats")
        self.assertEqual(r.status_code, 200)
        payload = r.json()
        for k in [
            "completed5A_24h",
            "offers_24h",
            "abandons_24h",
            "scans_8h",
            "scan_percent_8h",
            "help_points_8h",
            "help_percent_8h",
            "scans_24h",
        ]:
            self.assertIn(k, payload)
        self.assertGreaterEqual(payload["scan_percent_8h"], 0)
        self.assertLessEqual(payload["scan_percent_8h"], 100)
        self.assertGreaterEqual(payload["help_percent_8h"], 0)
        self.assertLessEqual(payload["help_percent_8h"], 100)

    def test_qr_redirects_to_agent_destination(self):
        r = self.client.get("/qr/TOTEM_001?agent=smoker", follow_redirects=False)
        self.assertEqual(r.status_code, 302)
        self.assertEqual(r.headers.get("location"), "https://tribu.stop-tabac.ch/")

    def test_qr_redirects_to_offer_destination(self):
        r = self.client.get("/qr/TOTEM_001?destination=cipret", follow_redirects=False)
        self.assertEqual(r.status_code, 302)
        self.assertEqual(r.headers.get("location"), "https://www.vivre-sans-fumer.ch/")

    def test_qr_default_destination(self):
        r = self.client.get("/qr/TOTEM_001", follow_redirects=False)
        self.assertEqual(r.status_code, 302)
        self.assertEqual(r.headers.get("location"), "https://smokwit.ch/map")


if __name__ == "__main__":
    unittest.main()
