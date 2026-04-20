import time
import redis
import requests
import json

r = redis.Redis(host='redis', port=6379, decode_responses=True)

# --- TELEGRAM CONFIG ---
BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")

def send_telegram_alert(site_name, url):
    message = f"🚨 ALERT: {site_name} ({url}) is DOWN! 😱"
    telegram_url = f"https://api.telegram.org/bot{BOT_TOKEN}/sendMessage?chat_id={CHAT_ID}&text={message}"
    try:
        requests.get(telegram_url)
        print(f"✅ Alert sent for {site_name}")
    except Exception as e:
        print(f"❌ Failed to send Telegram alert: {e}")



print("Testing Telegram Bot...")
send_telegram_alert("Test-Site", "http://test.com")

# --- MONITORING CONFIG ---
WEBSITES = [
    
    {"name": "GitHub", "url": "https://github.com"},
    {"name": "My Portfolio", "url": "https://vimukthiprabath.github.io/Portfolio/"},
    {"name": "Test-Site", "url": "http://test.com"}
]

INTERVAL = 300 

print(f"🚀 PingMe Worker Started! Checking every {INTERVAL} seconds...", flush=True)

while True:
    statuses = []
    for site in WEBSITES:
        start_time = time.time()
        try:
            res = requests.get(site["url"], timeout=10)
            latency = int((time.time() - start_time) * 1000)
            status = "Online" if res.status_code == 200 else "Offline"
        except Exception:
            latency = 0
            status = "Offline"
        
        
        if status == "Offline":
            send_telegram_alert(site["name"], site["url"])
        
        statuses.append({
            "name": site["name"],
            "url": site["url"],
            "status": status,
            "ping": f"{latency}ms"
        })
        print(f"[{status}] {site['name']} - {latency}ms", flush=True)
    
    r.set("website_status", json.dumps(statuses))
    time.sleep(INTERVAL) 