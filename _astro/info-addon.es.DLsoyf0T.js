import{C as i}from"./codemirror.es.DhNp89ap.js";import"./codemirror.es2.CXusOVRv.js";function v(e){return{options:e instanceof Function?{render:e}:!0===e?{}:e}}function g(e){const{options:o}=e.state.info;return o?.hoverTime||500}function T(e,o){const t=e.state.info,n=o.target||o.srcElement;if(!(n instanceof HTMLElement)||"SPAN"!==n.nodeName||void 0!==t.hoverTimeout)return;const r=n.getBoundingClientRect(),m=function(){clearTimeout(t.hoverTimeout),t.hoverTimeout=setTimeout(s,f)},u=function(){i.off(document,"mousemove",m),i.off(e.getWrapperElement(),"mouseout",u),clearTimeout(t.hoverTimeout),t.hoverTimeout=void 0},s=function(){i.off(document,"mousemove",m),i.off(e.getWrapperElement(),"mouseout",u),t.hoverTimeout=void 0,h(e,r)},f=g(e);t.hoverTimeout=setTimeout(s,f),i.on(document,"mousemove",m),i.on(e.getWrapperElement(),"mouseout",u)}function h(e,o){const t=e.coordsChar({left:(o.left+o.right)/2,top:(o.top+o.bottom)/2},"window"),n=e.state.info,{options:i}=n,r=i.render||e.getHelper(t,"info");if(r){const n=e.getTokenAt(t,!0);if(n){const m=r(n,i,e,t);m&&M(e,o,m)}}}function M(e,o,t){const n=document.createElement("div");n.className="CodeMirror-info",n.append(t),document.body.append(n);const r=n.getBoundingClientRect(),m=window.getComputedStyle(n),u=r.right-r.left+parseFloat(m.marginLeft)+parseFloat(m.marginRight),s=r.bottom-r.top+parseFloat(m.marginTop)+parseFloat(m.marginBottom);let f=o.bottom;s>window.innerHeight-o.bottom-15&&o.top>window.innerHeight-o.bottom&&(f=o.top-s),f<0&&(f=o.bottom);let a,c=Math.max(0,window.innerWidth-u-15);c>o.left&&(c=o.left),n.style.opacity="1",n.style.top=f+"px",n.style.left=c+"px";const p=function(){clearTimeout(a)},l=function(){clearTimeout(a),a=setTimeout(d,200)},d=function(){i.off(n,"mouseover",p),i.off(n,"mouseout",l),i.off(e.getWrapperElement(),"mouseout",l),n.style.opacity?(n.style.opacity="0",setTimeout((()=>{n.parentNode&&n.remove()}),600)):n.parentNode&&n.remove()};i.on(n,"mouseover",p),i.on(n,"mouseout",l),i.on(e.getWrapperElement(),"mouseout",l)}i.defineOption("info",!1,((e,o,t)=>{if(t&&t!==i.Init){const o=e.state.info.onMouseOver;i.off(e.getWrapperElement(),"mouseover",o),clearTimeout(e.state.info.hoverTimeout),delete e.state.info}if(o){const t=e.state.info=v(o);t.onMouseOver=T.bind(null,e),i.on(e.getWrapperElement(),"mouseover",t.onMouseOver)}}));