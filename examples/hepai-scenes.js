'use strict';
// Original Hepai choreography; used only when explicitly selected by its story.
(()=>{
function node(n,offset=0){let g=n%3,k=Math.floor(n/3),a=k*2.399963,r=35+Math.sqrt(k/30)*150;return[(g-1)*280+offset+Math.cos(a)*r,Math.sin(a)*r*.9,Math.sin(k)*50]}
function point(q,mode,t){let x=0,y=0,z=0,vis=1;const u=q.u,v=q.v,w=q.w,g=q.g,a=q.a;
switch(mode){
case 'vortex':{let r=25+Math.pow(u,.66)*720,an=(q.k%3)*TAU/3+r*.009+t*.21+(v-.5)*(.30+.6*u);x=Math.cos(an)*r;y=Math.sin(an)*r*.64+(v-.5)*35;z=(w-.5)*210+Math.sin(an*2+t*.2)*60;break}
case 'message':{let row=Math.floor(v*5),f=smo((t-6)/1.15)*(1-smo((t-7.55)/1.25));x=-550+u*1100;y=-180+row*78+Math.sin(u*15+row)*5;z=(w-.5)*24;vis=u<f?1:.035;if(q.k%5===0){let side=q.k%4;if(side<2){x=-635+u*1270;y=side?230:-265}else{x=side===2?-635:635;y=-265+u*495}vis=.42}break}
case 'duality':{let rr=155+(v-.5)*55,an=a+t*.25+g*.8;x=(g?390:-390)+Math.cos(an)*rr;y=Math.sin(an)*rr*.60;z=Math.sin(an)*100+(w-.5)*45;break}
case 'tide':{x=(u-.5)*1700;y=70+(v-.5)*240+Math.sin(u*TAU*1.3-t*.32+v*1.3)*68;z=(w-.5)*230;break}
case 'flock':{let band=q.k%3;x=(u-.5)*1500;y=(band-1)*145+Math.sin(u*5+t*.21+g)*75;z=(v-.5)*260;y+=(w-.5)*20;x+=g*60;break}
case 'city':{let col=Math.floor(v*9)-4;let lane=q.k%2;x=lane?(u-.5)*1400:col*150;y=lane?col*72:(u-.5)*650;z=-y*.32;y=y*.62+x*.14;x+=(w-.5)*5;y+=(w-.5)*4;break}
case 'helix':{let ph=u*TAU*2.4-t*.88+g*Math.PI,rr=155+(v-.5)*68;x=(u-.5)*1350;y=Math.sin(ph)*rr+x*.10;z=Math.cos(ph)*rr+(w-.5)*45;break}
case 'gap':{x=g?130+u*610:-740+u*610;y=(g?80:-80)+Math.sin(u*TAU+t*.28)*45+(v-.5)*100;z=(w-.5)*170;break}
case 'orbit':{let an=a+t*.33,rr=290+(v-.5)*80+Math.sin(an*3+t*.5)*10;x=Math.cos(an)*rr*1.4;y=Math.sin(an)*rr*.78;z=Math.sin(an)*90+(w-.5)*80;break}
case 'title':{let pp=glyph[(q.k*139)%glyph.length];x=pp[0];y=pp[1];z=(u-.5)*30;break}
case 'research':case 'interests':{let offset=mode==='research'?340:0,scale=mode==='research'?.68:1.5;let n=q.k%90,p=node(n,offset),p2=node((n+9)%90,offset);if(q.k%4===0){x=mix(p[0],p2[0],u);y=mix(p[1],p2[1],u);z=mix(p[2],p2[2],u);vis=.22*smo((t-(mode==='research'?34:38)-.4)*1.4)}else{let rr=Math.sqrt(u)*8;x=p[0]+Math.cos(a)*rr;y=p[1]+Math.sin(a)*rr;z=p[2]+(w-.5)*16}x=(x-offset)*scale+offset;y*=scale;break}
case 'selection':{x=(u-.5)*1550;y=(v-.5)*590;z=(w-.5)*250;let rr=Math.hypot(x,y*1.3),radius=420-110*smo((t-46)/3);vis=rr<radius?1:.09;break}
case 'branches':{let branch=q.k%9,an=(branch-4)*.33;x=Math.sin(an)*u*800;y=210-u*450+Math.sin(u*6+branch)*18;z=(v-.5)*65;x+=(w-.5)*6;vis=.18+.8*smo((t-50)/3-u*.2);break}
case 'book':{x=(u-.5)*920;let row=Math.floor(v*24)/23;y=(row-.5)*310-65*Math.sin(Math.abs(x)/460*Math.PI);z=Math.abs(x)*.1+(w-.5)*16;y+=(w-.5)*3;if(q.k%5===0){x=g?460:-460;y=(u-.5)*315;z=45}vis=smo((t-54)*1.2-u*.5);break}
case 'meeting':{let rr=210+(v-.5)*40;x=(g?145:-145)+Math.cos(a+t*.22)*rr;y=Math.sin(a+t*.22)*rr*.65;z=Math.sin(a+t*.22)*100+(w-.5)*25;break}
case 'send':{let f=smo((t-62)/3.4);x=-650+u*1300;y=-35+Math.sin(u*TAU*1.3)*35+(v-.5)*13;z=(w-.5)*40;vis=g?(q.k%10===1?.15:0):(u<=f?1:.025);if(g){x=650+Math.cos(a)*u*15;y=-35+Math.sin(a)*u*15;z=(w-.5)*20}break}
case 'reply':case 'different':case 'listen':{let freq=mode==='different'?(g?1.8:1.2):1.3;x=(u-.5)*1300;y=(g?65:-65)+Math.sin(u*TAU*freq+t*.11+g*.35)*34+(v-.5)*12;z=(w-.5)*50;let f=mode==='reply'?smo((t-66)/3.3):mode==='listen'?smo((t-74)/3.3):1;vis=g?(1-u<=f?1:.025):.65;break}
case 'parallel':{x=(u-.5)*1560;y=(g?120:-120)+Math.sin(u*TAU*(g?1.3:1.6)+t*.1)*45+(v-.5)*13;z=(w-.5)*60;break}
case 'ending':{let rr=330+(v-.5)*45,an=a+t*.12;x=Math.cos(an)*rr*1.7;y=Math.sin(an)*rr*.72+40;z=Math.sin(an)*60+(w-.5)*50;vis=.38;break}
}return[x,y,z,vis]}
function actor(mode,t,g){let x,y,z=0;
if(mode==='vortex'){let an=t*.24+g*Math.PI;x=Math.cos(an)*360;y=Math.sin(an)*360*.64}
else if(mode==='orbit'){let f=smo((t-27)/3),an=t*.45+g*Math.PI*(1-f);x=Math.cos(an)*420;y=Math.sin(an)*235;z=Math.sin(an)*90}
else if(mode==='gap'){x=g?200:-200;y=g?80:-80}
else if(mode==='message'){let f=smo((t-6)/1.15)*(1-smo((t-7.55)/1.25));x=g?635:-550+1100*f;y=g?230:132}
else if(mode==='send'){x=g?650:-650+1300*smo((t-62)/3.4);y=-35+Math.sin((x+650)/1300*TAU*1.3)*35}
else if(mode==='reply'||mode==='listen'){let f=smo((t-(mode==='reply'?66:74))/3.3);x=g?650-1300*f:-650;y=(g?65:-65)+Math.sin((x+650)/1300*TAU*1.3+t*.11+g*.35)*34}
else if(mode==='ending'){let f=smo((t-82)/6);x=g?mix(400,75,f):mix(-400,-75,f);y=230+(g?6:-6)}
else{let q={k:g,u:.46+.17*Math.sin(t*.37+g*.6),v:.5,w:.5,a:t*.45+g*Math.PI,g};let p=point(q,mode,t);[x,y,z]=p}
return project([x,y,z],t)}

const grouped=['helix','duality','send','reply','different','listen','parallel','gap','book'];
window.PARTICLE_SCENE={sceneIds:["vortex","message","duality","tide","flock","city","helix","gap","orbit","title","research","interests","selection","branches","book","meeting","send","reply","different","listen","parallel","ending"],
 point(q,scene,t){let p=point(q,scene.id,t);p[4]=grouped.includes(scene.id)?q.g:(Math.sin(q.a+q.u*3)>0?0:1);return p},
 decorate(t,previous,current,f){
  const m0=previous.id,m1=current.id;
  if(!['title','research','interests','selection','message','branches'].includes(m1)){
   for(let j=0;j<22;j++){let arr=[];for(let k=0;k<=95;k++){let q={k:j,u:k/95,v:j/21,w:.5,a:k/95*TAU,g:j%2};let a=point(q,m0,t),b=point(q,m1,t);arr.push(project(a.slice(0,3).map((x,l)=>mix(x,b[l],f)),t))}line(arr,cs[j%2],j%7===0?1:.45,j%7===0?.16:.05)}
  }
  if(!['title','research','interests'].includes(m1))for(let g=0;g<2;g++){
   let a=actor(m0,t,g),b=actor(m1,t,g),p=[mix(a[0],b[0],f),mix(a[1],b[1],f)];glow(p[0],p[1],m1==='ending'?68:100,g,.72);
   let tail=[];for(let j=0;j<34;j++){let a1=actor(m0,t-j*.007,g),b1=actor(m1,t-j*.007,g);tail.push([mix(a1[0],b1[0],f),mix(a1[1],b1[1],f)])}line(tail,cs[g],1.4,.7);
  }
  if(t>=30.5&&t<34){let d=t-30.5,r=220+650*(1-Math.exp(-d*2.2));for(let g=0;g<2;g++){let pp=[];for(let k=0;k<=220;k++){let a=k/220*TAU;pp.push([960+Math.cos(a)*(r+g*12),445+Math.sin(a)*(r+g*12)*.6])}line(pp,cs[g],g?1:2,.6*Math.exp(-d*1.6))}}
 }
};
})();
