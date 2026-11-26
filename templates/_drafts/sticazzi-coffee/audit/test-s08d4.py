"""Structural focus targets never draw a browser outline; keyboard links remain visible."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
server=ThreadingHTTPServer(("127.0.0.1",0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
base=f"http://127.0.0.1:{server.server_port}/"
with sync_playwright() as pw:
    browser=pw.chromium.launch()
    for name in ["index.html","it.html"]:
        for viewport in [{"width":1440,"height":900},{"width":390,"height":844}]:
            page=browser.new_page(viewport=viewport,has_touch=viewport["width"]<600)
            page.goto(base+name,wait_until="networkidle")
            for target in ["#main","#hero-title","#ritual-title","#last-word"]:
                loc=page.locator(target)
                loc.evaluate("e=>e.focus({preventScroll:true})")
                assert loc.evaluate("e=>document.activeElement===e && getComputedStyle(e).outlineStyle==='none'"),target
            page.reload(wait_until="networkidle")
            page.keyboard.press("Tab")
            assert page.locator(":focus").evaluate("e=>getComputedStyle(e).outlineStyle!=='none'")
            page.close()
    browser.close()
server.shutdown()
print("S08d4: structural focus and keyboard indicators verified.")
