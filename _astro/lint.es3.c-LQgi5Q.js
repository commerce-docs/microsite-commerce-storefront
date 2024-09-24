import{C as Q}from"./codemirror.es.DhNp89ap.js";import{c as $,d as I,f as q,i as v,n as C}from"./GraphiQLEditor.h-EeZlAI.js";import"./codemirror.es2.CXusOVRv.js";import"./index.BGCt5l70.js";function M(e){l=e,N=e.length,i=c=k=-1,s(),E();const r=j();return d("EOF"),r}let l,N,i,c,k,r,u;function j(){const e=i,r=[];if(d("{"),!w("}")){do{r.push(D())}while(w(","));d("}")}return{kind:"Object",start:e,end:k,members:r}}function D(){const e=i,r="String"===u?B():null;d("String"),d(":");const n=L();return{kind:"Member",start:e,end:k,key:r,value:n}}function H(){const e=i,r=[];if(d("["),!w("]")){do{r.push(L())}while(w(","));d("]")}return{kind:"Array",start:e,end:k,values:r}}function L(){switch(u){case"[":return H();case"{":return j();case"String":case"Number":case"Boolean":case"Null":const e=B();return E(),e}d("Value")}function B(){return{kind:u,start:i,end:c,value:JSON.parse(l.slice(i,c))}}function d(e){if(u===e)return void E();let r;if("EOF"===u)r="[end of file]";else if(c-i>1)r="`"+l.slice(i,c)+"`";else{const e=l.slice(i).match(/^.+?\b/);r="`"+(e?e[0]:l[i])+"`"}throw h(`Expected ${e} but found ${r}.`)}class V extends Error{constructor(e,r){super(e),this.position=r}}function h(e){return new V(e,{start:i,end:c})}function w(e){if(u===e)return E(),!0}function s(){return c<N&&(c++,r=c===N?0:l.charCodeAt(c)),r}function E(){for(k=c;9===r||10===r||13===r||32===r;)s();if(0!==r){switch(i=c,r){case 34:return u="String",J();case 45:case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:return u="Number",U();case 102:if("false"!==l.slice(i,i+5))break;return c+=4,s(),void(u="Boolean");case 110:if("null"!==l.slice(i,i+4))break;return c+=3,s(),void(u="Null");case 116:if("true"!==l.slice(i,i+4))break;return c+=3,s(),void(u="Boolean")}u=l[i],s()}else u="EOF"}function J(){for(s();34!==r&&r>31;)if(92===r)switch(r=s(),r){case 34:case 47:case 92:case 98:case 102:case 110:case 114:case 116:s();break;case 117:s(),g(),g(),g(),g();break;default:throw h("Bad character escape sequence.")}else{if(c===N)throw h("Unterminated string.");s()}if(34!==r)throw h("Unterminated string.");s()}function g(){if(r>=48&&r<=57||r>=65&&r<=70||r>=97&&r<=102)return s();throw h("Expected hexadecimal digit.")}function U(){45===r&&s(),48===r?s():y(),46===r&&(s(),y()),(69===r||101===r)&&(r=s(),(43===r||45===r)&&s(),y())}function y(){if(r<48||r>57)throw h("Expected decimal digit.");do{s()}while(r>=48&&r<=57)}function _(e,r,n){var t;const i=[];for(const s of n.members)if(s){const n=null===(t=s.key)||void 0===t?void 0:t.value,a=r[n];if(a)for(const[r,n]of b(a,s.value))i.push(O(e,r,n));else i.push(O(e,s.key,`Variable "$${n}" does not appear in any GraphQL query.`))}return i}function b(e,r){if(!e||!r)return[];if(e instanceof $)return"Null"===r.kind?[[r,`Type "${e}" is non-nullable and cannot be null.`]]:b(e.ofType,r);if("Null"===r.kind)return[];if(e instanceof I){const n=e.ofType;if("Array"===r.kind){return F(r.values||[],(e=>b(n,e)))}return b(n,r)}if(e instanceof q){if("Object"!==r.kind)return[[r,`Type "${e}" must be an Object.`]];const n=Object.create(null),t=F(r.members,(r=>{var t;const i=null===(t=r?.key)||void 0===t?void 0:t.value;n[i]=!0;const s=e.getFields()[i];if(!s)return[[r.key,`Type "${e}" does not have a field "${i}".`]];return b(s?s.type:void 0,r.value)}));for(const i of Object.keys(e.getFields())){const s=e.getFields()[i];!n[i]&&s.type instanceof $&&!s.defaultValue&&t.push([r,`Object of type "${e}" is missing required field "${i}".`])}return t}return"Boolean"===e.name&&"Boolean"!==r.kind||"String"===e.name&&"String"!==r.kind||"ID"===e.name&&"Number"!==r.kind&&"String"!==r.kind||"Float"===e.name&&"Number"!==r.kind||"Int"===e.name&&("Number"!==r.kind||(0|r.value)!==r.value)||(e instanceof v||e instanceof C)&&("String"!==r.kind&&"Number"!==r.kind&&"Boolean"!==r.kind&&"Null"!==r.kind||P(e.parseValue(r.value)))?[[r,`Expected value of type "${e}".`]]:[]}function O(e,r,n){return{message:n,severity:"error",type:"validation",from:e.posFromIndex(r.start),to:e.posFromIndex(r.end)}}function P(e){return null==e||e!=e}function F(e,r){return Array.prototype.concat.apply([],e.map(r))}Q.registerHelper("lint","graphql-variables",((e,r,n)=>{if(!e)return[];let t;try{t=M(e)}catch(e){if(e instanceof V)return[O(n,e.position,e.message)];throw e}const{variableToType:i}=r;return i?_(n,i,t):[]}));