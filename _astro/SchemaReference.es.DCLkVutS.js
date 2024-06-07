import{s as b}from"./forEachState.es.CB2-vmvs.js";import{e as l,f as k,h as F,d as h,i as S,S as g,T as D,j as T,k as j}from"./GraphiQLEditor.C4bfWNlg.js";var Q=Object.defineProperty,r=(e,t)=>Q(e,"name",{value:t,configurable:!0});function V(e,t){const n={schema:e,type:null,parentType:null,inputType:null,directiveDef:null,fieldDef:null,argDef:null,argDefs:null,objectFieldDefs:null};return b(t,(t=>{var a,i;switch(t.kind){case"Query":case"ShortQuery":n.type=e.getQueryType();break;case"Mutation":n.type=e.getMutationType();break;case"Subscription":n.type=e.getSubscriptionType();break;case"InlineFragment":case"FragmentDefinition":t.type&&(n.type=e.getType(t.type));break;case"Field":case"AliasedField":n.fieldDef=n.type&&t.name?c(e,n.parentType,t.name):null,n.type=null===(a=n.fieldDef)||void 0===a?void 0:a.type;break;case"SelectionSet":n.parentType=n.type?l(n.type):null;break;case"Directive":n.directiveDef=t.name?e.getDirective(t.name):null;break;case"Arguments":const r=t.prevState?"Field"===t.prevState.kind?n.fieldDef:"Directive"===t.prevState.kind?n.directiveDef:"AliasedField"===t.prevState.kind?t.prevState.name&&c(e,n.parentType,t.prevState.name):null:null;n.argDefs=r?r.args:null;break;case"Argument":if(n.argDef=null,n.argDefs)for(let e=0;e<n.argDefs.length;e++)if(n.argDefs[e].name===t.name){n.argDef=n.argDefs[e];break}n.inputType=null===(i=n.argDef)||void 0===i?void 0:i.type;break;case"EnumValue":const u=n.inputType?l(n.inputType):null;n.enumValue=u instanceof S?v(u.getValues(),(e=>e.value===t.name)):null;break;case"ListValue":const s=n.inputType?F(n.inputType):null;n.inputType=s instanceof h?s.ofType:null;break;case"ObjectValue":const p=n.inputType?l(n.inputType):null;n.objectFieldDefs=p instanceof k?p.getFields():null;break;case"ObjectField":const f=t.name&&n.objectFieldDefs?n.objectFieldDefs[t.name]:null;n.inputType=f?.type,n.fieldDef=f;break;case"NamedType":n.type=t.name?e.getType(t.name):null}})),n}function c(e,t,n){return n===g.name&&e.getQueryType()===t?g:n===D.name&&e.getQueryType()===t?D:n===T.name&&j(t)?T:t&&t.getFields?t.getFields()[n]:void 0}function v(e,t){for(let n=0;n<e.length;n++)if(t(e[n]))return e[n]}function A(e){return{kind:"Field",schema:e.schema,field:e.fieldDef,type:s(e.fieldDef)?null:e.parentType}}function L(e){return{kind:"Directive",schema:e.schema,directive:e.directiveDef}}function M(e){return e.directiveDef?{kind:"Argument",schema:e.schema,argument:e.argDef,directive:e.directiveDef}:{kind:"Argument",schema:e.schema,argument:e.argDef,field:e.fieldDef,type:s(e.fieldDef)?null:e.parentType}}function R(e){return{kind:"EnumValue",value:e.enumValue||void 0,type:e.inputType?l(e.inputType):void 0}}function E(e,t){return{kind:"Type",schema:e.schema,type:t||e.type}}function s(e){return"__"===e.name.slice(0,2)}r(V,"getTypeInfo"),r(c,"getFieldDef"),r(v,"find"),r(A,"getFieldReference"),r(L,"getDirectiveReference"),r(M,"getArgumentReference"),r(R,"getEnumValueReference"),r(E,"getTypeReference"),r(s,"isMetaField");export{V as E,R as G,A as L,E as O,L as R,M as _};