"""S08c2: intact recreation, natural proportions and fixed image checks."""
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
    for lang,filename in [("en","index.html"),("it","it.html")]:
        for w,h in [(1440,900),(1024,768),(844,390),(390,844),(320,568)]:
            for mode in ["normal","static"] if w==390 else ["normal"]:
                context=browser.new_context(viewport={"width":w,"height":h},has_touch=w<600,is_mobile=w<600,reduced_motion="reduce" if mode=="static" else "no-preference",device_scale_factor=1)
                page=context.new_page();errors=[]
                page.on("pageerror",lambda err:errors.append(str(err)))
                page.goto(base+filename,wait_until="networkidle")
                r=page.locator("#about")
                page.evaluate("document.querySelector('#about').scrollIntoView({behavior:'instant'})")
                page.wait_for_timeout(350)
                img=r.locator(".ritual-photo img")
                img.evaluate("i=>i.decode()")
                assert img.evaluate("i=>i.naturalWidth===1448 && i.naturalHeight===1086")
                assert "ritual-espresso.webp" in img.evaluate("i=>i.currentSrc")
                assert img.evaluate("i=>getComputedStyle(i).transform")=="none"
                plate=r.locator(".ritual-photo")
                initial=plate.evaluate("e=>getComputedStyle(e).transform")
                m=plate.evaluate("e=>{let m=new DOMMatrixReadOnly(getComputedStyle(e).transform);return [m.a,m.b,m.c,m.d]}")
                assert m==[1,0,0,1],m
                assert r.locator(".ritual-visual img").count()==1
                size=img.bounding_box()
                assert abs(size["width"]/size["height"]-4/3)<.02,size
                assert r.locator(".ritual-actions a").count()==2
                assert r.evaluate("e=>e.scrollWidth<=e.clientWidth+1")
                for sel in [".ritual-copy h2",".ritual-lead",".ritual-actions"]:
                    b=r.locator(sel).bounding_box()
                    assert b["x"]>=-1 and b["x"]+b["width"]<=w+1,b
                tag=f"{lang}-{w}x{h}-{mode}"
                r.screenshot(path=str(OUT/f"ritual-{tag}.png"))
                page.evaluate("window.scrollBy({top:100,behavior:'instant'})")
                page.wait_for_timeout(120)
                assert plate.evaluate("e=>getComputedStyle(e).transform")==initial
                assert img.evaluate("e=>getComputedStyle(e).transform")=="none"
                r.locator(".ritual-next").click();page.wait_for_timeout(800)
                assert page.locator("#last-word-title").is_visible()
                assert not errors,errors
                context.close()
    browser.close()
server.shutdown()
print("S08c2: 12 Ritual responsive and reduced-motion configurations passed.")
