"use client";

import { useEffect, useRef } from "react";
import styles from "./invitation.module.css";

type Particle = { x: number; y: number; z: number; px: number; py: number; pz: number; ox: number; oy: number; oz: number; release: number; mass: number };
type Link = { a: number; b: number; length: number; stiffness: number };
type Vertex = { x: number; y: number; light: number };

/** A soft 3D membrane rendered over live backdrop blur, without a fabric texture. */
export default function FallingGlass({ opening, onComplete }: { opening: boolean; onComplete: () => void }) {
  const glass = useRef<HTMLDivElement>(null);
  const folds = useRef<HTMLCanvasElement>(null);
  const edge = useRef<SVGPathElement>(null);
  const complete = useRef(onComplete);
  complete.current = onComplete;

  useEffect(() => {
    if (!opening || !glass.current) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    if (reduced.matches) {
      glass.current.style.opacity = "0";
      const timer = setTimeout(() => complete.current(), 160);
      return () => clearTimeout(timer);
    }
    const surface = glass.current, canvas = folds.current;
    const ctx = canvas?.getContext("2d", { alpha: true });
    if (!canvas || !ctx) { complete.current(); return; }
    let width = surface.clientWidth, height = surface.clientHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.ceil(width * dpr); canvas.height = Math.ceil(height * dpr);
    const columns = 22, rows = 16, stride = columns + 1;
    const id = (x: number, y: number) => y * stride + x;
    const randoms = crypto.getRandomValues(new Uint32Array(32));
    const random = (i: number) => randoms[i % randoms.length] / 4294967295;
    const phases = Array.from({ length: 6 }, (_, i) => random(i) * Math.PI * 2);
    // Smooth, non-repeating diagonal disturbances seed folds in several axes.
    const field = (u: number, v: number, time: number) =>
      Math.sin(u*8.3+v*4.7+phases[0]+time*2.1)*.48 +
      Math.sin(u*3.6-v*10.2+phases[1]-time*1.4)*.32 +
      Math.sin(u*13.1+v*7.2+phases[2]+time*.7)*.2;
    const points: Particle[] = [];
    for (let y = 0; y <= rows; y++) for (let x = 0; x <= columns; x++) {
      const u = x/columns, v = y/rows;
      const ox = -8 + u*(width+16), oy = -4 + v*(height*1.12+8);
      const oz = field(u,v,0)*height*.012;
      points.push({x:ox,y:oy,z:oz,px:ox,py:oy,pz:oz,ox,oy,oz,
        release:y===0 ? .035+random(x+6)*.31 : 0,
        mass: .9 + .2*Math.sin(u*5+v*7+phases[3])});
    }
    const links: Link[] = [];
    const connect = (a: number, b: number, stiffness: number) => {
      const p=points[a],q=points[b];
      links.push({a,b,length:Math.hypot(q.x-p.x,q.y-p.y,q.z-p.z),stiffness});
    };
    for(let y=0;y<=rows;y++)for(let x=0;x<=columns;x++){
      if(x<columns)connect(id(x,y),id(x+1,y),.95);
      if(y<rows)connect(id(x,y),id(x,y+1),.95);
      if(x<columns&&y<rows){connect(id(x,y),id(x+1,y+1),.3);connect(id(x+1,y),id(x,y+1),.3);}
      if(x<columns-1)connect(id(x,y),id(x+2,y),.08);
      if(y<rows-1)connect(id(x,y),id(x,y+2),.08);
    }
    const triangles: [number,number,number][]=[];
    for(let y=0;y<rows;y++)for(let x=0;x<columns;x++){
      triangles.push([id(x,y),id(x+1,y),id(x,y+1)],[id(x+1,y+1),id(x,y+1),id(x+1,y)]);
    }
    let raf=0,finished=false,simulation=0,previous=performance.now(),accumulator=0;
    const finish=()=>{if(!finished){finished=true;complete.current();}};
    const timeout=setTimeout(finish,2000);
    const dt=1/90;
    const step=()=>{
      simulation+=dt;
      points.forEach((p,i)=>{
        if(simulation<p.release){p.x=p.px=p.ox;p.y=p.py=p.oy;p.z=p.pz=p.oz;return;}
        const u=(i%stride)/columns,v=Math.floor(i/stride)/rows;
        const x=p.x,y=p.y,z=p.z;
        const pressure=field(u,v,simulation);
        p.x+=(p.x-p.px)*.992+Math.sin(v*6+simulation*3+phases[4])*width*.08*dt*dt;
        p.y+=(p.y-p.py)*.992+height*3.3*p.mass*dt*dt;
        p.z+=(p.z-p.pz)*.984+pressure*height*1.8*dt*dt;
        p.px=x;p.py=y;p.pz=z;
      });
      // Structural links resist stretching; soft shear/bending links allow
      // irregular creases as different top anchors release under gravity.
      for(let iteration=0;iteration<6;iteration++)for(const link of links){
        const a=points[link.a],b=points[link.b];
        const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;
        const length=Math.max(.001,Math.hypot(dx,dy,dz));
        const correction=(length-link.length)/length*link.stiffness;
        const wa=simulation<a.release?0:1,wb=simulation<b.release?0:1;
        const sum=wa+wb;if(!sum)continue;
        a.x+=dx*correction*wa/sum;a.y+=dy*correction*wa/sum;a.z+=dz*correction*wa/sum;
        b.x-=dx*correction*wb/sum;b.y-=dy*correction*wb/sum;b.z-=dz*correction*wb/sum;
      }
    };
    const sizeObserver=new ResizeObserver(()=>{
      const nextWidth=surface.clientWidth,nextHeight=surface.clientHeight;
      if(!nextWidth||!nextHeight||(nextWidth===width&&nextHeight===height))return;
      const sx=nextWidth/width,sy=nextHeight/height;
      for(const p of points){p.x*=sx;p.px*=sx;p.ox*=sx;p.y*=sy;p.py*=sy;p.oy*=sy;p.z*=sy;p.pz*=sy;p.oz*=sy;}
      for(const link of links){const a=points[link.a],b=points[link.b];link.length=Math.hypot(a.ox-b.ox,a.oy-b.oy,a.oz-b.oz);}
      width=nextWidth;height=nextHeight;canvas.width=Math.ceil(width*dpr);canvas.height=Math.ceil(height*dpr);
    });
    sizeObserver.observe(surface);
    const color=(light:number)=>light>=0?`rgba(255,255,255,${Math.min(.16,light*.55)})`:`rgba(35,48,61,${Math.min(.1,-light*.5)})`;
    const render=(now:number)=>{
      if(finished)return;
      accumulator+=Math.min(.05,(now-previous)/1000);previous=now;
      while(accumulator>=dt){step();accumulator-=dt;}
      const normals=points.map(()=>({x:0,y:0,z:0}));
      for(const [a,b,c]of triangles){
        const p=points[a],q=points[b],r=points[c];
        const ux=q.x-p.x,uy=q.y-p.y,uz=q.z-p.z,vx=r.x-p.x,vy=r.y-p.y,vz=r.z-p.z;
        const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;
        for(const i of[a,b,c]){normals[i].x+=nx;normals[i].y+=ny;normals[i].z+=nz;}
      }
      const vertices:Vertex[]=points.map((p,i)=>{
        const perspective=height*2.8,scale=perspective/(perspective+p.z);
        const n=normals[i],length=Math.max(.001,Math.hypot(n.x,n.y,n.z));
        return{x:width/2+(p.x-width/2)*scale,y:height/2+(p.y-height/2)*scale,
          light:((-n.x*.4-n.y*.28+n.z*.87)/length-.87)*1.3};
      });
      const top=vertices.slice(0,stride);
      const perimeter=[...top];
      for(let y=1;y<=rows;y++)perimeter.push(vertices[id(columns,y)]);
      for(let x=columns-1;x>=0;x--)perimeter.push(vertices[id(x,rows)]);
      for(let y=rows-1;y>0;y--)perimeter.push(vertices[id(0,y)]);
      const path=(list:Vertex[])=>`M ${list.map(p=>`${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(' L ')}`;
      surface.style.clipPath=`path("${path(perimeter)} Z")`;
      canvas.style.clipPath=surface.style.clipPath;
      if(edge.current){edge.current.setAttribute('d',path(top));edge.current.style.opacity=String(Math.min(1,simulation*5)*.5);}
      ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,width,height);
      for(const triangle of triangles){
        const [a,b,c]=triangle.map(i=>vertices[i]);
        const low=Math.min(a.light,b.light,c.light),high=Math.max(a.light,b.light,c.light);
        if(Math.max(Math.abs(low),Math.abs(high))<.007)continue;
        const dx1=b.x-a.x,dy1=b.y-a.y,dx2=c.x-a.x,dy2=c.y-a.y;
        const determinant=dx1*dy2-dx2*dy1;
        if(Math.abs(determinant)<.001)continue;
        // An affine light field matches all three vertex normals. Adjacent
        // triangles therefore share identical edge shading, avoiding facets.
        const gx=((b.light-a.light)*dy2-(c.light-a.light)*dy1)/determinant;
        const gy=(dx1*(c.light-a.light)-dx2*(b.light-a.light))/determinant;
        const magnitude=gx*gx+gy*gy;
        let fill:string|CanvasGradient=color((a.light+b.light+c.light)/3);
        if(magnitude>1e-10&&high-low>.001){
          const from=(low-a.light)/magnitude,to=(high-a.light)/magnitude;
          const gradient=ctx.createLinearGradient(a.x+gx*from,a.y+gy*from,a.x+gx*to,a.y+gy*to);
          gradient.addColorStop(0,color(low));gradient.addColorStop(1,color(high));
          if(low<0&&high>0)gradient.addColorStop(-low/(high-low),'rgba(255,255,255,0)');
          fill=gradient;
        }
        ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.lineTo(c.x,c.y);ctx.closePath();ctx.fillStyle=fill;ctx.fill();
      }
      if(simulation>1.65||top.every(p=>p.y>height+25))finish();else raf=requestAnimationFrame(render);
    };
    raf=requestAnimationFrame(render);
    return()=>{finished=true;clearTimeout(timeout);cancelAnimationFrame(raf);sizeObserver.disconnect();};
  }, [opening]);

  return <>
    <div ref={glass} className={styles.glass} data-invitation-glass aria-hidden="true" />
    {opening && <><canvas ref={folds} className={styles.glassFolds} aria-hidden="true" />
      <svg className={styles.glassEdge} data-invitation-fall aria-hidden="true"><path ref={edge} fill="none" stroke="rgba(255,255,255,.7)" strokeWidth="1" /></svg></>}
  </>;
}
