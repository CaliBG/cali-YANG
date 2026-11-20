const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawnSync}=require('node:child_process');
const pp=require(process.env.PUPPETEER_MODULE || 'puppeteer-core');
const expected=require('./original-digests.json');
const source='9d5702934920af51f095225a0bf3fc1974eca736';
const commit='a16244ab2ccfa7d6c609acd7adecc6346a2ddf4d';
const dir=process.env.ORIGINAL_RESULT_DIR;
const label=process.argv[3];
const isPrimary=label==='main';
const targets={main:'https://caliyang.cn',fixed:'https://4fa711d1.caliyang-portfolio.pages.dev',candidate:'https://4b602c9b.caliyang-portfolio.pages.dev'};
const target=targets[label];if(!target)throw Error('Unknown baseline URL');
const mobile=process.argv[2]==='mobile';
const exe=process.env.CHROME_BIN;
function hash(b){return crypto.createHash('sha256').update(b).digest('hex')}
const curl=url=>spawnSync('curl',['-fsSL','--noproxy','*','--connect-timeout','6','--max-time','15',url],{encoding:'utf8'});
(async()=>{
 const out={at:new Date().toISOString(),label,target,commit,source,device:mobile?'mobile':'desktop',pair:process.env.PAIR_ID},errs=[],reqFails=[],res=[];let b;
 try{
  try {const g=JSON.parse(curl('https://ipinfo.io/json').stdout);out.geo={country:g.country,region:g.region,city:g.city,network:g.org};}catch{out.geo={};}
  const trace=curl('https://www.cloudflare.com/cdn-cgi/trace').stdout.match(/^loc=([^\n]+)/m);if(trace)out.geo.egressCountry=trace[1];
  const deadline=Date.now()+(isPrimary?600000:25000);let matched=false;
  while(Date.now()<deadline){
    try {out.release=JSON.parse(curl(target+'/release.json').stdout);if(out.release.sourceCommit===source){const html=curl(target+'/').stdout;if(hash(Buffer.from(html))===expected['index.html']){matched=true;break;}}}catch{}
    await new Promise(done=>setTimeout(done,5000));
  }
  if(!matched)throw Error('Original source and HTML origin gate not satisfied');
  b=await pp.launch({executablePath:exe,headless:true,protocolTimeout:307000,args:['--no-proxy-server','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding']});
  const page=await b.newPage();await page.bringToFront();await page.setViewport(mobile?{width:390,height:844,deviceScaleFactor:2,isMobile:true,hasTouch:true}:{width:1280,height:800,deviceScaleFactor:1});out.browser=await b.version();
  page.on('pageerror',e=>errs.push(String(e)));
  page.on('requestfailed',r=>{reqFails.push([r.resourceType(),new URL(r.url()).pathname,r.failure()?.errorText]);});
  page.on('response',r=>{
   const u=new URL(r.url());if(u.origin===target&&(u.pathname.endsWith('.js')||u.pathname.match(/^\/model\/(hello\.gltf|cursor\.glb)$/))&&r.status()===200)res.push(r);
  });
  await page.evaluateOnNewDocument(()=>{
    const mem=window.__origObserver={draws:{},firstBoth:null,firstOutput:null,nextFrame:null,glCompleteRafs:[],marker:null,renderer:null,cameraReachedOrigin:null,firstCameraZ:null,lastCameraZ:null,maxCameraZ:null,cameraPath:[]};let frame=null;
    const progShaders=new WeakMap(),glassShaders=new WeakSet(),state=new WeakMap(),cameraLocs=new WeakMap(),programZ=new WeakMap();
    function current(gl){let x=state.get(gl);if(!x){x={prog:null,fb:null,frame:null,indices:0};state.set(gl,x);}return x}
    const nativeRAF=window.requestAnimationFrame;
    window.requestAnimationFrame=function(cb){return nativeRAF.call(this,t=>{frame=t;try{return cb(t)}finally{frame=null}})};
    const proto=WebGL2RenderingContext.prototype;
    function instrument(name,after){const native=proto[name];proto[name]=function(...a){const res=native.apply(this,a);after(this,a,res);return res}}
    instrument('shaderSource',(g,[s,source])=>{if(source.includes('uSceneRefractionEnabled')&&source.includes('uTintThicknessMinAlpha'))glassShaders.add(s);});
    instrument('attachShader',(g,[p,s])=>{if(glassShaders.has(s))progShaders.set(p,true)});
    instrument('getUniformLocation',(g,[program,name],loc)=>{if(loc&&name==='cameraPosition')cameraLocs.set(loc,program);});
    function setZ(loc,z){const prog=cameraLocs.get(loc);if(prog&&Number.isFinite(z))programZ.set(prog,z);}
    instrument('uniform3f',(g,[loc,x,y,z])=>setZ(loc,z));
    instrument('uniform3fv',(g,[loc,vector,offset])=>setZ(loc,vector[(offset||0)+2]));
    instrument('useProgram',(g,[p])=>{current(g).prog=p});
    instrument('bindFramebuffer',(g,[target,buf])=>{if(target===g.FRAMEBUFFER||target===g.DRAW_FRAMEBUFFER)current(g).fb=buf});
    const draw=(g,a,indexed)=>{
      if(frame===null||mem.glCompleteRafs.length>=900)return;
      const x=current(g);
      if(x.frame!==frame){x.frame=frame;x.indices=0;x.atTarget=0}
      const count=a[1];
      if(indexed && a[0]===g.TRIANGLES && progShaders.has(x.prog) && (count===136836||count===2820)){
        if(mem.draws[count]===undefined)mem.draws[count]=performance.now();
        const bit=count===136836?1:2;x.indices|=bit;
        const z=programZ.get(x.prog);
        if(Number.isFinite(z)){
          if(mem.firstCameraZ===null)mem.firstCameraZ=z;
          if(z!==mem.lastCameraZ&&mem.cameraPath.length<100)mem.cameraPath.push({at:performance.now(),z});
          mem.lastCameraZ=z;mem.maxCameraZ=Math.max(mem.maxCameraZ??z,z);
          if(z===24)x.atTarget|=bit;
        }
      }
      if(x.indices===3){
        if(!mem.firstBoth)mem.firstBoth={at:performance.now(),frame,canvas:g.canvas.getAttribute('data-engine')};
        if(!x.fb){
          if(x.atTarget===3&&mem.maxCameraZ>24.01&&!mem.cameraReachedOrigin){mem.cameraReachedOrigin={at:performance.now(),frame,z:mem.lastCameraZ};}
          if(!mem.firstOutput){
            mem.firstOutput={at:performance.now(),frame,pixelWidth:g.drawingBufferWidth,pixelHeight:g.drawingBufferHeight};
            nativeRAF.call(window,()=>{mem.nextFrame=performance.now();});
          }
          if(mem.glCompleteRafs.at(-1)!==frame)mem.glCompleteRafs.push(frame);
        }
      }
    };
    instrument('drawElements',(g,a)=>draw(g,a,true));instrument('drawArrays',(g,a)=>draw(g,a,false));
    new MutationObserver((records,observer)=>{if(document.querySelector('svg[viewBox="0 0 48 24"]')){mem.marker=performance.now();observer.disconnect()}}).observe(document,{subtree:true,childList:true});
    performance.setResourceTimingBufferSize(1800);
  });
  const first=page.waitForResponse(r=>r.request().isNavigationRequest()&&r.request().frame()===page.mainFrame(),{timeout:60000});
  page.goto(target+'/',{waitUntil:'domcontentloaded',timeout:265000}).catch(e=>{out.navigationError=e.message});
  const doc=await first;out.realURL=doc.url();out.status=doc.status();out.documentDelivery={contentEncoding:doc.headers()['content-encoding'],link:doc.headers().link};out.htmlSha=hash(await doc.buffer());out.htmlMatches=out.htmlSha===expected['index.html'];if(!out.htmlMatches)throw Error('HTML mismatch');
  try{await page.waitForFunction(()=>{const v=window.__origObserver; const span=v?.glCompleteRafs?.at(-1)-v?.glCompleteRafs?.[0];return v?.firstOutput && (span>=3000&&!!v.cameraReachedOrigin||span>=6500);},{timeout:240000,polling:250})}catch(e){out.timeout=String(e)}
  out.perf=await page.evaluate(()=>{
    const gl=document.querySelector('canvas[data-engine]')?.getContext('webgl2');const ext=gl?.getExtension('WEBGL_debug_renderer_info');const native=window.__origObserver;
    const ms=native.glCompleteRafs.slice(1).map((x,i)=>x-native.glCompleteRafs[i]);
    const ordered=ms.slice().sort((a,b)=>a-b);
    const nav=performance.getEntriesByType('navigation')[0];
    return {...native,renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null,visible:document.visibilityState,contextLost:gl?.isContextLost(),ttfb:nav.responseStart,
      fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
      glFrameStats:{count:ms.length,fps:ms.length?1000*ms.length/ms.reduce((a,b)=>a+b):0,p95:ordered[Math.floor(.95*(ordered.length-1))],above50:ms.filter(x=>x>50).length},
      models:performance.getEntriesByType('resource').filter(x=>x.name.includes('/model/')).map(x=>({path:new URL(x.name).pathname,start:x.startTime,end:x.responseEnd,encoded:x.encodedBodySize}))};
  });
  await page.screenshot({path:path.join(dir,label+'.png')});
  out.assets=[];for(const r of res){const p=decodeURIComponent(new URL(r.url()).pathname).slice(1);
    try{const bytes=await r.buffer();out.assets.push({p,bytes:bytes.length,sha:hash(bytes),matches:hash(bytes)===expected[p],server:r.headers().server,edge:r.headers()['cf-ray'],contentEncoding:r.headers()['content-encoding']})}catch(e){out.assets.push({p,error:String(e)})}
  }
  out.errors=errs;out.failedRequests=reqFails;out.ok=out.assets.every(a=>a.matches)&&['model/hello.gltf','model/cursor.glb'].every(p=>out.assets.some(a=>a.p===p&&a.matches))&&out.perf.firstOutput!=null;
 }catch(e){out.fatal=String(e);out.ok=false}finally{if(b)await b.close();fs.writeFileSync(path.join(dir,label+'.json'),JSON.stringify(out,null,2));if(!out.ok)process.exitCode=1;console.log(JSON.stringify({label,target,device:out.device,ok:out.ok,geo:out.geo,html:out.htmlMatches,assets:out.assets?.length,perf:{firstBoth:out.perf?.firstBoth,firstOutput:out.perf?.firstOutput,render:out.perf?.renderer,cameraEnd:out.perf?.cameraReachedOrigin,z0:out.perf?.firstCameraZ,z1:out.perf?.lastCameraZ,marker:out.perf?.marker,fcp:out.perf?.fcp},fatal:out.fatal,timeout:out.timeout}));}
})()
