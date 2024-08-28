const __vite__fileDeps=["_astro/ui-core.Br10NvTk.js","_astro/preload-helper.BiBI96sQ.js"],__vite__mapDeps=i=>i.map(i=>__vite__fileDeps[i]);
import{_ as S}from"./preload-helper.BiBI96sQ.js";import"./Tabs.astro_astro_type_script_index_0_lang.CCIyraCc.js";const b="starlight-image-zoom-zoomable";customElements.define("starlight-image-zoom",class E extends HTMLElement{#e;#o=[];#s;#i=this.querySelector("template");#t={image:"starlight-image-zoom-image",opened:"starlight-image-zoom-opened",source:"starlight-image-zoom-source"};static#u=!1;constructor(){super();const e=()=>{(window.requestIdleCallback??(t=>setTimeout(t,1)))(()=>{const t=[...document.querySelectorAll(b)];t.length!==0&&(this.#h(t),document.addEventListener("click",this.#r),window.addEventListener("resize",this.#a))})};window.addEventListener("DOMContentLoaded",e,{once:!0}),document.addEventListener("astro:after-preparation",()=>{document.removeEventListener("click",this.#r),window.removeEventListener("resize",this.#a)},{once:!0}),E.#u||=document.addEventListener("astro:after-swap",e)===void 0}#h(e){for(const n of e){const t=n.querySelector("img");t&&(this.#o.push(t),n.querySelector("button")?.addEventListener("click",i=>{i.stopPropagation(),this.#l(t)}))}}#r=({target:e})=>{if(!(e instanceof HTMLElement&&e.closest("figcaption"))){if(this.#e){this.#n();return}e instanceof HTMLImageElement&&this.#o.includes(e)&&this.#l(e)}};#a=()=>{this.#n(!0)};#c=()=>{this.#n()};#m=e=>{e.preventDefault(),this.#n()};#l(e){if(!this.#i||this.#e)return;this.#s=document.activeElement;const n=document.createElement("div");n.append(this.#i.content.cloneNode(!0));const t=n.querySelector("dialog"),i=t?.querySelector("figure");if(!t||!i)return;const r=this.#f(e);e.classList.add(this.#t.source),r.classList.add(this.#t.image),i.append(r),this.#g(e.getAttribute("alt"),i),document.body.append(n),document.addEventListener("wheel",this.#c,{once:!0}),t.addEventListener("cancel",this.#m),t.showModal(),r.style.transform=this.#p(e,i),document.body.classList.add(this.#t.opened),this.#e={dialog:t,image:e,zoomedImage:r}}#n(e=!1){if(window.removeEventListener("wheel",this.#c),!this.#e)return;const{zoomedImage:n}=this.#e;n.style.transform="",document.body.classList.remove(this.#t.opened);const{matches:t}=window.matchMedia("(prefers-reduced-motion: reduce)");e||t?this.#d():n.addEventListener("transitionend",this.#d,{once:!0})}#d=()=>{if(!this.#e)return;const{dialog:e,image:n}=this.#e;n.classList.remove(this.#t.source),e.parentElement?.remove(),this.#e=void 0,this.#s instanceof HTMLElement&&this.#s.focus()};#g(e,n){if(Object.hasOwn(this.dataset,"hideCaption")||(e=e?.trim()??"",e.length===0))return;const t=document.createElement("figcaption");t.ariaHidden="true",t.textContent=e,n.append(t)}#f(e){const{height:n,left:t,top:i,width:r}=e.getBoundingClientRect(),a=e.cloneNode(!0);return a.removeAttribute("id"),a.style.position="absolute",a.style.width=`${r}px`,a.style.height=`${n}px`,a.style.top=`${i}px`,a.style.left=`${t}px`,a.style.transform="",e.parentElement?.tagName==="PICTURE"&&e.currentSrc&&(a.src=e.currentSrc),a}#p(e,n){const t=this.#E(e),i=e.getBoundingClientRect(),r=n.getBoundingClientRect(),a=t?r.height:e.naturalHeight,u=t?r.width:e.naturalWidth,m=Math.min(Math.max(i.width,u),r.width)/i.width,g=Math.min(Math.max(i.height,a),r.height)/i.height,o=Math.min(m,g),l=(-i.left+(r.width-i.width)/2+r.left)/o,s=(-i.top+(r.height-i.height)/2+r.top)/o;return`scale(${o}) translate3d(${l}px, ${s}px, 0)`}#E(e){return e.currentSrc.toLowerCase().endsWith(".svg")}});class T extends HTMLElement{constructor(){super();const e=this.querySelector("select");e&&e.addEventListener("change",n=>{n.currentTarget instanceof HTMLSelectElement&&(window.location.pathname=n.currentTarget.value)})}}customElements.define("starlight-lang-select",T);class M extends HTMLElement{constructor(){super();const e=this.querySelector("button[data-open-modal]"),n=this.querySelector("button[data-close-modal]"),t=this.querySelector("dialog"),i=this.querySelector(".dialog-frame"),r=s=>{("href"in(s.target||{})||document.body.contains(s.target)&&!i.contains(s.target))&&u()},a=s=>{t.showModal(),document.body.toggleAttribute("data-search-modal-open",!0),this.querySelector("input")?.focus(),s?.stopPropagation(),window.addEventListener("click",r)},u=()=>t.close();e.addEventListener("click",a),e.disabled=!1,n.addEventListener("click",u),t.addEventListener("close",()=>{document.body.toggleAttribute("data-search-modal-open",!1),window.removeEventListener("click",r)}),window.addEventListener("keydown",s=>{const d=document.activeElement instanceof HTMLElement&&(["input","select","textarea"].includes(document.activeElement.tagName.toLowerCase())||document.activeElement.isContentEditable);(s.metaKey===!0||s.ctrlKey===!0)&&s.key==="k"?(t.open?u():a(),s.preventDefault()):s.key==="/"&&!t.open&&!d&&(a(),s.preventDefault())});let m={};try{m=JSON.parse(this.dataset.translations||"{}")}catch{}const l=this.dataset.stripTrailingSlash!==void 0?s=>s.replace(/(.)\/(#.*)?$/,"$1$2"):s=>s;window.addEventListener("DOMContentLoaded",()=>{(window.requestIdleCallback||(d=>setTimeout(d,1)))(async()=>{const{PagefindUI:d}=await S(()=>import("./ui-core.Br10NvTk.js"),__vite__mapDeps([0,1]));new d({element:"#starlight__search",baseUrl:"/",bundlePath:"/".replace(/\/$/,"")+"/pagefind/",showImages:!1,translations:m,showSubResults:!0,processResult:h=>{h.url=l(h.url),h.sub_results=h.sub_results.map(f=>(f.url=l(f.url),f))}})})})}}customElements.define("site-search",M);const v="starlight-theme",L=c=>c==="auto"||c==="dark"||c==="light"?c:"auto",w=()=>L(typeof localStorage<"u"&&localStorage.getItem(v));function C(c){typeof localStorage<"u"&&localStorage.setItem(v,c==="light"||c==="dark"?c:"")}const I=()=>matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";function p(c){StarlightThemeProvider.updatePickers(c),document.documentElement.dataset.theme=c==="auto"?I():c,C(c)}matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{w()==="auto"&&p("auto")});class H extends HTMLElement{constructor(){super(),p(w()),this.querySelector("select")?.addEventListener("change",e=>{e.currentTarget instanceof HTMLSelectElement&&p(L(e.currentTarget.value))})}}customElements.define("starlight-theme-select",H);class k extends HTMLElement{constructor(){super(),this.btn=this.querySelector("button"),this.btn.addEventListener("click",()=>this.toggleExpanded());const e=this.closest("nav");e&&e.addEventListener("keyup",n=>this.closeOnEscape(n))}setExpanded(e){this.setAttribute("aria-expanded",String(e)),document.body.toggleAttribute("data-mobile-menu-expanded",e)}toggleExpanded(){this.setExpanded(this.getAttribute("aria-expanded")!=="true")}closeOnEscape(e){e.code==="Escape"&&(this.setExpanded(!1),this.btn.focus())}}customElements.define("starlight-menu-button",k);const x="_top";class y extends HTMLElement{constructor(){super(),this._current=this.querySelector('a[aria-current="true"]'),this.minH=parseInt(this.dataset.minH||"2",10),this.maxH=parseInt(this.dataset.maxH||"3",10);const e=[...this.querySelectorAll("a")],n=o=>{if(o instanceof HTMLHeadingElement){if(o.id===x)return!0;const l=o.tagName[1];if(l){const s=parseInt(l,10);if(s>=this.minH&&s<=this.maxH)return!0}}return!1},t=o=>{if(!o)return null;const l=o;for(;o;){if(n(o))return o;for(o=o.previousElementSibling;o?.lastElementChild;)o=o.lastElementChild;const s=t(o);if(s)return s}return t(l.parentElement)},i=o=>{for(const{isIntersecting:l,target:s}of o){if(!l)continue;const d=t(s);if(!d)continue;const h=e.find(f=>f.hash==="#"+encodeURIComponent(d.id));if(h){this.current=h;break}}},r=document.querySelectorAll("main [id], main [id] ~ *, main .content > *");let a;const u=()=>{a&&a.disconnect(),a=new IntersectionObserver(i,{rootMargin:this.getRootMargin()}),r.forEach(o=>a.observe(o))};u();const m=window.requestIdleCallback||(o=>setTimeout(o,1));let g;window.addEventListener("resize",()=>{a&&a.disconnect(),clearTimeout(g),g=setTimeout(()=>m(u),200)})}set current(e){e!==this._current&&(this._current&&this._current.removeAttribute("aria-current"),e.setAttribute("aria-current","true"),this._current=e)}getRootMargin(){const e=document.querySelector("header")?.getBoundingClientRect().height||0,n=this.querySelector("summary")?.getBoundingClientRect().height||0,t=e+n+32,i=t+53,r=document.documentElement.clientHeight;return`-${t}px 0% ${i-r}px`}}customElements.define("starlight-toc",y);class q extends y{set current(e){super.current=e;const n=this.querySelector(".display-current");n&&(n.textContent=e.textContent)}constructor(){super();const e=this.querySelector("details");if(!e)return;const n=()=>{e.open=!1};e.querySelectorAll("a").forEach(t=>{t.addEventListener("click",n)}),window.addEventListener("click",t=>{e.contains(t.target)||n()}),window.addEventListener("keydown",t=>{if(t.key==="Escape"&&e.open){const i=e.contains(document.activeElement);if(n(),i){const r=e.querySelector("summary");r&&r.focus()}}})}}customElements.define("mobile-starlight-toc",q);
