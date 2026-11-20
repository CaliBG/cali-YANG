const { readFileSync, writeFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { join } = require('node:path');
const puppeteer = require(process.env.PUPPETEER_MODULE || 'puppeteer-core');
const config = JSON.parse(readFileSync(process.env.PROBE_CONFIG || join(__dirname, 'target.json')));
const mobile = process.argv[2] === 'mobile';
const viewport = { width: mobile ? 390 : 1280, height: mobile ? 844 : 800, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile };
const target = 'https://caliyang.cn';
const softwareWebGL=process.platform==='linux';
function curl(url, extra = []) {return spawnSync('curl', ['-fsSL','--noproxy','*','--connect-timeout','7','--max-time','15',...extra,url], {encoding:'utf8'});}
function location() {
  const geo = curl('https://ipinfo.io/json'); let where = {};
  try {const {country, region, city, org}=JSON.parse(geo.stdout);where={country,region,city,network:org};} catch {}
  const trace = curl('https://www.cloudflare.com/cdn-cgi/trace');
  const fields=Object.fromEntries(trace.stdout.split('\n').filter(x=>/^(loc|colo)=/.test(x)).map(x=>x.split('=')));
  return {...where,egressCountry:fields.loc,cloudflareEdge:fields.colo};
}
(async()=>{
  const result = {recordedAt:new Date().toISOString(), location:location(), runner:process.env.RUNNER_NAME||'local-mac', device: process.argv[2], viewport, expectedSource:config.commit, baseline:config.baseline, target};
  let browser;
  try {
    const release=curl(target+'/release.json?scene-check='+Date.now()); result.release=JSON.parse(release.stdout).sourceCommit;
    if(result.release!==config.commit) throw Error('Published release mismatch');
    browser=await puppeteer.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',headless:true,protocolTimeout:325000,args:['--no-proxy-server',...(softwareWebGL?['--enable-unsafe-swiftshader','--use-angle=swiftshader']:[]),'--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding']});
    result.browser=await browser.version();
    const page=await browser.newPage(); await page.setViewport(viewport);
    const researchImages=[];
    page.on('request',r=>{if(r.resourceType()==='image'&&r.url().includes('/research/'))researchImages.push(new URL(r.url()).pathname);});
    const pageErrors=[],failedRequests=[];page.on('requestfailed',r=>{failedRequests.push({path:new URL(r.url()).pathname,type:r.resourceType(),navigation:r.isNavigationRequest(),error:r.failure()?.errorText});});page.on('pageerror',e=>pageErrors.push(String(e).slice(0,160)));
    await page.evaluateOnNewDocument(()=>{
      performance.setResourceTimingBufferSize(1500);window.qaSceneTrace={elements:[],lcp:null,legacyReady:null};
      try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.qaSceneTrace.elements.push({id:e.identifier,name:e.name,t:e.startTime,url:e.url?.startsWith('data:')?'inline':e.url?.split('/').pop()});}).observe({type:'element',buffered:true});}catch{}
      try{new PerformanceObserver(l=>{window.qaSceneTrace.lcp=l.getEntries().at(-1).startTime;}).observe({type:'largest-contentful-paint',buffered:true});}catch{}
      new MutationObserver((records,observer)=>{if(document.querySelector('svg[viewBox="0 0 48 24"]')){window.qaSceneTrace.legacyReady=performance.now();observer.disconnect();}}).observe(document,{subtree:true,childList:true});
    });
    const mainDocument=page.waitForResponse(r=>r.request().isNavigationRequest()&&r.request().frame()===page.mainFrame(),{timeout:60000});
    const navigation=page.goto(target+'/',{waitUntil:'domcontentloaded',timeout:300000}).catch(e=>{result.navigationError=e.message;});
    const response=await mainDocument;
    result.status=response.status();result.htmlSha256=createHash('sha256').update(await response.buffer()).digest('hex');
    if(config.htmlSha256 && result.htmlSha256!==config.htmlSha256) throw Error('Navigation returned a different HTML build');
    const start=Date.now();
    try{await page.waitForFunction(baseline=>baseline?window.qaSceneTrace.legacyReady>0:performance.getEntriesByName('portfolio:hero-entry-complete','mark').length>0,{timeout:300000,polling:250},config.baseline);}catch{result.timerError='scene timed out after document response';}
    // Wait for the opacity transition after the render mark before capturing the live scene.
    if(!config.baseline&&!result.timerError){try{await page.waitForFunction(()=>performance.getEntriesByName('portfolio:hero-poster-dismissed','mark').length>0,{timeout:3500,polling:100});}catch{result.dismissMarkerMissing=true;}}
    await new Promise(r=>setTimeout(r,250));
    const metrics=await page.evaluate(()=>{
      const marks=performance.getEntriesByType('mark').filter(e=>e.name.startsWith('portfolio:')).map(e=>[e.name,Math.round(e.startTime)]);
      const resources=performance.getEntriesByType('resource').filter(e=>e.name.includes('/model/')).map(e=>({path:new URL(e.name).pathname,start:Math.round(e.startTime),end:Math.round(e.responseEnd),bytes:e.encodedBodySize}));
      const sceneCanvas=document.querySelector('canvas[data-engine]');
      const gl=sceneCanvas?.getContext('webgl2');const ext=gl?.getExtension('WEBGL_debug_renderer_info');
      const graphics=ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null;
      const posters=Array.from(document.querySelectorAll('[elementtiming]'),i=>({id:i.getAttribute('elementtiming'),image:(i.currentSrc||getComputedStyle(i).backgroundImage).replace(/data:[^)]*/, 'inline'),opacity:getComputedStyle(i).opacity,width:i.getBoundingClientRect().width}));
      const nav=performance.getEntriesByType('navigation')[0];return {graphics,posters,visibility:document.visibilityState,ttfb:Math.round(nav.responseStart),fcp:Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0),...window.qaSceneTrace,marks,resources,slowest:performance.getEntriesByType('resource').filter(e=>e.duration>150).sort((a,b)=>b.responseEnd-a.responseEnd).slice(0,12).map(e=>({path:new URL(e.name).pathname,end:Math.round(e.responseEnd),bytes:e.encodedBodySize})),canvasCount:document.querySelectorAll('canvas').length,jsHeapBytes:performance.memory?.usedJSHeapSize};
    });
    Object.assign(result,metrics,{pageErrors,failedRequests,researchImages,waitMs:Date.now()-start});
    result.sceneMs=config.baseline?Math.round(result.legacyReady||0):Object.fromEntries(result.marks)['portfolio:hero-animation-ready'];
    result.entryCompleteMs=Object.fromEntries(result.marks)['portfolio:hero-entry-complete'];
    if(!result.sceneMs||(!config.baseline&&!result.entryCompleteMs)||result.timerError)throw Error('No measured scene-ready signal');
    if(process.env.SCENE_PNG){await page.screenshot({path:process.env.SCENE_PNG});}
    result.ok=true;
  }catch(error){result.ok=false; result.error=String(error.message||error).slice(0,300);process.exitCode=1;}
  finally{if(browser)await browser.close(); console.log('BROWSER_RESULT '+JSON.stringify(result));if(process.env.RESULT_JSON)writeFileSync(process.env.RESULT_JSON,JSON.stringify(result,null,2));}
})().catch(e=>{console.error(e.message);process.exitCode=1});
