// Photographic editorial: one real image, uniformly transformed inside its
// measured slot. Crop is 20:17; original 51:77 source aspect remains unchanged.
export const wide=[[0,.66,.47,.86,-2,239,238,233,1,0,0,1],[.22,.36,.49,.91,-.5,229,227,216,.74,.26,0,1.04],[.5,.51,.50,1.06,0,199,203,187,0,1,0,1.63],[.72,.67,.46,.90,2,214,216,201,0,.6,.4,1.22],[1,.47,.50,.83,0,239,238,233,0,0,1,1]];
export const compact=[[0,.57,.46,.85,-1.5,239,238,233,1,0,0,1],[.22,.36,.50,.84,-.5,229,227,216,.74,.26,0,1.04],[.5,.49,.50,1.02,0,199,203,187,0,1,0,1.53],[.72,.66,.49,.85,1.5,214,216,201,0,.6,.4,1.20],[1,.49,.49,.82,0,239,238,233,0,0,1,1]];
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// Shape-preserving Hermite interpolation: shared tangent across adjacent
// segments rather than restarting ease-in/ease-out at each authored waypoint.
const tangent=(a,b)=>a*b<=0?0:2*a*b/(a+b);
export function pose(p,small){const t=small?compact:wide;p=clamp(p,0,1);let i=0;while(i<t.length-2&&p>t[i+1][0])i++;const a=t[i],b=t[i+1],dt=b[0]-a[0],u=(p-a[0])/dt;return a.slice(1).map((v,j)=>{const k=j+1,sec=(b[k]-v)/dt,m0=i?tangent((v-t[i-1][k])/(a[0]-t[i-1][0]),sec):0,m1=i+2<t.length?tangent(sec,(t[i+2][k]-b[k])/(t[i+2][0]-b[0])):0;return (2*u**3-3*u*u+1)*v+(u**3-2*u*u+u)*dt*m0+(-2*u**3+3*u*u)*b[k]+(u**3-u*u)*dt*m1})}
export function frame(p,small,w,h){const [x,y,size,angle,r,g,b,a,m,c,detail]=pose(p,small),rad=angle*Math.PI/180,ratio=17/20,cos=Math.abs(Math.cos(rad)),sin=Math.abs(Math.sin(rad)),bw=cos+ratio*sin,bh=sin+ratio*cos,pad=small?6:12,width=Math.max(1,Math.min(Math.min(w,h/ratio)*size,(w-2*pad)/bw,(h-2*pad)/bh)),rx=width*bw/2,ry=width*bh/2;return {width,x:clamp(w*x,pad+rx,w-pad-rx),y:clamp(h*y,pad+ry,h-pad-ry),angle,r:Math.round(r),g:Math.round(g),b:Math.round(b),a,m,c,rx,ry,detail}}
export function ink(r,g,b){const l=[r,g,b].map(x=>{const c=x/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);return l>.179?'#000000':'#ffffff'}

// Native configurator palette. Preserve the real photograph and map only
// authored stage colours; no generic inline important styles.
const hexColour=s=>typeof s==='string'&&/^#[0-9a-f]{6}$/i.test(s);
export function parsePalette(value){if(!value||!hexColour(value.primary)||!hexColour(value.secondary)||value.trim!=null&&!hexColour(value.trim))return null;return {primary:value.primary,secondary:value.secondary,trim:value.trim||value.primary}}
const rgbHex=s=>[1,3,5].map(i=>parseInt(s.slice(i,i+2),16));
const luminance=rgb=>rgb.map(v=>{const c=v/255;return c<=.04045?c/12.92:((c+.055)/1.055)**2.4}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
export function contrastRGB(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
export function accentFor(p,bg){const trim=rgbHex(p.trim);return contrastRGB(trim,bg)>=4.5?p.trim:ink(...bg)}
export function paletteFrame(f,p){if(!p)return {bg:[f.r,f.g,f.b],fg:ink(f.r,f.g,f.b),type:[f.r,f.g,f.b].map(v=>Math.round(v*.8+18)),accent:'#ad512c'};
 const amount=clamp((239-f.r)/40,0,1),a=rgbHex(p.secondary),b=rgbHex(p.primary),bg=a.map((v,i)=>Math.round(v+(b[i]-v)*amount)),fg=ink(...bg),target=fg==='#ffffff'?255:0;
 return {bg,fg,type:bg.map(v=>Math.round(v+(target-v)*.13)),accent:accentFor(p,bg)};
}
export function paletteSurface(p,role){const bg=rgbHex(p[role]);return {bg:p[role],fg:ink(...bg),accent:accentFor(p,bg)}}
