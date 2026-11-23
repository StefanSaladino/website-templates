/* No video source is requested until direct opt-in. In-view continuation is not a license to autoplay unrequested content. */
(()=>{
 const video=document.querySelector('#r-video'),stage=document.querySelector('#r-film'),button=document.querySelector('#r-toggle'),status=document.querySelector('#r-status');
 if(!video||!stage||!button||!status)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const url='https://videos.pexels.com/video-files/7677235/7677235-hd_1920_1080_25fps.mp4';
 let enabled=false,visible=true,busy=false,broken=false;
 const label=(text)=>{status.textContent=text;};
 function paint(){const playing=enabled&&!video.paused&&!broken&&!reduced.matches;stage.classList.toggle('is-playing',playing);button.setAttribute('aria-pressed',String(playing));button.textContent=playing?'Pause muted reel':enabled?'Resume muted reel':'Enable muted reel';}
 function pause(note){video.pause();paint();if(note)label(note);}
 async function play(){
   if(busy||reduced.matches)return;if(broken){label('Sample footage is unavailable. The still image remains visible.');return;}
   if(!video.src){video.src=url;video.preload='metadata';video.load();}
   video.muted=true;video.loop=true;video.playsInline=true;busy=true;
   label('Loading sample media on request.');try{await video.play();enabled=true;paint();label('Muted review-only reel playing. Use the button to pause.');}
   catch{video.pause();paint();label('Video could not play. The still image remains available.');}finally{busy=false;}
 }
 button.addEventListener('click',()=>{if(reduced.matches){label('Reduced motion is enabled. The poster stays static.');return;}if(!video.paused){enabled=false;pause('Sample reel paused by the visitor.');}else{enabled=true;play();}});
 video.addEventListener('error',()=>{broken=true;enabled=false;pause('Sample video did not load. The static poster remains visible.');});
 if('IntersectionObserver'in window){const observer=new IntersectionObserver(entries=>{visible=Boolean(entries[0]?.isIntersecting&&entries[0].intersectionRatio>=.25);if(!visible&&!video.paused)pause('Reel paused outside the visible section.');},{threshold:[0,.25,.65]});observer.observe(stage);}
 reduced.addEventListener('change',()=>{if(reduced.matches){enabled=false;pause('Reduced motion preference detected. Static poster shown.')}else paint();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&!video.paused)pause('Reel paused while this tab is hidden.');});
 paint();
})();
