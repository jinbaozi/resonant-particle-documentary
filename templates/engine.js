'use strict';
const cv=document.querySelector('#art'),c=cv.getContext('2d'),W=1920,H=1080,TAU=Math.PI*2;
const clamp=x=>Math.min(1,Math.max(0,x)),smo=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rnd=rng(512891),N=20000;
const pts=Array.from({length:N},(_,k)=>({k,u:rnd(),v:rnd(),w:rnd(),a:rnd()*TAU,g:k%2,size:.65+rnd()*1.8}));
const stars=Array.from({length:260},()=>({x:rnd()*W,y:rnd()*850,z:rnd(),p:rnd()*TAU}));
const palette=0;
const palettes=[[[255,145,88],[137,206,255]],[[255,91,166],[82,238,218]],[[255,201,100],[181,154,255]]];
function rgb(a){return `rgb(${a.join(',')})`}
function sprite(col){let x=document.createElement('canvas');x.width=x.height=96;let g=x.getContext('2d'),gr=g.createRadialGradient(48,48,0,48,48,48);gr.addColorStop(0,'rgba(255,250,232,1)');gr.addColorStop(.055,'rgba('+col.join(',')+',.95)');gr.addColorStop(.20,'rgba('+col.join(',')+',.20)');gr.addColorStop(1,'rgba('+col.join(',')+',0)');g.fillStyle=gr;g.fillRect(0,0,96,96);return x}
const sprites=palettes.map(p=>p.map(sprite));
const noise=document.createElement('canvas');noise.width=480;noise.height=270;let nc=noise.getContext('2d'),ni=nc.createImageData(480,270);for(let i=0;i<ni.data.length;i+=4){let k=rnd()*21;ni.data[i]=ni.data[i+1]=ni.data[i+2]=k;ni.data[i+3]=255}nc.putImageData(ni,0,0);
const title=document.createElement('canvas');title.width=800;title.height=400;let tc=title.getContext('2d');tc.font='700 274px "Noto Serif CJK SC"';tc.textAlign='center';tc.fillStyle='white';tc.fillText(FILM_CONFIG.anchor,400,290);let ti=tc.getImageData(0,0,800,400),glyph=[];for(let y=0;y<400;y+=3)for(let x=0;x<800;x+=3)if(ti.data[(y*800+x)*4+3]>120)glyph.push([x-400,y-190]);
const starts=[0,3,6,9,12,15,18,21,24,27,30.5,34,38,42,46,50,54,58,62,66,70,74,78,82,86];
const modes=['vortex','vortex','message','duality','tide','flock','city','helix','gap','orbit','title','research','interests','city','selection','branches','book','meeting','send','reply','different','listen','parallel','ending','ending'];
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
function state(t){let i=0;while(i<starts.length-1&&starts[i+1]<=t)i++;if(t>=30&&t<30.5)i=9;let prev=Math.max(0,i-1),dur=i===10?.65:1.05;let f=i===0||modes[prev]===modes[i]?1:smo((t-starts[i])/dur);return[modes[prev],modes[i],f,i]}
function project(p,t){let yaw=.14*Math.sin(t*.14),xx=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),zz=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw),sc=1120/(1120+zz),push=1+.045*Math.sin(t*.16);return[960+xx*sc*push,445+p[1]*sc*push,sc,zz]}
function line(points,col,width=1,alpha=.4){c.save();c.globalAlpha=alpha;c.strokeStyle=col;c.lineWidth=width;c.lineCap='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.restore()}
function glow(x,y,r,g,a=.6){c.save();c.globalAlpha=a;c.drawImage(sprites[palette][g],x-r,y-r,r*2,r*2);c.restore()}
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
function drawFilm(T){T=Math.min(93,Math.max(0,T));let t=T<3?(T-3)*.15:T-3;if(t>=30.4&&t<30.5)t=30.4;const cols=palettes[0],cs=cols.map(rgb),coverGain=T<3?.32+.68*smo((T-2.4)/.6):1;
c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#070b13';c.fillRect(0,0,W,H);c.globalCompositeOperation='screen';glow(670+Math.sin(t*.1)*70,420,720,0,.09*coverGain);glow(1260,400,750,1,.11*coverGain);
c.globalCompositeOperation='lighter';for(const s of stars){c.globalAlpha=(.06+s.z*.25+.06*Math.sin(t*.7+s.p))*coverGain;c.fillStyle='#99bbd4';c.fillRect((s.x+t*(s.z-.5)*2+W)%W,s.y,1+s.z,1+s.z)}c.globalAlpha=1;
const [m0,m1,f,idx]=state(Math.max(0,t));let intensity=m1==='title'?.40+.50*Math.exp(-(t-30.5)*2):1;
if(!['title','research','interests','selection','message','branches'].includes(m1)){for(let j=0;j<22;j++){let arr=[];for(let k=0;k<=95;k++){let q={k:j,u:k/95,v:j/21,w:.5,a:k/95*TAU,g:j%2};let a=point(q,m0,t),b=point(q,m1,t);arr.push(project(a.slice(0,3).map((x,l)=>mix(x,b[l],f)),t))}line(arr,cs[j%2],j%7===0?1:.45,(j%7===0?.16:.05)*coverGain)}}
for(const q of pts){let a=point(q,m0,t),b=point(q,m1,t);let p=project(a.slice(0,3).map((x,l)=>mix(x,b[l],f)),t),vis=mix(a[3],b[3],f);
if(m1==='title'&&window.GLYPH){let gp=window.GLYPH[(q.k*139)%window.GLYPH.length],fp=project(point(q,m0,t),t);p=[mix(fp[0],gp[0],f),mix(fp[1],gp[1],f),mix(fp[2],1,f),mix(fp[3],0,f)]}
if(m0==='title'&&m1!=='title'&&window.GLYPH){let gp=window.GLYPH[(q.k*139)%window.GLYPH.length],np=project(b,t);p=[mix(gp[0],np[0],f),mix(gp[1],np[1],f),mix(1,np[2],f),mix(0,np[3],f)]}
let bright=(.32+q.w*.68)*Math.pow(p[2],1.7)*intensity*vis*coverGain;if(bright<.005)continue;let col=['helix','duality','send','reply','different','listen','parallel','gap','book'].includes(m1)?q.g:(Math.sin(q.a+q.u*3)>0?0:1);c.globalAlpha=Math.min(.92,bright);c.fillStyle=q.k%7===0?'#fff5e7':cs[col];let r=q.size*p[2]*(m1==='title'?.9:1);c.fillRect(p[0],p[1],r,r);if(q.k%43===0)glow(p[0],p[1],7*p[2],col,.16*bright)}c.globalAlpha=1;
if(m1!=='title'&&m1!=='research'&&m1!=='interests'){for(let g=0;g<2;g++){let a=actor(m0,t,g),b=actor(m1,t,g),p=[mix(a[0],b[0],f),mix(a[1],b[1],f)];glow(p[0],p[1],m1==='ending'?68:100,g,.72*coverGain);let tail=[];for(let j=0;j<34;j++){let a1=actor(m0,t-j*.007,g),b1=actor(m1,t-j*.007,g);tail.push([mix(a1[0],b1[0],f),mix(a1[1],b1[1],f)])}line(tail,cs[g],1.4,.7*coverGain)}}
if(t>=30.5&&t<34){let d=t-30.5;glow(960,430,400,0,.32*Math.exp(-d*1.7));glow(980,430,440,1,.26*Math.exp(-d*1.7));let r=220+650*(1-Math.exp(-d*2.2));for(let g=0;g<2;g++){let pp=[];for(let k=0;k<=220;k++){let a=k/220*TAU;pp.push([960+Math.cos(a)*(r+g*12),445+Math.sin(a)*(r+g*12)*.6])}line(pp,cs[g],g?1:2,.6*Math.exp(-d*1.6))}}
c.globalCompositeOperation='source-over';c.globalAlpha=.06;c.drawImage(noise,0,0,W,H);c.globalAlpha=1;let shade=c.createLinearGradient(0,785,0,1080);shade.addColorStop(0,'rgba(7,11,19,0)');shade.addColorStop(.60,'rgba(7,11,19,.96)');shade.addColorStop(1,'rgba(7,11,19,1)');c.fillStyle=shade;c.fillRect(0,785,W,295);if(t>=30.5&&t<30.65){c.fillStyle=`rgba(236,243,255,${.30*(1-smo((t-30.5)/.15))})`;c.fillRect(0,0,W,H)}
}
