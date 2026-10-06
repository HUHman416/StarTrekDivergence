import { AWAY_LAYOUT, AWAY_OBJECT_POSITIONS, AWAY_SITES, currentEra, deployedEquipment } from "./game.js";

// A self-contained 2.5D renderer: original procedural art, no network assets.
export function paintAway(canvas, state, live) {
  const a=state.away;if(!canvas || !a) return;
  const ctx=canvas.getContext("2d"), w=canvas.width, h=canvas.height,
    era=currentEra(state), gear=deployedEquipment(state), site=AWAY_SITES[state.sectors.find(s=>s.id===a.sectorId).site],
    fov=1.12, focal=w/(2*Math.tan(fov/2)), horizon=h*.46, column=3, depth=[];
  ctx.fillStyle="#070c17";ctx.fillRect(0,0,w,h);
  const floor=ctx.createLinearGradient(0,horizon,0,h);floor.addColorStop(0,"#060b12");floor.addColorStop(1,"#273344");
  ctx.fillStyle=floor;ctx.fillRect(0,horizon,w,h);
  ctx.strokeStyle="#50647b33";ctx.lineWidth=1;
  for(let i=-8;i<=8;i++) {ctx.beginPath();ctx.moveTo(w/2+i*24,horizon);ctx.lineTo(w/2+i*170,h);ctx.stroke();}
  for(let i=1;i<=8;i++) {const y=horizon+(h-horizon)*Math.pow(i/8,2);ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  // Per-column projection and a depth buffer also occlude actors and objectives.
  for(let x=0;x<w;x+=column) {
    const ray=a.angle+Math.atan((x-w/2)/focal), dx=Math.cos(ray),dy=Math.sin(ray);
    let d=.02;while(d<15 && AWAY_LAYOUT[Math.floor(a.py+dy*d)]?.[Math.floor(a.px+dx*d)]===".")d+=.025;
    const z=d*Math.cos(ray-a.angle), wh=Math.min(h*5,focal/Math.max(.06,z)),top=horizon-wh*.5,
      hx=a.px+dx*d,hy=a.py+dy*d,ux=Math.abs(hx-Math.round(hx)),uy=Math.abs(hy-Math.round(hy)),
      u=(ux<uy?hy:hx)%1, shade=Math.max(.14,1-d*.095);
    depth[Math.floor(x/column)]=z;
    ctx.fillStyle=ux<uy?"#394557":"#4b596b";ctx.fillRect(x,top,column+1,wh);
    if(u<.045||u>.96){ctx.fillStyle="#0c1521";ctx.fillRect(x,top,column+1,wh);}
    ctx.fillStyle=era.color;ctx.fillRect(x,top+wh*.11,column+1,wh*.023);ctx.fillRect(x,top+wh*.8,column+1,wh*.012);
    if(u>.18&&u<.8) {
      ctx.fillStyle="#152131";ctx.fillRect(x,top+wh*.31,column+1,wh*.34);
      ctx.fillStyle=site.color;ctx.fillRect(x,top+wh*.37,column+1,wh*.016);
      if(u<.49) {ctx.fillStyle="#9ac6da";ctx.fillRect(x,top+wh*.43,column+1,wh*.012);}
    }
    ctx.fillStyle=`rgba(0,3,10,${1-shade})`;ctx.fillRect(x,top,column+1,wh);
    ctx.fillStyle="#d8eeff";ctx.globalAlpha=shade*.8;ctx.fillRect(x,top,column+1,Math.max(1,wh*.018));ctx.globalAlpha=1;
  }
  const sprites=[...AWAY_OBJECT_POSITIONS.filter((_,i)=>!a.resolved.includes(i)).map(p=>({x:p.x+.5,y:p.y+.5,type:"console",label:AWAY_OBJECT_POSITIONS.indexOf(p)+1})),
    ...a.enemies.filter(e=>e.hp>0).map(e=>({...e,type:e.kind}))];
  for(const p of sprites.sort((l,r)=>Math.hypot(r.x-a.px,r.y-a.py)-Math.hypot(l.x-a.px,l.y-a.py))) {
    const dx=p.x-a.px,dy=p.y-a.py, z=dx*Math.cos(a.angle)+dy*Math.sin(a.angle);
    if(z<.12)continue;
    const sx=w/2+(-dx*Math.sin(a.angle)+dy*Math.cos(a.angle))*focal/z,size=Math.min(h*2,focal/z),left=sx-size*.3;
    if(sx+size<0||sx-size>w)continue;
    ctx.save();ctx.beginPath();
    for(let x=Math.max(0,Math.floor(left/column)*column);x<Math.min(w,sx+size*.35);x+=column)
      if(z<(depth[Math.floor(x/column)]||0)+.05)ctx.rect(x,0,column+1,h);
    ctx.clip();ctx.translate(sx,horizon+size*.45);ctx.scale(size/100,size/100);
    if(p.type==="console") {
      ctx.fillStyle="#0e1926";ctx.strokeStyle=site.color;ctx.lineWidth=1.5;
      ctx.beginPath();ctx.moveTo(-24,0);ctx.lineTo(-24,-62);ctx.lineTo(0,-76);ctx.lineTo(24,-62);ctx.lineTo(24,0);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle=site.color;ctx.fillRect(-19,-57,38,24);ctx.fillStyle="#06101d";ctx.font="bold 18px monospace";ctx.textAlign="center";ctx.fillText(p.label,0,-38);
      ctx.strokeStyle="#91abb9";for(let y=-20;y<0;y+=6){ctx.beginPath();ctx.moveTo(-16,y);ctx.lineTo(16,y);ctx.stroke();}
    } else if(p.type==="drone") {
      ctx.translate(0,-12+Math.sin(a.elapsed*2)*2);ctx.fillStyle="#35475d";ctx.strokeStyle="#9eafc4";ctx.lineWidth=2;
      ctx.beginPath();ctx.moveTo(-27,-49);ctx.lineTo(-14,-67);ctx.lineTo(14,-67);ctx.lineTo(27,-49);ctx.lineTo(17,-28);ctx.lineTo(-17,-28);ctx.closePath();ctx.fill();ctx.stroke();
      ctx.fillStyle="#fc657a";ctx.fillRect(-14,-55,28,7);ctx.fillStyle="#192432";ctx.fillRect(-33,-45,12,19);ctx.fillRect(21,-45,12,19);
      ctx.fillStyle="#9bdfff";ctx.fillRect(-16,-26,8,8);ctx.fillRect(8,-26,8,8);
    } else {
      ctx.fillStyle="#202939";ctx.fillRect(-14,-38,11,38);ctx.fillRect(3,-38,11,38);
      ctx.fillStyle="#ad7457";ctx.fillRect(-17,-68,34,34);ctx.fillStyle="#e3b791";ctx.beginPath();ctx.arc(0,-79,10,0,Math.PI*2);ctx.fill();
      ctx.fillStyle="#2b384b";ctx.fillRect(-11,-86,23,10);ctx.fillRect(-25,-57,18,7);ctx.fillRect(7,-57,18,7);ctx.fillStyle="#ed879b";ctx.fillRect(-17,-57,34,4);
    }
    if(p.type!=="console"){ctx.fillStyle="#141823";ctx.fillRect(-25,-100,50,4);ctx.fillStyle="#fc899d";ctx.fillRect(-25,-100,50*p.hp/(p.kind==="drone"?66:55),4);}
    ctx.restore();
  }
  // Distinct era silhouettes; deliberately original art until licensed models are admitted.
  const bob=live?Math.sin(a.elapsed*3)*2:0,recoil=a.flash>0?8:0;
  ctx.save();ctx.translate(w*.64,h+bob+recoil);ctx.scale(w/900,w/900);
  const modern=["refit","nextgen"].includes(gear.id);
  ctx.fillStyle="#1a2537";ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(17,-89);ctx.lineTo(80,-97);ctx.lineTo(147,0);ctx.closePath();ctx.fill();
  ctx.fillStyle="#8796a7";ctx.strokeStyle="#c6d7e4";ctx.lineWidth=2;
  ctx.beginPath();ctx.moveTo(-58,-77);ctx.lineTo(modern?-72:-36,modern?-146:-165);ctx.lineTo(modern?16:4,-209);ctx.lineTo(modern?82:41,-179);ctx.lineTo(109,-84);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle=gear.id==="constitution"?"#303b49":"#354258";ctx.beginPath();ctx.moveTo(-36,-160);ctx.lineTo(7,-204);ctx.lineTo(43,-172);ctx.lineTo(71,-104);ctx.lineTo(-18,-105);ctx.closePath();ctx.fill();
  ctx.fillStyle=gear.color;ctx.fillRect(-17,-139,49,7);ctx.fillStyle="#101b2a";ctx.fillRect(0,-199,25,14);
  ctx.fillStyle=a.mode==="stun"?"#8fdbff":"#ffae63";ctx.fillRect(1,-196,22,5);
  if(gear.id==="nextgen"){ctx.fillStyle="#ced8df";ctx.fillRect(-21,-121,11,6);ctx.fillRect(1,-121,11,6);}
  ctx.restore();
  if(a.flash>0) {
    ctx.strokeStyle=a.mode==="stun"?"#80d7ff":"#ff984b";ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(w*.65,h-w/900*194);ctx.lineTo(w/2,horizon);ctx.stroke();
    ctx.strokeStyle="#fff";ctx.lineWidth=2;ctx.stroke();
  }
  ctx.strokeStyle="#d9f5ff";ctx.lineWidth=1.5;
  ctx.beginPath();ctx.moveTo(w/2-12,horizon);ctx.lineTo(w/2-4,horizon);ctx.moveTo(w/2+4,horizon);ctx.lineTo(w/2+12,horizon);ctx.moveTo(w/2,horizon-12);ctx.lineTo(w/2,horizon-4);ctx.moveTo(w/2,horizon+4);ctx.lineTo(w/2,horizon+12);ctx.stroke();
  if(a.hurt){ctx.fillStyle="#ff234429";ctx.fillRect(0,0,w,h);}
  ctx.fillStyle="#06111cd9";ctx.fillRect(0,0,w,38);ctx.fillRect(0,h-39,w,39);
  ctx.font="13px monospace";ctx.fillStyle=era.color;ctx.fillText(`${site.title.toUpperCase()} // ${live?"LIVE":"PAUSED"}`,18,25);
  ctx.fillStyle="#e3eef9";ctx.fillText(`${gear.weapon.toUpperCase()} · ${a.mode.toUpperCase()}`,18,h-15);
  ctx.textAlign="right";ctx.fillText(`${a.resolved.length}/3 OBJECTIVES · ${a.enemies.filter(e=>e.hp>0).length} HOSTILES`,w-18,h-15);ctx.textAlign="left";
  if(!live || a.health<=0){ctx.fillStyle="#07101dbb";ctx.fillRect(w*.12,h*.34,w*.76,82);ctx.textAlign="center";ctx.fillStyle="#f1f6ff";ctx.font="bold 22px sans-serif";ctx.fillText(a.health<=0?"EMERGENCY EVACUATION READY":"AWAY TEAM STANDING BY",w/2,h*.34+33);ctx.font="14px sans-serif";ctx.fillText(a.health<=0?"Recall the team for treatment":"Begin mission for live combat · Step controls remain available",w/2,h*.34+59);ctx.textAlign="left";}
}
