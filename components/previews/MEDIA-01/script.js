/* MEDIA-01: no network video request until explicit play, except the explicitly selected
   muted-in-view mobile-loop mode. Errors retain a legible poster with honest status. */
(()=>{
 const mode=new URLSearchParams(location.search).get('mobile');
 const modes=['M-MEDIA-01','M-MEDIA-02','M-MEDIA-03'];
 if(modes.includes(mode))document.body.dataset.mobileTreatment=mode;
 const stage=document.querySelector('#m1-stage'),video=document.querySelector('#m1-video');
 const playButton=document.querySelector('#m1-activate'),pauseButton=document.querySelector('#m1-pause');
 const status=document.querySelector('#m1-status');
 const small=matchMedia('(max-width:760px)'),reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const url='https://videos.pexels.com/video-files/7677235/7677235-hd_1920_1080_25fps.mp4';
 let loading=false,wasPaused=false,observer;
 function ready(){if(video.src)return;video.src=url;video.preload='metadata';video.load();}
 function state(message){status.textContent=message;}
 async function attempt(){
  if(loading)return;loading=true;ready();video.muted=true;video.playsInline=true;
  state('Trying to load the sample film. This is a review-only source.');
  try{await video.play();wasPaused=false;stage.classList.add('m1-is-playing');pauseButton.hidden=false;playButton.hidden=true;state('Sample film playing. No third-party booking or form submission.')}
  catch{stage.classList.remove('m1-is-playing');pauseButton.hidden=true;playButton.hidden=false;state('Video unavailable or blocked. The poster remains visible.');}
  finally{loading=false;}
 }
 function stop(){
  video.pause();stage.classList.remove('m1-is-playing');pauseButton.hidden=true;playButton.hidden=false;wasPaused=true;playButton.textContent='Resume sample film';state('Film paused. The sample poster is visible.');
 }
 playButton.addEventListener('click',attempt);pauseButton.addEventListener('click',stop);
 video.addEventListener('error',()=>{stage.classList.remove('m1-is-playing');pauseButton.hidden=true;playButton.hidden=false;state('Video did not load; poster fallback remains available.');});
 video.addEventListener('ended',()=>{stage.classList.remove('m1-is-playing');pauseButton.hidden=true;playButton.hidden=false;playButton.textContent='Replay sample film';state('Film finished.');});
 // The inline loop is a deliberate opt-in phone layout with reduced-motion / data-saver exclusions.
 if(mode==='M-MEDIA-02'){
   video.loop=true;video.muted=true;playButton.textContent='Play muted loop';
   function align(){
    const loopMode=small.matches&&!reduced.matches&&!navigator.connection?.saveData;
    if(observer){observer.disconnect();observer=null}
    if(!loopMode){video.pause();stage.classList.remove('m1-is-playing');pauseButton.hidden=true;playButton.hidden=false;state(reduced.matches?'Reduced motion: poster remains static.':'Poster visible. Choose play to load the film.');return;}
    state('Muted sample loop starts only while this frame is visible.');
    observer=new IntersectionObserver(entries=>{
      const visible=entries[0]?.isIntersecting&&entries[0].intersectionRatio>=.5;
      if(visible&&!wasPaused&&!loading&&!(!video.paused&&stage.classList.contains('m1-is-playing')))attempt();
      if(!visible&&!video.paused){video.pause();stage.classList.remove('m1-is-playing');pauseButton.hidden=true;playButton.hidden=false;state('Muted loop paused while offscreen.');}
    },{threshold:[0,.5,.75]});
    observer.observe(stage);
   }
   reduced.addEventListener('change',align);small.addEventListener('change',align);align();
 }
 else if(mode==='M-MEDIA-01')state('Poster-first composition. Tap to load and play; no automatic video traffic.');
 else if(mode==='M-MEDIA-03')state('Portrait-cropped frame of the original wide film. Tap to play the sample.');
})();
