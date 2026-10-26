"""
RESQ C2 Command Center - Unified Launcher
AI-Assisted Emergency Decision Support & Explainable Resource Optimization
Project Team: Swastik Patil (22), Shravan Mali (26), Riddhi Chalke (27), Mrunmay Raut (38)
"""
import sys
import os
import webbrowser
import uvicorn

# Add backend directory to sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    port = 8000
    host = "127.0.0.1"
    url = f"http://{host}:{port}"
    
    print("=" * 70)
    print("  RESQ: AI-Assisted Decision Support & Explainable Resource Optimization")
    print("  Diploma in Computer Engineering · Major Project")
    print("  'Every Second Matters. Every Resource Counts.'")
    print("=" * 70)
    print(f"[*] Starting Tactical C2 Operations Server at: {url}")
    print("[*] Documentation & Swagger API UI at:        f'{url}/docs'")
    print("[*] RESQ recommends. Human officers decide.")
    print("=" * 70)
    
    # Auto-open browser after 1 second
    try:
        import threading
        import time
        def open_browser():
            time.sleep(1.2)
            webbrowser.open(url)
        threading.Thread(target=open_browser, daemon=True).start()
    except Exception:
        pass

    uvicorn.run("main:app", app_dir=backend_dir, host=host, port=port, log_level="info")

