import requests
import time
import sys

def check_endpoint(name, url):
    print(f"Checking {name} at {url}...", end=" ")
    try:
        response = requests.get(url, timeout=5)
        if response.status_code == 200:
            print("✅ OK")
            return True
        else:
            print(f"❌ FAILED (Status: {response.status_code})")
            return False
    except Exception as e:
        print(f"❌ ERROR ({type(e).__name__})")
        return False

def main():
    endpoints = {
        "Backend Health": "http://localhost:3000/api/health",
        "ML Service Health": "http://localhost:8000/health",
        "Frontend": "http://localhost:3001"
    }
    
    all_ok = True
    for name, url in endpoints.items():
        if not check_endpoint(name, url):
            all_ok = False
            
    if not all_ok:
        print("\n⚠️ Some services are not ready yet.")
        sys.exit(1)
    else:
        print("\n🚀 All core services are UP and READY!")
        sys.exit(0)

if __name__ == "__main__":
    main()
