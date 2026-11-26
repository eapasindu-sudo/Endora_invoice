/* Particles drawn over the whole page, one kind per theme. */
(function(){
var K={
 monsoon:{n:70,c:'rgba(210,162,76,',t:'rain'},
 poruwa:{n:46,c:'rgba(240,190,90,',t:'ember'},
 jasmine:{n:22,c:'rgba(255,255,255,',t:'petal'},
 kandyan:{n:70,c:'rgba(255,214,140,',t:'star'},
 nelum:{n:20,c:'rgba(232,150,176,',t:'lotus'},
 blush:{n:46,c:'rgba(190,136,80,',t:'star'},
 mangalam:{n:34,c:'rgba(138,100,50,',t:'star'}
};
window.startFx=function(theme){
 var cfg=K[theme]||K.monsoon,cv=document.getElementById('fx');
 if(!cv||matchMedia('(prefers-reduced-motion:reduce)').matches)return;
 var x=cv.getContext('2d'),W=0,H=0,D=Math.min(2,window.devicePixelRatio||1),P=[],last=0,shoot=null,nextShoot=4000;
 function size(){W=innerWidth;H=innerHeight;cv.width=W*D;cv.height=H*D;cv.style.width=W+'px';cv.style.height=H+'px';x.setTransform(D,0,0,D,0,0)}
 size();addEventListener('resize',size);
 var r=Math.random;
 function mk(init){
  var p={x:r()*W,y:init?r()*H:-20,s:r(),ph:r()*6.28,rot:r()*6.28};
  if(cfg.t==='rain'){p.len=10+r()*22;p.v=520+r()*380;p.y=init?r()*H:-40}
  if(cfg.t==='ember'){p.y=init?r()*H:H+10;p.v=-(22+r()*50);p.r=.8+r()*2.4}
  if(cfg.t==='petal'){p.v=28+r()*40;p.r=7+r()*7}
  if(cfg.t==='star'){p.y=r()*H;p.r=.5+r()*1.5;p.v=.6+r()*2}
  if(cfg.t==='lotus'){p.v=20+r()*26;p.r=9+r()*8}
  return p}
 for(var i=0;i<cfg.n;i++)P.push(mk(true));
 function draw(t){
  requestAnimationFrame(draw);if(document.hidden)return;
  var dt=Math.min(.05,(t-last)/1000||0);last=t;x.clearRect(0,0,W,H);
  for(var i=0;i<P.length;i++){var p=P[i];
   if(cfg.t==='rain'){p.y+=p.v*dt;p.x-=p.v*dt*.12;if(p.y>H+30){P[i]=mk(false)}
    x.strokeStyle=cfg.c+(.12+p.s*.22)+')';x.lineWidth=1;x.beginPath();x.moveTo(p.x,p.y);x.lineTo(p.x+p.len*.12,p.y-p.len);x.stroke()}
   else if(cfg.t==='ember'){p.y+=p.v*dt;p.x+=Math.sin(t/900+p.ph)*14*dt;if(p.y<-10){P[i]=mk(false)}
    var a=(.35+.65*Math.abs(Math.sin(t/300+p.ph)))*Math.min(1,p.y/(H*.5)+.2);x.fillStyle=cfg.c+a+')';x.shadowColor='rgba(255,170,60,.9)';x.shadowBlur=10;x.beginPath();x.arc(p.x,p.y,p.r,0,6.28);x.fill();x.shadowBlur=0}
   else if(cfg.t==='petal'||cfg.t==='lotus'){p.y+=p.v*dt;p.x+=Math.sin(t/1400+p.ph)*26*dt;p.rot+=dt*(.6+p.s);if(p.y>H+20){P[i]=mk(false)}
    x.save();x.translate(p.x,p.y);x.rotate(p.rot);x.scale(1,.55+.45*Math.abs(Math.sin(t/1100+p.ph)));
    if(cfg.t==='petal'){x.fillStyle='rgba(255,253,245,.96)';x.strokeStyle='rgba(138,106,28,.35)';x.shadowColor='rgba(31,58,46,.25)';x.shadowBlur=5}
    else{x.fillStyle='rgba(238,160,186,.85)';x.strokeStyle='rgba(165,71,108,.4)';x.shadowColor='rgba(165,71,108,.25)';x.shadowBlur=5}
    x.beginPath();x.ellipse(0,0,p.r*.55,p.r,0,0,6.28);x.fill();x.lineWidth=.6;x.stroke();x.restore()}
   else if(cfg.t==='star'){var a2=.2+.8*Math.abs(Math.sin(t/(700/p.v)+p.ph));x.fillStyle=cfg.c+a2*.9+')';x.beginPath();x.arc(p.x,p.y,p.r,0,6.28);x.fill();
    if(p.r>1.2){x.strokeStyle=cfg.c+a2*.5+')';x.lineWidth=.6;x.beginPath();x.moveTo(p.x-p.r*3,p.y);x.lineTo(p.x+p.r*3,p.y);x.moveTo(p.x,p.y-p.r*3);x.lineTo(p.x,p.y+p.r*3);x.stroke()}}
  }
  if(cfg.t==='star'){nextShoot-=dt*1000;if(!shoot&&nextShoot<0){shoot={x:r()*W*.7+W*.3,y:r()*H*.3,l:0};nextShoot=5000+r()*6000}
   if(shoot){shoot.l+=dt*900;var g=x.createLinearGradient(shoot.x,shoot.y,shoot.x+120,shoot.y-60);var s=shoot.l;x.strokeStyle='rgba(255,230,170,'+Math.max(0,1-s/600)+')';x.lineWidth=1.4;x.beginPath();x.moveTo(shoot.x-s,shoot.y+s*.5);x.lineTo(shoot.x-s+Math.min(s,90),shoot.y+s*.5-Math.min(s,90)*.5);x.stroke();if(s>600)shoot=null}}
 }
 requestAnimationFrame(draw)};
})();
