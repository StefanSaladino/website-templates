"""S08d2 grounded closing still life, full-frame geometry and fallbacks."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"audit"/"captures";OUT.mkdir(parents=True,exist_ok=True)
server=ThreadingHTTPServer(("127.0.0.1",0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
base=f"http://127.0.0.1:{server.server_port}/"
with sync_playwright() as pw:
    browser=pw.chromium.launch()
    for lang,filename,setup,punch in [("en","index.html","Coffee first.","Then maybe I'll listen."),("it","it.html","Prima il caffè.","Poi, forse, ti ascolto.")]:
        for w,h,mode in [(1440,900,"normal"),(1024,768,"normal"),(844,390,"normal"),(390,844,"normal"),(320,568,"normal"),(390,844,"reduce"),(390,844,"nojs")]:
            context=browser.new_context(viewport={"width":w,"height":h},has_touch=w<600,is_mobile=w<600,reduced_motion="reduce" if mode=="reduce" else "no-preference",java_script_enabled=mode!="nojs",device_scale_factor=1)
            page=context.new_page();errors=[]
            page.on("pageerror",lambda err:errors.append(str(err)))
            page.goto(base+filename+"#last-word",wait_until="networkidle")
            section=page.locator("#last-word");img=section.locator(".last-word-art img")
            page.evaluate("document.querySelector('#last-word').scrollIntoView({behavior:'instant'})")
            img.evaluate("i=>i.decode()")
            page.wait_for_timeout(900)
            assert img.evaluate("i=>i.naturalWidth===1448 && i.naturalHeight===1086 && i.currentSrc.endsWith('/ritual-espresso.webp')")
            assert img.evaluate("i=>getComputedStyle(i).transform")=="none"
            assert img.evaluate("i=>getComputedStyle(i).objectFit")=="contain"
            assert section.locator(".last-word-setup").inner_text()==setup
            assert section.locator(".last-word-punch").inner_text()==punch
            assert section.locator(".last-word-actions a").count()==2
            assert section.evaluate("e=>e.scrollWidth<=e.clientWidth+1")
            b=img.bounding_box()
            assert abs(b["width"]/b["height"]-4/3)<.025,b
            # The entire photograph is visible at its intrinsic aspect ratio.
            coverage=img.evaluate("i=>(i.clientWidth/i.clientHeight)/(i.naturalWidth/i.naturalHeight)")
            assert abs(coverage-1)<.02,coverage
            for sel in [".last-word-setup",".last-word-punch",".last-word-actions"]:
                item=section.locator(sel).bounding_box()
                assert item["x"]>=-1 and item["x"]+item["width"]<=w+1,item
            if w<600:
                assert section.locator(".last-word-copy").bounding_box()["y"] < b["y"]
            if mode in ("reduce","nojs"):
                assert section.locator(".last-word-punch").evaluate("e=>getComputedStyle(e).animationName")=="none"
            section.screenshot(path=str(OUT/f"closing-{lang}-{w}x{h}-{mode}.png"))
            page.evaluate("window.scrollBy({top:60,behavior:'instant'})")
            assert img.evaluate("i=>getComputedStyle(i).transform")=="none"
            section.locator(".last-word-top").click();page.wait_for_timeout(1400)
            assert page.evaluate("window.scrollY")<10
            assert page.locator("#hero-title").is_visible()
            assert not errors,errors
            context.close()
    browser.close()
server.shutdown()
print("S08d2: 14 closing layout, navigation and fallback configurations passed.")
