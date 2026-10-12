'use strict';
// Shared appearance and deterministic morphing. Choreography belongs to scene.js.
const cv=document.querySelector('#art'),c=cv.getContext('2d'),W=1920,H=1080,TAU=Math.PI*2;
const clamp=x=>Math.min(1,Math.max(0,x)),smo=x=>{x=clamp(x);return x*x*(3-2*x)},mix=(a,b,t)=>a+(b-a)*t;
function rng(s){return()=>{s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
const rnd=rng(512891),N=20000;
const pts=Array.from({length:N},(_,k)=>({k,u:rnd(),v:rnd(),w:rnd(),a:rnd()*TAU,g:k%2,size:.65+rnd()*1.8}));
const stars=Array.from({length:260},()=>({x:rnd()*W,y:rnd()*850,z:rnd(),p:rnd()*TAU}));
const cols=[[255,145,88],[137,206,255]],cs=cols.map(a=>`rgb(${a.join(',')})`);
function sprite(col){let x=document.createElement('canvas');x.width=x.height=96;let g=x.getContext('2d'),gr=g.createRadialGradient(48,48,0,48,48,48);gr.addColorStop(0,'rgba(255,250,232,1)');gr.addColorStop(.055,'rgba('+col.join(',')+',.95)');gr.addColorStop(.20,'rgba('+col.join(',')+',.20)');gr.addColorStop(1,'rgba('+col.join(',')+',0)');g.fillStyle=gr;g.fillRect(0,0,96,96);return x}
const sprites=cols.map(sprite);
const noise=document.createElement('canvas');noise.width=480;noise.height=270;let nc=noise.getContext('2d'),ni=nc.createImageData(480,270);for(let i=0;i<ni.data.length;i+=4){let k=rnd()*21;ni.data[i]=ni.data[i+1]=ni.data[i+2]=k;ni.data[i+3]=255}nc.putImageData(ni,0,0);
const title=document.createElement('canvas');title.width=800;title.height=400;let tc=title.getContext('2d');tc.font='700 274px "Noto Serif CJK SC"';tc.textAlign='center';tc.fillStyle='white';tc.fillText(FILM_CONFIG.anchor,400,290);let ti=tc.getImageData(0,0,800,400),glyph=[];for(let y=0;y<400;y+=3)for(let x=0;x<800;x+=3)if(ti.data[(y*800+x)*4+3]>120)glyph.push([x-400,y-190]);
let camera={};
function project(p,t){const yaw=camera.yaw??.14*Math.sin(t*.14),push=camera.scale??1+.045*Math.sin(t*.16);let xx=p[0]*Math.cos(yaw)+p[2]*Math.sin(yaw),zz=-p[0]*Math.sin(yaw)+p[2]*Math.cos(yaw),sc=1120/(1120+zz);return[960+xx*sc*push,(camera.cy??445)+p[1]*sc*push,sc,zz]}
function line(points,col,width=1,alpha=.4){c.save();c.globalAlpha=alpha;c.strokeStyle=col;c.lineWidth=width;c.lineCap='round';c.beginPath();points.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));c.stroke();c.restore()}
function glow(x,y,r,g,a=.6){c.save();c.globalAlpha=a;c.drawImage(sprites[g],x-r,y-r,r*2,r*2);c.restore()}
function sceneState(t){
 const scenes=FILM_CONFIG.scenes,cover=scenes.find(s=>s.id===FILM_CONFIG.cover_scene)||scenes[0];
 if(t<0)return[cover,cover,1];let i=0;while(i<scenes.length-1&&scenes[i+1].start<=t)i++;
 const previous=i===0?cover:scenes[i-1],current=scenes[i];return[previous,current,previous.id===current.id?1:smo((t-current.start)/current.morph)];
}
function drawFilm(T){
 T=Math.min(93,Math.max(0,T));let t=T<3?(T-3)*.15:T-3;if(t>=30.4&&t<30.5)t=30.4;
 const theme=window.PARTICLE_SCENE;if(!theme||typeof theme.point!=='function'||!Array.isArray(theme.sceneIds))throw Error('Missing theme choreography: scene.js must define point and sceneIds');
 if(FILM_CONFIG.scenes.some(s=>!theme.sceneIds.includes(s.id)))throw Error('Story contains a scene not implemented by its theme module');
 camera=theme.camera?theme.camera(t):{};
 const [previous,current,f]=sceneState(t),coverGain=T<3?.32+.68*smo((T-2.4)/.6):1;
 c.globalCompositeOperation='source-over';c.globalAlpha=1;c.fillStyle='#070b13';c.fillRect(0,0,W,H);
 c.globalCompositeOperation='screen';glow(670+Math.sin(t*.1)*70,420,720,0,.09*coverGain);glow(1260,400,750,1,.11*coverGain);
 c.globalCompositeOperation='lighter';for(const s of stars){c.globalAlpha=(.06+s.z*.25+.06*Math.sin(t*.7+s.p))*coverGain;c.fillStyle='#99bbd4';c.fillRect((s.x+t*(s.z-.5)*2+W)%W,s.y,1+s.z,1+s.z)}c.globalAlpha=1;
 if(theme.decorate){c.save();theme.decorate(t,previous,current,f);c.restore()}
 for(const q of pts){
  const a=theme.point(q,previous,t),b=theme.point(q,current,t);let p=project(a.slice(0,3).map((x,l)=>mix(x,b[l],f)),t),vis=mix(a[3],b[3],f);
  if(current.kind==='anchor'&&window.GLYPH){let gp=window.GLYPH[(q.k*139)%window.GLYPH.length],fp=project(a,t);p=[mix(fp[0],gp[0],f),mix(fp[1],gp[1],f),mix(fp[2],1,f),0]}
  if(previous.kind==='anchor'&&current.kind!=='anchor'&&window.GLYPH){let gp=window.GLYPH[(q.k*139)%window.GLYPH.length],np=project(b,t);p=[mix(gp[0],np[0],f),mix(gp[1],np[1],f),mix(1,np[2],f),0]}
  const intensity=current.kind==='anchor'?.40+.50*Math.exp(-(t-30.5)*2):1;
  const bright=(.32+q.w*.68)*Math.pow(p[2],1.7)*intensity*vis*coverGain;if(bright<.005)continue;
  const col=f<.5?(a[4]??q.g):(b[4]??q.g);c.globalAlpha=Math.min(.92,bright);c.fillStyle=q.k%7===0?'#fff5e7':cs[col];let r=q.size*p[2]*(current.kind==='anchor'?.9:1);c.fillRect(p[0],p[1],r,r);if(q.k%43===0)glow(p[0],p[1],7*p[2],col,.16*bright);
 }
 c.globalAlpha=1;
 if(t>=30.5&&t<34){let d=t-30.5;glow(960,430,400,0,.32*Math.exp(-d*1.7));glow(980,430,440,1,.26*Math.exp(-d*1.7))}
 c.globalCompositeOperation='source-over';c.globalAlpha=.06;c.drawImage(noise,0,0,W,H);c.globalAlpha=1;
 const shade=c.createLinearGradient(0,785,0,1080);shade.addColorStop(0,'rgba(7,11,19,0)');shade.addColorStop(.60,'rgba(7,11,19,.96)');shade.addColorStop(1,'rgba(7,11,19,1)');c.fillStyle=shade;c.fillRect(0,785,W,295);
 if(t>=30.5&&t<30.65){c.fillStyle=`rgba(236,243,255,${.30*(1-smo((t-30.5)/.15))})`;c.fillRect(0,0,W,H)}
}
