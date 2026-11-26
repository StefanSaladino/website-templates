"""S08b4: actual computed transforms and layout at rest, pointer, touch and scroll."""
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
state="""el=>{const m=new DOMMatrixReadOnly(getComputedStyle(el).transform),im=el.querySelector('.still img'),n=new DOMMatrixReadOnly(getComputedStyle(im).transform);return {matrix:[m.a,m.b,m.c,m.d,m.e,m.f],image:[n.a,n.b,n.c,n.d,n.e,n.f],size:[el.offsetWidth,el.offsetHeight],fit:getComputedStyle(im).objectFit}}"""
def check(s,rest=None,static=False):
    assert all(abs(a-b)<.0001 for a,b in zip(s["matrix"][:4],[1,0,0,1])),s
    assert s["image"]==[1,0,0,1,0,0] and s["fit"]=="cover",s
    if rest:assert s["size"]==rest["size"],(s,rest)
    if static:assert all(abs(n)<.1 for n in s["matrix"][4:]),s
    assert abs(s["matrix"][4])<=12.1 and abs(s["matrix"][5])<=8.1,s
with sync_playwright() as pw:
    browser=pw.chromium.launch()
    for lang,filename in [("en","index.html"),("it","it.html")]:
        for w,h in [(1440,900),(1024,768),(390,844),(320,568)]:
            mobile=w<600
            context=browser.new_context(viewport={"width":w,"height":h},has_touch=mobile,is_mobile=mobile,device_scale_factor=1)
            page=context.new_page();errors=[]
            page.on("pageerror",lambda err:errors.append(str(err)))
            page.goto(base+filename,wait_until="networkidle")
            camera=page.locator(".scene-camera")
            assert page.locator("canvas,.photo-layers,.product-hit,input[type=range]").count()==0
            rest=camera.evaluate(state);check(rest,static=True)
            tag=f"{lang}-{w}x{h}";page.screenshot(path=str(OUT/f"{tag}-rest.png"))
            if mobile:
                cdp=context.new_cdp_session(page)
                for kind,points in [("touchStart",[{"x":w*.65,"y":h*.27}]),("touchMove",[{"x":w*.40,"y":h*.27}]),("touchEnd",[])]:
                    cdp.send("Input.dispatchTouchEvent",{"type":kind,"touchPoints":points})
                page.wait_for_timeout(300);check(camera.evaluate(state),rest,static=True)
            else:
                page.mouse.move(w*.85,h*.25,steps=8);page.wait_for_timeout(400)
                right=camera.evaluate(state);check(right,rest)
                assert right["matrix"][4]>4,right
                page.screenshot(path=str(OUT/f"{tag}-right.png"))
                page.mouse.move(w*.15,h*.7,steps=8);page.wait_for_timeout(400)
                left=camera.evaluate(state);check(left,rest)
                assert left["matrix"][4]<-4,left
                page.screenshot(path=str(OUT/f"{tag}-left.png"))
            # Fixed scale at every scroll sample, including the roast handoff.
            for fraction in [.1,.3,.6,.92]:
                page.evaluate("(y)=>window.scrollTo({top:y,behavior:'instant'})",h*fraction)
                page.wait_for_timeout(100);check(camera.evaluate(state),static=True if mobile or fraction>=.1 else False)
            page.evaluate("window.scrollTo({top:0,behavior:'instant'})")
            page.wait_for_timeout(150)
            page.locator(".hero-copy .primary").click();page.wait_for_timeout(1300)
            assert page.locator("#espresso h2").is_visible()
            assert page.locator("#ritual-title").is_visible()
            assert page.locator("#last-word-title").is_visible()
            assert not errors,errors
            context.close()
        for options in [{"reduced_motion":"reduce"},{"java_script_enabled":False}]:
            context=browser.new_context(viewport={"width":390,"height":844},**options)
            page=context.new_page();page.goto(base+filename,wait_until="networkidle")
            check(page.locator(".scene-camera").evaluate(state),static=True)
            assert page.locator("#filter").is_visible()
            assert page.locator("#last-word-title").is_visible()
            context.close()
    browser.close()
server.shutdown()
print("S08b4: eight responsive motion configurations and four fallbacks passed.")
