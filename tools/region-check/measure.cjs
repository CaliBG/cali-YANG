const { readFileSync, writeFileSync } = require('node:fs');
const { spawnSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const { join } = require('node:path');
const puppeteer = require(process.env.PUPPETEER_MODULE || 'puppeteer-core');
const config = JSON.parse(readFileSync(process.env.PROBE_CONFIG || join(__dirname, 'target.json')));
const mobile = process.argv[2] === 'mobile';
const viewport = { width: mobile ? 390 : 1280, height: mobile ? 844 : 800, deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile };
const target = 'https://caliyang.cn';
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
    browser=await puppeteer.launch({executablePath:process.env.CHROME_BIN||'/usr/bin/google-chrome',headless:true,args:['--no-proxy-server','--enable-unsafe-swiftshader','--use-angle=swiftshader','--disable-background-timer-throttling','--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding']});
    result.browser=await browser.version();
    const page=await browser.newPage(); await page.setViewport(viewport);
    const pageErrors=[];page.on('pageerror',e=>pageErrors.push(String(e).slice(0,160)));
    await page.evaluateOnNewDocument(()=>{
      performance.setResourceTimingBufferSize(1500);window.qaSceneTrace={elements:[],lcp:null,legacyReady:null};
      try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.qaSceneTrace.elements.push({id:e.identifier,name:e.name,t:e.startTime,url:e.url?.split('/').pop()});}).observe({type:'element',buffered:true});}catch{}
      try{new PerformanceObserver(l=>{window.qaSceneTrace.lcp=l.getEntries().at(-1).startTime;}).observe({type:'largest-contentful-paint',buffered:true});}catch{}
      new MutationObserver((records,observer)=>{if(document.querySelector('svg[viewBox="0 0 48 24"]')){window.qaSceneTrace.legacyReady=performance.now();observer.disconnect();}}).observe(document,{subtree:true,childList:true});
    });
    const response=await page.goto(target+'/',{waitUntil:'domcontentloaded',timeout:120000});
    result.status=response.status();result.htmlSha256=createHash('sha256').update(await response.buffer()).digest('hex');
    if(config.htmlSha256 && result.htmlSha256!==config.htmlSha256) throw Error('Navigation returned a different HTML build');
    const start=Date.now();
    try{await page.waitForFunction(baseline=>baseline?window.qaSceneTrace.legacyReady>0:performance.getEntriesByName('portfolio:hero-animation-ready','mark').length>0,{timeout:180000,polling:250},config.baseline);}catch{result.timerError='scene timed out after DOMContentLoaded';}
    // Allow buffered Element Timing and compositor handoff markers to arrive.
    await new Promise(r=>setTimeout(r,250));
    const metrics=await page.evaluate(()=>{
      const marks=performance.getEntriesByType('mark').filter(e=>e.name.startsWith('portfolio:')).map(e=>[e.name,Math.round(e.startTime)]);
      const resources=performance.getEntriesByType('resource').filter(e=>e.name.includes('/model/')).map(e=>({path:new URL(e.name).pathname,start:Math.round(e.startTime),end:Math.round(e.responseEnd),bytes:e.encodedBodySize}));
      const nav=performance.getEntriesByType('navigation')[0];return {visibility:document.visibilityState,ttfb:Math.round(nav.responseStart),fcp:Math.round(performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0),...window.qaSceneTrace,marks,resources,canvasCount:document.querySelectorAll('canvas').length,jsHeapBytes:performance.memory?.usedJSHeapSize};
    });
    Object.assign(result,metrics,{pageErrors,waitMs:Date.now()-start});
    result.sceneMs=config.baseline?Math.round(result.legacyReady||0):Object.fromEntries(result.marks)['portfolio:hero-animation-ready'];
    if(!result.sceneMs||result.timerError)throw Error('No measured scene-ready signal');
    result.ok=true;
  }catch(error){result.ok=false; result.error=String(error.message||error).slice(0,300);process.exitCode=1;}
  finally{if(browser)await browser.close(); console.log('BROWSER_RESULT '+JSON.stringify(result));if(process.env.RESULT_JSON)writeFileSync(process.env.RESULT_JSON,JSON.stringify(result,null,2));}
})().catch(e=>{console.error(e.message);process.exitCode=1});
