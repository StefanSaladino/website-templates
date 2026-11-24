// Authored scroll-distance poses, independent of the DOM and renderer.
export const wide=[ [0,65,42,39,12,-22,-24,1,235,233,227,1,0,0], [.2,57,36,49,5,-27,-8,1,235,233,227,.92,.08,0], [.35,40,34,60,12,-20,10,.98,221,220,213,.05,.40,0], [.5,39,34,68,10,-9,12,.85,55,56,59,0,1,0], [.65,63,39,52,8,25,48,.94,37,38,41,0,.88,.08], [.8,65,39,40,4,15,72,1,216,215,209,0,.05,.95], [1,65,40,35,2,0,88,1,235,233,227,0,0,1] ];
// Compact camera follows a diagonal arc with real lateral clearance before a
// larger central material reveal. Coordinates are local to the measured art slot.
export const narrow=[ [0,74,34,56,12,-22,-25,1,235,233,227,1,0,0], [.2,26,62,54,5,-34,-10,1,235,233,227,.92,.08,0], [.35,43,53,76,18,-25,12,.98,221,220,213,.05,.40,0], [.5,50,49,108,10,-9,12,.85,55,56,59,0,1,0], [.65,71,58,62,8,25,42,.94,37,38,41,0,.88,.08], [.8,59,44,59,4,15,72,1,216,215,209,0,.05,.95], [1,50,51,60,2,0,88,1,235,233,227,0,0,1] ];
export const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
function slope(a,b){return a*b<=0?0:2*a*b/(a+b)}
export function sample(p,track){let i=0;while(i<track.length-2&&p>track[i+1][0])i++;const a=track[i],b=track[i+1],d=b[0]-a[0],t=clamp((p-a[0])/d,0,1);return a.map((v,k)=>{if(!k)return p;const sec=(b[k]-v)/d,m0=i?slope((v-track[i-1][k])/(a[0]-track[i-1][0]),sec):0,m1=i+2<track.length?slope(sec,(track[i+2][k]-b[k])/(track[i+2][0]-b[0])):0;return (2*t**3-3*t*t+1)*v+(t**3-2*t*t+t)*d*m0+(-2*t**3+3*t*t)*b[k]+(t**3-t*t)*d*m1})}
export function campaignPose(p,compact,area,w,h,finish='ultramarine'){const [_,x,y,width,rx,ry,rz,shade,r,g,b,a,f,c]=sample(p,compact?narrow:wide),distance=6.8-2.25*Math.sin(Math.PI*p)**2,pose={yaw:ry,pitch:-rx,roll:-rz,distance,light:-38+90*Math.sin(Math.PI*p)**2-6*p,studio:Math.sin(Math.PI*p)**2,finish};const desired={x:compact?area.left+x/100*(area.right-area.left):x/100*w,y:compact?area.top+y/100*(area.bottom-area.top):y/100*h,width:width/100*w};return {pose,desired,rx,ry,rz,shade,r,g,b,a,f,c}}
export function contrastingInk(r,g,b){const lin=v=>{v=v/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4},l=.2126*lin(r)+.7152*lin(g)+.0722*lin(b);return (l+.05)/.05>=1.05/(l+.05)?'#000000':'#ffffff'}

// Native configurator palette: preserve the authored light-to-dark timeline,
// replacing its colour endpoints without recolouring the product artwork.
export function parsePreviewPalette(p){const valid=s=>typeof s==='string'&&/^#[0-9a-f]{6}$/i.test(s);if(!p||!valid(p.primary)||!valid(p.secondary)||p.trim!=null&&!valid(p.trim))return null;return {primary:p.primary,secondary:p.secondary,trim:p.trim||p.primary}}
export function previewRGB(hex){return [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16))}
export function previewCampaignColour(r,g,b,palette){if(!palette)return [r,g,b];const light=clamp(((r+g+b)/3-38.67)/(231.67-38.67),0,1),dark=previewRGB(palette.primary),bright=previewRGB(palette.secondary);return dark.map((v,i)=>Math.round(v+(bright[i]-v)*light))}
export function previewContrast(a,b){const lum=rgb=>rgb.map(x=>{const v=x/255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
