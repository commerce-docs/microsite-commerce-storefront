import{C as s}from"./codemirror.es.DhNp89ap.js";import"./show-hint.es.D0KHal1o.js";import{g as m}from"./GraphiQLEditor.h-EeZlAI.js";import{P as d}from"./Range.CZNrBk8u.js";import"./codemirror.es2.CXusOVRv.js";import"./index.BGCt5l70.js";s.registerHelper("hint","graphql",(n,p)=>{const{schema:i,externalFragments:c,autocompleteOptions:u}=p;if(!i)return;const r=n.getCursor(),e=n.getTokenAt(r),a=e.type!==null&&/"|\w/.test(e.string[0])?e.start:e.end,g=new d(r.line,a),t={list:m(i,n.getValue(),g,e,c,u).map(o=>{var l;return{text:(l=o?.rawInsert)!==null&&l!==void 0?l:o.label,type:o.type,description:o.documentation,isDeprecated:o.isDeprecated,deprecationReason:o.deprecationReason}}),from:{line:r.line,ch:a},to:{line:r.line,ch:e.end}};return t?.list&&t.list.length>0&&(t.from=s.Pos(t.from.line,t.from.ch),t.to=s.Pos(t.to.line,t.to.ch),s.signal(n,"hasCompletion",n,t,e)),t});
