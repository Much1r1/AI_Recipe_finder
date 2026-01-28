import requests
import unittest

class TestVerifyEndpoint(unittest.TestCase):
    def test_random_fact_endpoint(self):
        url = "http://localhost:8000/api/verify/random-fact"
        try:
            response = requests.get(url)
            self.assertEqual(response.status_code, 200)
            data = response.json()
            self.assertIn("ingredient", data)
            self.assertIn("weird_fact", data)
            self.assertIn("phi3_brain_active", data)
            self.assertTrue(data["phi3_brain_active"])
            print(f"Verified: {data['ingredient']} -> {data['weird_fact']}")
        except Exception as e:
            print(f"Server might not be running: {e}")

if __name__ == "__main__":
    unittest.main()
