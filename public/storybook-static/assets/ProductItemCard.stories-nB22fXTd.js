/*! Copyright 2026 Adobe
All Rights Reserved. */
import{a5 as se,a as e,r as ie,l as ne,B as p,N as t,p as d,k as m,q as le}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const de={title:"Components/ProductItemCard",component:se,argTypes:{image:{control:{type:"select",labels:{DefaultImage:"Default Image",Empty:"No Image"}},description:"Product image node.",options:["DefaultImage","Empty"],mapping:{DefaultImage:e(le,{src:"https://picsum.photos/300/375",width:"300",height:"375",alt:"Product Image",loading:"lazy"}),Empty:null},table:{defaultValue:{summary:"null"}}},titleNode:{control:{type:"select",labels:{DefaultTitle:"Default Title",LongTitle:"Long Title",Empty:"No Title"}},description:"Product title node.",options:["DefaultTitle","LongTitle","Empty"],mapping:{DefaultTitle:e("div",{children:"Hollister Backyard Sweatshirt"}),LongTitle:e("div",{children:"Hollister Backyard Sweatshirt with Extra Long Product Name That Might Wrap"}),Empty:null}},price:{control:{type:"select",labels:{DefaultPrice:"Default Price",SalePrice:"Sale Price",Empty:"No Price"}},description:"Product price node.",options:["DefaultPrice","SalePrice","Empty"],mapping:{DefaultPrice:e(m,{children:e(d,{amount:49.99})}),SalePrice:e(m,{children:[e(d,{amount:69.99,variant:"strikethrough"}),e(d,{amount:49.99,sale:!0})]}),Empty:null}},sku:{control:{type:"select",labels:{DefaultSku:"Default SKU",Empty:"No SKU"}},description:"Product SKU node.",options:["DefaultSku","Empty"],mapping:{DefaultSku:e("div",{children:"SKU: 123456789"}),Empty:null}},swatches:{control:{type:"select",labels:{DefaultSwatches:"Default Swatches",SelectedSwatches:"Selected Swatches",OutOfStockSwatches:"Out of Stock Swatches",Empty:"No Swatches"}},description:"Product swatches node.",options:["DefaultSwatches","SelectedSwatches","OutOfStockSwatches","Empty"],mapping:{DefaultSwatches:e("div",{style:{display:"flex",gap:"8px"},children:[e(t,{color:"red",label:"Red",groupAriaLabel:"Color options",value:"red"}),e(t,{color:"blue",label:"Blue",groupAriaLabel:"Color options",value:"blue"}),e(t,{color:"green",label:"Green",groupAriaLabel:"Color options",value:"green"})]}),SelectedSwatches:e("div",{style:{display:"flex",gap:"8px"},children:[e(t,{color:"red",label:"Red",groupAriaLabel:"Color options",value:"red",selected:!0}),e(t,{color:"blue",label:"Blue",groupAriaLabel:"Color options",value:"blue"}),e(t,{color:"green",label:"Green",groupAriaLabel:"Color options",value:"green"})]}),OutOfStockSwatches:e("div",{style:{display:"flex",gap:"8px"},children:[e(t,{color:"red",label:"Red",groupAriaLabel:"Color options",value:"red",outOfStock:!0}),e(t,{color:"blue",label:"Blue",groupAriaLabel:"Color options",value:"blue"}),e(t,{color:"green",label:"Green",groupAriaLabel:"Color options",value:"green"})]}),Empty:null},table:{defaultValue:{summary:"null"}}},actionButton:{control:{type:"select",labels:{DefaultButton:"Default Button",CustomButton:"Custom Button",Empty:"No Button"}},description:"Action button node.",options:["DefaultButton","CustomButton","Empty"],mapping:{DefaultButton:e(p,{children:"Select Options"}),CustomButton:e(p,{icon:e(ie,{source:ne,size:"24"}),variant:"primary",children:"Add to Cart"}),Empty:null},table:{defaultValue:{summary:"null"}}}},parameters:{docs:{description:{component:"Use ProductItemCard to display product recommendations with image, title, price, SKU, and action button."}}}},a={args:{initialized:!0,image:"DefaultImage",titleNode:"DefaultTitle",price:"DefaultPrice",sku:"DefaultSku",swatches:"DefaultSwatches",actionButton:"DefaultButton"}},o={args:{initialized:!0,image:"DefaultImage",titleNode:"LongTitle",price:"DefaultPrice",sku:"DefaultSku",swatches:"DefaultSwatches",actionButton:"DefaultButton"}},r={args:{initialized:!0,image:"DefaultImage",titleNode:"DefaultTitle",price:"SalePrice",sku:"DefaultSku",swatches:"DefaultSwatches",actionButton:"DefaultButton"}},s={args:{initialized:!0,image:"DefaultImage",titleNode:"DefaultTitle",price:"DefaultPrice",sku:"DefaultSku",swatches:"DefaultSwatches",actionButton:"Empty"}},i={args:{initialized:!0,image:"Empty",titleNode:"DefaultTitle",price:"DefaultPrice",sku:"DefaultSku",swatches:"DefaultSwatches",actionButton:"DefaultButton"}},n={args:{initialized:!0,image:"DefaultImage",titleNode:"DefaultTitle",price:"Empty",sku:"Empty",swatches:"Empty",actionButton:"Empty"}},l={args:{initialized:!0,image:"DefaultImage",titleNode:"DefaultTitle",price:"DefaultPrice",sku:"DefaultSku",swatches:"SelectedSwatches",actionButton:"DefaultButton"}},u={args:{initialized:!0,image:"DefaultImage",titleNode:"DefaultTitle",price:"DefaultPrice",sku:"DefaultSku",swatches:"OutOfStockSwatches",actionButton:"DefaultButton"}},c={args:{initialized:!1}};var f,g,y,D,S;a.parameters={...a.parameters,docs:{...(f=a.parameters)==null?void 0:f.docs,source:{originalSource:`{
  args: {
    initialized: true,
    image: 'DefaultImage' as any,
    titleNode: 'DefaultTitle' as any,
    price: 'DefaultPrice' as any,
    sku: 'DefaultSku' as any,
    swatches: 'DefaultSwatches' as any,
    actionButton: 'DefaultButton' as any
  }
}`,...(y=(g=a.parameters)==null?void 0:g.docs)==null?void 0:y.source},description:{story:"Default ProductItemCard with all elements",...(S=(D=a.parameters)==null?void 0:D.docs)==null?void 0:S.description}}};var h,w,k,B,P;o.parameters={...o.parameters,docs:{...(h=o.parameters)==null?void 0:h.docs,source:{originalSource:`{
  args: {
    initialized: true,
    image: 'DefaultImage' as any,
    titleNode: 'LongTitle' as any,
    price: 'DefaultPrice' as any,
    sku: 'DefaultSku' as any,
    swatches: 'DefaultSwatches' as any,
    actionButton: 'DefaultButton' as any
  }
}`,...(k=(w=o.parameters)==null?void 0:w.docs)==null?void 0:k.source},description:{story:"ProductItemCard with long title",...(P=(B=o.parameters)==null?void 0:B.docs)==null?void 0:P.description}}};var b,I,E,C,N;r.parameters={...r.parameters,docs:{...(b=r.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    initialized: true,
    image: 'DefaultImage' as any,
    titleNode: 'DefaultTitle' as any,
    price: 'SalePrice' as any,
    sku: 'DefaultSku' as any,
    swatches: 'DefaultSwatches' as any,
    actionButton: 'DefaultButton' as any
  }
}`,...(E=(I=r.parameters)==null?void 0:I.docs)==null?void 0:E.source},description:{story:"ProductItemCard with sale price",...(N=(C=r.parameters)==null?void 0:C.docs)==null?void 0:N.description}}};var T,z,v,L,O;s.parameters={...s.parameters,docs:{...(T=s.parameters)==null?void 0:T.docs,source:{originalSource:`{
  args: {
    initialized: true,
    image: 'DefaultImage' as any,
    titleNode: 'DefaultTitle' as any,
    price: 'DefaultPrice' as any,
    sku: 'DefaultSku' as any,
    swatches: 'DefaultSwatches' as any,
    actionButton: 'Empty' as any
  }
}`,...(v=(z=s.parameters)==null?void 0:z.docs)==null?void 0:v.source},description:{story:"ProductItemCard without action button",...(O=(L=s.parameters)==null?void 0:L.docs)==null?void 0:O.description}}};var A,x,U,K,G;i.parameters={...i.parameters,docs:{...(A=i.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    initialized: true,
    image: 'Empty' as any,
    titleNode: 'DefaultTitle' as any,
    price: 'DefaultPrice' as any,
    sku: 'DefaultSku' as any,
    swatches: 'DefaultSwatches' as any,
    actionButton: 'DefaultButton' as any
  }
}`,...(U=(x=i.parameters)==null?void 0:x.docs)==null?void 0:U.source},description:{story:"ProductItemCard without image",...(G=(K=i.parameters)==null?void 0:K.docs)==null?void 0:G.description}}};var M,R,V,H,_;n.parameters={...n.parameters,docs:{...(M=n.parameters)==null?void 0:M.docs,source:{originalSource:`{
  args: {
    initialized: true,
    image: 'DefaultImage' as any,
    titleNode: 'DefaultTitle' as any,
    price: 'Empty' as any,
    sku: 'Empty' as any,
    swatches: 'Empty' as any,
    actionButton: 'Empty' as any
  }
}`,...(V=(R=n.parameters)==null?void 0:R.docs)==null?void 0:V.source},description:{story:"ProductItemCard with minimal content",...(_=(H=n.parameters)==null?void 0:H.docs)==null?void 0:_.description}}};var q,W,j,F,J;l.parameters={...l.parameters,docs:{...(q=l.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    initialized: true,
    image: 'DefaultImage' as any,
    titleNode: 'DefaultTitle' as any,
    price: 'DefaultPrice' as any,
    sku: 'DefaultSku' as any,
    swatches: 'SelectedSwatches' as any,
    actionButton: 'DefaultButton' as any
  }
}`,...(j=(W=l.parameters)==null?void 0:W.docs)==null?void 0:j.source},description:{story:"ProductItemCard with selected swatch",...(J=(F=l.parameters)==null?void 0:F.docs)==null?void 0:J.description}}};var Q,X,Y,Z,$;u.parameters={...u.parameters,docs:{...(Q=u.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  args: {
    initialized: true,
    image: 'DefaultImage' as any,
    titleNode: 'DefaultTitle' as any,
    price: 'DefaultPrice' as any,
    sku: 'DefaultSku' as any,
    swatches: 'OutOfStockSwatches' as any,
    actionButton: 'DefaultButton' as any
  }
}`,...(Y=(X=u.parameters)==null?void 0:X.docs)==null?void 0:Y.source},description:{story:"ProductItemCard with out of stock swatch",...($=(Z=u.parameters)==null?void 0:Z.docs)==null?void 0:$.description}}};var ee,te,ae,oe,re;c.parameters={...c.parameters,docs:{...(ee=c.parameters)==null?void 0:ee.docs,source:{originalSource:`{
  args: {
    initialized: false
  }
}`,...(ae=(te=c.parameters)==null?void 0:te.docs)==null?void 0:ae.source},description:{story:"ProductItemCard in skeleton loading state",...(re=(oe=c.parameters)==null?void 0:oe.docs)==null?void 0:re.description}}};const pe=["Default","LongTitle","SalePrice","NoButton","NoImage","Minimal","SelectedSwatch","OutOfStockSwatch","Skeleton"];export{a as Default,o as LongTitle,n as Minimal,s as NoButton,i as NoImage,u as OutOfStockSwatch,r as SalePrice,l as SelectedSwatch,c as Skeleton,pe as __namedExportsOrder,de as default};
//# sourceMappingURL=ProductItemCard.stories-nB22fXTd.js.map
