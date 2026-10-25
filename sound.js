'use strict';
window.gallerySound=(()=>{
 let enabled=true,context,master,lastStep=-1;
 const counts={step:0,door:0,review:0};
 try{enabled=localStorage.getItem('hwangdongtae-sound')!=='off'}catch{}
 const button=document.getElementById('sound-toggle');
 function label(){button.textContent=enabled?'♫ 소리 켜짐':'♪ 소리 꺼짐';button.setAttribute('aria-pressed',String(enabled));button.setAttribute('aria-label',enabled?'효과음 끄기':'효과음 켜기')}
 function unlock(){try{if(!context){const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio){button.disabled=true;button.textContent='소리 지원 안 됨';return}context=new Audio();master=context.createGain();master.gain.value=enabled?.22:0;master.connect(context.destination)}if(context.state==='suspended')context.resume().catch(()=>{})}catch{button.disabled=true;button.textContent='소리 사용 불가'}}
 function tone(freq,end,duration,volume,type='sine',delay=0){const t=context.currentTime+delay,o=context.createOscillator(),g=context.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);o.frequency.exponentialRampToValueAtTime(end,t+duration);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume,t+.015);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(master);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()}}
 function play(kind){if(!enabled||!context||context.state!=='running'||document.hidden)return;const t=context.currentTime;if(kind==='step'){if(t-lastStep<.3)return;lastStep=t;tone(130,65,.085,.16);tone(480,260,.055,.018,'triangle')}else if(kind==='door'){tone(180,265,.38,.075,'triangle');tone(520,330,.16,.035,'sine',.22)}else if(kind==='review'){tone(660,660,.23,.075);tone(880,880,.32,.055,'sine',.09)}counts[kind]++;}
 button.addEventListener('click',()=>{enabled=!enabled;unlock();if(master)master.gain.setTargetAtTime(enabled?.22:0,context.currentTime,.015);try{localStorage.setItem('hwangdongtae-sound',enabled?'on':'off')}catch{}label()});
 document.addEventListener('visibilitychange',()=>{if(master)master.gain.setTargetAtTime(enabled&&!document.hidden?.22:0,context.currentTime,.015)});
 label();return{unlock,play,getState:()=>({enabled,state:context?.state||'not-started',counts:{...counts}})};
})();
