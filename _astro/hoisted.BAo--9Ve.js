import"./Tabs.astro_astro_type_script_index_0_lang.CCIyraCc.js";const S="starlight-image-zoom-zoomable";customElements.define("starlight-image-zoom",class p extends HTMLElement{#e;#o=[];#s;#i=this.querySelector("template");#t={image:"starlight-image-zoom-image",opened:"starlight-image-zoom-opened",source:"starlight-image-zoom-source"};static#u=!1;constructor(){super();const e=()=>{(window.requestIdleCallback??(t=>setTimeout(t,1)))(()=>{const t=[...document.querySelectorAll(S)];t.length!==0&&(this.#h(t),document.addEventListener("click",this.#r),window.addEventListener("resize",this.#a))})};window.addEventListener("DOMContentLoaded",e,{once:!0}),document.addEventListener("astro:after-preparation",()=>{document.removeEventListener("click",this.#r),window.removeEventListener("resize",this.#a)},{once:!0}),p.#u||=document.addEventListener("astro:after-swap",e)===void 0}#h(e){for(const n of e){const t=n.querySelector("img");t&&(this.#o.push(t),n.querySelector("button")?.addEventListener("click",o=>{o.stopPropagation(),this.#l(t)}))}}#r=({target:e})=>{if(!(e instanceof HTMLElement&&e.closest("figcaption"))){if(this.#e){this.#n();return}e instanceof HTMLImageElement&&this.#o.includes(e)&&this.#l(e)}};#a=()=>{this.#n(!0)};#c=()=>{this.#n()};#m=e=>{e.preventDefault(),this.#n()};#l(e){if(!this.#i||this.#e)return;this.#s=document.activeElement;const n=document.createElement("div");n.append(this.#i.content.cloneNode(!0));const t=n.querySelector("dialog"),o=t?.querySelector("figure");if(!t||!o)return;const i=this.#f(e);e.classList.add(this.#t.source),i.classList.add(this.#t.image),o.append(i),this.#g(e.getAttribute("alt"),o),document.body.append(n),document.addEventListener("wheel",this.#c,{once:!0}),t.addEventListener("cancel",this.#m),t.showModal(),i.style.transform=this.#p(e,o),document.body.classList.add(this.#t.opened),this.#e={dialog:t,image:e,zoomedImage:i}}#n(e=!1){if(window.removeEventListener("wheel",this.#c),!this.#e)return;const{zoomedImage:n}=this.#e;n.style.transform="",document.body.classList.remove(this.#t.opened);const{matches:t}=window.matchMedia("(prefers-reduced-motion: reduce)");e||t?this.#d():n.addEventListener("transitionend",this.#d,{once:!0})}#d=()=>{if(!this.#e)return;const{dialog:e,image:n}=this.#e;n.classList.remove(this.#t.source),e.parentElement?.remove(),this.#e=void 0,this.#s instanceof HTMLElement&&this.#s.focus()};#g(e,n){if(Object.hasOwn(this.dataset,"hideCaption")||(e=e?.trim()??"",e.length===0))return;const t=document.createElement("figcaption");t.ariaHidden="true",t.textContent=e,n.append(t)}#f(e){const{height:n,left:t,top:o,width:i}=e.getBoundingClientRect(),r=e.cloneNode(!0);return r.removeAttribute("id"),r.style.position="absolute",r.style.width=`${i}px`,r.style.height=`${n}px`,r.style.top=`${o}px`,r.style.left=`${t}px`,r.style.transform="",e.parentElement?.tagName==="PICTURE"&&e.currentSrc&&(r.src=e.currentSrc),r}#p(e,n){const t=this.#E(e),o=e.getBoundingClientRect(),i=n.getBoundingClientRect(),r=t?i.height:e.naturalHeight,d=t?i.width:e.naturalWidth,h=Math.min(Math.max(o.width,d),i.width)/o.width,c=Math.min(Math.max(o.height,r),i.height)/o.height,s=Math.min(h,c),u=(-o.left+(i.width-o.width)/2+i.left)/s,l=(-o.top+(i.height-o.height)/2+i.top)/s;return`scale(${s}) translate3d(${u}px, ${l}px, 0)`}#E(e){return e.currentSrc.toLowerCase().endsWith(".svg")}});class b extends HTMLElement{constructor(){super();const e=this.querySelector("select");e&&e.addEventListener("change",n=>{n.currentTarget instanceof HTMLSelectElement&&(window.location.pathname=n.currentTarget.value)})}}customElements.define("starlight-lang-select",b);class T extends HTMLElement{constructor(){super();const e=this.querySelector("button[data-open-modal]"),n=this.querySelector("button[data-close-modal]"),t=this.querySelector("dialog"),o=this.querySelector(".dialog-frame"),i=c=>{("href"in(c.target||{})||document.body.contains(c.target)&&!o.contains(c.target))&&d()},r=c=>{t.showModal(),document.body.toggleAttribute("data-search-modal-open",!0),this.querySelector("input")?.focus(),c?.stopPropagation(),window.addEventListener("click",i)},d=()=>t.close();e.addEventListener("click",r),e.disabled=!1,n.addEventListener("click",d),t.addEventListener("close",()=>{document.body.toggleAttribute("data-search-modal-open",!1),window.removeEventListener("click",i)}),window.addEventListener("keydown",c=>{const s=document.activeElement instanceof HTMLElement&&(["input","select","textarea"].includes(document.activeElement.tagName.toLowerCase())||document.activeElement.isContentEditable);(c.metaKey===!0||c.ctrlKey===!0)&&c.key==="k"?(t.open?d():r(),c.preventDefault()):c.key==="/"&&!t.open&&!s&&(r(),c.preventDefault())});let h={};try{h=JSON.parse(this.dataset.translations||"{}")}catch{}this.dataset.stripTrailingSlash,window.addEventListener("DOMContentLoaded",()=>{})}}customElements.define("site-search",T);const E="starlight-theme",v=a=>a==="auto"||a==="dark"||a==="light"?a:"auto",L=()=>v(typeof localStorage<"u"&&localStorage.getItem(E));function M(a){typeof localStorage<"u"&&localStorage.setItem(E,a==="light"||a==="dark"?a:"")}const C=()=>matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";function m(a){StarlightThemeProvider.updatePickers(a),document.documentElement.dataset.theme=a==="auto"?C():a,M(a)}matchMedia("(prefers-color-scheme: light)").addEventListener("change",()=>{L()==="auto"&&m("auto")});class H extends HTMLElement{constructor(){super(),m(L()),this.querySelector("select")?.addEventListener("change",e=>{e.currentTarget instanceof HTMLSelectElement&&m(v(e.currentTarget.value))})}}customElements.define("starlight-theme-select",H);class x extends HTMLElement{constructor(){super(),this.btn=this.querySelector("button"),this.btn.addEventListener("click",()=>this.toggleExpanded());const e=this.closest("nav");e&&e.addEventListener("keyup",n=>this.closeOnEscape(n))}setExpanded(e){this.setAttribute("aria-expanded",String(e)),document.body.toggleAttribute("data-mobile-menu-expanded",e)}toggleExpanded(){this.setExpanded(this.getAttribute("aria-expanded")!=="true")}closeOnEscape(e){e.code==="Escape"&&(this.setExpanded(!1),this.btn.focus())}}customElements.define("starlight-menu-button",x);const k="_top";class y extends HTMLElement{constructor(){super(),this._current=this.querySelector('a[aria-current="true"]'),this.minH=parseInt(this.dataset.minH||"2",10),this.maxH=parseInt(this.dataset.maxH||"3",10);const e=[...this.querySelectorAll("a")],n=s=>{if(s instanceof HTMLHeadingElement){if(s.id===k)return!0;const u=s.tagName[1];if(u){const l=parseInt(u,10);if(l>=this.minH&&l<=this.maxH)return!0}}return!1},t=s=>{if(!s)return null;const u=s;for(;s;){if(n(s))return s;for(s=s.previousElementSibling;s?.lastElementChild;)s=s.lastElementChild;const l=t(s);if(l)return l}return t(u.parentElement)},o=s=>{for(const{isIntersecting:u,target:l}of s){if(!u)continue;const g=t(l);if(!g)continue;const f=e.find(w=>w.hash==="#"+encodeURIComponent(g.id));if(f){this.current=f;break}}},i=document.querySelectorAll("main [id], main [id] ~ *, main .content > *");let r;const d=()=>{r&&r.disconnect(),r=new IntersectionObserver(o,{rootMargin:this.getRootMargin()}),i.forEach(s=>r.observe(s))};d();const h=window.requestIdleCallback||(s=>setTimeout(s,1));let c;window.addEventListener("resize",()=>{r&&r.disconnect(),clearTimeout(c),c=setTimeout(()=>h(d),200)})}set current(e){e!==this._current&&(this._current&&this._current.removeAttribute("aria-current"),e.setAttribute("aria-current","true"),this._current=e)}getRootMargin(){const e=document.querySelector("header")?.getBoundingClientRect().height||0,n=this.querySelector("summary")?.getBoundingClientRect().height||0,t=e+n+32,o=t+53,i=document.documentElement.clientHeight;return`-${t}px 0% ${o-i}px`}}customElements.define("starlight-toc",y);class q extends y{set current(e){super.current=e;const n=this.querySelector(".display-current");n&&(n.textContent=e.textContent)}constructor(){super();const e=this.querySelector("details");if(!e)return;const n=()=>{e.open=!1};e.querySelectorAll("a").forEach(t=>{t.addEventListener("click",n)}),window.addEventListener("click",t=>{e.contains(t.target)||n()}),window.addEventListener("keydown",t=>{if(t.key==="Escape"&&e.open){const o=e.contains(document.activeElement);if(n(),o){const i=e.querySelector("summary");i&&i.focus()}}})}}customElements.define("mobile-starlight-toc",q);
