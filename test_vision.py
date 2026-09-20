import requests
import base64
import sys

def test_api(endpoint, img_path):
    with open(img_path, "rb") as f:
        img_b64 = base64.b64encode(f.read()).decode('utf-8')
    
    payload = {
        "description": "test",
        "image": img_b64
    }
    
    print(f"\n--- Testing {endpoint} with {img_path} ---")
    try:
        resp = requests.post(f"http://localhost:8001/api/{endpoint}", json=payload)
        resp.raise_for_status()
        import json
        print(json.dumps(resp.json(), indent=2))
    except Exception as e:
        print("Error:", e)
        if hasattr(resp, 'text'):
            print(resp.text)

if __name__ == "__main__":
    flower_img = "/Users/macxcalamity/.gemini/antigravity-ide/brain/b77fa8bc-e00b-4c31-9b08-49024f295296/test_flower_1789904925276.jpg"
    plastic_img = "/Users/macxcalamity/.gemini/antigravity-ide/brain/b77fa8bc-e00b-4c31-9b08-49024f295296/test_plastic_1789904947676.jpg"
    houseplant_img = "/Users/macxcalamity/.gemini/antigravity-ide/brain/b77fa8bc-e00b-4c31-9b08-49024f295296/test_houseplant_1789904970695.jpg"
    
    test_api("scout", flower_img)
    test_api("inorganic", plastic_img)
    test_api("plant_id", houseplant_img)
