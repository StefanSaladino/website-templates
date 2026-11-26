"""Hosted-source browser audit. Screenshots are review evidence, not a visual pass."""
from pathlib import Path
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from functools import partial
from threading import Thread
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/"audit"/"captures"
OUT.mkdir(parents=True,exist_ok=True)
server=ThreadingHTTPServer(("127.0.0.1",0),partial(SimpleHTTPRequestHandler,directory=str(ROOT)))
Thread(target=server.serve_forever,daemon=True).start()
base=f"http://127.0.0.1:{server.server_port}/"

with sync_playwright() as pw:
    browser=pw.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader"])
    for lang,pagefile in [("en","index.html"),("it","it.html")]:
        for width,height in [(1440,900),(390,844),(320,568)]:
            context=browser.new_context(viewport={"width":width,"height":height},has_touch=width<600,is_mobile=width<600,device_scale_factor=1)
            page=context.new_page()
            errors=[]
            page.on("pageerror",lambda err:errors.append(str(err)))
            page.goto(base+pagefile,wait_until="networkidle")
            hit=page.locator(".product-hit")
            hit.wait_for(state="visible")
            assert page.locator('input[type=range]').count()==0
            assert page.locator(".photo-layers").count()==0
            assert page.locator(".still img").evaluate("(im)=>im.complete&&im.naturalWidth>0")
            c=page.locator(".product-motion-canvas")
            assert c.is_visible()
            hero=page.locator(".hero")
            assert float(hero.get_attribute("data-mesh-depth"))>0
            assert int(hero.get_attribute("data-mesh-triangles"))>100
            canvas_id=c.evaluate("(c)=>{c.dataset.auditIdentity=\"same\";return c.dataset.auditIdentity}")
            tag=f"{lang}-{width}x{height}"
            page.screenshot(path=str(OUT/f"{tag}-rest.png"))
            b=hit.bounding_box()
            x=b["x"]+b["width"]*.55
            y=b["y"]+b["height"]*.40
            if width<600:
                cdp=context.new_cdp_session(page)
                def touch(kind,xx=None,yy=None):
                    cdp.send("Input.dispatchTouchEvent",{"type":kind,"touchPoints":[] if xx is None else [{"x":xx,"y":yy}]})
                touch("touchStart",x,y)
                for d in [12,25,45,65]:touch("touchMove",x+d,y)
            else:
                page.mouse.move(x,y);page.mouse.down();page.mouse.move(x+65,y,steps=8)
            c.wait_for(state="visible")
            page.wait_for_timeout(220)
            right=float(hero.get_attribute("data-turn-angle"))
            assert right>70, right
            assert hero.get_attribute("data-visible-face") in ("side","back")
            page.screenshot(path=str(OUT/f"{tag}-right.png"))
            if width<600:
                for d in [35,5,-25,-65]:touch("touchMove",x+d,y)
            else:page.mouse.move(x-65,y,steps=12)
            page.wait_for_timeout(220)
            left=float(hero.get_attribute("data-turn-angle"))
            assert left < -70, left
            assert hero.get_attribute("data-visible-face")=="back"
            assert c.get_attribute("data-audit-identity")==canvas_id
            page.screenshot(path=str(OUT/f"{tag}-left.png"))
            if width<600:touch("touchEnd")
            else:page.mouse.up()
            page.wait_for_function("document.querySelector('.hero').dataset.turnAngle==='0.00'")
            hit.focus()
            page.keyboard.press("Enter")
            page.wait_for_function("Number(document.querySelector('.hero').dataset.turnAngle)>30")
            page.wait_for_function("document.querySelector('.hero').dataset.turnAngle==='0.00'")
            # Verify the rest of the campaign still exists and can be reached.
            page.locator(".hero-copy .primary").click()
            page.wait_for_timeout(1300)
            assert page.locator("#espresso h2").is_visible()
            page.locator("#about").scroll_into_view_if_needed()
            assert page.locator("#ritual-title").is_visible()
            page.locator("#last-word").scroll_into_view_if_needed()
            assert page.locator("#last-word-title").is_visible()
            assert not errors, errors
            context.close()
        context=browser.new_context(viewport={"width":390,"height":844},reduced_motion="reduce")
        page=context.new_page()
        page.goto(base+pagefile,wait_until="networkidle")
        assert page.locator(".product-hit").is_hidden()
        assert page.locator(".product-motion-canvas").is_hidden()
        assert page.locator("#last-word-title").is_visible()
        context.close()
        context=browser.new_context(java_script_enabled=False)
        page=context.new_page()
        page.goto(base+pagefile,wait_until="networkidle")
        assert page.locator(".product-hit").is_hidden()
        assert page.locator("#filter").is_visible()
        assert page.locator("#last-word-title").is_visible()
        context.close()
    browser.close()
server.shutdown()
print("S08b2: six interactive configurations and four fallbacks passed.")
