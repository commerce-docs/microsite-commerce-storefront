import{f as o}from"./forEachState.es.DETpARGm.js";import{e as t,f as b,h as v,d as k,i as F,S as g,T as y,j as D,k as S}from"./GraphiQLEditor.h-EeZlAI.js";function V(e,n){const a={schema:e,type:null,parentType:null,inputType:null,directiveDef:null,fieldDef:null,argDef:null,argDefs:null,objectFieldDefs:null};return o(n,(n=>{var i,l;switch(n.kind){case"Query":case"ShortQuery":a.type=e.getQueryType();break;case"Mutation":a.type=e.getMutationType();break;case"Subscription":a.type=e.getSubscriptionType();break;case"InlineFragment":case"FragmentDefinition":n.type&&(a.type=e.getType(n.type));break;case"Field":case"AliasedField":a.fieldDef=a.type&&n.name?T(e,a.parentType,n.name):null,a.type=null===(i=a.fieldDef)||void 0===i?void 0:i.type;break;case"SelectionSet":a.parentType=a.type?t(a.type):null;break;case"Directive":a.directiveDef=n.name?e.getDirective(n.name):null;break;case"Arguments":const r=n.prevState?"Field"===n.prevState.kind?a.fieldDef:"Directive"===n.prevState.kind?a.directiveDef:"AliasedField"===n.prevState.kind?n.prevState.name&&T(e,a.parentType,n.prevState.name):null:null;a.argDefs=r?r.args:null;break;case"Argument":if(a.argDef=null,a.argDefs)for(let e=0;e<a.argDefs.length;e++)if(a.argDefs[e].name===n.name){a.argDef=a.argDefs[e];break}a.inputType=null===(l=a.argDef)||void 0===l?void 0:l.type;break;case"EnumValue":const u=a.inputType?t(a.inputType):null;a.enumValue=u instanceof F?h(u.getValues(),(e=>e.value===n.name)):null;break;case"ListValue":const p=a.inputType?v(a.inputType):null;a.inputType=p instanceof k?p.ofType:null;break;case"ObjectValue":const s=a.inputType?t(a.inputType):null;a.objectFieldDefs=s instanceof b?s.getFields():null;break;case"ObjectField":const c=n.name&&a.objectFieldDefs?a.objectFieldDefs[n.name]:null;a.inputType=c?.type,a.fieldDef=c;break;case"NamedType":a.type=n.name?e.getType(n.name):null}})),a}function T(e,t,n){return n===g.name&&e.getQueryType()===t?g:n===y.name&&e.getQueryType()===t?y:n===D.name&&S(t)?D:t&&t.getFields?t.getFields()[n]:void 0}function h(e,t){for(let n=0;n<e.length;n++)if(t(e[n]))return e[n]}function A(e){return{kind:"Field",schema:e.schema,field:e.fieldDef,type:m(e.fieldDef)?null:e.parentType}}function M(e){return{kind:"Directive",schema:e.schema,directive:e.directiveDef}}function E(e){return e.directiveDef?{kind:"Argument",schema:e.schema,argument:e.argDef,directive:e.directiveDef}:{kind:"Argument",schema:e.schema,argument:e.argDef,field:e.fieldDef,type:m(e.fieldDef)?null:e.parentType}}function L(e){return{kind:"EnumValue",value:e.enumValue||void 0,type:e.inputType?t(e.inputType):void 0}}function R(e,t){return{kind:"Type",schema:e.schema,type:t||e.type}}function m(e){return"__"===e.name.slice(0,2)}export{A as a,M as b,E as c,L as d,R as e,V as g};