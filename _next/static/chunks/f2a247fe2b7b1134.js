(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,57864,e=>{"use strict";var t=e.i(61893),r=e.i(65905);let a=new Map,o=new Set,i=0;function s(){i++,o.forEach(e=>e())}function n(e,t){return a.set(e,t),s(),()=>{a.get(e)===t&&(a.delete(e),s())}}function l(e){return a.get(e)??null}function u(e){return o.add(e),()=>{o.delete(e)}}function c(){return(0,t.useSyncExternalStore)(u,()=>i,()=>0)}function f(e){return(0,t.useCallback)(t=>{t&&n(e,t)},[e])}function d(e,r){(0,t.useEffect)(()=>{if(r)return n(e,r)},[e,r])}let m=new Map,A=new Set,h=[];function p(){h=Array.from(m.values()),A.forEach(e=>e())}function B(e){return m.set(e.key,e),p(),()=>{m.get(e.key)===e&&(m.delete(e.key),p())}}function v(e){return A.add(e),()=>{A.delete(e)}}let g=[];function C(){return(0,t.useSyncExternalStore)(v,()=>h,()=>g)}class x{el;measured=null;scrollAtMeasure=0;framesSinceMeasure=0;signature="";constructor(e){this.el=e}matches(e){return this.el===e}get(e){let t,r=(t=window.visualViewport,`${window.innerWidth}x${window.innerHeight}x${window.devicePixelRatio}x${t?Math.round(t.height):0}`);if(!this.measured||this.framesSinceMeasure>=12||r!==this.signature){let t=this.el.getBoundingClientRect();return this.measured={top:t.top,left:t.left,width:t.width,height:t.height,bottom:t.bottom},this.scrollAtMeasure=e,this.framesSinceMeasure=0,this.signature=r,this.measured}this.framesSinceMeasure++;let a=e-this.scrollAtMeasure,o=this.measured;return{top:o.top-a,left:o.left,width:o.width,height:o.height,bottom:o.bottom-a}}}function M(e){return Math.min(1,Math.max(0,e>1?e/100:e))}function R(e,t,{opaqueThreshold:r,opaqueTolerance:a,hysteresis:o}){return e?t>=r-a-o:t>=r-a}function y(e,t){return t?3:e>.75?4:e>.5?2:1}let b={opaqueThreshold:.9,opaqueTolerance:0,hysteresis:.08},F={opaqueThreshold:.99,opaqueTolerance:.005,hysteresis:.02},T={frameCount:0,scrollTop:0,viewportH:1,viewportW:1,overlay:0,solidCovered:!1,refractiveCovered:!1,scrollVelocityFactor:0,sections:new Map},E=new Map;function D(e){T.frameCount++;let t=r.scrollEnv.getScrollTopPx(),o=r.scrollEnv.getViewportHeightPx()||window.innerHeight||1,i=window.innerWidth||1,s=T.scrollTop,n=Math.min(1,(e>0?Math.abs(t-s)/e:0)/800),l=1-Math.exp(-e/(n>T.scrollVelocityFactor?.025:.175));T.scrollVelocityFactor+=(n-T.scrollVelocityFactor)*l,T.scrollTop=t,T.viewportH=o,T.viewportW=i,T.sections.clear(),a.forEach((e,r)=>{let a=E.get(r);a&&a.matches(e)||(a=new x(e),E.set(r,a));let i=a.get(t);T.sections.set(r,{rect:i,inView:i.bottom>0&&i.top<o})});let u=T.sections.get("banner"),c=T.sections.get("footer"),f=0;u&&(f=Math.min(1,Math.max(0,(o-u.rect.bottom)/Math.max(1,o-.25*o))),c&&(f*=Math.min(1,Math.max(0,(c.rect.top+t-t)/o)))),T.overlay=f,T.solidCovered=R(T.solidCovered,f,b),T.refractiveCovered=R(T.refractiveCovered,f,F)}e.s(["TrackedRect",()=>x,"frameState",0,T,"getWebGLSectionEl",()=>l,"normalizeOverlay",()=>M,"opaqueWithHysteresis",()=>R,"overlayStride",()=>y,"registerWebGLImageLayer",()=>B,"registerWebGLSection",()=>n,"updateFrameState",()=>D,"useRegisterWebGLSection",()=>d,"useWebGLImageLayers",()=>C,"useWebGLSectionRef",()=>f,"useWebGLSectionsVersion",()=>c])},16717,e=>{"use strict";var t=e.i(87420),r=e.i(57864),a=e.i(98990),o=e.i(99396);function i(){let{lang:e}=(0,o.useLanguage)();return(0,t.jsx)(a.default,{text:"zh"===e?"我是杨子硕，一名热爱设计与视觉的美术生，喜欢用细腻的线条表达思考。我相信艺术的力量不在于高冷的展览，而在于生活被放大的温度。":"I'm Zishuo Yang, an art student passionate about design and visual expression, who loves to articulate thoughts through delicate lines. I believe the power of art lies not in elitist exhibitions, but in the amplified warmth of everyday life.",startDelayMs:300,letterDelayMs:10,className:"col-span-12 lg:col-span-6 xl:col-span-4 lg:col-start-7 xl:col-start-9 mt-auto lg:mt-0 p-2"},`brand-${e}`)}function s(){let e=(0,r.useWebGLSectionRef)("banner"),{lang:s}=(0,o.useLanguage)(),n="zh"===s;return(0,t.jsxs)("div",{ref:e,className:"grid grid-cols-12 grid-rows-[auto_1fr] px-4 lg:px-14 py-18 lg:py-24 w-full h-dvh lg:h-screen",children:[(0,t.jsxs)("div",{className:"flex flex-col order-2 lg:order-1 lg:grid lg:grid-cols-12 col-span-12 font-mono text-base",children:[(0,t.jsxs)("span",{className:"hidden lg:block lg:col-span-3 xl:col-span-2 lg:col-start-1 xl:col-start-1 p-2 font-sans font-medium text-[4svw] sm:text-2xl lg:text-3xl leading-tight",children:[(0,t.jsx)(a.default,{text:n?"视觉 &":"Visual &",startDelayMs:300,letterDelayMs:10},`meta1a-${s}`),(0,t.jsx)("br",{}),(0,t.jsx)(a.default,{text:n?"装置":"Installation",startDelayMs:300,letterDelayMs:10},`meta1b-${s}`)]}),(0,t.jsx)(a.default,{text:n?"拒绝多余的修辞，只谈存在本身。":"Rejecting rhetoric. Speaking of existence itself.",startDelayMs:300,letterDelayMs:10,className:"hidden lg:block lg:col-span-3 xl:col-span-2 lg:col-start-4 xl:col-start-5 p-2 text-balance"},`meta2-${s}`),(0,t.jsx)(i,{})]}),(0,t.jsxs)("div",{className:"flex flex-col self-end order-1 lg:order-2 col-span-12 px-2 font-bold text-[7.2svw] lg:text-[6svw] 2xl:text-[5svw] xl:text-[5.6svw] uppercase leading-none",style:{fontVariationSettings:'"wdth" 120'},children:[(0,t.jsx)(a.default,{text:n?"感知归零":"Yet",startDelayMs:300},`h1-${s}`),(0,t.jsx)(a.default,{text:n?"一切":"Zero",startDelayMs:500},`h2-${s}`),(0,t.jsx)(a.default,{text:n?"重新开始":"Sense",startDelayMs:700},`h3-${s}`)]})]})}e.s(["default",()=>s])},28200,e=>{"use strict";var t=e.i(87420),r=e.i(61893),a=e.i(57864);function o({imageKey:e,src:o,hoverSrc:i,...s}){let n=(0,r.useRef)(null);return(0,r.useEffect)(()=>{let t=n.current;if(t)return(0,a.registerWebGLImageLayer)({key:e??o,imageUrl:o,hoverImageUrl:i,el:t})},[e,o,i]),(0,t.jsx)("div",{ref:n,"aria-hidden":!0,"data-webgl-image":e??o,...s})}e.s(["default",()=>o])},66371,e=>{"use strict";var t=e.i(61893);function r(e,{once:a=!0,threshold:o=.1,rootMargin:i}={}){let[s,n]=(0,t.useState)(!1);return(0,t.useEffect)(()=>{let t=e.current;if(!t)return;if("u"<typeof IntersectionObserver)return void n(!0);let r=new IntersectionObserver(e=>{e.some(e=>e.isIntersecting)?(n(!0),a&&r.disconnect()):a||n(!1)},{threshold:o,rootMargin:i});return r.observe(t),()=>r.disconnect()},[e,a,o,i]),s}e.s(["useInViewport",()=>r])},38709,e=>{"use strict";var t=e.i(87420),r=e.i(61893),a=e.i(28200),o=e.i(67436),i=e.i(99396),s=e.i(66371);let n=`
        .svg-sign__path {
          opacity: 0;
          fill: none;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .svg-sign.is-drawing .svg-sign__path {
          animation:
            svg-sign-show 0s linear var(--path-delay) forwards,
            svg-sign-draw var(--path-dur) cubic-bezier(0.65, 0, 0.35, 1) var(--path-delay) forwards;
        }
        @keyframes svg-sign-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes svg-sign-show {
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .svg-sign.is-drawing .svg-sign__path {
            animation: none;
            stroke-dashoffset: 0;
            opacity: 1;
          }
        }
      `,l=[{d:"M22 28 L62 80 L62 126",strokeWidth:8},{d:"M102 28 L62 80",strokeWidth:8},{d:"M122 28 L202 28 L122 126 L202 126",strokeWidth:8},{d:"M302 28 L222 28 L222 77 L302 77 L302 126 L222 126",strokeWidth:8}];function u(){let e=(0,r.useRef)(null),[a,o]=(0,r.useState)(!1),i=(0,s.useInViewport)(e,{once:!1,threshold:.15,rootMargin:"0px 0px -8% 0px"});return(0,r.useLayoutEffect)(()=>{let t=e.current;if(!t)return;let r=Array.from(t.querySelectorAll(".svg-sign__path")),a=.5;for(let e of r){let t=e.getTotalLength(),r=t/720;e.style.setProperty("--path-len",String(t)),e.style.setProperty("--path-dur",`${r}s`),e.style.setProperty("--path-delay",`${a}s`),e.style.strokeDasharray=`${t}`,e.style.strokeDashoffset=`${t}`,a+=r+.03}o(!0)},[]),(0,t.jsx)("svg",{ref:e,viewBox:"0 0 320 154",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:`svg-sign absolute pointer-events-none -top-[6%] right-0 w-1/2 sm:-top-1/10 sm:-right-1/6 sm:w-3/5${a&&i?" is-drawing":""}`,"aria-hidden":"true",children:l.map((e,r)=>(0,t.jsx)("path",{className:"svg-sign__path",d:e.d,stroke:"#C0FE04",strokeWidth:e.strokeWidth,fill:"none"},r))})}function c(){let{lang:e}=(0,i.useLanguage)(),r="zh"===e;return(0,t.jsxs)("div",{className:"grid grid-cols-12 px-4 lg:px-14 py-18 lg:py-24 lg:pb-28 w-full",children:[(0,t.jsxs)("div",{className:"relative col-span-12 sm:col-span-4 lg:col-span-3 p-2",children:[(0,t.jsx)("style",{children:n}),(0,t.jsx)(u,{}),(0,t.jsx)(a.default,{imageKey:"about",src:(0,o.asset)("/img/m3.png"),className:"aspect-square"})]}),(0,t.jsxs)("div",{className:"flex flex-col justify-start items-start gap-6 col-span-12 sm:col-span-7 lg:col-span-8 sm:col-start-6 lg:col-start-5 text-base lg:text-xl leading-none",children:[(0,t.jsx)("p",{className:"p-2 w-full text-l1 md:text-[4.2svw] text-xl leading-[1.3] md:leading-none select-text",style:{fontFamily:"'tiktok', sans-serif"},children:(0,t.jsx)("span",{children:r?"我们拒绝多余的修辞，只谈存在本身。YZS 是年轻灵魂的留白区——一个探索「无我」与「存在」边界的青年视觉品牌。":'We reject unnecessary rhetoric and speak only of existence itself. YZS is a blank canvas for young souls — a youth visual brand exploring the boundary between "selflessness" and "being".'})}),(0,t.jsx)("p",{className:"p-2 w-full text-l2 md:text-[4.2svw] text-xl leading-[1.3] md:leading-none select-text",style:{fontFamily:"'tiktok', sans-serif"},children:(0,t.jsxs)("span",{children:[r?"我们生活在一个「过度感知」的时代。情绪被算法放大，色彩被符号化，连「真实」都被包装成消费品。":'We live in an era of "over-perception". Emotions are amplified by algorithms, colors are symbolized, and even "authenticity" is packaged as a commodity. ',(0,t.jsx)("a",{target:"_blank",rel:"noopener noreferrer",className:"inline text-l1 underline underline-offset-[0.08em] decoration-solid decoration-(--label-3) transition-[text-decoration-color] duration-150 ease-out lg:[@media(hover:hover)]:hover:decoration-(--label-1)",href:"https://caliyang.dpdns.org",children:"YZS"}),r?" 不提供答案，只提供空白。":" offers no answers — only blank space."]})})]})]})}e.s(["default",()=>c])},40563,e=>{"use strict";var t=e.i(87420),r=e.i(61893),a=e.i(65614),o=e.i(28200),i=e.i(90870),s=e.i(99396),n=e.i(67436);let l=[{name:"YZS® Merch Series",nameZh:"YZS® 周边系列",imageUrl:"/work/yzs_w06.jpg",hoverImageUrl:"/work/yzs_w06_h.jpg",href:"/yzs-merch",year:"2026",type:"post",gridClass:"col-span-12 lg:col-start-2 lg:col-span-5 xl:col-start-2 xl:col-span-4"},{name:"43+1 — Force & Balance",nameZh:"43+1 — 力量与平衡",imageUrl:"/work/yzs_w01.jpg",hoverImageUrl:"/work/yzs_w01_h.jpg",href:"/force-balance",year:"2025",type:"post",gridClass:"col-span-12 lg:col-start-8 lg:col-span-5 xl:col-start-8 xl:col-span-4"},{name:"Memory of the Flesh",nameZh:"皮囊记忆",imageUrl:"/work/yzs_w02.jpg",hoverImageUrl:"/work/yzs_w02_h.jpg",href:"/memory-of-the-flesh",year:"2025",type:"post",gridClass:"col-span-12 lg:col-start-1 lg:col-span-6 xl:col-span-5"},{name:"Pain",nameZh:"痛",imageUrl:"/work/yzs_w03.jpg",hoverImageUrl:"/work/yzs_w03_h.jpg",href:"/pain",year:"2025",type:"post",gridClass:"col-span-12 lg:col-span-6 xl:col-span-5 lg:col-start-7 xl:col-start-7"},{name:"Deep Sea Breathing",nameZh:"深海呼吸",imageUrl:"/work/yzs_w04.jpg",hoverImageUrl:"/work/yzs_w04_h.jpg",href:"/deep-sea-breathing",year:"2025",type:"post",gridClass:"col-span-6 lg:col-start-5 lg:col-span-4 xl:col-start-6 xl:col-span-3"},{name:"Imprint — Flowing Traces",nameZh:"拓印-流动的痕",imageUrl:"/work/yzs_w05.jpg",href:"/imprint-flowing-traces",year:"2025",type:"post",gridClass:"col-span-6 lg:col-start-9 lg:col-span-4 xl:col-start-10 xl:col-span-3"},{name:"Quiet Index",nameZh:"安静指数",imageUrl:"/work/yzs_w07.jpg",href:"/quiet-index",year:"2025",type:"post",gridClass:"col-span-12 lg:col-start-1 lg:col-span-4 xl:col-start-1 xl:col-span-3"},{name:"Indigo Lion, Guardian of Place",nameZh:"靛狮·域守",imageUrl:"/work/yzs_w08.jpg",hoverImageUrl:"/work/yzs_w08_h.jpg",href:"/indigo-lion",year:"2025",type:"post",gridClass:"col-span-12 lg:col-start-5 lg:col-span-4 xl:col-start-5 xl:col-span-3"},{name:"Tongkuang — Dual Camera App",nameZh:"同框 — 前后双摄 App",imageUrl:"/work/yzs_w09.jpg",hoverImageUrl:"/work/yzs_w09_h.jpg",href:"/tongkuang",year:"2026",type:"tools",codingProject:!0,gridClass:"col-span-12 lg:col-start-9 lg:col-span-4 xl:col-start-9 xl:col-span-3"}].map(e=>({...e,imageUrl:(0,n.asset)(e.imageUrl),hoverImageUrl:e.hoverImageUrl?(0,n.asset)(e.hoverImageUrl):void 0})),u=new Map;function c({item:e}){let i=function(e){let[t,a]=(0,r.useState)(()=>u.get(e)??"1 / 1");return(0,r.useEffect)(()=>{let t=u.get(e);if(t)return void a(t);let r=!1,o=new Image;return o.onload=()=>{if(!o.naturalWidth||!o.naturalHeight)return;let t=`${o.naturalWidth} / ${o.naturalHeight}`;u.set(e,t),r||a(t)},o.src=e,()=>{r=!0}},[e]),t}(e.imageUrl),{lang:n}=(0,s.useLanguage)(),l="zh"===n&&e.nameZh?e.nameZh:e.name,c=/^https?:\/\//.test(e.href),f=`${l} - ${e.year}${c?" (external)":""}`,d=(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(o.default,{imageKey:e.name,src:e.imageUrl,hoverSrc:e.hoverImageUrl,className:"relative w-full pointer-events-none select-none",style:{aspectRatio:i},children:e.codingProject&&(0,t.jsx)("span",{className:"top-0 right-0 z-10 absolute bg-selection px-1 font-mono-2 text-black text-xs uppercase pointer-events-none select-none","aria-hidden":"true",children:"Coding Project"})}),(0,t.jsxs)("div",{className:"flex justify-between items-start gap-3 min-w-0 text-xs lg:text-sm uppercase",children:[(0,t.jsx)("span",{className:"flex-1 min-w-0 lg:truncate max-lg:line-clamp-2",children:l}),(0,t.jsxs)("div",{className:"flex items-center gap-2 sm:gap-3 font-mono-2 tabular-nums whitespace-nowrap shrink-0",children:[(0,t.jsx)("span",{children:e.year}),"post"!==e.type&&(0,t.jsxs)("span",{className:"hidden lg:inline-flex items-center gap-1","aria-hidden":"true",children:[(0,t.jsx)("span",{children:e.type}),(0,t.jsx)("span",{children:"↗"})]})]})]})]});return(0,t.jsx)("article",{className:e.gridClass,children:c?(0,t.jsx)("a",{href:e.href,target:"_blank",rel:"noopener noreferrer",className:"group block space-y-3 p-2","aria-label":f,children:d}):(0,t.jsx)(a.default,{href:e.href,className:"group block space-y-3 p-2","aria-label":f,children:d})})}function f(){let e=(0,i.usePasscodeAccessLookup)(),a=(0,r.useRef)(null),[o,s]=(0,r.useState)(0);(0,r.useEffect)(()=>{let e=a.current;if(!e)return;let t=()=>s(e.clientWidth/12);if("u"<typeof ResizeObserver)return void t();let r=new ResizeObserver(t);return r.observe(e),t(),()=>r.disconnect()},[]);let n=l.filter(t=>!t.passcodeProtected||e(t.href));return(0,t.jsx)("section",{id:"selected-work",className:"px-4 lg:px-14 py-18 lg:py-24 w-full",children:(0,t.jsx)("div",{ref:a,className:"grid grid-cols-12 w-full",style:{rowGap:`${o}px`},children:n.map(e=>(0,t.jsx)(c,{item:e},e.name))})})}e.s(["default",()=>f],40563)},42517,e=>{"use strict";var t=e.i(87420),r=e.i(61893),a=e.i(3350),o=e.i(65905),i=e.i(57864),s=e.i(66371);function n(e,t){let r=Array.from(e),a=r.length;return r.map((r,o)=>{let i,s=(i=function(e){let t=0x811c9dc5;for(let r=0;r<e.length;r++)t^=e.charCodeAt(r),t=Math.imul(t,0x1000193);return t>>>0}(`${e}#${o}#${t}`)>>>0,()=>{let e=Math.imul((i=i+0x6d2b79f5|0)^i>>>15,1|i);return(((e=e+Math.imul(e^e>>>7,61|e)^e)^e>>>14)>>>0)/0x100000000});return(a>1?o/(a-1):0)*203+290*s()*.35})}function l({text:e,play:a=!0,groupDelayMs:o=0,className:i}){let s=(0,r.useRef)(!1);a&&(s.current=!0);let l=(0,r.useMemo)(()=>n(e,"in"),[e]),u=(0,r.useMemo)(()=>n(e,"out"),[e]);if(!a&&!s.current)return(0,t.jsx)("span",{className:i,style:{opacity:0},children:e});let c=a?l:u,f=Array.from(e);return(0,t.jsx)("span",{className:i,children:f.map((e,r)=>" "===e?(0,t.jsx)("span",{className:"hsst-char",children:" "},r):(0,t.jsx)("span",{className:"hsst-char",style:{opacity:+!a,animationName:a?"hsstFadeIn":"hsstFadeOut",animationDuration:"0.23s",animationTimingFunction:"linear",animationFillMode:"forwards",animationDelay:`${Math.round(o+c[r])}ms`},children:e},r))})}let u="flex flex-col justify-center items-center col-span-12 row-span-6 font-bold text-[7.2svw] lg:text-[6.8svw] uppercase leading-none",c={fontVariationSettings:'"wdth" 120'};function f({lines:e,play:r}){return(0,t.jsx)("div",{className:u,style:c,children:e.map((e,a)=>(0,t.jsx)(l,{text:e,play:r,groupDelayMs:100*a},a))})}function d(){let e=(0,r.useRef)(null),a=(0,s.useInViewport)(e,{threshold:.35,once:!1});return(0,t.jsxs)("div",{ref:e,className:u,style:c,children:[(0,t.jsx)(l,{text:"FUTURE-FIRST",play:a,groupDelayMs:0}),(0,t.jsx)(l,{text:"ALWAYS",play:a,groupDelayMs:100})]})}function m({getProgress:e}){let a=(0,r.useRef)([]);return(0,r.useEffect)(()=>{let t=0,r=()=>{t=requestAnimationFrame(r);let o=945*e();for(let e=0;e<7;e++){let t=a.current[e];if(!t)continue;let r=o-50*e,i=r>0,s=0;if(i&&(o<=600?s=r%300:(s=(600-50*e)%300+(o-600))>300&&(i=!1)),!i){t.setAttribute("visibility","hidden");continue}let n=Math.sqrt(Math.max(0,22500-(s-150)*(s-150)));t.setAttribute("visibility","visible"),t.setAttribute("cy",String(22+s)),t.setAttribute("rx",String(n)),t.setAttribute("ry",String(.1*n))}};return t=requestAnimationFrame(r),()=>cancelAnimationFrame(t)},[e]),(0,t.jsx)("svg",{width:344,height:344,viewBox:"0 0 344 344",fill:"none",xmlns:"http://www.w3.org/2000/svg",className:"top-1/2 left-1/2 absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none",style:{clipPath:"polygon(20px 22px, 324px 22px, 324px 322px, 20px 322px)"},"aria-hidden":"true",children:Array.from({length:7},(e,r)=>(0,t.jsx)("ellipse",{ref:e=>{a.current[r]=e},cx:172,cy:22,rx:0,ry:0,stroke:"#C0FE04",strokeWidth:2,visibility:"hidden"},r))})}let A=[{position:"col-start-1 lg:col-start-7 row-start-2",lines:["Building tomorrow's","digital products."]},{position:"col-start-5 lg:col-start-9 row-start-3",lines:["Independent by","design & engineering."]},{position:"col-start-1 lg:col-start-2 row-start-4",lines:["Clarity first.","Delight second."]},{position:"col-start-5 lg:col-start-4 row-start-5",lines:["Ship in small loops.","Aim for long arcs."]}];function h({getProgress:e}){return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsx)(m,{getProgress:e}),A.map((e,r)=>(0,t.jsx)("div",{className:`col-span-8 lg:col-span-4 p-2 font-medium text-[5.6svw] lg:text-3xl leading-tight ${e.position}`,children:e.lines.map((e,r)=>(0,t.jsx)(l,{text:e,groupDelayMs:100*r,className:"block"},r))},r))]})}let p=["Innovate","with","purpose"],B=["Innovate","with a","human touch"];function v(){let e=(0,r.useRef)(null),{height:s}=(0,o.useViewportSize)(),n=(0,a.useArrowFullscreenPastThreshold)(),[l,u]=(0,r.useState)("seg0-primary"),[c,m]=(0,r.useState)(!1),[A,v]=(0,r.useState)(0),g=(0,r.useRef)(!1),C=(0,r.useRef)(0);(0,r.useEffect)(()=>{let t=e.current;if(t)return(0,i.registerWebGLSection)("hyper-space",t)},[]),(0,r.useEffect)(()=>{let t=0,r=()=>{t=requestAnimationFrame(r);let a=e.current;if(!a)return;let o=window.innerHeight||1,i=-a.getBoundingClientRect().top,s=Math.min(7,Math.max(0,Math.floor(i/o))),n=s<=1?"seg0-primary":s<=3?"seg0-secondary":s<=5?"seg1":"end";u(e=>e===n?e:n);let l=i>-.2*o;l!==g.current&&(g.current=l,m(l),l&&v(e=>e+1)),C.current=Math.min(1,Math.max(0,(i/o-4)/2))};return t=requestAnimationFrame(r),()=>cancelAnimationFrame(t)},[]);let x=(0,r.useMemo)(()=>()=>C.current,[]);return(0,t.jsx)("div",{ref:e,className:`relative transition-colors duration-300 ease-out motion-reduce:transition-none ${n?"text-white":"text-l1"}`,style:{height:`${s>0?8*s:8}px`},children:(0,t.jsxs)("div",{className:"top-0 sticky grid grid-cols-12 grid-rows-6 px-4 lg:px-14 py-18 lg:py-24 w-full",style:{minHeight:`${s>0?s:1}px`},children:["seg0-primary"===l&&(0,t.jsx)(f,{lines:p,play:c},`p-${A}`),"seg0-secondary"===l&&(0,t.jsx)(f,{lines:B,play:c},`s-${A}`),"seg1"===l&&(0,t.jsx)(h,{getProgress:x}),"end"===l&&(0,t.jsx)(d,{})]})})}e.s(["default",()=>v])},37052,e=>{"use strict";var t=e.i(87420),r=e.i(57864),a=e.i(98990),o=e.i(99396);let i="gap-2 grid grid-cols-12 font-bold text-[7.2svw] lg:text-[6svw] 2xl:text-[5svw] xl:text-[5.6svw] uppercase leading-none",s={fontVariationSettings:'"wdth" 120'},n="block before:absolute relative before:inset-0 p-2 lg:hover:before:border-l1 before:border-2 before:border-transparent active:before:border-l1 before:border-dotted uppercase before:content-[''] before:transition-colors before:duration-200 cursor-pointer pointer-events-auto before:pointer-events-none",l=[["RedNote","https://xhslink.com/m/9VQT99pmKGj"],["Bilibili","https://b23.tv/C6YHUGG"],["NetEase Music","https://music.163.com/#/artist?id=121587079"],["YouTube","https://www.youtube.com/@yzs-cali-yang"],["Instagram","https://www.instagram.com/caliyang0693"],["Douyin","https://www.douyin.com/user/MS4wLjABAAAAwZDZH1-khE631mUgvp1U0ZsJM7w-yoLCMUymkTEPzxiA1Y5peo-hNZLApZ4LORoi"]];function u(){let e=(0,r.useWebGLSectionRef)("footer"),{lang:u}=(0,o.useLanguage)(),c="zh"===u,f=c?`${i} !leading-[1.12]`:i;return(0,t.jsxs)("footer",{id:"contact",ref:e,className:"z-10 relative flex flex-col justify-center p-6 lg:p-16 w-full h-dvh lg:h-screen pointer-events-none",children:[(0,t.jsxs)("div",{className:f,style:s,children:[(0,t.jsx)(a.default,{text:c?"感知":"Perception",startDelayMs:300,className:"col-span-6 md:col-span-5 xl:col-span-4 md:col-start-2 xl:col-start-3 text-left pointer-events-auto"},`f1a-${u}`),(0,t.jsx)(a.default,{text:c?"归零":"Reset",startDelayMs:300,reverse:!0,className:"col-span-6 md:col-span-5 xl:col-span-4 text-right pointer-events-auto"},`f1b-${u}`)]}),(0,t.jsx)("div",{className:f,style:s,children:(0,t.jsx)(a.default,{text:c?"一切":"Everything",startDelayMs:300,className:"col-span-12 md:col-start-2 xl:col-start-3 text-left pointer-events-auto"},`f2-${u}`)}),(0,t.jsx)("div",{className:f,style:s,children:(0,t.jsx)(a.default,{text:c?"重新开始":"Begins Anew",startDelayMs:300,reverse:!0,className:"col-span-12 md:col-end-12 xl:col-end-11 text-right pointer-events-auto"},`f3-${u}`)}),(0,t.jsx)("div",{className:"absolute inset-0 flex flex-col justify-end px-4 lg:px-14 py-18 lg:py-24 font-mono-2 text-sm lg:text-base",children:(0,t.jsxs)("div",{className:"flex lg:flex-row flex-col justify-between w-full",children:[(0,t.jsx)("a",{className:n,href:"mailto:yzs13968803946@qq.com",children:(0,t.jsx)(a.default,{text:"yzs13968803946@qq.com",startDelayMs:300})}),(0,t.jsx)("div",{className:"flex flex-row flex-wrap items-center gap-2 lg:gap-4",children:l.map(([e,r])=>(0,t.jsx)("a",{className:n,target:"_blank",rel:"noopener noreferrer",href:r,children:(0,t.jsx)(a.default,{text:e,startDelayMs:300})},e))})]})})]})}e.s(["default",()=>u])},37721,e=>{"use strict";let t;var r=e.i(87420),a=e.i(61893),o=e.i(11315),i=e.i(8842);function s(){return(s=Object.assign.bind()).apply(null,arguments)}var n=e.i(30617),l=e.i(45462);let u=a.forwardRef(({envMap:e,resolution:t=256,frames:r=1/0,makeDefault:o,children:u,...c},f)=>{let d=(0,n.useThree)(({set:e})=>e),m=(0,n.useThree)(({camera:e})=>e),A=(0,n.useThree)(({size:e})=>e),h=a.useRef(null);a.useImperativeHandle(f,()=>h.current,[]);let p=a.useRef(null),B=function(e,t,r){let o=(0,n.useThree)(e=>e.size),i=(0,n.useThree)(e=>e.viewport),s="number"==typeof e?e:o.width*i.dpr,u=o.height*i.dpr,c=("number"==typeof e?void 0:e)||{},{samples:f=0,depth:d,...m}=c,A=null!=d?d:c.depthBuffer,h=a.useMemo(()=>{let e=new l.WebGLRenderTarget(s,u,{minFilter:l.LinearFilter,magFilter:l.LinearFilter,type:l.HalfFloatType,...m});return A&&(e.depthTexture=new l.DepthTexture(s,u,l.FloatType)),e.samples=f,e},[]);return a.useLayoutEffect(()=>{h.setSize(s,u),f&&(h.samples=f)},[f,h,s,u]),a.useEffect(()=>()=>h.dispose(),[]),h}(t);a.useLayoutEffect(()=>{c.manual||(h.current.aspect=A.width/A.height)},[A,c]),a.useLayoutEffect(()=>{h.current.updateProjectionMatrix()});let v=0,g=null,C="function"==typeof u;return(0,i.useFrame)(t=>{C&&(r===1/0||v<r)&&(p.current.visible=!1,t.gl.setRenderTarget(B),g=t.scene.background,e&&(t.scene.background=e),t.gl.render(t.scene,h.current),t.scene.background=g,t.gl.setRenderTarget(null),p.current.visible=!0,v++)}),a.useLayoutEffect(()=>{if(o)return d(()=>({camera:h.current})),()=>d(()=>({camera:m}))},[h,o,d]),a.createElement(a.Fragment,null,a.createElement("perspectiveCamera",s({ref:h},c),!C&&u),a.createElement("group",{ref:p},C&&u(B.texture)))});var c=e.i(51869),f=e.i(64843),d=e.i(66838),m=e.i(65905);let A=(0,a.createContext)(null);function h(){let e=(0,a.useContext)(A);if(!e)throw Error("useSceneEnv must be inside SceneEnvContext");return e}let p=Math.hypot(4,9),B=Math.atan2(9,4);class v{angle=B;raycaster=new l.Raycaster;plane=new l.Plane(new l.Vector3(0,0,1),0);ndc=new l.Vector2;hit=new l.Vector3;update(e,t,r,a,o,i){let s=B;r&&(this.ndc.set(2*t.x-1,2*t.y-1),this.raycaster.setFromCamera(this.ndc,e),this.raycaster.ray.intersectPlane(this.plane,this.hit)&&(s=Math.atan2(-this.hit.y,-this.hit.x)));let n=s-this.angle;n=Math.atan2(Math.sin(n),Math.cos(n)),this.angle+=n*(1-Math.exp(-6*a)),o.set(Math.cos(this.angle)*p,Math.sin(this.angle)*p,i)}}var g=e.i(57864),C=e.i(28325);function x(){let{camera:e}=(0,n.useThree)(),t=h(),r=(0,a.useMemo)(()=>new l.Vector2(0,0),[]),o=(0,a.useMemo)(()=>new l.Vector3,[]),s=(0,a.useRef)(null);return(0,i.useFrame)((a,i)=>{if(!e.isPerspectiveCamera)return;let n=g.frameState.viewportW||window.innerWidth||1,u=e.aspect||1,c=l.MathUtils.radToDeg(2*Math.atan(Math.tan(l.MathUtils.degToRad(n>=1024?60:38)/2)/u));Math.abs(e.fov-c)>1e-4&&(e.fov=c,e.updateProjectionMatrix());let f=Math.min(1,Math.max(0,g.frameState.overlay)),d=l.MathUtils.lerp(24,32,f),m=d+8;if(t.ready){null===s.current&&(s.current=a.clock.elapsedTime);let e=Math.min((a.clock.elapsedTime-s.current)/1.2,1);m=l.MathUtils.lerp(d+8,d,(0,C.customCubic)(e))}let A=0,h=0;if(!t.isMobile){let e=t.pointerUv,r=(.5-e.x)*2,a=(.5-e.y)*2;A=1.4*r,h=1.4*a*.6}let p=t.pointerInsideRef.current?.18:.05;r.x=l.MathUtils.lerp(r.x,A,p),r.y=l.MathUtils.lerp(r.y,h,p),e.position.set(r.x,r.y,m),o.set(-(.12*r.x),-(.12*r.y),0),e.lookAt(o)},-2),null}let M=`
precision mediump float;
precision mediump int;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`,R=`
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform float uRadius;
uniform float uFalloff;
uniform float uMix;
uniform float uDisplace;
uniform float uSkew;
uniform float uAngle;
uniform vec3 uVignetteColor;
uniform vec2 uPos; // 动态中心（跟随指针，如原始实现）
uniform vec2 uResolution;
uniform vec3 uClearColor;
// 边缘明暗强度：[-1,1]，负值加深暗角，正值提亮边缘
uniform float uEdgeIntensity;

mat2 rot(float a) {
  return mat2(cos(a),-sin(a),sin(a),cos(a));
}
void main() {
  vec2 uv = vUv;
  vec4 color = vec4(vec3(1.), 0.);
  float luma = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  float displacement = (luma - 0.5) * uDisplace * 0.5;
  vec2 aspectRatio = vec2(uResolution.x/uResolution.y, 1.0);
  vec2 skew = vec2(uSkew, 1.0 - uSkew);
  float halfRadius = uRadius * 0.5;
  float innerEdge = halfRadius - uFalloff * halfRadius * 0.5;
  float outerEdge = halfRadius + uFalloff * halfRadius * 0.5;
  // 使用动态指针位置作为暗角中心（原始方案）
  vec2 pos = uPos;
  vec2 scaledUV = uv * aspectRatio * rot(uAngle * 6.28318530718) * skew;
  vec2 scaledPos = pos * aspectRatio * rot(uAngle * 6.28318530718) * skew;
  float radius = distance(scaledUV, scaledPos);
  float falloff = smoothstep(innerEdge + displacement, outerEdge + displacement, radius);
  // 原始实现不额外乘 uMix（保留 uniform 以兼容但不使用）

  // 根据 uEdgeIntensity 调整边缘亮暗：
  // uEdgeIntensity > 0 推向 0（提亮边缘），< 0 推向 1（加深暗角）
  float brighten = max(uEdgeIntensity, 0.0);
  float darken = max(-uEdgeIntensity, 0.0);
  falloff = mix(falloff, 0.0, brighten);
  falloff = mix(falloff, 1.0, darken);

  vec3 mixed = mix(uClearColor, uVignetteColor, falloff);
  gl_FragColor = vec4(mixed, falloff);
}
`,y=`
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform vec2 uResolution;
uniform sampler2D tInput;
uniform float uRadius;
uniform float uAngle;
uniform float uPhase;
uniform float uTime;
uniform float uMix;
uniform vec2 uPos;

void main() {
  vec2 uv = vUv;
  float angle = uAngle * 10.;
  vec2 originalUV = uv;
  vec2 pos = uPos;
  uv -= pos;
  vec2 R = vec2(uv.x * uResolution.x / uResolution.y, uv.y);
  float distanceToCenter = length(R);
  if (distanceToCenter <= uRadius) {
    float rot = atan(R.y, R.x) + angle * smoothstep(uRadius, 0., distanceToCenter);
    uv = vec2(cos(rot + uTime / 20. + uPhase * 6.28318530718), sin(rot + uTime / 20. + uPhase * 6.28318530718));
    uv = distanceToCenter * uv + pos;
  }
  float t = smoothstep(0., uRadius, distanceToCenter);
  vec2 mixedUV = mix(uv, originalUV, t);
  gl_FragColor = texture2D(tInput, mix(vUv, mixedUV, uMix));
}
`,b=`
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform float uMixRadius;
uniform vec2 uPos;
uniform float uFrequency;
uniform float uAmplitude;
uniform float uRotation;
uniform float uTime;
uniform vec2 uResolution;
uniform vec2 uMousePos;
uniform float uTrackMouse;

void main() {
  vec2 uv = vUv;
  vec2 waveCoord = vUv.xy * 2.0 - 1.0;
  float time = uTime * 0.25;
  float frequency = 20.0 * uFrequency;
  float amp = uAmplitude * 0.2;
  float waveX = sin((waveCoord.y + uPos.y) * frequency + (time)) * amp;
  float waveY = sin((waveCoord.x - uPos.x) * frequency + (time)) * amp;
  waveCoord.xy += vec2(mix(waveX, 0., uRotation), mix(0., waveY, uRotation));
  vec2 finalUV = waveCoord * 0.5 + 0.5;
  float aspectRatio = uResolution.x/uResolution.y;
  vec2 mPos = uPos + mix(vec2(0.), (uMousePos-0.5), uTrackMouse);
  float dist = (max(0.,1.-distance(uv * vec2(aspectRatio, 1.), mPos * vec2(aspectRatio, 1.)) * 4. * (1. - uMixRadius)));
  uv = mix(uv, finalUV, dist);
  gl_FragColor = texture2D(tInput, uv);
}
`,F=`
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform float uAmount;
uniform float uSpread;
uniform float uAngle;
uniform float uTime;
uniform float uSkew;
uniform float uCellScale;
uniform vec2 uPos;
uniform vec2 uResolution;
uniform float uMixRadius;
uniform int uMixRadiusInvert;
uniform int uEasing;
uniform vec2 uMousePos;
uniform float uTrackMouse;
uniform float uRoundness;

vec2 random2( vec2 p ) {
  return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);
}
mat2 rot(float a) { return mat2(cos(a),-sin(a),sin(a),cos(a)); }

float ease(int mode, float t){
  if(mode==1){ return 1.0 - (1.0 - t)*(1.0 - t); }
  if(mode==2){ return t < 0.5 ? 4.0*t*t*t : 1.0 - pow(-2.0*t + 2.0, 3.0)/2.0; }
  return t;
}

void main(){
  vec2 uv = vUv;
  float aspectRatio = uResolution.x / uResolution.y;
  vec2 skew = mix(vec2(1.0), vec2(1.0, 0.0), uSkew);
  vec2 st = (uv - uPos) * vec2(aspectRatio, 1.0) * uCellScale * uAmount;
  st = st * rot(uAngle * 2.0 * 3.14159265359) * skew;
  vec2 i_st = floor(st);
  vec2 f_st = fract(st);

  float m_dist = 15.0;
  float m_dist2 = 15.0;
  vec2 m_point = vec2(0.0);
  vec2 diffBest = vec2(0.0);
  for(int j=-1;j<=1;j++){
    for(int i=-1;i<=1;i++){
      vec2 neighbor = vec2(float(i), float(j));
      vec2 point = random2(i_st + neighbor);
      point = 0.5 + 0.5 * sin(5.0 + uTime * 0.2 + 6.2831 * point);
      vec2 diff = neighbor + point - f_st;
      float dist = length(diff);
      if(dist < m_dist){
        m_dist2 = m_dist;
        m_dist = dist;
        m_point = point;
        diffBest = diff;
      } else if (dist < m_dist2) {
        m_dist2 = dist;
      }
    }
  }

  vec2 offset = (m_point * 0.2 * uSpread * 2.0) - (uSpread * 0.2);
  // soften offsets near cell edges to get rounder pieces
  // Use F2-F1 (second nearest minus nearest) to detect corners and soften further
  float cornerSoft = smoothstep(0.0, max(0.0001, uRoundness) * 2.0, m_dist2 - m_dist);
  float edgeSoft = smoothstep(0.0, max(0.0001, uRoundness), m_dist) * cornerSoft;
  offset *= edgeSoft;

  vec2 mPos = uPos + mix(vec2(0.0), (uMousePos - 0.5), uTrackMouse);
  vec2 pos = mix(uPos, mPos, floor(uMixRadius));

  float rawDist = max(0.0, 1.0 - distance(uv * vec2(aspectRatio,1.0), mPos * vec2(aspectRatio,1.0)) * 4.0 * (1.0 - uMixRadius));
  if(uMixRadiusInvert == 1){ rawDist = 1.0 - rawDist; }
  float dist = ease(uEasing, rawDist);

  vec4 color = texture2D(tInput, uv + offset * dist);
  gl_FragColor = color;
}
`,T=`
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform sampler2D tBlueNoise;
uniform float uAmount;
uniform float uTilt;
uniform float uTime;
uniform vec2 uPos;
uniform vec2 uResolution;
uniform vec2 uBlueNoiseResolution;
uniform vec2 uMousePos;
uniform float uTrackMouse;

#define PI 3.14159265
#define PI2 6.28318530718
// 优化：降低采样迭代次数 (原 50.0 -> 24.0) 以大幅提升性能
#define ITERATIONS 32.0
#define GOLDEN_ANGLE 2.39996323

vec2 Sample(in float theta, inout float r) {
  r += 1.0 / r;
  return (r - 1.0) * vec2(cos(theta), sin(theta));
}

float getBlueNoiseOffset(vec2 st) {
  vec2 texSize = uBlueNoiseResolution;
  vec2 uv = fract(st * (uResolution/texSize) * vec2(texSize.x/texSize.y, 1.0));
  vec4 blueNoise = texture2D(tBlueNoise, uv);
  return mod((blueNoise.r - 0.5) * PI2, PI2);
}

vec4 Bokeh(sampler2D tex, vec2 uv, float blurRadius) {
  vec3 accumulatedColor = vec3(0.0);
  vec3 accumulatedWeights = vec3(0.0);
  float accumulatedAlpha = 0.0;
  float aspectRatio = uResolution.x / uResolution.y;
  vec2 basePixelSize = vec2(1.0 / aspectRatio, 1.0) * 0.04 * 0.075;
  float r = 1.0;
  float noiseOffset = (getBlueNoiseOffset(uv) - 0.5) * 0.01;
  float noiseAngle = noiseOffset * PI2;
  mat2 rotationMatrix = mat2(
    cos(noiseAngle), -sin(noiseAngle),
    sin(noiseAngle),  cos(noiseAngle)
  );
  for (float j = 0.0; j < GOLDEN_ANGLE * ITERATIONS; j += GOLDEN_ANGLE) {
    vec2 offset = Sample(j, r) * basePixelSize * blurRadius;
    float jitterAmount = 0.05 * (sin(j * 0.1) * 0.5 + 0.5);
    offset *= 1.0 + jitterAmount * sin(j * 0.7 + noiseOffset);
    vec2 sampleOffset = rotationMatrix * offset;
    vec4 colorSample = texture2D(tex, uv + sampleOffset);
    // Render targets are in Three.js working space (linear) by default.
    vec3 linearSample = colorSample.rgb;
    vec3 bokehWeight = vec3(5.0) + pow(linearSample, vec3(9.0)) * 150.0;
    accumulatedAlpha += colorSample.a;
    accumulatedColor += linearSample * bokehWeight;
    accumulatedWeights += bokehWeight;
  }
  vec3 linearOut = accumulatedColor / accumulatedWeights;
  return vec4(linearOut, accumulatedAlpha / ITERATIONS);
}

void main() {
  vec2 uv = vUv;
  if(uAmount == 0.0) { gl_FragColor = vec4(0.0); return; }
  vec2 pos = uPos + mix(vec2(0.0), (uMousePos - 0.5), uTrackMouse);
  float dis = distance(uv, pos) * 1000.0;
  float tilt = mix(1.0 - dis * 0.001, dis * 0.001, uTilt);
  float blurRadius = uAmount * tilt;
  gl_FragColor = Bokeh(tInput, uv, blurRadius);
}
`,E=`
precision mediump float;
precision mediump int;

varying vec2 vUv;

void main() {
  vUv = uv;
  // Render in clip-space to fill the screen, ignoring camera transforms
  gl_Position = vec4(position, 1.0);
}
`,D=`
precision mediump float;
precision mediump int;
varying vec2 vUv;
uniform sampler2D tInput;
uniform vec3 uBgColor;
uniform vec3 uOutputColor;
uniform int uLoaded;
// 可调输出混合权重（0.0~1.0），用于替代固定 0.6
uniform float uOutputMix;
// 方案A：更接近 before.js 的合成逻辑 (base * mix(1, blend, 0.26))

vec3 overlay(vec3 base, vec3 blend){
  return mix(2.0 * base * blend, 1.0 - 2.0 * (1.0 - base) * (1.0 - blend), step(0.5, base));
}

void main(){
  if(uLoaded!=1){
    gl_FragColor = vec4(197./255.,136./255.,122./255.,1.);
    return;
  }

  // uBgColor/uOutputColor are provided in Three.js working space (linear).
  vec3 bgTex = vec3(1.0); // 无背景贴图时近似常量
  vec3 base = mix(uBgColor, overlay(uBgColor, bgTex), 0.61);

  vec4 inTex = texture2D(tInput, vUv);
  // 作为 tint 加色，不依赖 alpha，保证 OUTPUT_COLOR 可见
  vec3 tint = uOutputColor * 0.35;
  vec3 blend = clamp(inTex.rgb + tint, 0.0, 1.0);
  vec3 finalColor = base * mix(vec3(1.0), blend, clamp(uOutputMix, 0.0, 1.0));

  gl_FragColor = vec4(finalColor, 1.0);

  #include <colorspace_fragment>
}
`,G=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`,I=`
precision highp float;

varying vec2 vUv;

uniform vec3 uColor;
uniform float uOpacity;
uniform float uPixelSize;
uniform float uRadiusScale;
uniform vec2 uResolution;

void main() {
  float a = clamp(uOpacity, 0.0, 1.0);

  vec2 normalizedPixelSize = vec2(
    uPixelSize / max(uResolution.x, 1.0),
    uPixelSize / max(uResolution.y, 1.0)
  );

  vec2 safePixelSize = max(normalizedPixelSize, vec2(1e-6));
  vec2 cellUV = fract(vUv / safePixelSize);

  // 与 route_transition 点阵一致：透明度直接映射圆半径。
  float radius = uRadiusScale * a;
  float distanceFromCenter = distance(cellUV, vec2(0.5));
  float aa = fwidth(distanceFromCenter) * 1.5;
  float circleMask = smoothstep(radius, radius - aa, distanceFromCenter);

  gl_FragColor = vec4(uColor, circleMask);
  #include <colorspace_fragment>
}
`,S=`
varying vec3 worldNormal;
varying vec3 eyeVector;
varying float modelLocalY;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;

  gl_Position = projectionMatrix * mvPosition;

  // vec3 transformedNormal = modelMatrix * normal;
  worldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
  eyeVector = normalize(worldPos.xyz - cameraPosition);
  modelLocalY = position.y;
}
`,w=`
uniform float uIorR;
uniform float uIorY;
uniform float uIorG;
uniform float uIorC;
uniform float uIorB;
uniform float uIorP;

uniform float uSaturation;
uniform float uChromaticAberration;
uniform float uRefractPower;
uniform float uFresnelPower;
uniform float uShininess;
uniform float uDiffuseness;
uniform vec3 uLight;
// New tone controls
uniform float uBrightness;      // scales base refracted color
uniform float uContrast;        // adjusts contrast around 0.5
uniform float uGamma;           // gamma correction (1.0 = neutral)
uniform float uSpecularStrength;// scales specular contribution
uniform float uFresnelStrength; // scales fresnel contribution
uniform vec3 uFresnelSideDir;   // fresnel side direction (world space)

// Tint controls for colored glass effect
uniform vec4 uTintColorA;      // gradient color A (rgb) + alpha
uniform vec4 uTintColorB;      // gradient color B (rgb) + alpha
uniform vec2 uTintLocalYRange; // model local y min/max for vertical gradient normalization
uniform float uTintEnabled;   // 0.0 = off, 1.0 = on
uniform float uTintMix;       // blend amount [0,1]
uniform float uTintThicknessMinAlpha; // min alpha at grazing angles [0,1]
uniform float uTintThicknessMaxAlpha; // max alpha at facing angles [0,1]

uniform vec2 uScreenResolutionPx;
uniform sampler2D uTexture;
// 1.0：多采样折射；0.0：单次采样（FBO skip 时省算力，遮罩全屏时几乎不可见）
uniform float uSceneRefractionEnabled;
// 1.0：每 loop 三次 texture2D（RGB）；0.0：六通道光谱路径
uniform float uRgbRefraction;

// 0.0 = Beer-Lambert transmission, 1.0 = Hard Light duotone mix
uniform float uDark;

varying vec3 worldNormal;
varying vec3 eyeVector;
varying float modelLocalY;

float random(vec2 p){
  return fract(sin(dot(p.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 sat(vec3 rgb, float adjustment) {
  const vec3 W = vec3(0.2125, 0.7154, 0.0721);
  vec3 intensity = vec3(dot(rgb, W));
  return mix(intensity, rgb, adjustment);
}

float fresnel(vec3 eyeDir, vec3 normal, float power) {
  float fresnelFactor = abs(dot(eyeDir, normal));
  float inversefresnelFactor = 1.0 - fresnelFactor;
  return pow(inversefresnelFactor, power);
}

float specular(vec3 light, vec3 normal, vec3 eyeDir, float shininess, float diffuseness) {
  vec3 lightVector = normalize(-light);
  vec3 halfVector = normalize(eyeDir + lightVector);

  float NdotL = dot(normal, lightVector);
  float NdotH = abs(dot(normal, halfVector));
  float kDiffuse = max(0.0, NdotL);

  float kSpecular = pow(NdotH, shininess);
  // 可选：使用 smoothstep 进一步柔化高光边缘
  // kSpecular = smoothstep(0.0, 1.0, kSpecular);
  return kSpecular + kDiffuse * diffuseness;
}

uniform int uLoop;

void main() {
  vec2 uv = gl_FragCoord.xy / uScreenResolutionPx.xy;
  // 确保法线归一化，这对平滑高光至关重要
  vec3 normal = normalize(worldNormal);
  vec3 eyeDir = normalize(eyeVector);
  vec3 color;

  if (uSceneRefractionEnabled > 0.5) {
    color = vec3(0.0);

    float noiseIntensity = 0.025;
    float noise = random(uv) * noiseIntensity;

    if (uRgbRefraction > 0.5) {
      vec3 refractVecR = refract(eyeDir, normal, (1.0 / uIorR));
      vec3 refractVecG = refract(eyeDir, normal, (1.0 / uIorG));
      vec3 refractVecB = refract(eyeDir, normal, (1.0 / uIorB));

      for (int i = 0; i < uLoop; i++) {
        float slide = float(i) / float(uLoop) * 0.1 + noise;
        float offset = (uRefractPower + slide) * uChromaticAberration;

        color.r += texture2D(uTexture, uv + refractVecR.xy * offset).r;
        color.g += texture2D(uTexture, uv + refractVecG.xy * offset).g;
        color.b += texture2D(uTexture, uv + refractVecB.xy * offset).b;
      }
    } else {
      vec3 refractVecR = refract(eyeDir, normal, (1.0 / uIorR));
      vec3 refractVecY = refract(eyeDir, normal, (1.0 / uIorY));
      vec3 refractVecG = refract(eyeDir, normal, (1.0 / uIorG));
      vec3 refractVecC = refract(eyeDir, normal, (1.0 / uIorC));
      vec3 refractVecB = refract(eyeDir, normal, (1.0 / uIorB));
      vec3 refractVecP = refract(eyeDir, normal, (1.0 / uIorP));

      for (int i = 0; i < uLoop; i++) {
        float slide = float(i) / float(uLoop) * 0.1 + noise;

        float offsetR = (uRefractPower + slide * 1.0) * uChromaticAberration;
        float offsetY = (uRefractPower + slide * 1.0) * uChromaticAberration;
        float offsetG = (uRefractPower + slide * 2.0) * uChromaticAberration;
        float offsetC = (uRefractPower + slide * 2.5) * uChromaticAberration;
        float offsetB = (uRefractPower + slide * 3.0) * uChromaticAberration;
        float offsetP = (uRefractPower + slide * 1.0) * uChromaticAberration;

        float r = texture2D(uTexture, uv + refractVecR.xy * offsetR).x * 0.5;

        vec3 ySample = texture2D(uTexture, uv + refractVecY.xy * offsetY).xyz;
        float y = (ySample.x * 2.0 + ySample.y * 2.0 - ySample.z) / 6.0;

        float g = texture2D(uTexture, uv + refractVecG.xy * offsetG).y * 0.5;

        vec3 cSample = texture2D(uTexture, uv + refractVecC.xy * offsetC).xyz;
        float c = (cSample.y * 2.0 + cSample.z * 2.0 - cSample.x) / 6.0;

        float b = texture2D(uTexture, uv + refractVecB.xy * offsetB).z * 0.5;

        vec3 pSample = texture2D(uTexture, uv + refractVecP.xy * offsetP).xyz;
        float p = (pSample.z * 2.0 + pSample.x * 2.0 - pSample.y) / 6.0;

        float R = r + (2.0 * p + 2.0 * y - c) / 3.0;
        float G = g + (2.0 * y + 2.0 * c - p) / 3.0;
        float B = b + (2.0 * c + 2.0 * p - y) / 3.0;

        color.r += R;
        color.g += G;
        color.b += B;
      }
    }

    color /= float(uLoop);
  } else {
    color = texture2D(uTexture, uv).rgb;
  }

  color = sat(color, uSaturation);

  // Tone adjustments to counter light/dark inversion
  color *= uBrightness;
  color = (color - 0.5) * uContrast + 0.5;
  // prevent division by zero; apply gamma correction
  float invGamma = 1.0 / max(uGamma, 0.0001);
  color = pow(max(color, 0.0), vec3(invGamma));

  // 有色玻璃透射/混合：保持原计算逻辑不变
  // uDark = 0 -> Beer-Lambert
  // uDark = 1 -> Hard Light
  float mode = clamp(uDark, 0.0, 1.0);

  // --- Beer-Lambert (原逻辑) ---
  float localYMin = uTintLocalYRange.x;
  float localYMax = uTintLocalYRange.y;
  float localYDenominator = max(localYMax - localYMin, 1e-5);
  float tintGradientFactor = clamp((modelLocalY - localYMin) / localYDenominator, 0.0, 1.0);
  vec4 tintColorGradient = mix(uTintColorB, uTintColorA, tintGradientFactor);

  float ndotv = abs(dot(normal, eyeDir));
  float thicknessMask = clamp(1.0 - ndotv, 0.0, 1.0);
  float tintAlpha = clamp(tintColorGradient.a, 0.0, 1.0);
  float minAlpha = clamp(uTintThicknessMinAlpha, 0.0, 1.0);
  float maxAlpha = clamp(uTintThicknessMaxAlpha, 0.0, 1.0);
  tintAlpha *= mix(maxAlpha, minAlpha, thicknessMask);

  float tintK_beer = clamp(uTintEnabled, 0.0, 1.0) * tintAlpha;
  vec3 tintColorClamped = clamp(tintColorGradient.rgb, 0.001, 1.0);
  float thickness = clamp(uTintMix, 0.01, 3.0);
  vec3 transmittance = pow(tintColorClamped, vec3(thickness));
  vec3 beerColor = mix(color, color * transmittance, tintK_beer);

  // --- Hard Light (原逻辑) ---
  float tintK_hard = clamp(uTintEnabled, 0.0, 1.0) * clamp(uTintMix, 0.0, 1.0) * tintAlpha;
  vec3 baseClamped = clamp(color, 0.0, 1.0);
  vec3 blendClamped = clamp(tintColorGradient.rgb, 0.0, 1.0);
  vec3 h = step(vec3(0.5), blendClamped);
  vec3 hard = mix(2.0 * baseClamped * blendClamped,
                  1.0 - 2.0 * (1.0 - blendClamped) * (1.0 - baseClamped),
                  h);
  vec3 hardColor = mix(color, hard, tintK_hard);

  color = mix(beerColor, hardColor, mode);

  // Specular
  float specularLight = specular(uLight, normal, eyeDir, uShininess, uDiffuseness);
  color += specularLight * uSpecularStrength;

  // Fresnel
  float f = fresnel(eyeDir, normal, uFresnelPower);
  float sideDot = dot(normal, normalize(uFresnelSideDir));
  float sideMask = smoothstep(-0.5, 0.5, sideDot);
  color.rgb += f * sideMask * vec3(uFresnelStrength);

  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,H=`
varying vec3 vWorldNormal;
varying vec3 vEyeVector;

void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vec4 mvPosition = viewMatrix * worldPos;

  gl_Position = projectionMatrix * mvPosition;

  vWorldNormal = normalize(modelMatrix * vec4(normal, 0.0)).xyz;
  vEyeVector = normalize(worldPos.xyz - cameraPosition);
}
`,P=`
uniform vec3 iResolution;
uniform float iTime;
uniform float uScrollDuration;

uniform vec3 uAccentColor;
uniform vec3 uStripeColorA;
uniform vec3 uStripeColorB;
uniform float uStripeReveal;

uniform float uOpacity;
uniform vec3 uLight;
uniform float uShininess;
uniform float uDiffuseness;
uniform float uSpecularStrength;
uniform float uFresnelPower;
uniform float uFresnelStrength;
uniform vec3 uFresnelSideDir;

varying vec3 vWorldNormal;
varying vec3 vEyeVector;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec3 rgb2hsv(vec3 c) {
  vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
  vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));
  float d = q.x - min(q.w, q.y);
  float e = 1.0e-10;
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

vec3 sampleHyperspace(vec2 fragCoord) {
  vec2 R = iResolution.xy;
  float baseScale = max(1.0, min(R.x, R.y));
  vec2 u = (fragCoord * 2.0 - R) / baseScale;

  float dur = max(uScrollDuration, 1e-4);
  float time = clamp(iTime, 0.0, dur);
  float t = clamp(time / dur, 0.0, 1.0);

  const float cellDensity = 100.0;
  vec2 polar = vec2(atan(u.y, u.x) / 3.0, length(u));
  float angleCoord = (6.0 - polar.x) * cellDensity;
  float angleId = floor(angleCoord) + 0.5;
  float angleCell = abs(fract(angleCoord) - 0.5);
  float radialCoord = (6.0 - polar.y) * cellDensity;
  vec2 q = vec2(angleId, radialCoord);

  float travel = smoothstep(0.0, 1.0, t);
  float keepProbability = mix(0.18, 1.0, travel);
  float scrollSpeed = mix(0.7, 3.6, travel);
  float trailLength = mix(2.7, 0.975, travel);
  float raySeq = fract((angleId + 0.5) * 0.61803398875);
  float keepEdge = 0.025;
  float keepMask = 1.0 - smoothstep(keepProbability - keepEdge, keepProbability + keepEdge, raySeq);

  float phaseBase = (q.y * 0.02 + q.x * 0.4) * fract(q.x * 0.61);
  vec4 spark = max(
    1.0 - fract(vec4(7.0, 6.0, 4.0, 0.0) * 0.02 + phaseBase + time * scrollSpeed) * trailLength,
    0.0
  );

  float channelMix = max(max(spark.r, spark.g), spark.b);
  float edge = max(fwidth(channelMix) * 1.5, 2.0 / max(iResolution.y, 1.0));
  float star = smoothstep(0.12 - edge, 0.12 + edge, channelMix);

  const float starThinness = 0.13;
  float thinEdge = max(fwidth(angleCell) * 1.5, 0.002);
  float thinMask = 1.0 - smoothstep(starThinness - thinEdge, starThinness + thinEdge, angleCell);
  star *= thinMask * keepMask;

  float radialBoost = pow(smoothstep(0.1, 1.0, polar.y), 1.25);
  float intensity = mix(0.0, 6.5, t * 1.2);

  float stripeBlend = hash21(vec2(angleId, 19.713));
  vec3 stripeRgb = mix(uStripeColorA, uStripeColorB, stripeBlend);

  vec3 hsvA = rgb2hsv(max(uStripeColorA, vec3(1e-5)));
  vec3 hsvB = rgb2hsv(max(uStripeColorB, vec3(1e-5)));
  float dh = abs(hsvA.x - hsvB.x);
  dh = min(dh, 1.0 - dh);
  float hueBand = clamp(dh * 1.25 + 0.04, 0.07, 0.24);

  vec3 hsv = rgb2hsv(max(stripeRgb, vec3(1e-5)));
  float idHash = hash21(vec2(angleId, 6.18));
  float idHash2 = hash21(vec2(angleId, 91.7));

  float scrollPhase = time * scrollSpeed;
  float hueAnim =
    sin(scrollPhase * 0.52 + angleId * 0.29 + idHash * 6.2831853) * (hueBand * 0.85);
  float hueStripe = (idHash - 0.5) * hueBand * 2.0;

  hsv.x = fract(hsv.x + hueStripe + hueAnim);
  hsv.y = clamp(hsv.y * mix(0.96, 1.06, idHash2), 0.0, 1.0);
  hsv.z = clamp(hsv.z * mix(0.97, 1.05, idHash), 0.0, 1.0);

  vec3 sparkColor = hsv2rgb(hsv);
  float pulse = mix(0.78, 1.0, smoothstep(0.14, 0.5, channelMix));
  sparkColor *= pulse;

  return intensity * radialBoost * sparkColor * star;
}

float fresnel(vec3 eyeDir, vec3 normal, float power) {
  float fresnelFactor = abs(dot(eyeDir, normal));
  float inversefresnelFactor = 1.0 - fresnelFactor;
  return pow(inversefresnelFactor, power);
}

float specular(vec3 light, vec3 normal, vec3 eyeDir, float shininess, float diffuseness) {
  vec3 lightVector = normalize(-light);
  vec3 halfVector = normalize(eyeDir + lightVector);

  float NdotL = dot(normal, lightVector);
  float NdotH = abs(dot(normal, halfVector));
  float kDiffuse = max(0.0, NdotL);

  float kSpecular = pow(NdotH, shininess);
  return kSpecular + kDiffuse * diffuseness;
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec3 stripes = sampleHyperspace(fragCoord);

  float reveal = clamp(uStripeReveal, 0.0, 1.0);

  float stripeLuma = dot(stripes, vec3(0.299, 0.587, 0.114));
  // 蓝→黑：全屏前压到纯黑底；满 reveal 不再填 accent，间隙为 #000
  float darken = smoothstep(0.0, 0.88, reveal);
  vec3 darkBase = mix(uAccentColor, vec3(0.0), darken);
  float gapMask = (1.0 - smoothstep(0.035, 0.12, stripeLuma)) * reveal;
  float crackGuard = 1.0 - smoothstep(0.68, 0.94, reveal);
  vec3 rgb = darkBase + stripes * reveal + uAccentColor * gapMask * 0.07 * crackGuard;

  vec3 normal = normalize(vWorldNormal);
  // DoubleSide：背面剔除关掉后须翻转法线，否则高光/Fresnel 在背对相机时会错且易像「穿模」
  if (!gl_FrontFacing) {
    normal = -normal;
  }
  vec3 eyeDir = normalize(vEyeVector);

  float glossMask = mix(1.0, smoothstep(0.1, 0.48, stripeLuma), reveal);

  float specularLight = specular(uLight, normal, eyeDir, uShininess, uDiffuseness);
  rgb += specularLight * uSpecularStrength * glossMask;

  float f = fresnel(eyeDir, normal, uFresnelPower);
  float sideDot = dot(normal, normalize(uFresnelSideDir));
  float sideMask = smoothstep(-0.5, 0.5, sideDot);
  rgb += f * sideMask * vec3(uFresnelStrength) * glossMask;

  float alpha = clamp(uOpacity, 0.0, 1.0);
  if (alpha <= 0.0001) discard;

  gl_FragColor = vec4(rgb, alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,U=`
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`,L=`
uniform float uCurlStrength;

vec2 applyCurl(vec2 screenUv) {
  float centered = 2.0 * screenUv.y - 1.0;
  float profile = 1.0 - sqrt(max(0.0, 1.0 - centered * centered));
  float uvScale = 1.0 - profile * uCurlStrength;
  float distortedX = (screenUv.x - 0.5) * uvScale + 0.5;
  return vec2(distortedX, screenUv.y);
}

uniform sampler2D map;
uniform sampler2D mapHover;
uniform vec4 uRect;
uniform float uPolarityPositive;
uniform float uLayerOpacity;
uniform float uRevealProgress;
uniform float uRevealSoftness;
uniform float uRevealDirection;
uniform float uHoverRevealProgress;
uniform float uDotPixelSize;
uniform vec2 uViewportPx;
varying vec2 vUv;

vec3 applyPolarity(vec3 rgb) {
  float t = clamp(uPolarityPositive, 0.0, 1.0);
  return mix(1.0 - rgb, rgb, t);
}

float hoverDotCoverage(vec2 screenUv) {
  float hoverProgress = clamp(uHoverRevealProgress, 0.0, 1.0);
  if (hoverProgress <= 0.0) return 0.0;

  vec2 viewportPx = max(uViewportPx, vec2(1.0));
  float dotPx = max(2.0, uDotPixelSize);
  vec2 cellSizeUv = vec2(dotPx) / viewportPx;
  vec2 safeCellSize = max(cellSizeUv, vec2(1.0 / 4096.0));

  float rectWidthPx = max(uRect.z * uViewportPx.x, 1.0);
  float rectHeightPx = max(uRect.w * uViewportPx.y, 1.0);
  float rectAspect = max(rectWidthPx / rectHeightPx, 1e-5);
  vec2 localUv = (screenUv - uRect.xy) / uRect.zw;
  vec2 centered = localUv * 2.0 - 1.0;
  centered.x *= rectAspect;
  float distToCenter = length(centered);

  float maxRadius = sqrt(1.0 + rectAspect * rectAspect);
  // 拉长中心向外的过渡环宽度，让 hover 扩散更柔和，不会出现短促硬边
  float revealBand = max(length(safeCellSize) * 18.0, 0.08);
  float revealRadius = hoverProgress * (maxRadius + revealBand);
  float grow = clamp((revealRadius - distToCenter) / revealBand, 0.0, 1.0);
  grow = smoothstep(0.0, 1.0, grow);

  vec2 cellUv = fract(screenUv / safeCellSize);
  vec2 cellFromCenter = abs(cellUv - vec2(0.5));
  float squareExtent = mix(0.0, 0.5, grow);
  float squareDist = max(cellFromCenter.x, cellFromCenter.y);
  float squareAa = max(fwidth(squareDist), 0.0001) * 1.5;
  if (squareExtent <= squareAa) {
    return 0.0;
  }
  if (grow >= 0.999) {
    return 1.0;
  }
  float squareMask = 1.0 - smoothstep(
    squareExtent - squareAa,
    squareExtent + squareAa,
    squareDist
  );

  return squareMask;
}

/** hover 未生效时 0；此时跳过 mapHover 采样省一半 tex2D（mip-0 路径下分支安全） */
vec4 sampleSourceRgba(vec2 localUv, float hoverCoverage) {
  vec2 lu = clamp(localUv, 0.0, 1.0);
  vec4 baseColor = texture2D(map, lu);
  if (hoverCoverage < 0.001) return baseColor;
  vec4 hoverColor = texture2D(mapHover, lu);
  return mix(baseColor, hoverColor, clamp(hoverCoverage, 0.0, 1.0));
}

/** 边缘 AA；aaRef = fwidth(localUv)，下限避免除零 */
float edgeAaMask(vec2 uv, vec2 aaRef) {
  vec2 edgeDist = min(uv, 1.0 - uv);
  float xClip = smoothstep(0.0, aaRef.x, edgeDist.x);
  float yClip = smoothstep(0.0, aaRef.y, edgeDist.y);
  return xClip * yClip;
}

void main() {
  vec2 distortedScreenUv = applyCurl(vUv);
  vec2 revealLocalUv = (vUv - uRect.xy) / uRect.zw;
  vec2 localUv = (distortedScreenUv - uRect.xy) / uRect.zw;

  vec2 aa = max(fwidth(localUv), vec2(1e-5));

  float revealProgress = clamp(uRevealProgress, 0.0, 1.0);
  float revealMask = 1.0;
  if (revealProgress <= 0.001) {
    revealMask = 0.0;
  } else if (revealProgress < 0.999) {
    float revealCoord = uRevealDirection < 0.0 ? 1.0 - revealLocalUv.x : revealLocalUv.x;
    float revealFeather = max(uRevealSoftness, 0.0);
    revealMask = revealFeather <= 0.0
      ? step(revealCoord, revealProgress)
      : 1.0 - smoothstep(
          revealProgress - revealFeather,
          revealProgress + revealFeather,
          revealCoord
        );
  }

  float hoverCov = hoverDotCoverage(vUv);
  vec4 sourceColor = sampleSourceRgba(localUv, hoverCov);
  float inside = edgeAaMask(localUv, aa);
  float outA = sourceColor.a * inside * revealMask * clamp(uLayerOpacity, 0.0, 1.0);
  if (outA < 0.001) {
    discard;
  }

  vec3 sourcePolar = applyPolarity(sourceColor.rgb);
  gl_FragColor = vec4(sourcePolar, outA);

  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,J=`
attribute vec4 uvRect;

varying vec2 vAtlasUv;

void main() {
  vAtlasUv = uvRect.xy + uv * uvRect.zw;

  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
}
`,k=`
uniform sampler2D map;

varying vec2 vAtlasUv;

void main() {
  vec4 color = texture2D(map, vAtlasUv);
  if (color.a < 0.01) discard;

  gl_FragColor = color;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`,O=`
uniform sampler2D tDiffuse;
uniform vec2 uResolution;
uniform float uEnabled;
uniform float uIntensity;
uniform float uThreshold;
uniform float uStreakScale;
uniform float uHotspotPower;
uniform float uGate;
uniform float uStarRays;

uniform vec3 uTailColor;

const float TAIL_MIX = 1.0;
const float TAIL_START = 0.0;
const float TAIL_FALLOFF = 0.5;

varying vec2 vUv;

float luma(vec3 c) {
  return dot(c, vec3(0.2126, 0.7152, 0.0722));
}

float brightMask(float lum) {
  // 适配 LDR/sRGB：阈值一般在 0.8~0.95
  float x = max(lum - uThreshold, 0.0);
  float m = x / max(1.0 - uThreshold, 1e-5);
  // smoothstep(0,1,m) 的多项式形式（避免多余 clamp；smoothstep 本身会夹紧）
  m = clamp(m, 0.0, 1.0);
  m = m * m * (3.0 - 2.0 * m);

  float hp = max(uHotspotPower, 1.0);
  if (hp > 1.01) {
    m = pow(m, hp);
  }

  // 线性软门控：减少断裂感且便宜
  float gate = clamp(uGate, 0.0, 1.0);
  float gm = (m - gate) / max(1.0 - gate, 1e-5);
  gm = clamp(gm, 0.0, 1.0);
  return m * gm;
}

vec3 sampleBright(vec2 uv) {
  vec3 c = texture2D(tDiffuse, uv).rgb;
  return c * brightMask(luma(c));
}

vec3 streak(vec2 dirPx) {
  vec3 acc = vec3(0.0);
  // 固定 8 次采样：用"半步相位"打散离散采样间隙（更像连续直线），且不引入 sin/exp
  vec2 pixel = floor(vUv * uResolution);
  float h = fract(52.9829189 * fract(dot(pixel, vec2(0.06711056, 0.00583715))));
  float phase = step(0.5, h) * 0.5; // 0 或 0.5（半步）
  for (int i = 1; i <= 8; i++) {
    float fi = float(i);
    // 增加步长以维持拖尾长度 (原 1 -> 1.5)
    float dist = fi * 1.5 + phase;
    // 放缓衰减：视觉上更"长"，同时保持成本低
    float w = 1.0 / (1.0 + dist * 0.22);
    w *= w;

    // 末端颜色：中心偏白，越靠近末端越靠近 uTailColor
    float t = clamp(dist / 8.0, 0.0, 1.0);
    float start = clamp(TAIL_START, 0.0, 0.95);
    float tt = clamp((t - start) / max(1.0 - start, 1e-5), 0.0, 1.0);
    tt = pow(tt, max(TAIL_FALLOFF, 0.001));
    vec3 ramp = mix(vec3(1.0), uTailColor, clamp(TAIL_MIX, 0.0, 1.0) * tt);

    vec2 o = dirPx * dist;
    acc += sampleBright(vUv + o) * (w * ramp);
    acc += sampleBright(vUv - o) * (w * ramp);
  }
  return acc;
}

void main() {
  vec3 flare = vec3(0.0);
  if (uEnabled >= 0.5 && uIntensity > 0.0001) {
    vec3 base = texture2D(tDiffuse, vUv).rgb;
    vec2 px = (1.0 / max(uResolution, vec2(1.0))) * uStreakScale;

    // 中心热点（让亮点像"星芒"有核心）
    flare += base * brightMask(luma(base)) * 1.2;
    // 4/6/8 芒：每条 streak 是"一条线"（包含正反两个方向）
    // 4 芒：0\xb0 + 90\xb0（十字）
    // 6 芒：0\xb0 + (+60\xb0) + (-60\xb0)（三条线）
    // 8 芒：0\xb0 + 90\xb0 + (+45\xb0) + (-45\xb0)
    if (uStarRays >= 7.5) {
      // 8 rays
      flare += streak(vec2(px.x, 0.0));
      flare += streak(vec2(0.0, px.y));
      const float c45 = 0.70710678;
      flare += streak(vec2(px.x * c45, px.y * c45));
      flare += streak(vec2(px.x * c45, -px.y * c45));
    } else if (uStarRays >= 5.5) {
      // 6 rays（整体旋转 30\xb0，保证有一根竖线）：90\xb0 + (+30\xb0) + (-30\xb0)
      flare += streak(vec2(0.0, px.y));
      const float c30 = 0.8660254;
      const float s30 = 0.5;
      flare += streak(vec2(px.x * c30, px.y * s30));
      flare += streak(vec2(px.x * c30, -px.y * s30));
    } else {
      // 4 rays
      flare += streak(vec2(px.x, 0.0));
      flare += streak(vec2(0.0, px.y));
    }

    // 保持核心尽量中性（末端颜色由 streak 内的 ramp 控制）
  }

  flare *= (uIntensity * 0.75);
  gl_FragColor = vec4(flare, 1.0);
  #include <colorspace_fragment>
}
`,K=`
uniform sampler2D tBase;
uniform sampler2D tFlare;

varying vec2 vUv;

void main() {
  vec3 base = texture2D(tBase, vUv).rgb;
  vec3 flare = texture2D(tFlare, vUv).rgb;

  gl_FragColor = vec4(base + flare, 1.0);
  #include <colorspace_fragment>
}
`,N=`
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  float left = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).y;
  float right = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).y;
  float top = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).x;
  float bottom = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).x;
  float value = 0.5 * (right - left - top + bottom);
  gl_FragColor = vec4(value, 0.0, 0.0, 1.0);
}
`,_=`
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform vec2 uTexelSize;
uniform vec2 uResolution;
uniform vec2 uPointer;
uniform vec2 uPointerDelta;
uniform float uCurlStrength;
uniform float uSplatRadius;
uniform float uSplatForce;
varying vec2 vUv;

void main() {
  float left = abs(texture2D(uCurl, vUv - vec2(uTexelSize.x, 0.0)).x);
  float right = abs(texture2D(uCurl, vUv + vec2(uTexelSize.x, 0.0)).x);
  float top = abs(texture2D(uCurl, vUv + vec2(0.0, uTexelSize.y)).x);
  float bottom = abs(texture2D(uCurl, vUv - vec2(0.0, uTexelSize.y)).x);
  float center = texture2D(uCurl, vUv).x;

  vec2 force = vec2(top - bottom, right - left);
  float forceLength = length(force);
  if (forceLength > 0.0001) {
    force /= forceLength;
  } else {
    force = vec2(0.0);
  }

  force *= uCurlStrength * center;
  force.y *= -1.0;

  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity += force * 0.016;
  velocity = clamp(velocity, vec2(-1000.0), vec2(1000.0));

  vec2 mouseUv = uPointer / max(uResolution, vec2(0.0001));
  vec2 diff = vUv - mouseUv;
  diff.x *= uResolution.x / max(uResolution.y, 0.0001);
  float pointerMask = exp(-dot(diff, diff) / max(uSplatRadius, 0.0001));
  velocity += (uPointerDelta / max(uResolution, vec2(0.0001))) * pointerMask * uSplatForce;

  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`,j=`
uniform sampler2D uVelocity;
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  float left = texture2D(uVelocity, vUv - vec2(uTexelSize.x, 0.0)).x;
  float right = texture2D(uVelocity, vUv + vec2(uTexelSize.x, 0.0)).x;
  float top = texture2D(uVelocity, vUv + vec2(0.0, uTexelSize.y)).y;
  float bottom = texture2D(uVelocity, vUv - vec2(0.0, uTexelSize.y)).y;
  float divergence = 0.5 * (right - left + top - bottom);
  gl_FragColor = vec4(divergence, 0.0, 0.0, 1.0);
}
`,Q=`
void main() {
  gl_FragColor = vec4(0.0);
}
`,V=`
uniform sampler2D uPressure;
uniform sampler2D uDivergence;
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  float left = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float right = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float top = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float bottom = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  float divergence = texture2D(uDivergence, vUv).x;
  float pressure = (left + right + top + bottom - divergence) * 0.25;
  gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`,X=`
uniform sampler2D uVelocity;
uniform sampler2D uPressure;
uniform vec2 uTexelSize;
varying vec2 vUv;

void main() {
  float left = texture2D(uPressure, vUv - vec2(uTexelSize.x, 0.0)).x;
  float right = texture2D(uPressure, vUv + vec2(uTexelSize.x, 0.0)).x;
  float top = texture2D(uPressure, vUv + vec2(0.0, uTexelSize.y)).x;
  float bottom = texture2D(uPressure, vUv - vec2(0.0, uTexelSize.y)).x;
  vec2 velocity = texture2D(uVelocity, vUv).xy;
  velocity -= vec2(right - left, top - bottom);
  gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`,Y=`
uniform sampler2D uVelocity;
uniform sampler2D uProjectedVelocity;
uniform vec2 uTexelSize;
uniform float uDissipation;
varying vec2 vUv;

void main() {
  vec2 velocity = texture2D(uProjectedVelocity, vUv).xy;
  vec2 coord = clamp(vUv - velocity * uTexelSize * 0.016, 0.0, 1.0);
  vec2 advected = texture2D(uProjectedVelocity, coord).xy;
  advected /= 1.0 + uDissipation * 0.016;
  gl_FragColor = vec4(advected, 0.0, 1.0);
}
`,W=`
uniform sampler2D tDiffuse;
uniform sampler2D uVelocity;
uniform vec2 uSimSize;
uniform float uDisplacementStrength;
uniform float uChromaticBoost;
uniform float uEffectEnabled;

vec3 spectrum(float x) {
  return cos((x - vec3(0.0, 0.5, 1.0)) * vec3(0.6, 1.0, 0.5) * 3.14);
}

vec4 getFluidDisplayColor(vec2 uv) {
  vec2 velocity = texture2D(uVelocity, uv).xy;
  float effectEnabled = step(0.5, uEffectEnabled);
  vec2 displacement = velocity / max(uSimSize, vec2(1.0)) * uDisplacementStrength * effectEnabled;
  float velocityMagnitude = length(displacement);

  const int samples = 4; // 采样次数
  vec4 color = vec4(0.0);
  vec3 weightSum = vec3(0.0);

  for (int index = 0; index < samples; index++) {
    float t = float(index) / float(samples - 1);
    vec3 weight = max(vec3(0.0), cos((t - vec3(0.0, 0.5, 1.0)) * 3.14159 * 0.5));
    vec4 sampleColor = texture2D(tDiffuse, clamp(uv - displacement * 0.3 * (t + 0.3) * velocityMagnitude, 0.0, 1.0));
    color.rgb += sampleColor.rgb * weight;
    color.a += sampleColor.a * (weight.r + weight.g + weight.b) / 3.0;
    weightSum += weight;
  }

  color.rgb /= max(weightSum, vec3(0.0001));
  color.a /= max((weightSum.r + weightSum.g + weightSum.b) / 3.0, 0.0001);

  vec3 spectralHighlight = spectrum(sin(velocityMagnitude * 2.0) * 0.4 + 0.6);
  color.rgb += spectralHighlight * smoothstep(0.2, 0.8, velocityMagnitude) * 0.5 * uChromaticBoost * effectEnabled;

  return color;
}

uniform vec2 uTrail[16];
uniform float uTrailStrength[16];
uniform float uTrailCount;
uniform vec3 uPointerColor;
uniform float uPointerOpacity;
uniform float uPointerDotRadius;
uniform float uPointerPixelSize;
uniform vec2 uResolution;
uniform float uDevicePixelRatio;

float cellEquals(vec2 a, vec2 b) {
  vec2 d = abs(a - b);
  return 1.0 - step(0.5, max(d.x, d.y));
}

vec4 applyPointerOverlay(vec2 uv, vec4 baseColor) {
  float cssPixelSize = uPointerPixelSize * max(uDevicePixelRatio, 1.0);
  vec2 normalizedPixelSize = vec2(
    cssPixelSize / max(uResolution.x, 1.0),
    cssPixelSize / max(uResolution.y, 1.0)
  );

  vec2 safePixelSize = max(normalizedPixelSize, vec2(1e-6));
  vec2 cellId = floor(uv / safePixelSize);
  vec2 cellUV = fract(uv / safePixelSize);

  float highlight = 0.0;
  for (int i = 0; i < 16; i++) {
    float enabled = step(float(i), uTrailCount - 1.0);
    vec2 pointerCell = floor(uTrail[i] / safePixelSize);
    float isSame = cellEquals(cellId, pointerCell);
    float weight = clamp(uTrailStrength[i], 0.0, 1.0);
    highlight = max(highlight, enabled * isSame * weight);
  }

  float distToCenter = distance(cellUV, vec2(0.5));
  float aa = fwidth(distToCenter) * 1.5;
  float radius = clamp(uPointerDotRadius, 0.0, 1.0);
  float circleMask = smoothstep(radius, radius - aa, distToCenter);
  float overlayAlpha = circleMask * highlight * clamp(uPointerOpacity, 0.0, 1.0);
  baseColor.rgb = mix(baseColor.rgb, uPointerColor, overlayAlpha);

  return baseColor;
}

varying vec2 vUv;

void main() {
  vec4 color = getFluidDisplayColor(vUv);
  gl_FragColor = applyPointerOverlay(vUv, color);
  #include <colorspace_fragment>
}
`,z={light:{bg:"#ffead6",vignette:"#6196ff",output:"#acffb9"},dark:{bg:"#2c4bd5",vignette:"#00000d",output:"#00344C"}},Z={light:{outputMix:.65,edgeIntensity:-.16},dark:{outputMix:.95,edgeIntensity:-.82}},q=new l.Vector2(.5,-.1);function $(e,t){return new l.ShaderMaterial({vertexShader:M,fragmentShader:e,uniforms:t,transparent:!1,blending:l.NoBlending,depthTest:!1,depthWrite:!1,toneMapped:!1})}function ee(){let{gl:e}=(0,n.useThree)(),t=h(),o=(0,a.useRef)(t);o.current=t;let s=(0,a.useMemo)(()=>{let e=function(){let e=new Uint8Array(65536);for(let t=0;t<16384;t++){let r=Math.floor(256*Math.random());e[4*t]=r,e[4*t+1]=r,e[4*t+2]=r,e[4*t+3]=255}let t=new l.DataTexture(e,128,128,l.RGBAFormat);return t.wrapS=l.RepeatWrapping,t.wrapT=l.RepeatWrapping,t.needsUpdate=!0,t}(),t=new l.Color(z.light.bg),r=new l.Color(z.light.vignette),a=new l.Color(z.light.output),o=new l.Vector2().copy(q),i=new l.Vector2(.5,.5),s=new l.Vector2(1,1),n=()=>({uResolution:{value:s},uTime:{value:0},uMousePos:{value:i}}),u=$(R,{...n(),uRadius:{value:.354},uFalloff:{value:1},uMix:{value:1},uDisplace:{value:0},uSkew:{value:.54},uAngle:{value:0},uEdgeIntensity:{value:Z.light.edgeIntensity},uVignetteColor:{value:r},uClearColor:{value:t},uColorAlpha:{value:1},uTrackMouse:{value:1},uPos:{value:q.clone()}}),c=$(y,{...n(),tInput:{value:null},uRadius:{value:.25},uAngle:{value:.1},uPhase:{value:0},uMix:{value:.5},uPos:{value:o}}),f=$(b,{...n(),tInput:{value:null},uMixRadius:{value:1},uFrequency:{value:.35},uAmplitude:{value:1.18},uRotation:{value:0},uTrackMouse:{value:0},uPos:{value:o}}),d=$(F,{...n(),tInput:{value:null},uAmount:{value:1},uSpread:{value:.9},uAngle:{value:-.125},uSkew:{value:.9},uCellScale:{value:16},uMixRadius:{value:1},uMixRadiusInvert:{value:0},uEasing:{value:1},uTrackMouse:{value:0},uPos:{value:new l.Vector2(.5,.5)},uRoundness:{value:.02}}),m=[{name:"vignette",material:u,needsInput:!1},{name:"swirl",material:c,needsInput:!0},{name:"sine",material:f,needsInput:!0},{name:"shatter",material:d,needsInput:!0},{name:"bokeh",material:$(T,{...n(),tInput:{value:null},tBlueNoise:{value:e},uBlueNoiseResolution:{value:new l.Vector2(128,128)},uAmount:{value:2.35625},uTilt:{value:.5},uTrackMouse:{value:0},uPos:{value:q.clone()}}),needsInput:!0}].filter(e=>"shatter"!==e.name),A={tInput:{value:null},uBgColor:{value:t},uOutputColor:{value:a},uLoaded:{value:1},uOutputMix:{value:Z.light.outputMix}},h=new l.Scene,p=new l.OrthographicCamera(-1,1,1,-1,0,1),B=new l.Mesh(new l.PlaneGeometry(2,2),u);return B.frustumCulled=!1,h.add(B),{blueNoise:e,bgColor:t,vignetteColor:r,outputColor:a,smoothedPos:o,mousePos:i,rtSize:s,passes:m,vignette:u,shatter:d,outputUniforms:A,quadScene:h,quadCamera:p,quadMesh:B,read:null,write:null,targets:{bg:new l.Color(z.light.bg),vignette:new l.Color(z.light.vignette),output:new l.Color(z.light.output)}}},[]);(0,a.useEffect)(()=>{let e=z[t.theme];s.targets.bg.set(e.bg),s.targets.vignette.set(e.vignette),s.targets.output.set(e.output);let r=Z[t.theme];s.vignette.uniforms.uEdgeIntensity.value=r.edgeIntensity,s.outputUniforms.uOutputMix.value=r.outputMix},[t.theme,s]),(0,a.useEffect)(()=>()=>{s.read?.dispose(),s.write?.dispose(),s.blueNoise.dispose(),s.passes.forEach(e=>e.material.dispose()),s.shatter.dispose(),s.quadMesh.geometry.dispose()},[s]);let u=(0,a.useMemo)(()=>new l.Vector2,[]);(0,i.useFrame)((t,r)=>{e.getDrawingBufferSize(u);let a=Math.max(1,Math.floor(.3*u.x)),i=Math.max(1,Math.floor(.3*u.y));if(!s.read||s.read.width!==a||s.read.height!==i){s.read?.dispose(),s.write?.dispose();let t={depthBuffer:!1};s.read=new l.WebGLRenderTarget(a,i,t),s.write=new l.WebGLRenderTarget(a,i,t),s.rtSize.set(a,i);let r=new l.Color;e.getClearColor(r);let o=e.getClearAlpha();e.setClearColor(s.bgColor,1),e.setRenderTarget(s.read),e.clear(),e.setRenderTarget(s.write),e.clear(),e.setRenderTarget(null),e.setClearColor(r,o)}s.bgColor.lerp(s.targets.bg,.1),s.vignetteColor.lerp(s.targets.vignette,.1),s.outputColor.lerp(s.targets.output,.1);let n=!!o.current.pointerInsideRef.current;if(o.current.isMobile)s.smoothedPos.copy(q),s.mousePos.set(.5,.5);else{let e=n?o.current.pointerUv:q;s.smoothedPos.lerp(e,n?.1:.05),s.mousePos.copy(o.current.pointerUv)}let c=g.frameState.overlay,f=Math.max((0,g.overlayStride)(c,!1),2);if(c<.98&&g.frameState.frameCount%f==0&&s.read&&s.write){let r=t.clock.elapsedTime,a=e.getRenderTarget(),o=s.read,i=s.write;for(let t of s.passes){let a=t.material.uniforms;a.uTime.value=r,t.needsInput&&a.tInput&&(a.tInput.value=o.texture),s.quadMesh.material=t.material,e.setRenderTarget(i),e.render(s.quadScene,s.quadCamera);let n=o;o=i,i=n}s.read=o,s.write=i,e.setRenderTarget(a)}s.read&&(s.outputUniforms.tInput.value=s.read.texture)},-3);let c=(0,a.useMemo)(()=>new l.ShaderMaterial({vertexShader:E,fragmentShader:D,uniforms:s.outputUniforms,transparent:!1,depthTest:!1,depthWrite:!1,toneMapped:!1}),[s]);return(0,a.useEffect)(()=>()=>c.dispose(),[c]),(0,r.jsxs)("mesh",{renderOrder:-10,frustumCulled:!1,children:[(0,r.jsx)("planeGeometry",{args:[2,2]}),(0,r.jsx)("primitive",{object:c,attach:"material"})]})}let et={dark:"#0F1111",light:"#FBFAF4"};function er(){let{gl:e}=(0,n.useThree)(),t=h(),o=(0,a.useMemo)(()=>({uColor:{value:new l.Color(et.light)},uOpacity:{value:0},uPixelSize:{value:4},uRadiusScale:{value:.9},uResolution:{value:new l.Vector2(1,1)}}),[]);(0,a.useEffect)(()=>{o.uColor.value.set(et[t.theme])},[t.theme,o]),(0,i.useFrame)(()=>{o.uOpacity.value=(0,g.normalizeOverlay)(g.frameState.overlay),e.getDrawingBufferSize(o.uResolution.value),o.uPixelSize.value=4*e.getPixelRatio()});let s=(0,a.useMemo)(()=>new l.ShaderMaterial({vertexShader:G,fragmentShader:I,uniforms:o,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1}),[o]);return(0,a.useEffect)(()=>()=>s.dispose(),[s]),(0,r.jsxs)("mesh",{renderOrder:10,frustumCulled:!1,children:[(0,r.jsx)("planeGeometry",{args:[2,2]}),(0,r.jsx)("primitive",{object:s,attach:"material"})]})}var ea=l;function eo(e,t){if(t===l.TrianglesDrawMode)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),e;if(t!==l.TriangleFanDrawMode&&t!==l.TriangleStripDrawMode)return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",t),e;{let r=e.getIndex();if(null===r){let t=[],a=e.getAttribute("position");if(void 0===a)return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),e;for(let e=0;e<a.count;e++)t.push(e);e.setIndex(t),r=e.getIndex()}let a=r.count-2,o=[];if(r)if(t===l.TriangleFanDrawMode)for(let e=1;e<=a;e++)o.push(r.getX(0)),o.push(r.getX(e)),o.push(r.getX(e+1));else for(let e=0;e<a;e++)e%2==0?(o.push(r.getX(e)),o.push(r.getX(e+1)),o.push(r.getX(e+2))):(o.push(r.getX(e+2)),o.push(r.getX(e+1)),o.push(r.getX(e)));o.length/3!==a&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");let i=e.clone();return i.setIndex(o),i.clearGroups(),i}}let ei=parseInt(l.REVISION.replace(/\D+/g,""));function es(e){if("u">typeof TextDecoder)return new TextDecoder().decode(e);let t="";for(let r=0,a=e.length;r<a;r++)t+=String.fromCharCode(e[r]);try{return decodeURIComponent(escape(t))}catch(e){return t}}let en="srgb",el="srgb-linear";class eu extends ea.Loader{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(e){return new eh(e)}),this.register(function(e){return new ep(e)}),this.register(function(e){return new eb(e)}),this.register(function(e){return new eF(e)}),this.register(function(e){return new eT(e)}),this.register(function(e){return new ev(e)}),this.register(function(e){return new eg(e)}),this.register(function(e){return new eC(e)}),this.register(function(e){return new ex(e)}),this.register(function(e){return new eA(e)}),this.register(function(e){return new eM(e)}),this.register(function(e){return new eB(e)}),this.register(function(e){return new ey(e)}),this.register(function(e){return new eR(e)}),this.register(function(e){return new ed(e)}),this.register(function(e){return new eE(e)}),this.register(function(e){return new eD(e)})}load(e,t,r,a){let o,i=this;if(""!==this.resourcePath)o=this.resourcePath;else if(""!==this.path){let t=ea.LoaderUtils.extractUrlBase(e);o=ea.LoaderUtils.resolveURL(t,this.path)}else o=ea.LoaderUtils.extractUrlBase(e);this.manager.itemStart(e);let s=function(t){a?a(t):console.error(t),i.manager.itemError(e),i.manager.itemEnd(e)},n=new ea.FileLoader(this.manager);n.setPath(this.path),n.setResponseType("arraybuffer"),n.setRequestHeader(this.requestHeader),n.setWithCredentials(this.withCredentials),n.load(e,function(r){try{i.parse(r,o,function(r){t(r),i.manager.itemEnd(e)},s)}catch(e){s(e)}},r,s)}setDRACOLoader(e){return this.dracoLoader=e,this}setDDSLoader(){throw Error('THREE.GLTFLoader: "MSFT_texture_dds" no longer supported. Please update to "KHR_texture_basisu".')}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return -1===this.pluginCallbacks.indexOf(e)&&this.pluginCallbacks.push(e),this}unregister(e){return -1!==this.pluginCallbacks.indexOf(e)&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,r,a){let o,i={},s={};if("string"==typeof e)o=JSON.parse(e);else if(e instanceof ArrayBuffer)if(es(new Uint8Array(e.slice(0,4)))===eG){try{i[ef.KHR_BINARY_GLTF]=new eI(e)}catch(e){a&&a(e);return}o=JSON.parse(i[ef.KHR_BINARY_GLTF].content)}else o=JSON.parse(es(new Uint8Array(e)));else o=e;if(void 0===o.asset||o.asset.version[0]<2){a&&a(Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let n=new eZ(o,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});n.fileLoader.setRequestHeader(this.requestHeader);for(let e=0;e<this.pluginCallbacks.length;e++){let t=this.pluginCallbacks[e](n);t.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),s[t.name]=t,i[t.name]=!0}if(o.extensionsUsed)for(let e=0;e<o.extensionsUsed.length;++e){let t=o.extensionsUsed[e],r=o.extensionsRequired||[];switch(t){case ef.KHR_MATERIALS_UNLIT:i[t]=new em;break;case ef.KHR_DRACO_MESH_COMPRESSION:i[t]=new eS(o,this.dracoLoader);break;case ef.KHR_TEXTURE_TRANSFORM:i[t]=new ew;break;case ef.KHR_MESH_QUANTIZATION:i[t]=new eH;break;default:r.indexOf(t)>=0&&void 0===s[t]&&console.warn('THREE.GLTFLoader: Unknown extension "'+t+'".')}}n.setExtensions(i),n.setPlugins(s),n.parse(r,a)}parseAsync(e,t){let r=this;return new Promise(function(a,o){r.parse(e,t,a,o)})}}function ec(){let e={};return{get:function(t){return e[t]},add:function(t,r){e[t]=r},remove:function(t){delete e[t]},removeAll:function(){e={}}}}let ef={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class ed{constructor(e){this.parser=e,this.name=ef.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let r=0,a=t.length;r<a;r++){let a=t[r];a.extensions&&a.extensions[this.name]&&void 0!==a.extensions[this.name].light&&e._addNodeRef(this.cache,a.extensions[this.name].light)}}_loadLight(e){let t,r=this.parser,a="light:"+e,o=r.cache.get(a);if(o)return o;let i=r.json,s=((i.extensions&&i.extensions[this.name]||{}).lights||[])[e],n=new ea.Color(0xffffff);void 0!==s.color&&n.setRGB(s.color[0],s.color[1],s.color[2],el);let l=void 0!==s.range?s.range:0;switch(s.type){case"directional":(t=new ea.DirectionalLight(n)).target.position.set(0,0,-1),t.add(t.target);break;case"point":(t=new ea.PointLight(n)).distance=l;break;case"spot":(t=new ea.SpotLight(n)).distance=l,s.spot=s.spot||{},s.spot.innerConeAngle=void 0!==s.spot.innerConeAngle?s.spot.innerConeAngle:0,s.spot.outerConeAngle=void 0!==s.spot.outerConeAngle?s.spot.outerConeAngle:Math.PI/4,t.angle=s.spot.outerConeAngle,t.penumbra=1-s.spot.innerConeAngle/s.spot.outerConeAngle,t.target.position.set(0,0,-1),t.add(t.target);break;default:throw Error("THREE.GLTFLoader: Unexpected light type: "+s.type)}return t.position.set(0,0,0),t.decay=2,eX(t,s),void 0!==s.intensity&&(t.intensity=s.intensity),t.name=r.createUniqueName(s.name||"light_"+e),o=Promise.resolve(t),r.cache.add(a,o),o}getDependency(e,t){if("light"===e)return this._loadLight(t)}createNodeAttachment(e){let t=this,r=this.parser,a=r.json.nodes[e],o=(a.extensions&&a.extensions[this.name]||{}).light;return void 0===o?null:this._loadLight(o).then(function(e){return r._getNodeRef(t.cache,o,e)})}}class em{constructor(){this.name=ef.KHR_MATERIALS_UNLIT}getMaterialType(){return ea.MeshBasicMaterial}extendParams(e,t,r){let a=[];e.color=new ea.Color(1,1,1),e.opacity=1;let o=t.pbrMetallicRoughness;if(o){if(Array.isArray(o.baseColorFactor)){let t=o.baseColorFactor;e.color.setRGB(t[0],t[1],t[2],el),e.opacity=t[3]}void 0!==o.baseColorTexture&&a.push(r.assignTexture(e,"map",o.baseColorTexture,en))}return Promise.all(a)}}class eA{constructor(e){this.parser=e,this.name=ef.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let a=r.extensions[this.name].emissiveStrength;return void 0!==a&&(t.emissiveIntensity=a),Promise.resolve()}}class eh{constructor(e){this.parser=e,this.name=ef.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?ea.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser,a=r.json.materials[e];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();let o=[],i=a.extensions[this.name];if(void 0!==i.clearcoatFactor&&(t.clearcoat=i.clearcoatFactor),void 0!==i.clearcoatTexture&&o.push(r.assignTexture(t,"clearcoatMap",i.clearcoatTexture)),void 0!==i.clearcoatRoughnessFactor&&(t.clearcoatRoughness=i.clearcoatRoughnessFactor),void 0!==i.clearcoatRoughnessTexture&&o.push(r.assignTexture(t,"clearcoatRoughnessMap",i.clearcoatRoughnessTexture)),void 0!==i.clearcoatNormalTexture&&(o.push(r.assignTexture(t,"clearcoatNormalMap",i.clearcoatNormalTexture)),void 0!==i.clearcoatNormalTexture.scale)){let e=i.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new ea.Vector2(e,e)}return Promise.all(o)}}class ep{constructor(e){this.parser=e,this.name=ef.KHR_MATERIALS_DISPERSION}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?ea.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let a=r.extensions[this.name];return t.dispersion=void 0!==a.dispersion?a.dispersion:0,Promise.resolve()}}class eB{constructor(e){this.parser=e,this.name=ef.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?ea.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser,a=r.json.materials[e];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();let o=[],i=a.extensions[this.name];return void 0!==i.iridescenceFactor&&(t.iridescence=i.iridescenceFactor),void 0!==i.iridescenceTexture&&o.push(r.assignTexture(t,"iridescenceMap",i.iridescenceTexture)),void 0!==i.iridescenceIor&&(t.iridescenceIOR=i.iridescenceIor),void 0===t.iridescenceThicknessRange&&(t.iridescenceThicknessRange=[100,400]),void 0!==i.iridescenceThicknessMinimum&&(t.iridescenceThicknessRange[0]=i.iridescenceThicknessMinimum),void 0!==i.iridescenceThicknessMaximum&&(t.iridescenceThicknessRange[1]=i.iridescenceThicknessMaximum),void 0!==i.iridescenceThicknessTexture&&o.push(r.assignTexture(t,"iridescenceThicknessMap",i.iridescenceThicknessTexture)),Promise.all(o)}}class ev{constructor(e){this.parser=e,this.name=ef.KHR_MATERIALS_SHEEN}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?ea.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser,a=r.json.materials[e];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();let o=[];t.sheenColor=new ea.Color(0,0,0),t.sheenRoughness=0,t.sheen=1;let i=a.extensions[this.name];if(void 0!==i.sheenColorFactor){let e=i.sheenColorFactor;t.sheenColor.setRGB(e[0],e[1],e[2],el)}return void 0!==i.sheenRoughnessFactor&&(t.sheenRoughness=i.sheenRoughnessFactor),void 0!==i.sheenColorTexture&&o.push(r.assignTexture(t,"sheenColorMap",i.sheenColorTexture,en)),void 0!==i.sheenRoughnessTexture&&o.push(r.assignTexture(t,"sheenRoughnessMap",i.sheenRoughnessTexture)),Promise.all(o)}}class eg{constructor(e){this.parser=e,this.name=ef.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?ea.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser,a=r.json.materials[e];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();let o=[],i=a.extensions[this.name];return void 0!==i.transmissionFactor&&(t.transmission=i.transmissionFactor),void 0!==i.transmissionTexture&&o.push(r.assignTexture(t,"transmissionMap",i.transmissionTexture)),Promise.all(o)}}class eC{constructor(e){this.parser=e,this.name=ef.KHR_MATERIALS_VOLUME}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?ea.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser,a=r.json.materials[e];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();let o=[],i=a.extensions[this.name];t.thickness=void 0!==i.thicknessFactor?i.thicknessFactor:0,void 0!==i.thicknessTexture&&o.push(r.assignTexture(t,"thicknessMap",i.thicknessTexture)),t.attenuationDistance=i.attenuationDistance||1/0;let s=i.attenuationColor||[1,1,1];return t.attenuationColor=new ea.Color().setRGB(s[0],s[1],s[2],el),Promise.all(o)}}class ex{constructor(e){this.parser=e,this.name=ef.KHR_MATERIALS_IOR}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?ea.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser.json.materials[e];if(!r.extensions||!r.extensions[this.name])return Promise.resolve();let a=r.extensions[this.name];return t.ior=void 0!==a.ior?a.ior:1.5,Promise.resolve()}}class eM{constructor(e){this.parser=e,this.name=ef.KHR_MATERIALS_SPECULAR}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?ea.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser,a=r.json.materials[e];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();let o=[],i=a.extensions[this.name];t.specularIntensity=void 0!==i.specularFactor?i.specularFactor:1,void 0!==i.specularTexture&&o.push(r.assignTexture(t,"specularIntensityMap",i.specularTexture));let s=i.specularColorFactor||[1,1,1];return t.specularColor=new ea.Color().setRGB(s[0],s[1],s[2],el),void 0!==i.specularColorTexture&&o.push(r.assignTexture(t,"specularColorMap",i.specularColorTexture,en)),Promise.all(o)}}class eR{constructor(e){this.parser=e,this.name=ef.EXT_MATERIALS_BUMP}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?ea.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser,a=r.json.materials[e];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();let o=[],i=a.extensions[this.name];return t.bumpScale=void 0!==i.bumpFactor?i.bumpFactor:1,void 0!==i.bumpTexture&&o.push(r.assignTexture(t,"bumpMap",i.bumpTexture)),Promise.all(o)}}class ey{constructor(e){this.parser=e,this.name=ef.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){let t=this.parser.json.materials[e];return t.extensions&&t.extensions[this.name]?ea.MeshPhysicalMaterial:null}extendMaterialParams(e,t){let r=this.parser,a=r.json.materials[e];if(!a.extensions||!a.extensions[this.name])return Promise.resolve();let o=[],i=a.extensions[this.name];return void 0!==i.anisotropyStrength&&(t.anisotropy=i.anisotropyStrength),void 0!==i.anisotropyRotation&&(t.anisotropyRotation=i.anisotropyRotation),void 0!==i.anisotropyTexture&&o.push(r.assignTexture(t,"anisotropyMap",i.anisotropyTexture)),Promise.all(o)}}class eb{constructor(e){this.parser=e,this.name=ef.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,r=t.json,a=r.textures[e];if(!a.extensions||!a.extensions[this.name])return null;let o=a.extensions[this.name],i=t.options.ktx2Loader;if(!i)if(!(r.extensionsRequired&&r.extensionsRequired.indexOf(this.name)>=0))return null;else throw Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return t.loadTextureImage(e,o.source,i)}}class eF{constructor(e){this.parser=e,this.name=ef.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(e){let t=this.name,r=this.parser,a=r.json,o=a.textures[e];if(!o.extensions||!o.extensions[t])return null;let i=o.extensions[t],s=a.images[i.source],n=r.textureLoader;if(s.uri){let e=r.options.manager.getHandler(s.uri);null!==e&&(n=e)}return this.detectSupport().then(function(o){if(o)return r.loadTextureImage(e,i.source,n);if(a.extensionsRequired&&a.extensionsRequired.indexOf(t)>=0)throw Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return r.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",t.onload=t.onerror=function(){e(1===t.height)}})),this.isSupported}}class eT{constructor(e){this.parser=e,this.name=ef.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(e){let t=this.name,r=this.parser,a=r.json,o=a.textures[e];if(!o.extensions||!o.extensions[t])return null;let i=o.extensions[t],s=a.images[i.source],n=r.textureLoader;if(s.uri){let e=r.options.manager.getHandler(s.uri);null!==e&&(n=e)}return this.detectSupport().then(function(o){if(o)return r.loadTextureImage(e,i.source,n);if(a.extensionsRequired&&a.extensionsRequired.indexOf(t)>=0)throw Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return r.loadTexture(e)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(e){let t=new Image;t.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",t.onload=t.onerror=function(){e(1===t.height)}})),this.isSupported}}class eE{constructor(e){this.name=ef.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){let t=this.parser.json,r=t.bufferViews[e];if(!r.extensions||!r.extensions[this.name])return null;{let e=r.extensions[this.name],a=this.parser.getDependency("buffer",e.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported)if(!(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0))return null;else throw Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return a.then(function(t){let r=e.byteOffset||0,a=e.byteLength||0,i=e.count,s=e.byteStride,n=new Uint8Array(t,r,a);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(i,s,n,e.mode,e.filter).then(function(e){return e.buffer}):o.ready.then(function(){let t=new ArrayBuffer(i*s);return o.decodeGltfBuffer(new Uint8Array(t),i,s,n,e.mode,e.filter),t})})}}}class eD{constructor(e){this.name=ef.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,r=t.nodes[e];if(!r.extensions||!r.extensions[this.name]||void 0===r.mesh)return null;for(let e of t.meshes[r.mesh].primitives)if(e.mode!==eJ.TRIANGLES&&e.mode!==eJ.TRIANGLE_STRIP&&e.mode!==eJ.TRIANGLE_FAN&&void 0!==e.mode)return null;let a=r.extensions[this.name].attributes,o=[],i={};for(let e in a)o.push(this.parser.getDependency("accessor",a[e]).then(t=>(i[e]=t,i[e])));return o.length<1?null:(o.push(this.parser.createNodeMesh(e)),Promise.all(o).then(e=>{let t=e.pop(),r=t.isGroup?t.children:[t],a=e[0].count,o=[];for(let e of r){let t=new ea.Matrix4,r=new ea.Vector3,s=new ea.Quaternion,n=new ea.Vector3(1,1,1),l=new ea.InstancedMesh(e.geometry,e.material,a);for(let e=0;e<a;e++)i.TRANSLATION&&r.fromBufferAttribute(i.TRANSLATION,e),i.ROTATION&&s.fromBufferAttribute(i.ROTATION,e),i.SCALE&&n.fromBufferAttribute(i.SCALE,e),l.setMatrixAt(e,t.compose(r,s,n));for(let t in i)if("_COLOR_0"===t){let e=i[t];l.instanceColor=new ea.InstancedBufferAttribute(e.array,e.itemSize,e.normalized)}else"TRANSLATION"!==t&&"ROTATION"!==t&&"SCALE"!==t&&e.geometry.setAttribute(t,i[t]);ea.Object3D.prototype.copy.call(l,e),this.parser.assignFinalMaterial(l),o.push(l)}return t.isGroup?(t.clear(),t.add(...o),t):o[0]}))}}let eG="glTF";class eI{constructor(e){this.name=ef.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,12);if(this.header={magic:es(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==eG)throw Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw Error("THREE.GLTFLoader: Legacy binary file detected.");const r=this.header.length-12,a=new DataView(e,12);let o=0;for(;o<r;){const t=a.getUint32(o,!0);o+=4;const r=a.getUint32(o,!0);if(o+=4,0x4e4f534a===r){const r=new Uint8Array(e,12+o,t);this.content=es(r)}else if(5130562===r){const r=12+o;this.body=e.slice(r,r+t)}o+=t}if(null===this.content)throw Error("THREE.GLTFLoader: JSON content not found.")}}class eS{constructor(e,t){if(!t)throw Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=ef.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let r=this.json,a=this.dracoLoader,o=e.extensions[this.name].bufferView,i=e.extensions[this.name].attributes,s={},n={},l={};for(let e in i)s[e_[e]||e.toLowerCase()]=i[e];for(let t in e.attributes){let a=e_[t]||t.toLowerCase();if(void 0!==i[t]){let o=r.accessors[e.attributes[t]],i=ek[o.componentType];l[a]=i.name,n[a]=!0===o.normalized}}return t.getDependency("bufferView",o).then(function(e){return new Promise(function(t,r){a.decodeDracoFile(e,function(e){for(let t in e.attributes){let r=e.attributes[t],a=n[t];void 0!==a&&(r.normalized=a)}t(e)},s,l,el,r)})})}}class ew{constructor(){this.name=ef.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(void 0===t.texCoord||t.texCoord===e.channel)&&void 0===t.offset&&void 0===t.rotation&&void 0===t.scale||(e=e.clone(),void 0!==t.texCoord&&(e.channel=t.texCoord),void 0!==t.offset&&e.offset.fromArray(t.offset),void 0!==t.rotation&&(e.rotation=t.rotation),void 0!==t.scale&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class eH{constructor(){this.name=ef.KHR_MESH_QUANTIZATION}}class eP extends ea.Interpolant{constructor(e,t,r,a){super(e,t,r,a)}copySampleValue_(e){let t=this.resultBuffer,r=this.sampleValues,a=this.valueSize,o=e*a*3+a;for(let e=0;e!==a;e++)t[e]=r[o+e];return t}interpolate_(e,t,r,a){let o=this.resultBuffer,i=this.sampleValues,s=this.valueSize,n=2*s,l=3*s,u=a-t,c=(r-t)/u,f=c*c,d=f*c,m=e*l,A=m-l,h=-2*d+3*f,p=d-f,B=1-h,v=p-f+c;for(let e=0;e!==s;e++){let t=i[A+e+s],r=i[A+e+n]*u,a=i[m+e+s],l=i[m+e]*u;o[e]=B*t+v*r+h*a+p*l}return o}}let eU=new ea.Quaternion;class eL extends eP{interpolate_(e,t,r,a){let o=super.interpolate_(e,t,r,a);return eU.fromArray(o).normalize().toArray(o),o}}let eJ={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},ek={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},eO={9728:ea.NearestFilter,9729:ea.LinearFilter,9984:ea.NearestMipmapNearestFilter,9985:ea.LinearMipmapNearestFilter,9986:ea.NearestMipmapLinearFilter,9987:ea.LinearMipmapLinearFilter},eK={33071:ea.ClampToEdgeWrapping,33648:ea.MirroredRepeatWrapping,10497:ea.RepeatWrapping},eN={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},e_={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",...ei>=152?{TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3"}:{TEXCOORD_0:"uv",TEXCOORD_1:"uv2"},COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},ej={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},eQ={CUBICSPLINE:void 0,LINEAR:ea.InterpolateLinear,STEP:ea.InterpolateDiscrete};function eV(e,t,r){for(let a in r.extensions)void 0===e[a]&&(t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[a]=r.extensions[a])}function eX(e,t){void 0!==t.extras&&("object"==typeof t.extras?Object.assign(e.userData,t.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+t.extras))}function eY(e){let t="",r=Object.keys(e).sort();for(let a=0,o=r.length;a<o;a++)t+=r[a]+":"+e[r[a]]+";";return t}function eW(e){switch(e){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}let ez=new ea.Matrix4;class eZ{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new ec,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let r=!1,a=!1,o=-1;"u">typeof navigator&&void 0!==navigator.userAgent&&(r=!0===/^((?!chrome|android).)*safari/i.test(navigator.userAgent),o=(a=navigator.userAgent.indexOf("Firefox")>-1)?navigator.userAgent.match(/Firefox\/([0-9]+)\./)[1]:-1),"u"<typeof createImageBitmap||r||a&&o<98?this.textureLoader=new ea.TextureLoader(this.options.manager):this.textureLoader=new ea.ImageBitmapLoader(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new ea.FileLoader(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),"use-credentials"===this.options.crossOrigin&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let r=this,a=this.json,o=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(e){return e._markDefs&&e._markDefs()}),Promise.all(this._invokeAll(function(e){return e.beforeRoot&&e.beforeRoot()})).then(function(){return Promise.all([r.getDependencies("scene"),r.getDependencies("animation"),r.getDependencies("camera")])}).then(function(t){let i={scene:t[0][a.scene||0],scenes:t[0],animations:t[1],cameras:t[2],asset:a.asset,parser:r,userData:{}};return eV(o,i,a),eX(i,a),Promise.all(r._invokeAll(function(e){return e.afterRoot&&e.afterRoot(i)})).then(function(){for(let e of i.scenes)e.updateMatrixWorld();e(i)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],r=this.json.meshes||[];for(let r=0,a=t.length;r<a;r++){let a=t[r].joints;for(let t=0,r=a.length;t<r;t++)e[a[t]].isBone=!0}for(let t=0,a=e.length;t<a;t++){let a=e[t];void 0!==a.mesh&&(this._addNodeRef(this.meshCache,a.mesh),void 0!==a.skin&&(r[a.mesh].isSkinnedMesh=!0)),void 0!==a.camera&&this._addNodeRef(this.cameraCache,a.camera)}}_addNodeRef(e,t){void 0!==t&&(void 0===e.refs[t]&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,r){if(e.refs[t]<=1)return r;let a=r.clone(),o=(e,t)=>{let r=this.associations.get(e);for(let[a,i]of(null!=r&&this.associations.set(t,r),e.children.entries()))o(i,t.children[a])};return o(r,a),a.name+="_instance_"+e.uses[t]++,a}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let r=0;r<t.length;r++){let a=e(t[r]);if(a)return a}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let r=[];for(let a=0;a<t.length;a++){let o=e(t[a]);o&&r.push(o)}return r}getDependency(e,t){let r=e+":"+t,a=this.cache.get(r);if(!a){switch(e){case"scene":a=this.loadScene(t);break;case"node":a=this._invokeOne(function(e){return e.loadNode&&e.loadNode(t)});break;case"mesh":a=this._invokeOne(function(e){return e.loadMesh&&e.loadMesh(t)});break;case"accessor":a=this.loadAccessor(t);break;case"bufferView":a=this._invokeOne(function(e){return e.loadBufferView&&e.loadBufferView(t)});break;case"buffer":a=this.loadBuffer(t);break;case"material":a=this._invokeOne(function(e){return e.loadMaterial&&e.loadMaterial(t)});break;case"texture":a=this._invokeOne(function(e){return e.loadTexture&&e.loadTexture(t)});break;case"skin":a=this.loadSkin(t);break;case"animation":a=this._invokeOne(function(e){return e.loadAnimation&&e.loadAnimation(t)});break;case"camera":a=this.loadCamera(t);break;default:if(!(a=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)})))throw Error("Unknown type: "+e)}this.cache.add(r,a)}return a}getDependencies(e){let t=this.cache.get(e);if(!t){let r=this;t=Promise.all((this.json[e+("mesh"===e?"es":"s")]||[]).map(function(t,a){return r.getDependency(e,a)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],r=this.fileLoader;if(t.type&&"arraybuffer"!==t.type)throw Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(void 0===t.uri&&0===e)return Promise.resolve(this.extensions[ef.KHR_BINARY_GLTF].body);let a=this.options;return new Promise(function(e,o){r.load(ea.LoaderUtils.resolveURL(t.uri,a.path),e,void 0,function(){o(Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(e){let r=t.byteLength||0,a=t.byteOffset||0;return e.slice(a,a+r)})}loadAccessor(e){let t=this,r=this.json,a=this.json.accessors[e];if(void 0===a.bufferView&&void 0===a.sparse){let e=eN[a.type],t=ek[a.componentType],r=!0===a.normalized,o=new t(a.count*e);return Promise.resolve(new ea.BufferAttribute(o,e,r))}let o=[];return void 0!==a.bufferView?o.push(this.getDependency("bufferView",a.bufferView)):o.push(null),void 0!==a.sparse&&(o.push(this.getDependency("bufferView",a.sparse.indices.bufferView)),o.push(this.getDependency("bufferView",a.sparse.values.bufferView))),Promise.all(o).then(function(e){let o,i,s=e[0],n=eN[a.type],l=ek[a.componentType],u=l.BYTES_PER_ELEMENT,c=u*n,f=a.byteOffset||0,d=void 0!==a.bufferView?r.bufferViews[a.bufferView].byteStride:void 0,m=!0===a.normalized;if(d&&d!==c){let e=Math.floor(f/d),r="InterleavedBuffer:"+a.bufferView+":"+a.componentType+":"+e+":"+a.count,c=t.cache.get(r);c||(o=new l(s,e*d,a.count*d/u),c=new ea.InterleavedBuffer(o,d/u),t.cache.add(r,c)),i=new ea.InterleavedBufferAttribute(c,n,f%d/u,m)}else o=null===s?new l(a.count*n):new l(s,f,a.count*n),i=new ea.BufferAttribute(o,n,m);if(void 0!==a.sparse){let t=eN.SCALAR,r=ek[a.sparse.indices.componentType],o=a.sparse.indices.byteOffset||0,u=a.sparse.values.byteOffset||0,c=new r(e[1],o,a.sparse.count*t),f=new l(e[2],u,a.sparse.count*n);null!==s&&(i=new ea.BufferAttribute(i.array.slice(),i.itemSize,i.normalized));for(let e=0,t=c.length;e<t;e++){let t=c[e];if(i.setX(t,f[e*n]),n>=2&&i.setY(t,f[e*n+1]),n>=3&&i.setZ(t,f[e*n+2]),n>=4&&i.setW(t,f[e*n+3]),n>=5)throw Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}}return i})}loadTexture(e){let t=this.json,r=this.options,a=t.textures[e].source,o=t.images[a],i=this.textureLoader;if(o.uri){let e=r.manager.getHandler(o.uri);null!==e&&(i=e)}return this.loadTextureImage(e,a,i)}loadTextureImage(e,t,r){let a=this,o=this.json,i=o.textures[e],s=o.images[t],n=(s.uri||s.bufferView)+":"+i.sampler;if(this.textureCache[n])return this.textureCache[n];let l=this.loadImageSource(t,r).then(function(t){t.flipY=!1,t.name=i.name||s.name||"",""===t.name&&"string"==typeof s.uri&&!1===s.uri.startsWith("data:image/")&&(t.name=s.uri);let r=(o.samplers||{})[i.sampler]||{};return t.magFilter=eO[r.magFilter]||ea.LinearFilter,t.minFilter=eO[r.minFilter]||ea.LinearMipmapLinearFilter,t.wrapS=eK[r.wrapS]||ea.RepeatWrapping,t.wrapT=eK[r.wrapT]||ea.RepeatWrapping,a.associations.set(t,{textures:e}),t}).catch(function(){return null});return this.textureCache[n]=l,l}loadImageSource(e,t){let r=this.json,a=this.options;if(void 0!==this.sourceCache[e])return this.sourceCache[e].then(e=>e.clone());let o=r.images[e],i=self.URL||self.webkitURL,s=o.uri||"",n=!1;if(void 0!==o.bufferView)s=this.getDependency("bufferView",o.bufferView).then(function(e){n=!0;let t=new Blob([e],{type:o.mimeType});return s=i.createObjectURL(t)});else if(void 0===o.uri)throw Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let l=Promise.resolve(s).then(function(e){return new Promise(function(r,o){let i=r;!0===t.isImageBitmapLoader&&(i=function(e){let t=new ea.Texture(e);t.needsUpdate=!0,r(t)}),t.load(ea.LoaderUtils.resolveURL(e,a.path),i,void 0,o)})}).then(function(e){var t;return!0===n&&i.revokeObjectURL(s),eX(e,o),e.userData.mimeType=o.mimeType||((t=o.uri).search(/\.jpe?g($|\?)/i)>0||0===t.search(/^data\:image\/jpeg/)?"image/jpeg":t.search(/\.webp($|\?)/i)>0||0===t.search(/^data\:image\/webp/)?"image/webp":"image/png"),e}).catch(function(e){throw console.error("THREE.GLTFLoader: Couldn't load texture",s),e});return this.sourceCache[e]=l,l}assignTexture(e,t,r,a){let o=this;return this.getDependency("texture",r.index).then(function(i){if(!i)return null;if(void 0!==r.texCoord&&r.texCoord>0&&((i=i.clone()).channel=r.texCoord),o.extensions[ef.KHR_TEXTURE_TRANSFORM]){let e=void 0!==r.extensions?r.extensions[ef.KHR_TEXTURE_TRANSFORM]:void 0;if(e){let t=o.associations.get(i);i=o.extensions[ef.KHR_TEXTURE_TRANSFORM].extendTexture(i,e),o.associations.set(i,t)}}return void 0!==a&&("number"==typeof a&&(a=3001===a?en:el),"colorSpace"in i?i.colorSpace=a:i.encoding=a===en?3001:3e3),e[t]=i,i})}assignFinalMaterial(e){let t=e.geometry,r=e.material,a=void 0===t.attributes.tangent,o=void 0!==t.attributes.color,i=void 0===t.attributes.normal;if(e.isPoints){let e="PointsMaterial:"+r.uuid,t=this.cache.get(e);t||(t=new ea.PointsMaterial,ea.Material.prototype.copy.call(t,r),t.color.copy(r.color),t.map=r.map,t.sizeAttenuation=!1,this.cache.add(e,t)),r=t}else if(e.isLine){let e="LineBasicMaterial:"+r.uuid,t=this.cache.get(e);t||(t=new ea.LineBasicMaterial,ea.Material.prototype.copy.call(t,r),t.color.copy(r.color),t.map=r.map,this.cache.add(e,t)),r=t}if(a||o||i){let e="ClonedMaterial:"+r.uuid+":";a&&(e+="derivative-tangents:"),o&&(e+="vertex-colors:"),i&&(e+="flat-shading:");let t=this.cache.get(e);t||(t=r.clone(),o&&(t.vertexColors=!0),i&&(t.flatShading=!0),a&&(t.normalScale&&(t.normalScale.y*=-1),t.clearcoatNormalScale&&(t.clearcoatNormalScale.y*=-1)),this.cache.add(e,t),this.associations.set(t,this.associations.get(r))),r=t}e.material=r}getMaterialType(){return ea.MeshStandardMaterial}loadMaterial(e){let t,r=this,a=this.json,o=this.extensions,i=a.materials[e],s={},n=i.extensions||{},l=[];if(n[ef.KHR_MATERIALS_UNLIT]){let e=o[ef.KHR_MATERIALS_UNLIT];t=e.getMaterialType(),l.push(e.extendParams(s,i,r))}else{let a=i.pbrMetallicRoughness||{};if(s.color=new ea.Color(1,1,1),s.opacity=1,Array.isArray(a.baseColorFactor)){let e=a.baseColorFactor;s.color.setRGB(e[0],e[1],e[2],el),s.opacity=e[3]}void 0!==a.baseColorTexture&&l.push(r.assignTexture(s,"map",a.baseColorTexture,en)),s.metalness=void 0!==a.metallicFactor?a.metallicFactor:1,s.roughness=void 0!==a.roughnessFactor?a.roughnessFactor:1,void 0!==a.metallicRoughnessTexture&&(l.push(r.assignTexture(s,"metalnessMap",a.metallicRoughnessTexture)),l.push(r.assignTexture(s,"roughnessMap",a.metallicRoughnessTexture))),t=this._invokeOne(function(t){return t.getMaterialType&&t.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(t){return t.extendMaterialParams&&t.extendMaterialParams(e,s)})))}!0===i.doubleSided&&(s.side=ea.DoubleSide);let u=i.alphaMode||"OPAQUE";if("BLEND"===u?(s.transparent=!0,s.depthWrite=!1):(s.transparent=!1,"MASK"===u&&(s.alphaTest=void 0!==i.alphaCutoff?i.alphaCutoff:.5)),void 0!==i.normalTexture&&t!==ea.MeshBasicMaterial&&(l.push(r.assignTexture(s,"normalMap",i.normalTexture)),s.normalScale=new ea.Vector2(1,1),void 0!==i.normalTexture.scale)){let e=i.normalTexture.scale;s.normalScale.set(e,e)}if(void 0!==i.occlusionTexture&&t!==ea.MeshBasicMaterial&&(l.push(r.assignTexture(s,"aoMap",i.occlusionTexture)),void 0!==i.occlusionTexture.strength&&(s.aoMapIntensity=i.occlusionTexture.strength)),void 0!==i.emissiveFactor&&t!==ea.MeshBasicMaterial){let e=i.emissiveFactor;s.emissive=new ea.Color().setRGB(e[0],e[1],e[2],el)}return void 0!==i.emissiveTexture&&t!==ea.MeshBasicMaterial&&l.push(r.assignTexture(s,"emissiveMap",i.emissiveTexture,en)),Promise.all(l).then(function(){let a=new t(s);return i.name&&(a.name=i.name),eX(a,i),r.associations.set(a,{materials:e}),i.extensions&&eV(o,a,i),a})}createUniqueName(e){let t=ea.PropertyBinding.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,r=this.extensions,a=this.primitiveCache,o=[];for(let i=0,s=e.length;i<s;i++){let s=e[i],n=function(e){let t,r=e.extensions&&e.extensions[ef.KHR_DRACO_MESH_COMPRESSION];if(t=r?"draco:"+r.bufferView+":"+r.indices+":"+eY(r.attributes):e.indices+":"+eY(e.attributes)+":"+e.mode,void 0!==e.targets)for(let r=0,a=e.targets.length;r<a;r++)t+=":"+eY(e.targets[r]);return t}(s),l=a[n];if(l)o.push(l.promise);else{let e;e=s.extensions&&s.extensions[ef.KHR_DRACO_MESH_COMPRESSION]?function(e){return r[ef.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(e,t).then(function(r){return eq(r,e,t)})}(s):eq(new ea.BufferGeometry,s,t),a[n]={primitive:s,promise:e},o.push(e)}}return Promise.all(o)}loadMesh(e){let t=this,r=this.json,a=this.extensions,o=r.meshes[e],i=o.primitives,s=[];for(let e=0,t=i.length;e<t;e++){var n;let t=void 0===i[e].material?(void 0===(n=this.cache).DefaultMaterial&&(n.DefaultMaterial=new ea.MeshStandardMaterial({color:0xffffff,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:ea.FrontSide})),n.DefaultMaterial):this.getDependency("material",i[e].material);s.push(t)}return s.push(t.loadGeometries(i)),Promise.all(s).then(function(r){let s=r.slice(0,r.length-1),n=r[r.length-1],l=[];for(let r=0,u=n.length;r<u;r++){let u,c=n[r],f=i[r],d=s[r];if(f.mode===eJ.TRIANGLES||f.mode===eJ.TRIANGLE_STRIP||f.mode===eJ.TRIANGLE_FAN||void 0===f.mode)!0===(u=!0===o.isSkinnedMesh?new ea.SkinnedMesh(c,d):new ea.Mesh(c,d)).isSkinnedMesh&&u.normalizeSkinWeights(),f.mode===eJ.TRIANGLE_STRIP?u.geometry=eo(u.geometry,ea.TriangleStripDrawMode):f.mode===eJ.TRIANGLE_FAN&&(u.geometry=eo(u.geometry,ea.TriangleFanDrawMode));else if(f.mode===eJ.LINES)u=new ea.LineSegments(c,d);else if(f.mode===eJ.LINE_STRIP)u=new ea.Line(c,d);else if(f.mode===eJ.LINE_LOOP)u=new ea.LineLoop(c,d);else if(f.mode===eJ.POINTS)u=new ea.Points(c,d);else throw Error("THREE.GLTFLoader: Primitive mode unsupported: "+f.mode);Object.keys(u.geometry.morphAttributes).length>0&&function(e,t){if(e.updateMorphTargets(),void 0!==t.weights)for(let r=0,a=t.weights.length;r<a;r++)e.morphTargetInfluences[r]=t.weights[r];if(t.extras&&Array.isArray(t.extras.targetNames)){let r=t.extras.targetNames;if(e.morphTargetInfluences.length===r.length){e.morphTargetDictionary={};for(let t=0,a=r.length;t<a;t++)e.morphTargetDictionary[r[t]]=t}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}(u,o),u.name=t.createUniqueName(o.name||"mesh_"+e),eX(u,o),f.extensions&&eV(a,u,f),t.assignFinalMaterial(u),l.push(u)}for(let r=0,a=l.length;r<a;r++)t.associations.set(l[r],{meshes:e,primitives:r});if(1===l.length)return o.extensions&&eV(a,l[0],o),l[0];let u=new ea.Group;o.extensions&&eV(a,u,o),t.associations.set(u,{meshes:e});for(let e=0,t=l.length;e<t;e++)u.add(l[e]);return u})}loadCamera(e){let t,r=this.json.cameras[e],a=r[r.type];return a?("perspective"===r.type?t=new ea.PerspectiveCamera(ea.MathUtils.radToDeg(a.yfov),a.aspectRatio||1,a.znear||1,a.zfar||2e6):"orthographic"===r.type&&(t=new ea.OrthographicCamera(-a.xmag,a.xmag,a.ymag,-a.ymag,a.znear,a.zfar)),r.name&&(t.name=this.createUniqueName(r.name)),eX(t,r),Promise.resolve(t)):void console.warn("THREE.GLTFLoader: Missing camera parameters.")}loadSkin(e){let t=this.json.skins[e],r=[];for(let e=0,a=t.joints.length;e<a;e++)r.push(this._loadNodeShallow(t.joints[e]));return void 0!==t.inverseBindMatrices?r.push(this.getDependency("accessor",t.inverseBindMatrices)):r.push(null),Promise.all(r).then(function(e){let r=e.pop(),a=[],o=[];for(let i=0,s=e.length;i<s;i++){let s=e[i];if(s){a.push(s);let e=new ea.Matrix4;null!==r&&e.fromArray(r.array,16*i),o.push(e)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[i])}return new ea.Skeleton(a,o)})}loadAnimation(e){let t=this.json,r=this,a=t.animations[e],o=a.name?a.name:"animation_"+e,i=[],s=[],n=[],l=[],u=[];for(let e=0,t=a.channels.length;e<t;e++){let t=a.channels[e],r=a.samplers[t.sampler],o=t.target,c=o.node,f=void 0!==a.parameters?a.parameters[r.input]:r.input,d=void 0!==a.parameters?a.parameters[r.output]:r.output;void 0!==o.node&&(i.push(this.getDependency("node",c)),s.push(this.getDependency("accessor",f)),n.push(this.getDependency("accessor",d)),l.push(r),u.push(o))}return Promise.all([Promise.all(i),Promise.all(s),Promise.all(n),Promise.all(l),Promise.all(u)]).then(function(e){let t=e[0],a=e[1],i=e[2],s=e[3],n=e[4],l=[];for(let e=0,o=t.length;e<o;e++){let o=t[e],u=a[e],c=i[e],f=s[e],d=n[e];if(void 0===o)continue;o.updateMatrix&&o.updateMatrix();let m=r._createAnimationTracks(o,u,c,f,d);if(m)for(let e=0;e<m.length;e++)l.push(m[e])}return new ea.AnimationClip(o,void 0,l)})}createNodeMesh(e){let t=this.json,r=this,a=t.nodes[e];return void 0===a.mesh?null:r.getDependency("mesh",a.mesh).then(function(e){let t=r._getNodeRef(r.meshCache,a.mesh,e);return void 0!==a.weights&&t.traverse(function(e){if(e.isMesh)for(let t=0,r=a.weights.length;t<r;t++)e.morphTargetInfluences[t]=a.weights[t]}),t})}loadNode(e){let t=this.json.nodes[e],r=this._loadNodeShallow(e),a=[],o=t.children||[];for(let e=0,t=o.length;e<t;e++)a.push(this.getDependency("node",o[e]));let i=void 0===t.skin?Promise.resolve(null):this.getDependency("skin",t.skin);return Promise.all([r,Promise.all(a),i]).then(function(e){let t=e[0],r=e[1],a=e[2];null!==a&&t.traverse(function(e){e.isSkinnedMesh&&e.bind(a,ez)});for(let e=0,a=r.length;e<a;e++)t.add(r[e]);return t})}_loadNodeShallow(e){let t=this.json,r=this.extensions,a=this;if(void 0!==this.nodeCache[e])return this.nodeCache[e];let o=t.nodes[e],i=o.name?a.createUniqueName(o.name):"",s=[],n=a._invokeOne(function(t){return t.createNodeMesh&&t.createNodeMesh(e)});return n&&s.push(n),void 0!==o.camera&&s.push(a.getDependency("camera",o.camera).then(function(e){return a._getNodeRef(a.cameraCache,o.camera,e)})),a._invokeAll(function(t){return t.createNodeAttachment&&t.createNodeAttachment(e)}).forEach(function(e){s.push(e)}),this.nodeCache[e]=Promise.all(s).then(function(t){let s;if((s=!0===o.isBone?new ea.Bone:t.length>1?new ea.Group:1===t.length?t[0]:new ea.Object3D)!==t[0])for(let e=0,r=t.length;e<r;e++)s.add(t[e]);if(o.name&&(s.userData.name=o.name,s.name=i),eX(s,o),o.extensions&&eV(r,s,o),void 0!==o.matrix){let e=new ea.Matrix4;e.fromArray(o.matrix),s.applyMatrix4(e)}else void 0!==o.translation&&s.position.fromArray(o.translation),void 0!==o.rotation&&s.quaternion.fromArray(o.rotation),void 0!==o.scale&&s.scale.fromArray(o.scale);return a.associations.has(s)||a.associations.set(s,{}),a.associations.get(s).nodes=e,s}),this.nodeCache[e]}loadScene(e){let t=this.extensions,r=this.json.scenes[e],a=this,o=new ea.Group;r.name&&(o.name=a.createUniqueName(r.name)),eX(o,r),r.extensions&&eV(t,o,r);let i=r.nodes||[],s=[];for(let e=0,t=i.length;e<t;e++)s.push(a.getDependency("node",i[e]));return Promise.all(s).then(function(e){for(let t=0,r=e.length;t<r;t++)o.add(e[t]);return a.associations=(e=>{let t=new Map;for(let[e,r]of a.associations)(e instanceof ea.Material||e instanceof ea.Texture)&&t.set(e,r);return e.traverse(e=>{let r=a.associations.get(e);null!=r&&t.set(e,r)}),t})(o),o})}_createAnimationTracks(e,t,r,a,o){let i,s=[],n=e.name?e.name:e.uuid,l=[];switch(ej[o.path]===ej.weights?e.traverse(function(e){e.morphTargetInfluences&&l.push(e.name?e.name:e.uuid)}):l.push(n),ej[o.path]){case ej.weights:i=ea.NumberKeyframeTrack;break;case ej.rotation:i=ea.QuaternionKeyframeTrack;break;case ej.position:case ej.scale:i=ea.VectorKeyframeTrack;break;default:i=1===r.itemSize?ea.NumberKeyframeTrack:ea.VectorKeyframeTrack}let u=void 0!==a.interpolation?eQ[a.interpolation]:ea.InterpolateLinear,c=this._getArrayFromAccessor(r);for(let e=0,r=l.length;e<r;e++){let r=new i(l[e]+"."+ej[o.path],t.array,c,u);"CUBICSPLINE"===a.interpolation&&this._createCubicSplineTrackInterpolant(r),s.push(r)}return s}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let e=eW(t.constructor),r=new Float32Array(t.length);for(let a=0,o=t.length;a<o;a++)r[a]=t[a]*e;t=r}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(e){return new(this instanceof ea.QuaternionKeyframeTrack?eL:eP)(this.times,this.values,this.getValueSize()/3,e)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function eq(e,t,r){let a=t.attributes,o=[];for(let t in a){let i=e_[t]||t.toLowerCase();i in e.attributes||o.push(function(t,a){return r.getDependency("accessor",t).then(function(t){e.setAttribute(a,t)})}(a[t],i))}if(void 0!==t.indices&&!e.index){let a=r.getDependency("accessor",t.indices).then(function(t){e.setIndex(t)});o.push(a)}return eX(e,t),!function(e,t,r){let a=t.attributes,o=new ea.Box3;if(void 0===a.POSITION)return;{let e=r.json.accessors[a.POSITION],t=e.min,i=e.max;if(void 0===t||void 0===i)return console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");if(o.set(new ea.Vector3(t[0],t[1],t[2]),new ea.Vector3(i[0],i[1],i[2])),e.normalized){let t=eW(ek[e.componentType]);o.min.multiplyScalar(t),o.max.multiplyScalar(t)}}let i=t.targets;if(void 0!==i){let e=new ea.Vector3,t=new ea.Vector3;for(let a=0,o=i.length;a<o;a++){let o=i[a];if(void 0!==o.POSITION){let a=r.json.accessors[o.POSITION],i=a.min,s=a.max;if(void 0!==i&&void 0!==s){if(t.setX(Math.max(Math.abs(i[0]),Math.abs(s[0]))),t.setY(Math.max(Math.abs(i[1]),Math.abs(s[1]))),t.setZ(Math.max(Math.abs(i[2]),Math.abs(s[2]))),a.normalized){let e=eW(ek[a.componentType]);t.multiplyScalar(e)}e.max(t)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}o.expandByVector(e)}e.boundingBox=o;let s=new ea.Sphere;o.getCenter(s.center),s.radius=o.min.distanceTo(o.max)/2,e.boundingSphere=s}(e,t,r),Promise.all(o).then(function(){return void 0!==t.targets?function(e,t,r){let a=!1,o=!1,i=!1;for(let e=0,r=t.length;e<r;e++){let r=t[e];if(void 0!==r.POSITION&&(a=!0),void 0!==r.NORMAL&&(o=!0),void 0!==r.COLOR_0&&(i=!0),a&&o&&i)break}if(!a&&!o&&!i)return Promise.resolve(e);let s=[],n=[],l=[];for(let u=0,c=t.length;u<c;u++){let c=t[u];if(a){let t=void 0!==c.POSITION?r.getDependency("accessor",c.POSITION):e.attributes.position;s.push(t)}if(o){let t=void 0!==c.NORMAL?r.getDependency("accessor",c.NORMAL):e.attributes.normal;n.push(t)}if(i){let t=void 0!==c.COLOR_0?r.getDependency("accessor",c.COLOR_0):e.attributes.color;l.push(t)}}return Promise.all([Promise.all(s),Promise.all(n),Promise.all(l)]).then(function(t){let r=t[0],s=t[1],n=t[2];return a&&(e.morphAttributes.position=r),o&&(e.morphAttributes.normal=s),i&&(e.morphAttributes.color=n),e.morphTargetsRelative=!0,e})}(e,t.targets,r):e})}var e$=l;let e0=new WeakMap;class e1 extends e$.Loader{constructor(e){super(e),this.decoderPath="",this.decoderConfig={},this.decoderBinary=null,this.decoderPending=null,this.workerLimit=4,this.workerPool=[],this.workerNextTaskID=1,this.workerSourceURL="",this.defaultAttributeIDs={position:"POSITION",normal:"NORMAL",color:"COLOR",uv:"TEX_COORD"},this.defaultAttributeTypes={position:"Float32Array",normal:"Float32Array",color:"Float32Array",uv:"Float32Array"}}setDecoderPath(e){return this.decoderPath=e,this}setDecoderConfig(e){return this.decoderConfig=e,this}setWorkerLimit(e){return this.workerLimit=e,this}load(e,t,r,a){let o=new e$.FileLoader(this.manager);o.setPath(this.path),o.setResponseType("arraybuffer"),o.setRequestHeader(this.requestHeader),o.setWithCredentials(this.withCredentials),o.load(e,e=>{let r={attributeIDs:this.defaultAttributeIDs,attributeTypes:this.defaultAttributeTypes,useUniqueIDs:!1};this.decodeGeometry(e,r).then(t).catch(a)},r,a)}decodeDracoFile(e,t,r,a){let o={attributeIDs:r||this.defaultAttributeIDs,attributeTypes:a||this.defaultAttributeTypes,useUniqueIDs:!!r};this.decodeGeometry(e,o).then(t)}decodeGeometry(e,t){let r;for(let e in t.attributeTypes){let r=t.attributeTypes[e];void 0!==r.BYTES_PER_ELEMENT&&(t.attributeTypes[e]=r.name)}let a=JSON.stringify(t);if(e0.has(e)){let t=e0.get(e);if(t.key===a)return t.promise;if(0===e.byteLength)throw Error("THREE.DRACOLoader: Unable to re-decode a buffer with different settings. Buffer has already been transferred.")}let o=this.workerNextTaskID++,i=e.byteLength,s=this._getWorker(o,i).then(a=>(r=a,new Promise((a,i)=>{r._callbacks[o]={resolve:a,reject:i},r.postMessage({type:"decode",id:o,taskConfig:t,buffer:e},[e])}))).then(e=>this._createGeometry(e.geometry));return s.catch(()=>!0).then(()=>{r&&o&&this._releaseTask(r,o)}),e0.set(e,{key:a,promise:s}),s}_createGeometry(e){let t=new e$.BufferGeometry;e.index&&t.setIndex(new e$.BufferAttribute(e.index.array,1));for(let r=0;r<e.attributes.length;r++){let a=e.attributes[r],o=a.name,i=a.array,s=a.itemSize;t.setAttribute(o,new e$.BufferAttribute(i,s))}return t}_loadLibrary(e,t){let r=new e$.FileLoader(this.manager);return r.setPath(this.decoderPath),r.setResponseType(t),r.setWithCredentials(this.withCredentials),new Promise((t,a)=>{r.load(e,t,void 0,a)})}preload(){return this._initDecoder(),this}_initDecoder(){if(this.decoderPending)return this.decoderPending;let e="object"!=typeof WebAssembly||"js"===this.decoderConfig.type,t=[];return e?t.push(this._loadLibrary("draco_decoder.js","text")):(t.push(this._loadLibrary("draco_wasm_wrapper.js","text")),t.push(this._loadLibrary("draco_decoder.wasm","arraybuffer"))),this.decoderPending=Promise.all(t).then(t=>{let r=t[0];e||(this.decoderConfig.wasmBinary=t[1]);let a=e2.toString(),o=["/* draco decoder */",r,"\n/* worker */",a.substring(a.indexOf("{")+1,a.lastIndexOf("}"))].join("\n");this.workerSourceURL=URL.createObjectURL(new Blob([o]))}),this.decoderPending}_getWorker(e,t){return this._initDecoder().then(()=>{if(this.workerPool.length<this.workerLimit){let e=new Worker(this.workerSourceURL);e._callbacks={},e._taskCosts={},e._taskLoad=0,e.postMessage({type:"init",decoderConfig:this.decoderConfig}),e.onmessage=function(t){let r=t.data;switch(r.type){case"decode":e._callbacks[r.id].resolve(r);break;case"error":e._callbacks[r.id].reject(r);break;default:console.error('THREE.DRACOLoader: Unexpected message, "'+r.type+'"')}},this.workerPool.push(e)}else this.workerPool.sort(function(e,t){return e._taskLoad>t._taskLoad?-1:1});let r=this.workerPool[this.workerPool.length-1];return r._taskCosts[e]=t,r._taskLoad+=t,r})}_releaseTask(e,t){e._taskLoad-=e._taskCosts[t],delete e._callbacks[t],delete e._taskCosts[t]}debug(){console.log("Task load: ",this.workerPool.map(e=>e._taskLoad))}dispose(){for(let e=0;e<this.workerPool.length;++e)this.workerPool[e].terminate();return this.workerPool.length=0,this}}function e2(){let e,t;onmessage=function(r){let a=r.data;switch(a.type){case"init":e=a.decoderConfig,t=new Promise(function(t){e.onModuleLoaded=function(e){t({draco:e})},DracoDecoderModule(e)});break;case"decode":let o=a.buffer,i=a.taskConfig;t.then(e=>{let t=e.draco,r=new t.Decoder,s=new t.DecoderBuffer;s.Init(new Int8Array(o),o.byteLength);try{let e=function(e,t,r,a){var o,i,s;let n,l,u,c,f,d,m=a.attributeIDs,A=a.attributeTypes,h=t.GetEncodedGeometryType(r);if(h===e.TRIANGULAR_MESH)f=new e.Mesh,d=t.DecodeBufferToMesh(r,f);else if(h===e.POINT_CLOUD)f=new e.PointCloud,d=t.DecodeBufferToPointCloud(r,f);else throw Error("THREE.DRACOLoader: Unexpected geometry type.");if(!d.ok()||0===f.ptr)throw Error("THREE.DRACOLoader: Decoding failed: "+d.error_msg());let p={index:null,attributes:[]};for(let r in m){let o,i,s=self[A[r]];if(a.useUniqueIDs)i=m[r],o=t.GetAttributeByUniqueId(f,i);else{if(-1===(i=t.GetAttributeId(f,e[m[r]])))continue;o=t.GetAttribute(f,i)}p.attributes.push(function(e,t,r,a,o,i){let s=i.num_components(),n=r.num_points()*s,l=n*o.BYTES_PER_ELEMENT,u=function(e,t){switch(t){case Float32Array:return e.DT_FLOAT32;case Int8Array:return e.DT_INT8;case Int16Array:return e.DT_INT16;case Int32Array:return e.DT_INT32;case Uint8Array:return e.DT_UINT8;case Uint16Array:return e.DT_UINT16;case Uint32Array:return e.DT_UINT32}}(e,o),c=e._malloc(l);t.GetAttributeDataArrayForAllPoints(r,i,u,l,c);let f=new o(e.HEAPF32.buffer,c,n).slice();return e._free(c),{name:a,array:f,itemSize:s}}(e,t,f,r,s,o))}return h===e.TRIANGULAR_MESH&&(o=e,i=t,s=f,n=3*s.num_faces(),l=4*n,u=o._malloc(l),i.GetTrianglesUInt32Array(s,l,u),c=new Uint32Array(o.HEAPF32.buffer,u,n).slice(),o._free(u),p.index={array:c,itemSize:1}),e.destroy(f),p}(t,r,s,i),o=e.attributes.map(e=>e.array.buffer);e.index&&o.push(e.index.array.buffer),self.postMessage({type:"decode",id:a.id,geometry:e},o)}catch(e){console.error(e),self.postMessage({type:"error",id:a.id,error:e.message})}finally{t.destroy(s),t.destroy(r)}})}}}var e9=e.i(71701),e9=e9;let e8=function(e){let t=new Map,r=new Map,a=e.clone();return function e(t,r,a){a(t,r);for(let o=0;o<t.children.length;o++)e(t.children[o],r.children[o],a)}(e,a,function(e,a){t.set(a,e),r.set(e,a)}),a.traverse(function(e){if(!e.isSkinnedMesh)return;let a=t.get(e),o=a.skeleton.bones;e.skeleton=a.skeleton.clone(),e.bindMatrix.copy(a.bindMatrix),e.skeleton.bones=o.map(function(e){return r.get(e)}),e.bind(e.skeleton,e.bindMatrix)}),a},e3=a.forwardRef(({isChild:e=!1,object:t,children:r,deep:o,castShadow:i,receiveShadow:n,inject:u,keys:c,...f},d)=>{let m={keys:c,deep:o,inject:u,castShadow:i,receiveShadow:n};if(Array.isArray(t=a.useMemo(()=>{if(!1===e&&!Array.isArray(t)){let e=!1;if(t.traverse(t=>{t.isSkinnedMesh&&(e=!0)}),e)return e8(t)}return t},[t,e])))return a.createElement("group",s({},f,{ref:d}),t.map(e=>a.createElement(e3,s({key:e.uuid,object:e},m))),r);let{children:A,...h}=function(e,{keys:t=["near","far","color","distance","decay","penumbra","angle","intensity","skeleton","visible","castShadow","receiveShadow","morphTargetDictionary","morphTargetInfluences","name","geometry","material","position","rotation","scale","up","userData","bindMode","bindMatrix","bindMatrixInverse","skeleton"],deep:r,inject:o,castShadow:i,receiveShadow:s}){let n={};for(let r of t)n[r]=e[r];return r&&(n.geometry&&"materialsOnly"!==r&&(n.geometry=n.geometry.clone()),n.material&&"geometriesOnly"!==r&&(n.material=n.material.clone())),o&&(n="function"==typeof o?{...n,children:o(e)}:a.isValidElement(o)?{...n,children:o}:{...n,...o}),e instanceof l.Mesh&&(i&&(n.castShadow=!0),s&&(n.receiveShadow=!0)),n}(t,m),p=t.type[0].toLowerCase()+t.type.slice(1);return a.createElement(p,s({},h,f,{ref:d}),t.children.map(e=>"Bone"===e.type?a.createElement("primitive",s({key:e.uuid,object:e},m)):a.createElement(e3,s({key:e.uuid,object:e},m,{isChild:!0}))),r,A)}),e6=null,e4="https://www.gstatic.com/draco/versioned/decoders/1.5.5/";function e5(e=!0,r=!0,a){return o=>{a&&a(o),e&&(e6||(e6=new e1),e6.setDecoderPath("string"==typeof e?e:e4),o.setDRACOLoader(e6)),r&&o.setMeshoptDecoder((()=>{let e;if(t)return t;let r=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),a=new Uint8Array([32,0,65,253,3,1,2,34,4,106,6,5,11,8,7,20,13,33,12,16,128,9,116,64,19,113,127,15,10,21,22,14,255,66,24,54,136,107,18,23,192,26,114,118,132,17,77,101,130,144,27,87,131,44,45,74,156,154,70,167]);if("object"!=typeof WebAssembly)return{supported:!1};let o="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";WebAssembly.validate(r)&&(o="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");let i=WebAssembly.instantiate(function(e){let t=new Uint8Array(e.length);for(let r=0;r<e.length;++r){let a=e.charCodeAt(r);t[r]=a>96?a-71:a>64?a-65:a>47?a+4:a>46?63:62}let r=0;for(let o=0;o<e.length;++o)t[r++]=t[o]<60?a[t[o]]:(t[o]-60)*64+t[++o];return t.buffer.slice(0,r)}(o),{}).then(t=>{(e=t.instance).exports.__wasm_call_ctors()});function s(t,r,a,o,i,s){let n=e.exports.sbrk,l=a+3&-4,u=n(l*o),c=n(i.length),f=new Uint8Array(e.exports.memory.buffer);f.set(i,c);let d=t(u,a,o,c,i.length);if(0===d&&s&&s(u,l,o),r.set(f.subarray(u,u+a*o)),n(u-n(0)),0!==d)throw Error(`Malformed buffer data: ${d}`)}let n={0:"",1:"meshopt_decodeFilterOct",2:"meshopt_decodeFilterQuat",3:"meshopt_decodeFilterExp",NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp"},l={0:"meshopt_decodeVertexBuffer",1:"meshopt_decodeIndexBuffer",2:"meshopt_decodeIndexSequence",ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"};return t={ready:i,supported:!0,decodeVertexBuffer(t,r,a,o,i){s(e.exports.meshopt_decodeVertexBuffer,t,r,a,o,e.exports[n[i]])},decodeIndexBuffer(t,r,a,o){s(e.exports.meshopt_decodeIndexBuffer,t,r,a,o)},decodeIndexSequence(t,r,a,o){s(e.exports.meshopt_decodeIndexSequence,t,r,a,o)},decodeGltfBuffer(t,r,a,o,i,u){s(e.exports[l[i]],t,r,a,o,e.exports[n[u]])}}})())}}let e7=(e,t,r,a)=>(0,e9.G)(eu,e,e5(t,r,a));function te(e,t=!1){let r=null!==e[0].index,a=new Set(Object.keys(e[0].attributes)),o=new Set(Object.keys(e[0].morphAttributes)),i={},s={},n=e[0].morphTargetsRelative,u=new l.BufferGeometry,c=0;for(let l=0;l<e.length;++l){let f=e[l],d=0;if(r!==(null!==f.index))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(let e in f.attributes){if(!a.has(e))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+'. All geometries must have compatible attributes; make sure "'+e+'" attribute exists among all geometries, or in none of them.'),null;void 0===i[e]&&(i[e]=[]),i[e].push(f.attributes[e]),d++}if(d!==a.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". Make sure all geometries have the same number of attributes."),null;if(n!==f.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(let e in f.morphAttributes){if(!o.has(e))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+".  .morphAttributes must be consistent throughout all geometries."),null;void 0===s[e]&&(s[e]=[]),s[e].push(f.morphAttributes[e])}if(t){let e;if(r)e=f.index.count;else{if(void 0===f.attributes.position)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+l+". The geometry must have either an index or a position attribute"),null;e=f.attributes.position.count}u.addGroup(c,e,l),c+=e}}if(r){let t=0,r=[];for(let a=0;a<e.length;++a){let o=e[a].index;for(let e=0;e<o.count;++e)r.push(o.getX(e)+t);t+=e[a].attributes.position.count}u.setIndex(r)}for(let e in i){let t=tt(i[e]);if(!t)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+e+" attribute."),null;u.setAttribute(e,t)}for(let e in s){let t=s[e][0].length;if(0===t)break;u.morphAttributes=u.morphAttributes||{},u.morphAttributes[e]=[];for(let r=0;r<t;++r){let t=[];for(let a=0;a<s[e].length;++a)t.push(s[e][a][r]);let a=tt(t);if(!a)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+e+" morphAttribute."),null;u.morphAttributes[e].push(a)}}return u}function tt(e){let t,r,a,o=-1,i=0;for(let s=0;s<e.length;++s){let n=e[s];if(void 0===t&&(t=n.array.constructor),t!==n.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(void 0===r&&(r=n.itemSize),r!==n.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(void 0===a&&(a=n.normalized),a!==n.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(-1===o&&(o=n.gpuType),o!==n.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;i+=n.count*r}let s=new t(i),n=new l.BufferAttribute(s,r,a),u=0;for(let t=0;t<e.length;++t){let a=e[t];if(a.isInterleavedBufferAttribute){let e=u/r;for(let t=0,o=a.count;t<o;t++)for(let o=0;o<r;o++){let r=a.getComponent(t,o);n.setComponent(t+e,o,r)}}else s.set(a.array,u);u+=a.count*r}return void 0!==o&&(n.gpuType=o),n}e7.preload=(e,t,r,a)=>e9.G.preload(eu,e,e5(t,r,a)),e7.clear=e=>e9.G.clear(eu,e),e7.setDecoderPath=e=>{e4=e};var tr=e.i(67436);let ta="https://www.gstatic.com/draco/versioned/decoders/1.5.5/",to={opaqueThreshold:.99,opaqueTolerance:.005,hysteresis:.02},ti={refractPower:.72,chromaticAberration:.14,specularStrength:1.2,loop:3,lightZ:.5,fresnelSideDir:new l.Vector3(-1,1,-1)},ts={light:{shininess:120,diffuseness:.1,fresnelPower:1,fresnelStrength:.24,brightness:.78,contrast:.9,gamma:1,saturation:1.2,tintMix:1,tintColorA:"#009dff",tintColorB:"#ffffff",tintThicknessMinAlpha:1,tintThicknessMaxAlpha:.92},dark:{shininess:100,diffuseness:.05,fresnelPower:3,fresnelStrength:.72,brightness:.6,contrast:.98,gamma:1,saturation:1.2,tintMix:1,tintColorA:"#64c3ff",tintColorB:"#8e9dc4",tintThicknessMinAlpha:1,tintThicknessMaxAlpha:.4}},tn=(0,a.createContext)(null);function tl({children:e}){let{gl:t,scene:o,camera:s}=(0,n.useThree)(),u=h(),c=(0,a.useRef)(u.isMobile);c.current=u.isMobile;let f=(0,a.useMemo)(()=>new l.WebGLRenderTarget(2,2,{stencilBuffer:!1,depthBuffer:!0,samples:0}),[]);(0,a.useEffect)(()=>()=>f.dispose(),[f]),(0,a.useEffect)(()=>{s.layers.enable(10)},[s]);let d=(0,a.useRef)(!0),m=(0,a.useRef)(!1),A=(0,a.useMemo)(()=>new l.Vector2,[]);(0,i.useFrame)(()=>{t.getDrawingBufferSize(A);let e=Math.max(1,Math.floor(.5*A.x)),r=Math.max(1,Math.floor(.5*A.y));(f.width!==e||f.height!==r)&&f.setSize(e,r);let a=g.frameState.overlay;m.current=(0,g.opaqueWithHysteresis)(m.current,a,to);let i=g.frameState.sections.get("banner")?.inView??!1,n=g.frameState.sections.get("footer")?.inView??!1;if(m.current||!i&&!n){d.current=!1;return}d.current=!0;let l=(0,g.overlayStride)(a,c.current);if(g.frameState.frameCount%l!=0)return;let u=s.layers.mask,h=t.getRenderTarget();s.layers.mask=1,t.setRenderTarget(f),t.clear(),t.render(o,s),t.setRenderTarget(h),s.layers.mask=u},-1);let p=(0,a.useMemo)(()=>({envMapBase:f.texture,glassLayer:10,sceneRefractionActiveRef:d}),[f]);return(0,r.jsx)(tn.Provider,{value:p,children:e})}let tu=Math.PI/180;function tc({model:e,modelPosition:t=[0,0,0],rotationAxisTilt:o=[0,0,0],beforeRotation:s=[0,0,0],rotation:u=[0,0,0],afterRotation:c,scale:f=1,floatingMotion:d=!0,tintEnabled:m=!1,scrollSyncFactor:A=1,sectionName:p="footer",tingColor:B,onReady:C}){let{gl:x}=(0,n.useThree)(),M=h(),R=function(){let e=(0,a.useContext)(tn);if(!e)throw Error("useGlassContext must be inside GlassProvider");return e}(),y=e7((0,tr.asset)(e.startsWith("/")?e:`/${e}`),ta),b=c??u,F=(0,a.useMemo)(()=>{let e=[];if(y.scene.updateMatrixWorld(!0),y.scene.traverse(t=>{if(t.isMesh&&t.geometry){let r=t.geometry.clone();r.applyMatrix4(t.matrixWorld),e.push(r)}}),0===e.length)return new l.BufferGeometry;let t=e[0];e.length>1&&(t=te(e,!0)??e[0]),t.computeBoundingBox();let r=t.boundingBox.getCenter(new l.Vector3);return t.translate(-r.x,-r.y,-r.z),t.computeBoundingBox(),t.computeBoundingSphere(),t},[y]),T=(0,a.useMemo)(()=>({uIorR:{value:1.15},uIorY:{value:1.16},uIorG:{value:1.18},uIorC:{value:1.22},uIorB:{value:1.22},uIorP:{value:1.22},uRefractPower:{value:.24},uChromaticAberration:{value:.24},uSaturation:{value:1},uShininess:{value:40},uDiffuseness:{value:.1},uFresnelPower:{value:6},uBrightness:{value:1},uContrast:{value:1},uGamma:{value:1},uSpecularStrength:{value:1.2},uFresnelStrength:{value:1},uFresnelSideDir:{value:new l.Vector3(-1,.3,1)},uTintColorA:{value:new l.Vector4(1,1,1,1)},uTintColorB:{value:new l.Vector4(1,1,1,1)},uTintLocalYRange:{value:new l.Vector2(0,1)},uTintEnabled:{value:0},uTintMix:{value:.8},uTintThicknessMinAlpha:{value:.35},uTintThicknessMaxAlpha:{value:1},uDark:{value:0},uLoop:{value:6},uSceneRefractionEnabled:{value:1},uRgbRefraction:{value:0},uLight:{value:new l.Vector3(4,9,.5)},uScreenResolutionPx:{value:new l.Vector2(1,1)},uTexture:{value:null}}),[]),E=(0,a.useMemo)(()=>new l.ShaderMaterial({vertexShader:S,fragmentShader:w,uniforms:T,toneMapped:!1,transparent:!0}),[T]);(0,a.useEffect)(()=>()=>E.dispose(),[E]),(0,a.useLayoutEffect)(()=>{let e=ts[M.theme];T.uRefractPower.value=ti.refractPower,T.uChromaticAberration.value=ti.chromaticAberration,T.uSpecularStrength.value=ti.specularStrength,T.uFresnelSideDir.value.copy(ti.fresnelSideDir),T.uLoop.value=M.isMobile?Math.min(ti.loop,2):ti.loop,T.uRgbRefraction.value=+(ti.loop<=3),T.uShininess.value=e.shininess,T.uDiffuseness.value=e.diffuseness,T.uFresnelPower.value=e.fresnelPower,T.uFresnelStrength.value=e.fresnelStrength,T.uBrightness.value=e.brightness,T.uContrast.value=e.contrast,T.uGamma.value=e.gamma,T.uSaturation.value=e.saturation,T.uTintMix.value=e.tintMix,T.uTintThicknessMinAlpha.value=e.tintThicknessMinAlpha,T.uTintThicknessMaxAlpha.value=e.tintThicknessMaxAlpha,T.uDark.value=+("dark"===M.theme),T.uTintEnabled.value=+!!m;let t=B?"dark"===M.theme?B[2]:B[0]:e.tintColorA,r=B?"dark"===M.theme?B[3]:B[1]:e.tintColorB,a=new l.Color(t),o=new l.Color(r);T.uTintColorA.value.set(a.r,a.g,a.b,1),T.uTintColorB.value.set(o.r,o.g,o.b,1);let i=F.boundingBox;i&&T.uTintLocalYRange.value.set(i.min.y,i.max.y),T.uTexture.value=R.envMapBase},[M.theme,M.isMobile,m,B,F,R,T]);let D=(0,a.useRef)(null),G=(0,a.useRef)(null),I=(0,a.useRef)(null);(0,a.useEffect)(()=>{I.current?.layers.set(R.glassLayer)},[R.glassLayer]);let H=(0,a.useMemo)(()=>new v,[]),P=(0,a.useRef)(0),U=(0,a.useRef)(!1),L=(0,a.useRef)(C);L.current=C,(0,i.useFrame)((e,r)=>{let a=D.current,o=G.current;if(!a||!o)return;let i=g.frameState.sections.get(p),n=!!i?.inView;a.visible=n,!U.current&&(P.current++,P.current>=5&&(U.current=!0,L.current?.()));let c=T.uScreenResolutionPx.value;if(e.gl.getDrawingBufferSize(c),T.uTexture.value=R.envMapBase,!n&&i)return;let f=g.frameState.viewportH||1,m=g.frameState.scrollTop,h=e.camera,B=2*Math.tan(l.MathUtils.degToRad(h.fov)/2)*h.position.z,v=0;i&&(v=(.5-(i.rect.top+m+i.rect.height/2)/f)*B+m/f*B*A);let C=e.clock.elapsedTime,x=d&&!M.isMobile?.18*Math.sin(1.2*C)+.06*Math.sin(.6*C):0;if(a.position.set(t[0],v+t[1]+x,t[2]),i){let e=i.rect.top+m,t=(m+f-e)/f,a=Math.min(1,Math.max(0,t)),n=Math.min(1,Math.max(0,t-1)),c=["x","y","z"];for(let e=0;e<3;e++){let t=l.MathUtils.lerp(s[e],u[e],a),i=l.MathUtils.lerp(t,b[e],n)*tu;o.rotation[c[e]]=l.MathUtils.damp(o.rotation[c[e]],i,6,r)}}H.update(e.camera,M.pointerUv,!!M.pointerInsideRef.current&&!M.isMobile,r,T.uLight.value,ti.lightZ)},-2),(0,i.useFrame)(()=>{T.uSceneRefractionEnabled.value=+!!R.sceneRefractionActiveRef.current},0);let J=(0,a.useMemo)(()=>[o[0]*tu,o[1]*tu,o[2]*tu],[o]),k=(0,a.useMemo)(()=>[-J[0],-J[1],-J[2]],[J]),O=(0,a.useMemo)(()=>[s[0]*tu,s[1]*tu,s[2]*tu],[s]);return(0,r.jsx)("group",{ref:D,visible:!1,position:t,children:(0,r.jsx)("group",{rotation:J,children:(0,r.jsx)("group",{ref:G,rotation:O,children:(0,r.jsx)("group",{rotation:k,children:(0,r.jsx)("mesh",{ref:I,geometry:F,scale:[f,f,f],children:(0,r.jsx)("primitive",{object:E,attach:"material"})})})})})})}e7.preload((0,tr.asset)("/model/hello.gltf"),ta),e7.preload((0,tr.asset)("/model/cursor.glb"),ta),e7.preload((0,tr.asset)("/model/cnt.gltf"),ta);var tf=e.i(3350);let td={model:(0,tr.asset)("/model/cursor.glb"),refMarginPx:120,accentColor:"#009dff",stripeColorA:"#009dff",stripeColorB:"#64c3ff",restScale:.1,scaleSmoothing:32,autoPeakPadding:1.64,rotationAxisTilt:[0,0,45]};function tm({targetEl:e,scaleSpinDegrees:t=360}){let{gl:o}=(0,n.useThree)(),s=h(),u=e7(td.model,ta),c=(0,a.useMemo)(()=>{let e=[];if(u.scene.updateMatrixWorld(!0),u.scene.traverse(t=>{if(t.isMesh&&t.geometry){let r=t.geometry.clone();r.applyMatrix4(t.matrixWorld),e.push(r)}}),0===e.length)return new l.BufferGeometry;let t=e[0];e.length>1&&(t=te(e,!0)??e[0]),t.computeBoundingBox();let r=t.boundingBox.getCenter(new l.Vector3);return t.translate(-r.x,-r.y,-r.z),t.computeBoundingBox(),t.computeBoundingSphere(),t},[u]),f=(0,a.useMemo)(()=>({iResolution:{value:new l.Vector3(1,1,1)},iTime:{value:0},uScrollDuration:{value:2},uOpacity:{value:1},uAccentColor:{value:new l.Color(td.accentColor)},uStripeColorA:{value:new l.Color(td.stripeColorA)},uStripeColorB:{value:new l.Color(td.stripeColorB)},uStripeReveal:{value:0},uLight:{value:new l.Vector3(4,9,.5)},uShininess:{value:40},uDiffuseness:{value:.1},uSpecularStrength:{value:1.2},uFresnelPower:{value:6},uFresnelStrength:{value:1},uFresnelSideDir:{value:new l.Vector3(-1,.3,1)}}),[]),d=(0,a.useMemo)(()=>new l.ShaderMaterial({vertexShader:H,fragmentShader:P,uniforms:f,transparent:!0,depthWrite:!1,depthTest:!0,toneMapped:!1,side:l.FrontSide}),[f]);(0,a.useEffect)(()=>()=>d.dispose(),[d]);let m=(0,a.useRef)(null),A=(0,a.useRef)(null),p=(0,a.useRef)(null),B=(0,a.useRef)(null),C=(0,a.useRef)(td.restScale),x=(0,a.useMemo)(()=>new v,[]),M=(0,a.useMemo)(()=>new l.Vector2,[]);(0,a.useEffect)(()=>()=>(0,tf.setArrowFullscreenDampedScaleT)(0),[]),(0,i.useFrame)((r,a)=>{let i=m.current,n=A.current;if(!i||!n)return;B.current&&B.current.matches(e)||(B.current=new g.TrackedRect(e));let u=B.current.get(g.frameState.scrollTop),d=g.frameState.viewportH||1,h=td.refMarginPx,v=r.camera,R=2*Math.tan(l.MathUtils.degToRad(v.fov)/2)*v.position.z,y=R*v.aspect,b=Math.min(Math.max(d/2,Math.min(u.top+h,u.bottom-h)),Math.max(u.top+h,u.bottom-h));i.position.set(0,(.5-b/d)*R,0);let F=c.boundingSphere,T=F?Math.max(F.radius,1e-4):1,E=Math.hypot(y,R)*td.autoPeakPadding/T,D=Math.max(d,1),G=(d/2-(u.top+h))/D,I=l.MathUtils.smoothstep(Math.min(1,Math.max(0,G)),0,1),S=(u.bottom-h-d/2)/D,w=l.MathUtils.smoothstep(Math.min(1,Math.max(0,S)),0,1),H=l.MathUtils.lerp(td.restScale,E,I*w);C.current=l.MathUtils.damp(C.current,H,td.scaleSmoothing,a);let P=C.current;i.scale.setScalar(1),p.current?.scale.setScalar(P);let U=Math.min(1,Math.max(0,(P-td.restScale)/Math.max(E-td.restScale,1e-4)));f.uStripeReveal.value=U,(0,tf.setArrowFullscreenDampedScaleT)(U);let L=l.MathUtils.degToRad(t);n.rotation.y=Math.min(1,Math.max(0,U/.4))*L+Math.min(1,Math.max(0,(1-w-.6)/.4))*L;let J=g.frameState.scrollTop,k=J+d,O=u.top+J;f.iTime.value=2*Math.min(1,Math.max(0,(k-O)/(k+u.height))),o.getDrawingBufferSize(M),f.iResolution.value.set(M.x,M.y,1),x.update(r.camera,s.pointerUv,!!s.pointerInsideRef.current&&!s.isMobile,a,f.uLight.value,.5)},-2);let R=(0,a.useMemo)(()=>[l.MathUtils.degToRad(td.rotationAxisTilt[0]),l.MathUtils.degToRad(td.rotationAxisTilt[1]),l.MathUtils.degToRad(td.rotationAxisTilt[2])],[]),y=(0,a.useMemo)(()=>[-R[0],-R[1],-R[2]],[R]);return(0,r.jsx)("group",{ref:m,children:(0,r.jsx)("group",{rotation:R,children:(0,r.jsx)("group",{ref:A,children:(0,r.jsx)("group",{rotation:y,children:(0,r.jsx)("mesh",{ref:p,geometry:c,renderOrder:12,frustumCulled:!1,scale:[.1,.1,.1],children:(0,r.jsx)("primitive",{object:d,attach:"material"})})})})})})}function tA(e){return(0,r.jsx)(a.Suspense,{fallback:null,children:(0,r.jsx)(tm,{...e})})}function th(e,t,r){e.colorSpace=l.SRGBColorSpace,e.wrapS=l.ClampToEdgeWrapping,e.wrapT=l.ClampToEdgeWrapping,r?(e.generateMipmaps=!1,e.minFilter=l.LinearFilter):(e.generateMipmaps=!0,e.minFilter=l.LinearMipmapLinearFilter),e.magFilter=l.LinearFilter,e.anisotropy=Math.min(r?4:8,t.capabilities.getMaxAnisotropy()),e.needsUpdate=!0}function tp({layer:e}){let{gl:t}=(0,n.useThree)(),o=h(),s=(0,a.useRef)(o);s.current=o;let u=(0,a.useMemo)(()=>({map:{value:null},mapHover:{value:null},uRect:{value:new l.Vector4(0,0,1,1)},uCurlStrength:{value:0},uPolarityPositive:{value:0},uLayerOpacity:{value:1},uRevealProgress:{value:1},uRevealSoftness:{value:0},uRevealDirection:{value:1},uHoverRevealProgress:{value:0},uDotPixelSize:{value:18},uViewportPx:{value:new l.Vector2(1,1)}}),[]),c=(0,a.useRef)(null),f=(0,a.useRef)(null),d=(0,a.useRef)({hovering:!1,progress:0}),m=(0,a.useRef)({started:!1,t:0}),A=(0,a.useRef)(!1);(0,a.useEffect)(()=>{let r=new l.TextureLoader,a=!1,o=null,i=null,n=()=>{A.current||(A.current=!0,s.current.onAssetReady(e.key))};return r.load(e.imageUrl,e=>{a?e.dispose():(th(e,t,s.current.isMobile),o=e,u.map.value=e,u.mapHover.value||(u.mapHover.value=e),n())},void 0,n),e.hoverImageUrl&&r.load(e.hoverImageUrl,e=>{a?e.dispose():(th(e,t,s.current.isMobile),i=e,u.mapHover.value=e)}),()=>{a=!0,o?.dispose(),i?.dispose()}},[e.key,e.imageUrl,e.hoverImageUrl,t,u]),(0,a.useEffect)(()=>{if(!e.hoverImageUrl)return;let t=e.el.parentElement??e.el,r=()=>{d.current.hovering=!0},a=()=>{d.current.hovering=!1};return t.addEventListener("pointerenter",r),t.addEventListener("pointerleave",a),()=>{t.removeEventListener("pointerenter",r),t.removeEventListener("pointerleave",a)}},[e.el,e.hoverImageUrl]),(0,i.useFrame)((t,r)=>{let a=c.current;if(!a)return;f.current&&f.current.matches(e.el)||(f.current=new g.TrackedRect(e.el));let o=f.current.get(g.frameState.scrollTop),i=g.frameState.viewportW||1,n=g.frameState.viewportH||1;if(a.visible=o.bottom>-.25*n&&o.top<1.25*n&&!!u.map.value,(o.bottom<-2*n||o.top>n+3*n)&&(m.current.started=!1,m.current.t=0,d.current.progress=0,u.uHoverRevealProgress.value=0),a.visible){if(u.uRect.value.set(o.left/i,1-(o.top+o.height)/n,Math.max(o.width/i,1e-5),Math.max(o.height/n,1e-5)),u.uViewportPx.value.set(i,n),u.uCurlStrength.value=.06*g.frameState.scrollVelocityFactor,s.current.reducedMotion)u.uPolarityPositive.value=1;else{var l;let e=m.current;e.started||(e.started=!0,e.t=0),e.t=Math.min(e.t+r/.8,1),u.uPolarityPositive.value=(l=e.t)<.5?4*l*l*l:1-Math.pow(-2*l+2,3)/2}if(e.hoverImageUrl){let e=d.current;e.progress=Math.min(1,Math.max(0,e.progress+(e.hovering?r:-r)/.42)),u.uHoverRevealProgress.value=.5-.5*Math.cos(Math.PI*e.progress)}}});let p=(0,a.useMemo)(()=>{let e=new l.ShaderMaterial({vertexShader:U,fragmentShader:L,uniforms:u,transparent:!0,depthTest:!1,depthWrite:!1,toneMapped:!1});return e.polygonOffset=!0,e.polygonOffsetFactor=-1,e.polygonOffsetUnits=-1,e},[u]);return(0,a.useEffect)(()=>()=>p.dispose(),[p]),(0,r.jsx)("mesh",{ref:c,renderOrder:20,frustumCulled:!1,visible:!1,material:p,children:(0,r.jsx)("planeGeometry",{args:[2,2]})})}let tB=Array.from({length:12},(e,t)=>(0,tr.asset)(`/sticker_img/s_${String(t+1).padStart(2,"0")}.png`));function tv(e,t,r){let a=Math.random;e.baseX=(a()-.5)*32,e.x=e.baseX,e.spawnY=24+24*a()*.5,e.y=r?e.spawnY-48*a():e.spawnY,e.z=-6+(a()-.5)*4,e.rot=a()*Math.PI*2,e.rotSpeed=(a()-.5)*1.6,e.windAmp=.3+1.8*a(),e.windPhase=a()*Math.PI*2,e.fallRand=.6+.8*a(),e.texIndex=t,e.delay=r?0:.04+.04*a(),e.oneShot=!1,e.scale=1.4,e.dead=!1}function tg({sectionName:e="banner"}){let{camera:t}=(0,n.useThree)(),o=h(),s=(0,a.useRef)(o);s.current=o;let[u,c]=(0,a.useState)(null);(0,a.useEffect)(()=>{let e=!1;return Promise.all(tB.map(e=>new Promise(t=>{let r=new Image;r.onload=()=>t(r),r.onerror=()=>t(null),r.src=e}))).then(t=>{if(e)return;let r=t.filter(e=>!!e);0!==r.length&&c(function(e){let t=2,r=2,a=0,o=[];for(let i of e){let e=i.naturalWidth,s=i.naturalHeight;t+e+2>1024&&(t=2,r+=a+4,a=0),o.push({x:t,y:r,w:e,h:s}),t+=e+4,a=Math.max(a,s)}let i=r+a+2,s=e=>Math.pow(2,Math.ceil(Math.log2(Math.max(e,1)))),n=s(1024),u=s(i),c=document.createElement("canvas");c.width=n,c.height=u;let f=c.getContext("2d"),d=[];e.forEach((e,t)=>{let r=o[t];f.drawImage(e,r.x,r.y),d.push([r.x/n,1-(r.y+r.h)/u,r.w/n,r.h/u])});let m=new l.CanvasTexture(c);return m.colorSpace=l.SRGBColorSpace,m.minFilter=l.LinearFilter,m.magFilter=l.LinearFilter,m.generateMipmaps=!1,{texture:m,uvRects:d}}(r))}),()=>{e=!0}},[]),(0,a.useEffect)(()=>()=>u?.texture.dispose(),[u]);let f=(0,a.useMemo)(()=>{let e=new l.InstancedBufferGeometry,t=new l.PlaneGeometry(2,2);return e.index=t.index,e.attributes.position=t.attributes.position,e.attributes.uv=t.attributes.uv,e.attributes.normal=t.attributes.normal,e.setAttribute("uvRect",new l.InstancedBufferAttribute(new Float32Array(8192),4)),e},[]),d=(0,a.useRef)(null),m=(0,a.useMemo)(()=>{let e=[];for(let t=0;t<12;t++){let r={};tv(r,t%12,!0),r.emitAt=0,e.push(r)}return{continuous:e,oneShots:[],dummy:new l.Object3D,raycaster:new l.Raycaster,planeZ0:new l.Plane(new l.Vector3(0,0,1),0),ndc:new l.Vector2,hit:new l.Vector3,time:0}},[]);return((0,a.useEffect)(()=>{let e=0,r=0,a=0,o=t=>{e=t.clientX,r=t.clientY,a=performance.now()},i=o=>{if(s.current.isMobile||g.frameState.refractiveCovered||performance.now()-a>600||Math.hypot(o.clientX-e,o.clientY-r)>8||window.getSelection()?.toString())return;let i=window.innerWidth||1,n=window.innerHeight||1;if(m.ndc.set(o.clientX/i*2-1,-(2*(o.clientY/n))+1),m.raycaster.setFromCamera(m.ndc,t),m.raycaster.ray.intersectPlane(m.planeZ0,m.hit)){m.oneShots.length+12>384&&(m.oneShots.sort((e,t)=>e.emitAt-t.emitAt),m.oneShots.splice(0,m.oneShots.length+12-384));for(let e=0;e<12;e++){let t=Math.random,r={};r.baseX=m.hit.x+(t()-.5)*24,r.x=r.baseX,r.spawnY=m.hit.y+24*t()*.5+2,r.y=r.spawnY,r.z=-6+(t()-.5)*4,r.rot=t()*Math.PI*2,r.rotSpeed=(t()-.5)*1.6,r.windAmp=.3+1.8*t(),r.windPhase=t()*Math.PI*2,r.fallRand=.6+.8*t(),r.texIndex=e%12,r.delay=e*(.04+.04*Math.random()),r.oneShot=!0,r.scale=1.4,r.dead=!1,r.emitAt=performance.now(),m.oneShots.push(r)}}};return window.addEventListener("pointerdown",o,{passive:!0}),window.addEventListener("pointerup",i,{passive:!0}),()=>{window.removeEventListener("pointerdown",o),window.removeEventListener("pointerup",i)}},[t,m]),(0,i.useFrame)((t,r)=>{let a=d.current;if(!a||!u)return;if(g.frameState.refractiveCovered){a.count=0,a.visible=!1;return}let o=g.frameState.sections.get(e);if(o){let e=o.rect.top+g.frameState.scrollTop+o.rect.height/2-g.frameState.viewportH;if(g.frameState.scrollTop<e){a.count=0,a.visible=!1;return}}a.visible=!0,m.time+=r;let i=m.time,s=u.uvRects.length,n=e=>{if(!e.dead){if(e.delay>0){e.delay-=r;return}e.y-=1.8*e.fallRand*r,e.x+=Math.sin(.3*i+e.windPhase)*e.windAmp*r,e.rot+=e.rotSpeed*r,(e.spawnY-e.y)/48>=1&&(e.oneShot?e.dead=!0:tv(e,(e.texIndex+1)%s,!1))}};m.continuous.forEach(n),m.oneShots.forEach(n),m.oneShots.some(e=>e.dead)&&(m.oneShots=m.oneShots.filter(e=>!e.dead));let l=[],c=e=>{if(e.dead||e.delay>0)return;let t=(e.spawnY-e.y)/48;t<0||t>=1||l.push(e)};m.continuous.forEach(c),m.oneShots.forEach(c),l.sort((e,t)=>e.z-t.z);let A=l.slice(0,96),h=f.getAttribute("uvRect");A.forEach((e,t)=>{let r=(e.spawnY-e.y)/48,o=1;r<.05?o=r/.05:r>.9&&(o=(1-r)/.1);let i=Math.max(e.scale*o,1e-4);m.dummy.position.set(e.x,e.y,e.z),m.dummy.rotation.set(0,0,e.rot),m.dummy.scale.setScalar(i),m.dummy.updateMatrix(),a.setMatrixAt(t,m.dummy.matrix);let n=u.uvRects[e.texIndex%s];h.setXYZW(t,n[0],n[1],n[2],n[3])}),a.count=A.length,a.instanceMatrix.needsUpdate=!0,h.needsUpdate=!0}),u)?(0,r.jsx)("instancedMesh",{ref:d,args:[f,void 0,2048],frustumCulled:!1,children:(0,r.jsx)("shaderMaterial",{vertexShader:J,fragmentShader:k,uniforms:{map:{value:u.texture}},transparent:!0,depthWrite:!1,side:l.FrontSide,toneMapped:!1})}):null}let tC="#ffa300",tx=Math.max(.003,5e-4),tM=1,tR=.5;function ty(e,t){return new l.ShaderMaterial({vertexShader:"varying vec2 vUv;void main(){vUv=position.xy*0.5+0.5;gl_Position=vec4(position.xy,1.0,1.0);}",fragmentShader:e,uniforms:t,transparent:!1,blending:l.NoBlending,depthTest:!1,depthWrite:!1,toneMapped:!1})}function tb(e,t){return new l.WebGLRenderTarget(e,t,{type:l.HalfFloatType,format:l.RGBAFormat,minFilter:l.LinearFilter,magFilter:l.LinearFilter,depthBuffer:!1,stencilBuffer:!1})}function tF(){let{gl:e,scene:t,camera:r}=(0,n.useThree)(),o=h(),s=(0,a.useRef)(o);s.current=o;let u=(0,a.useMemo)(()=>{let e=new l.Scene,t=new l.OrthographicCamera(-1,1,1,-1,0,1),r=new l.Mesh(new l.PlaneGeometry(2,2));r.frustumCulled=!1,e.add(r);let a={tDiffuse:{value:null},uResolution:{value:new l.Vector2(1,1)},uEnabled:{value:1},uIntensity:{value:.7},uThreshold:{value:.99},uStreakScale:{value:8},uHotspotPower:{value:32},uGate:{value:.88},uStarRays:{value:6},uTailColor:{value:new l.Color(tC)}},o={tBase:{value:null},tFlare:{value:null}},i=new l.Vector2(1,1),s=new l.Vector2(1,1),n=new l.Vector2(0,0),u=new l.Vector2(0,0),c={uVelocity:{value:null},uTexelSize:{value:i}},f={uVelocity:{value:null},uCurl:{value:null},uTexelSize:{value:i},uResolution:{value:s},uPointer:{value:n},uPointerDelta:{value:u},uCurlStrength:{value:0},uSplatRadius:{value:tx},uSplatForce:{value:3e3}},d={uVelocity:{value:null},uTexelSize:{value:i}},m={uPressure:{value:null},uDivergence:{value:null},uTexelSize:{value:i}},A={uVelocity:{value:null},uPressure:{value:null},uTexelSize:{value:i}},h={uVelocity:{value:null},uProjectedVelocity:{value:null},uTexelSize:{value:i},uDissipation:{value:3}},p=Array.from({length:16},()=>new l.Vector2(-1,-1)),B=Array(16).fill(0),v={tDiffuse:{value:null},uVelocity:{value:null},uSimSize:{value:s},uDisplacementStrength:{value:tM},uChromaticBoost:{value:tR},uEffectEnabled:{value:0},uTrail:{value:p},uTrailStrength:{value:B},uTrailCount:{value:0},uPointerColor:{value:new l.Color("#c0fe04")},uPointerOpacity:{value:1},uPointerDotRadius:{value:.8},uPointerPixelSize:{value:16},uResolution:{value:new l.Vector2(1,1)},uDevicePixelRatio:{value:1}};return{quadScene:e,quadCamera:t,quadMesh:r,flareMat:ty(O,a),flareUniforms:a,compositeMat:ty(K,o),compositeUniforms:o,curlMat:ty(N,c),curlU:c,vorticityMat:ty(_,f),vorticityU:f,divergenceMat:ty(j,d),divergenceU:d,clearMat:ty(Q,{}),pressureMat:ty(V,m),pressureU:m,gradientMat:ty(X,A),gradientU:A,advectMat:ty(Y,h),advectU:h,displayMat:ty(W,v),displayU:v,texel:i,simSize:s,pointerPx:n,pointerDelta:u,trail:p,trailStrength:B,baseRT:null,compositeRT:null,flareRT:null,velRead:null,velWrite:null,curlRT:null,divRT:null,pressRead:null,pressWrite:null,prevPointerPx:new l.Vector2(-1,-1),hasPointer:!1,lastPointerMoveMs:-1e9,lastPointerUv:new l.Vector2(-1,-1),lastTrailCell:new l.Vector2(-1,-1),drawSize:new l.Vector2}},[]);(0,a.useEffect)(()=>{u.flareUniforms.uTailColor.value.set("dark"===o.theme?"#1600ff":tC)},[o.theme,u]),(0,a.useEffect)(()=>()=>{[u.baseRT,u.compositeRT,u.flareRT,u.velRead,u.velWrite,u.curlRT,u.divRT,u.pressRead,u.pressWrite].forEach(e=>e?.dispose()),[u.flareMat,u.compositeMat,u.curlMat,u.vorticityMat,u.divergenceMat,u.clearMat,u.pressureMat,u.gradientMat,u.advectMat,u.displayMat].forEach(e=>e.dispose()),u.quadMesh.geometry.dispose()},[u]);let c=(t,r)=>{u.quadMesh.material=t,e.setRenderTarget(r),e.render(u.quadScene,u.quadCamera)};return(0,i.useFrame)((a,o)=>{let i=s.current;e.getDrawingBufferSize(u.drawSize);let n=Math.max(1,Math.floor(u.drawSize.x)),f=Math.max(1,Math.floor(u.drawSize.y));if(!u.baseRT||u.baseRT.width!==n||u.baseRT.height!==f){u.baseRT?.dispose(),u.compositeRT?.dispose(),u.flareRT?.dispose(),u.baseRT=new l.WebGLRenderTarget(n,f,{depthBuffer:!0,stencilBuffer:!1}),u.compositeRT=new l.WebGLRenderTarget(n,f,{depthBuffer:!1}),u.flareRT=new l.WebGLRenderTarget(Math.max(1,Math.floor(.5*n)),Math.max(1,Math.floor(.5*f)),{depthBuffer:!1});let e=n/f,t=e>=1?Math.round(160*e):160,r=e>=1?160:Math.round(160/e);[u.velRead,u.velWrite,u.curlRT,u.divRT,u.pressRead,u.pressWrite].forEach(e=>e?.dispose()),u.velRead=tb(t,r),u.velWrite=tb(t,r),u.curlRT=tb(t,r),u.divRT=tb(t,r),u.pressRead=tb(t,r),u.pressWrite=tb(t,r),u.simSize.set(t,r),u.texel.set(1/t,1/r)}let d=1e3*a.clock.elapsedTime,m=i.pointerUv;(m.x!==u.lastPointerUv.x||m.y!==u.lastPointerUv.y)&&(u.lastPointerUv.copy(m),u.lastPointerMoveMs=d);let A=d-u.lastPointerMoveMs<600,h=m.x*u.simSize.x,p=m.y*u.simSize.y;if(u.hasPointer){let e=(h-u.prevPointerPx.x)*1,t=(p-u.prevPointerPx.y)*1;0!==e||0!==t?u.pointerDelta.set(e,t):u.pointerDelta.multiplyScalar(.9)}u.prevPointerPx.set(h,p),u.hasPointer=!0,u.pointerPx.set(h,p);{let t=16*Math.max(e.getPixelRatio(),1),r=Math.floor(m.x*n/t),a=Math.floor(m.y*f/t);if(i.pointerInsideRef.current&&(r!==u.lastTrailCell.x||a!==u.lastTrailCell.y)){u.lastTrailCell.set(r,a);for(let e=13;e>0;e--)u.trail[e].copy(u.trail[e-1]),u.trailStrength[e]=u.trailStrength[e-1];u.trail[0].copy(m),u.trailStrength[0]=1}for(let e=0;e<16;e++)u.trailStrength[e]=l.MathUtils.damp(u.trailStrength[e],0,2,o)}let B=!i.reducedMotion&&u.trailStrength.some(e=>e>.02),v=g.frameState.sections.get("banner")?.inView??!1,C=g.frameState.sections.get("footer")?.inView??!1,x=g.frameState.solidCovered,M=!x&&(v||C),R=!i.isMobile&&!i.reducedMotion&&!x&&A,y=R||B;if(!M&&!y){e.setRenderTarget(null),e.render(t,r);return}e.setRenderTarget(u.baseRT),e.clear(),e.render(t,r);let b=u.baseRT;if(M)if(u.flareUniforms.uEnabled.value=1,u.flareUniforms.tDiffuse.value=b.texture,u.flareUniforms.uResolution.value.set(n,f),u.flareUniforms.uStreakScale.value=8*(g.frameState.viewportW/1920)*(i.isMobile?2:1),g.frameState.frameCount%2==0&&c(u.flareMat,u.flareRT),u.compositeUniforms.tBase.value=b.texture,u.compositeUniforms.tFlare.value=u.flareRT.texture,y)c(u.compositeMat,u.compositeRT),b=u.compositeRT;else{c(u.compositeMat,null),e.setRenderTarget(null);return}if(R&&u.velRead&&u.velWrite){u.curlU.uVelocity.value=u.velRead.texture,c(u.curlMat,u.curlRT),u.vorticityU.uVelocity.value=u.velRead.texture,u.vorticityU.uCurl.value=u.curlRT.texture,c(u.vorticityMat,u.velWrite),[u.velRead,u.velWrite]=[u.velWrite,u.velRead],u.divergenceU.uVelocity.value=u.velRead.texture,c(u.divergenceMat,u.divRT),c(u.clearMat,u.pressRead);for(let e=0;e<4;e++)u.pressureU.uPressure.value=u.pressRead.texture,u.pressureU.uDivergence.value=u.divRT.texture,c(u.pressureMat,u.pressWrite),[u.pressRead,u.pressWrite]=[u.pressWrite,u.pressRead];u.gradientU.uVelocity.value=u.velRead.texture,u.gradientU.uPressure.value=u.pressRead.texture,c(u.gradientMat,u.velWrite),[u.velRead,u.velWrite]=[u.velWrite,u.velRead],u.advectU.uVelocity.value=u.velRead.texture,u.advectU.uProjectedVelocity.value=u.velRead.texture,c(u.advectMat,u.velWrite),[u.velRead,u.velWrite]=[u.velWrite,u.velRead]}u.displayU.tDiffuse.value=b.texture,u.displayU.uVelocity.value=u.velRead?u.velRead.texture:null,u.displayU.uEffectEnabled.value=+!!R,u.displayU.uTrailCount.value=Math.min(14,u.trailStrength.filter(e=>e>.001).length),u.displayU.uResolution.value.set(n,f),u.displayU.uDevicePixelRatio.value=e.getPixelRatio(),c(u.displayMat,null),e.setRenderTarget(null)},998),null}var tT=e.i(28200);let tE=["hello","h_star","cnt"];function tD(){return(0,i.useFrame)((e,t)=>(0,g.updateFrameState)(t),-1e3),null}function tG(){(0,g.useWebGLSectionsVersion)();let e=(0,g.getWebGLSectionEl)("hyper-space"),[t,o]=(0,a.useState)(!1);return((0,a.useEffect)(()=>{if(!e)return;let t=new IntersectionObserver(e=>o(e.some(e=>e.isIntersecting)),{rootMargin:"480px 0px 480px 0px"});return t.observe(e),()=>t.disconnect()},[e]),e&&t)?(0,r.jsx)(tA,{targetEl:e,scaleSpinDegrees:180}):null}function tI(){let{resolvedTheme:e}=(0,c.useThemeMode)(),{setReadyToLoadHeavy:t,setHeavyLoadProgress:i,readyToLoadHeavy:s}=(0,f.useFullscreenTransition)(),n=(0,d.usePointerContext)(),l=(0,m.useIsMobile)(),h=function(){let[e,t]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{let e=window.matchMedia("(prefers-reduced-motion: reduce)"),r=()=>t(e.matches);return r(),e.addEventListener("change",r),()=>e.removeEventListener("change",r)},[]),e}(),p=(0,g.useWebGLImageLayers)(),[B,v]=(0,a.useState)(!1);(0,a.useEffect)(()=>v(!0),[]);let C=(0,a.useRef)(new Set),M=(0,a.useRef)([...tE]);M.current=[...tE,...p.map(e=>e.key)];let R=(0,a.useRef)(!1),y=(0,a.useCallback)(()=>{let e=M.current,r=e.filter(e=>C.current.has(e)).length;i(Math.round(r/Math.max(e.length,1)*100)),r>=e.length&&!R.current&&(R.current=!0,t(!0))},[i,t]),b=(0,a.useCallback)(e=>{C.current.add(e),y()},[y]);(0,a.useEffect)(()=>{y()},[p,y]);let F=(0,a.useMemo)(()=>({theme:e,isMobile:l,reducedMotion:h,pointerUv:n.uv,pointerInsideRef:n.insideRef,onAssetReady:b,ready:s}),[e,l,h,n.uv,n.insideRef,b,s]);return(0,r.jsx)("div",{className:"top-0 left-0 -z-1 fixed w-full h-dvh lg:h-screen",children:B&&(0,r.jsx)(o.Canvas,{dpr:[1,2],children:(0,r.jsxs)(A.Provider,{value:F,children:[(0,r.jsx)(tD,{}),(0,r.jsx)(u,{makeDefault:!0,position:[0,0,22]}),(0,r.jsx)(er,{}),(0,r.jsx)(x,{}),(0,r.jsxs)(tl,{children:[(0,r.jsxs)(a.Suspense,{fallback:null,children:[(0,r.jsx)(tc,{model:"model/hello.gltf",scrollSyncFactor:.72,modelPosition:[-.1,0,2],beforeRotation:[0,240,0],afterRotation:[0,90,0],rotation:[0,4,0],scale:l?19:22,sectionName:"banner",onReady:()=>b("hello"),tintEnabled:!0}),(0,r.jsx)(tc,{model:"model/cursor.glb",scrollSyncFactor:.72,modelPosition:[l?6.6:11.6,l?-5.6:-4.2,-3],rotationAxisTilt:[0,0,45],beforeRotation:[0,0,0],afterRotation:[0,720,0],scale:.1,sectionName:"banner",tintEnabled:!0,tingColor:["#009dff","#009dff","#64c3ff","#64c3ff"],onReady:()=>b("h_star")})]}),(0,r.jsx)(ee,{}),(0,r.jsx)(a.Suspense,{fallback:null,children:(0,r.jsx)(tc,{model:"model/cnt.gltf",beforeRotation:[-180,0,0],rotation:[0,0,0],scale:19,sectionName:"footer",tintEnabled:!0,tingColor:["#FFFFFF","#009dff","#8e9dc4","#64c3ff"],onReady:()=>b("cnt")})}),(0,r.jsx)(tg,{sectionName:"banner"}),p.map(e=>(0,r.jsx)(tp,{layer:e},e.key)),(0,r.jsx)(tG,{}),(0,r.jsx)(tF,{})]})]})})})}e.s(["default",()=>tI],41519),e.i(41519),e.s(["WebGLImageSlot",()=>tT.default,"default",()=>tI,"registerWebGLImageLayer",()=>g.registerWebGLImageLayer,"registerWebGLSection",()=>g.registerWebGLSection,"useRegisterWebGLSection",()=>g.useRegisterWebGLSection,"useWebGLSectionRef",()=>g.useWebGLSectionRef],37721)}]);