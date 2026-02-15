import threading
import time
from urllib.request import Request, urlopen

from engine import analyzer_server


def start_server():
    analyzer_server.run(host="127.0.0.1", port=8000)


def main():
    t = threading.Thread(target=start_server, daemon=True)
    t.start()
    time.sleep(0.5)

    with open("engine/analyzer.py", "r", encoding="utf-8") as f:
        code = f.read()

    req = Request("http://127.0.0.1:8000/analyze", data=code.encode("utf-8"), headers={"Content-Type": "text/plain"})
    with urlopen(req) as resp:
        print(resp.read().decode("utf-8"))


if __name__ == "__main__":
    main()
