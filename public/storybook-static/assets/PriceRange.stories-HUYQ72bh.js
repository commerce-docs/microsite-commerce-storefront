/*! Copyright 2026 Adobe
All Rights Reserved. */
import{a7 as _}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const W={title:"Components/PriceRange",component:_,argTypes:{currency:{description:"Currency of price",control:"select",options:["USD","EUR"]},locale:{description:"Locale of price",control:"select",options:["en-US","fr-FR"]},amount:{description:"Price of a simple product",control:"number"},variant:{description:"Price display variant",control:"select",options:["default","strikethrough"]},minimumAmount:{description:"Minimum price of a product price range",control:"number"},maximumAmount:{description:"Maximum price of a product price range",control:"number"},size:{description:"Size of price",control:"select",options:["small","medium","large"]},display:{description:"Price range display option",control:"select",options:["dash","from to","as low as"]},specialPrice:{description:"Special price of a product",control:"select",options:[void 0,9.99]},sale:{description:"Whether or not to display contrast color for special sale price",control:"boolean"}},parameters:{docs:{description:{component:"Use PriceRanges to display price range.\n\nImport the component like this:\n\n```tsx\nimport { PriceRange } from '@adobe-commerce/elsie/components/PriceRange';\n```"}}}},e={args:{currency:"USD",amount:36,size:"small",variant:"default",sale:!1}},n={args:{currency:"USD",minimumAmount:56,maximumAmount:58,size:"small",display:"dash",sale:!1}},s={args:{currency:"USD",minimumAmount:56,maximumAmount:58,size:"small",display:"from to",sale:!1}},r={args:{currency:"USD",minimumAmount:56,maximumAmount:58,size:"small",display:"as low as",sale:!1}},a={args:{currency:"USD",minimumAmount:56,maximumAmount:58,size:"small",display:"dash",sale:!1,specialPrice:9.99}},i={args:{currency:"USD",minimumAmount:56,maximumAmount:58,size:"small",display:"dash",sale:!0,specialPrice:9.99}};var o,m,c,t,l;e.parameters={...e.parameters,docs:{...(o=e.parameters)==null?void 0:o.docs,source:{originalSource:`{
  args: {
    currency: 'USD',
    amount: 36.0,
    size: 'small',
    variant: 'default',
    sale: false
  }
}`,...(c=(m=e.parameters)==null?void 0:m.docs)==null?void 0:c.source},description:{story:`Use the component like this to get a price for a simple product:

\`\`\`tsx
<PriceRange
   currency: 'USD',
   amount: 36.0,
   size: 'small',
   variant: 'default',
   sale: false,
/>
\`\`\``,...(l=(t=e.parameters)==null?void 0:t.docs)==null?void 0:l.description}}};var p,u,d,g,y;n.parameters={...n.parameters,docs:{...(p=n.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    currency: 'USD',
    minimumAmount: 56.0,
    maximumAmount: 58.0,
    size: 'small',
    display: 'dash',
    sale: false
  }
}`,...(d=(u=n.parameters)==null?void 0:u.docs)==null?void 0:d.source},description:{story:`Use the component like this to get a simple PriceRange:

\`\`\`tsx
<PriceRange
   currency: 'USD',
   minimumAmount: 56.0,
   maximumAmount: 58.0,
   size: 'small',
   display: 'dash',
   sale: false,
/>
\`\`\``,...(y=(g=n.parameters)==null?void 0:g.docs)==null?void 0:y.description}}};var P,f,A,h,S;s.parameters={...s.parameters,docs:{...(P=s.parameters)==null?void 0:P.docs,source:{originalSource:`{
  args: {
    currency: 'USD',
    minimumAmount: 56.0,
    maximumAmount: 58.0,
    size: 'small',
    display: 'from to',
    sale: false
  }
}`,...(A=(f=s.parameters)==null?void 0:f.docs)==null?void 0:A.source},description:{story:`Use the component like this to get a from / to PriceRange:

\`\`\`tsx
<PriceRange
   currency: 'USD',
   minimumAmount: 56.0,
   maximumAmount: 58.0,
   size: 'small',
   display: 'from to',
   sale: false,
/>
\`\`\``,...(S=(h=s.parameters)==null?void 0:h.docs)==null?void 0:S.description}}};var R,U,x,D,z;r.parameters={...r.parameters,docs:{...(R=r.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    currency: 'USD',
    minimumAmount: 56.0,
    maximumAmount: 58.0,
    size: 'small',
    display: 'as low as',
    sale: false
  }
}`,...(x=(U=r.parameters)==null?void 0:U.docs)==null?void 0:x.source},description:{story:`Use the component like this to get a as low as PriceRange:

\`\`\`tsx
<PriceRange
   currency: 'USD',
   minimumAmount: 56.0,
   maximumAmount: 58.0,
   size: 'small',
   display: 'as low as',
   sale: false,
/>
\`\`\``,...(z=(D=r.parameters)==null?void 0:D.docs)==null?void 0:z.description}}};var w,k,v,b,C;a.parameters={...a.parameters,docs:{...(w=a.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    currency: 'USD',
    minimumAmount: 56.0,
    maximumAmount: 58.0,
    size: 'small',
    display: 'dash',
    sale: false,
    specialPrice: 9.99
  }
}`,...(v=(k=a.parameters)==null?void 0:k.docs)==null?void 0:v.source},description:{story:`Use the component like this to get a simple PriceRange with special price:

\`\`\`tsx
<PriceRange
   currency: 'USD',
   minimumAmount: 56.0,
   maximumAmount: 58.0,
   size: 'small',
   display: 'dash',
   sale: false,
   specialPrice: 9.99,
/>
\`\`\``,...(C=(b=a.parameters)==null?void 0:b.docs)==null?void 0:C.description}}};var F,L,T,E,M;i.parameters={...i.parameters,docs:{...(F=i.parameters)==null?void 0:F.docs,source:{originalSource:`{
  args: {
    currency: 'USD',
    minimumAmount: 56.0,
    maximumAmount: 58.0,
    size: 'small',
    display: 'dash',
    sale: true,
    specialPrice: 9.99
  }
}`,...(T=(L=i.parameters)==null?void 0:L.docs)==null?void 0:T.source},description:{story:`Use the component like this to get a simple PriceRange with high contrast special price:

\`\`\`tsx
<PriceRange
   currency: 'USD',
   minimumAmount: 56.0,
   maximumAmount: 58.0,
   size: 'small',
   display: 'dash',
   sale: true,
   specialPrice: 9.99,
/>
\`\`\``,...(M=(E=i.parameters)==null?void 0:E.docs)==null?void 0:M.description}}};const j=["SimplePrice","PriceRangeDash","PriceRangeFromTo","PriceRangeAsLowAs","PriceRangeSpecialPrice","PriceRangeSpecialPriceContrast"];export{r as PriceRangeAsLowAs,n as PriceRangeDash,s as PriceRangeFromTo,a as PriceRangeSpecialPrice,i as PriceRangeSpecialPriceContrast,e as SimplePrice,j as __namedExportsOrder,W as default};
//# sourceMappingURL=PriceRange.stories-HUYQ72bh.js.map
