'use strict';
// One population, a selective window, omitted routes, and a widening view.
// Particle counts are schematic; neither counts nor spatial distributions are data.
(()=>{
const cameraKeys=[[0,-.12,1],[6,.12,1],[12,.54,1],[18,.30,1],[24,.06,1.06],[30.5,0,1],[34,0,1],[38,.02,1],[46,-.08,1],[54,.12,1],[62,0,1],[70,.12,1],[78,-.14,1],[82,-.24,1],[90,-.36,.82]];
function cameraAt(t){let i=0;while(i<cameraKeys.length-2&&t>=cameraKeys[i+1][0])i++;let a=cameraKeys[i],b=cameraKeys[i+1],f=smo((t-a[0])/(b[0]-a[0]));return{yaw:mix(a[1],b[1],f),scale:mix(a[2],b[2],f),cy:405}}
function sample(q,scene,t){
 const id=scene.id,lane=q.k%12,kept=lane%4===1,group=Math.floor(lane/4);
 const flow=['window','gate','forks','traceback','paired','recover'].includes(id),direction=id==='traceback'?-1:1;
 const u=q.fixedU??(flow?(q.u+direction*t*.072+20)%1:q.u),v=q.v,w=q.w;
 let x=0,y=0,z=(w-.5)*90,alpha=1;
 switch(id){
 case 'spotlight':{
  if(kept){const column=group;let height=[290,410,330][column]*(.64+.36*smo(t/5));x=(column-1)*245+(v-.5)*55;y=250-u*height+Math.sin(u*9+t)*5;z=(w-.5)*90}
  else{x=(u-.5)*1500;y=230+(v-.5)*150+Math.sin(u*8+t*.2)*20;z=120+(w-.5)*120;alpha=.10+.06*Math.sin(u*8+t*.4)**2}
  break;
 }
 case 'window':{
  x=(u-.5)*1450;y=kept?(group-1)*75:(lane-5.5)*48;y+=Math.sin(u*Math.PI)*30+(v-.5)*16;z=(w-.5)*80;
  alpha=kept?1:(x>70?.035:.42);break;
 }
 case 'gate':{
  const before=(lane-5.5)*42,pass=smo((u-.42)/.25);x=-700+u*1400;y=mix(before,kept?(group-1)*75:270,pass);
  if(!kept&&u>.48){x=-28-400*smo((u-.48)/.52);z=100+u*100;alpha=1-.84*smo((u-.7)/.3)}
  y+=(v-.5)*14;break;
 }
 case 'forks':{
  x=-700+u*1400;y=mix(0,(lane-5.5)*45,smo(u))+(v-.5)*16;z=(w-.5)*100+Math.sin(u*Math.PI)*70;
  alpha=kept?1:1-.93*smo((u-.5)/.4);break;
 }
 case 'crop':{
  x=(u-.5)*1400;y=kept?(group-1)*75:(lane-5.5)*48;y+=Math.sin(u*Math.PI)*30+(v-.5)*16;
  alpha=kept?1:.06*(1-smo((t-24)/6));break;
 }
 case 'reveal':{
  const side=lane<6?-1:1;x=(u-.5)*1540;y=(side<0?-(215+(lane%6)*13+Math.sin(u*Math.PI)*8):190+(lane%6)*4+Math.sin(u*Math.PI)*6)+(v-.5)*8;z=(w-.5)*65;
  alpha=kept?.9:.15+.85*smo((t-30.5)/.55);break;
 }
 case 'evidence':{
  x=340+(u-.5)*470;y=(lane-5.5)*38+(v-.5)*15+Math.sin(u*Math.PI)*20;
  alpha=kept?1:.13+.48*smo((t-35)/2);z=(w-.5)*80;break;
 }
 case 'compare':{
  const panel=Math.floor(q.k/12)%2;x=(panel?365:-365)+(u-.5)*515;y=(lane-5.5)*36+(v-.5)*12;
  alpha=kept?1:panel?.08+.8*smo((t-39)/5):.04;break;
 }
 case 'rebuild':{
  x=(u-.5)*1340;y=kept?145-290*u+(v-.5)*32:(v-.5)*460;z=(w-.5)*170;
  const sweep=clamp((t-46)/6);alpha=kept?.95:.06+.82*smo((sweep-u)*9);y+=Math.sin(u*7+t*.24)*8;break;
 }
 case 'traceback':{
  x=-700+u*1400;y=mix((group-1)*185,(lane-5.5)*44,smo(u))+(v-.5)*15;
  z=Math.sin(u*Math.PI)*120+(w-.5)*65;alpha=kept?1:.62;break;
 }
 case 'paired':{
  x=-690+u*1380;y=(group-1)*170+(kept?-65:65)*smo((u-.3)/.5)+(v-.5)*13;
  z=(w-.5)*80;alpha=kept?1:.76;break;
 }
 case 'recover':{
  x=(u-.5)*1450;y=(lane-5.5)*44+Math.sin(u*6+lane)*12+(v-.5)*13;z=(w-.5)*150;
  const sweep=clamp((t-70)/7);alpha=kept?.8:.035+.88*smo((sweep-u)*10);if(q.k%17===0)alpha=.06;break;
 }
 case 'context':{
  x=(u-.5)*1490;y=(v-.5)*470;z=(w-.5)*340;y+=Math.sin(u*7+t*.17)*13;
  alpha=u>.85?.07:kept?.9:.60;break;
 }
 case 'whole':{
  x=(u-.5)*1700;y=170+(v-.5)*290+Math.sin(u*6+t*.12)*15;z=(w-.5)*280;
  alpha=u>.86?.035:kept?.8:.52+.17*Math.sin(u*5+t*.2)**2;break;
 }
 default:throw Error('Unknown survivorship scene: '+id);
 }
 return[x,y,z,alpha,kept?0:1];
}
function strokeWorld(points,t,color,width,opacity){line(points.map(p=>project(p,t)),cs[color],width,opacity)}
function rectangle(cx,cy,hw,hh,z,t,color,opacity){strokeWorld([[cx-hw,cy-hh,z],[cx+hw,cy-hh,z],[cx+hw,cy+hh,z],[cx-hw,cy+hh,z],[cx-hw,cy-hh,z]],t,color,1.35,opacity)}
function guides(t,scene,opacity){
 if(opacity<.01)return;const id=scene.id;
 // Long traces show where this population comes from and where it was removed.
 if(['window','gate','forks','reveal','evidence','compare','traceback','paired','recover'].includes(id)){
  const lanes=id==='compare'?24:12;
  for(let lane=0;lane<lanes;lane++){
   let path=[],visibility=0;for(let j=0;j<=64;j++){let p=sample({k:lane,u:j/64,fixedU:j/64,v:.5,w:.5},scene,t);path.push(p);visibility+=p[3]}
   strokeWorld(path,t,lane%4===1?0:1,lane%4===1?1.35:.85,opacity*.27*visibility/65);
   if(['window','gate','forks','traceback','paired','recover'].includes(id)){
    let p=sample({k:lane,u:(lane*.071)%1,v:.5,w:.5},scene,t),s=project(p,t);glow(s[0],s[1],lane%4===1?34:24,p[4],opacity*.50*p[3]);
   }
  }
 }
 if(id==='spotlight')for(let j=0;j<3;j++){let h=[290,410,330][j]*(.64+.36*smo(t/5));strokeWorld([[(j-1)*245,250,0],[(j-1)*245,250-h,0]],t,0,1.2,.38*opacity);let p=project([(j-1)*245,250-h,0],t);glow(p[0],p[1],72,0,.68*opacity)}
 if(id==='window')rectangle(380,15,315,130,-50,t,0,.56*opacity);
 if(id==='gate'){
  rectangle(0,0,8,300,0,t,1,.58*opacity);
  strokeWorld([[0,-310,-180],[0,310,-180],[0,310,180],[0,-310,180],[0,-310,-180]],t,1,1,.24*opacity);
  for(let j=-3;j<=3;j++)strokeWorld([[0,j*80,-180],[0,j*80,180]],t,1,.8,.16*opacity);
 }
 if(id==='crop'){let w=mix(690,300,smo((t-24)/5));rectangle(0,15,w,150,0,t,0,.58*opacity)}
 if(id==='reveal'){let f=smo((t-30.5)/.75);rectangle(0,15,mix(300,850,f),mix(150,325,f),0,t,1,.55*opacity)}
 if(id==='evidence')rectangle(340,0,265,245,0,t,1,.3*opacity);
 if(id==='compare'){rectangle(-365,0,285,248,0,t,0,.30*opacity);rectangle(365,0,285,248,0,t,1,.42*opacity)}
 if(id==='rebuild'){let x=-690+1380*clamp((t-46)/6);strokeWorld([[x,-245,0],[x,245,0]],t,1,1.25,.50*opacity)}
 if(id==='paired')for(let j=-1;j<=1;j++)strokeWorld([[-690,j*170,0],[-290,j*170,0]],t,0,2,.38*opacity);
 if(id==='recover'){let x=-740+1480*clamp((t-70)/7);strokeWorld([[x,-285,0],[x,285,0]],t,1,1.8,.58*opacity);for(let y=-220;y<=220;y+=110){let p=project([x,y,0],t);glow(p[0],p[1],48,1,.30*opacity)}}
 if(id==='context')rectangle(-250,0,290,225,-80,t,0,.43*opacity);
 if(id==='whole'){let f=smo((t-82)/7);rectangle(-100,170,mix(300,720,f),185,0,t,1,.36*opacity);strokeWorld([[620,15,0],[620,340,0]],t,1,.7,.18*opacity)}
}
window.PARTICLE_SCENE={sceneIds:["spotlight","window","gate","forks","crop","reveal","evidence","compare","rebuild","traceback","paired","recover","context","whole"],point:sample,camera:cameraAt,decorate(t,previous,current,f){if(previous.id!==current.id)guides(t,previous,1-f);guides(t,current,f)}};
})();
