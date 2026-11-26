"""S08b3: check real camera transforms, not self-reported motion state."""
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
matrix="el=>{const m=new DOMMatrixReadOnly(getComputedStyle(el).transform);return [m.a,m.b,m.c,m.d,m.e,m.f]}"

def rigid(m,rest):
    assert abs(m[0]-rest[0])<.0001 and abs(m[3]-rest[3])<.0001, (m,rest)
    assert abs(m[1])<.0001 and abs(m[2])<.0001
    assert abs(m[0]-m[3])<.0001

with sync_playwright() as pw:
    browser=pw.chromium.launch()
    for lang,pagefile in [("en","index.html"),("it","it.html")]:
        for width,height in [(1440,900),(390,844),(320,568)]:
            context=browser.new_context(viewport={"width":width,"height":height},has_touch=width<600,is_mobile=width<600,device_scale_factor=1)
            page=context.new_page()
            errors=[]
            page.on("pageerror",lambda err:errors.append(str(err)))
            page.goto(base+pagefile,wait_until="networkidle")
            hit=page.locator(".product-hit");hit.wait_for(state="visible")
            camera=page.locator(".scene-camera")
            assert page.locator("canvas,.photo-layers,input[type=range]").count()==0
            assert page.locator(".still img").evaluate("(im)=>im.complete&&im.naturalWidth>0")
            tag=f"{lang}-{width}x{height}"
            rest=camera.evaluate(matrix);rigid(rest,rest)
            page.screenshot(path=str(OUT/f"{tag}-rest.png"))
            b=hit.bounding_box();x=b["x"]+b["width"]*.55;y=b["y"]+b["height"]*.4
            if width<600:
                cdp=context.new_cdp_session(page)
                def touch(kind,xx=None,yy=None):
                    cdp.send("Input.dispatchTouchEvent",{"type":kind,"touchPoints":[] if xx is None else [{"x":xx,"y":yy}]})
                touch("touchStart",x,y)
                for d in [12,25,45,55]:touch("touchMove",x+d,y)
            else:
                page.mouse.move(width*.88,height*.28,steps=8)
            page.wait_for_timeout(350)
            right=camera.evaluate(matrix);rigid(right,rest)
            assert right[4]-rest[4]>2 and right[4]-rest[4]<=18.1, (right,rest)
            page.screenshot(path=str(OUT/f"{tag}-right.png"))
            if width<600:
                for d in [30,0,-25,-55]:touch("touchMove",x+d,y)
            else:page.mouse.move(width*.12,height*.7,steps=8)
            page.wait_for_timeout(350)
            left=camera.evaluate(matrix);rigid(left,rest)
            assert left[4]-rest[4]<-2 and left[4]-rest[4]>=-18.1, (left,rest)
            page.screenshot(path=str(OUT/f"{tag}-left.png"))
            if width<600:touch("touchEnd")
            else:page.mouse.move(width/2,height/2)
            page.wait_for_timeout(500)
            settled=camera.evaluate(matrix)
            assert abs(settled[4]-rest[4])<.1 and abs(settled[5]-rest[5])<.1,(settled,rest)
            hit.focus();page.keyboard.press("Enter");page.wait_for_timeout(150)
            assert camera.evaluate(matrix)[4]-rest[4]>1
            page.wait_for_timeout(700)
            page.locator(".hero-copy .primary").click();page.wait_for_timeout(1300)
            assert page.locator("#espresso h2").is_visible()
            page.locator("#about").scroll_into_view_if_needed()
            assert page.locator("#ritual-title").is_visible()
            page.locator("#last-word").scroll_into_view_if_needed()
            assert page.locator("#last-word-title").is_visible()
            assert not errors, errors
            context.close()
        for options in [{"reduced_motion":"reduce"},{"java_script_enabled":False}]:
            context=browser.new_context(viewport={"width":390,"height":844},**options)
            page=context.new_page();page.goto(base+pagefile,wait_until="networkidle")
            assert page.locator(".product-hit").is_hidden()
            assert page.locator("canvas").count()==0
            assert page.locator("#filter").is_visible()
            assert page.locator("#last-word-title").is_visible()
            context.close()
    browser.close()
server.shutdown()
print("S08b3: six interactive configurations and four fallbacks passed.")
