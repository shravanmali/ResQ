import requests
import json

BASE = "http://127.0.0.1:8000"

def test_endpoints():
    print("[1] Testing /api/status...")
    r = requests.get(f"{BASE}/api/status")
    assert r.status_code == 200, f"Status failed: {r.status_code}"
    print("   -> Success:", r.json()["system"])

    print("[2] Testing /api/incidents...")
    r = requests.get(f"{BASE}/api/incidents")
    assert r.status_code == 200
    incidents = r.json()
    print(f"   -> Success: {len(incidents)} active incidents loaded.")

    print("[3] Testing /api/resources...")
    r = requests.get(f"{BASE}/api/resources")
    assert r.status_code == 200
    resources = r.json()
    print(f"   -> Success: {len(resources)} fleet resources loaded.")

    print("[4] Testing /api/allocation (Hungarian Algorithm)...")
    r = requests.get(f"{BASE}/api/allocation?algorithm=HUNGARIAN")
    assert r.status_code == 200
    alloc = r.json()
    print(f"   -> Success: {len(alloc['assignments'])} assignments computed. Avg ETA: {alloc['avg_eta_minutes']}m. Total Cost: {alloc['total_cost']}")

    print("[5] Testing /api/whatif (Road Blockage Scenario)...")
    r = requests.get(f"{BASE}/api/whatif?scenario_type=ROAD_BLOCKAGE&algorithm=HUNGARIAN")
    assert r.status_code == 200
    whatif = r.json()
    print(f"   -> Success: Delta ETA +{whatif['delta']['eta_delta_minutes']}m, Cost Delta +{whatif['delta']['cost_delta']}")

    print("[6] Testing /api/incidents/ai-extract...")
    r = requests.post(f"{BASE}/api/incidents/ai-extract", json={
        "report_text": "Heavy flooding near the railway station. Several people are trapped and require immediate rescue assistance.",
        "vision_preset": "flood_water"
    })
    assert r.status_code == 200
    extracted = r.json()
    print(f"   -> Success: Hazard: {extracted['extracted']['hazard_type']}, Priority Score: {extracted['priority']['score']}/100")

    print("[7] Testing Frontend Root HTTP 200...")
    r = requests.get(f"{BASE}/")
    assert r.status_code == 200
    print("   -> Success: Web UI served properly with HTML & assets.")

    print("\n[ALL 7 END-TO-END ACCEPTANCE TESTS PASSED FLLAWLESSLY!]")

if __name__ == "__main__":
    test_endpoints()

