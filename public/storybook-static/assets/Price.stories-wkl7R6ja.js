/*! Copyright 2026 Adobe
All Rights Reserved. */
import{p as r,a}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const{expect:h,within:x}=__STORYBOOK_MODULE_TEST__,S={title:"Components/Price",component:r,argTypes:{currency:{control:"select",options:["USD","EUR"]},locale:{control:"select",options:["en-US","fr-FR"]},variant:{description:"Font variant",defaultValue:"default",control:"select",options:["default","strikethrough"]},size:{control:"select",options:["small","medium","large"]},weight:{description:"Font weight",defaultValue:"bold",control:"select",options:["bold","normal"]},formatOptions:{control:{type:"object"},defaultValue:{minimumFractionDigits:2,maximumFractionDigits:2}},amount:{description:"Price amount",type:{name:"number"}},sale:{description:"Indicates a sale price",control:"boolean"}},parameters:{docs:{description:{component:"Use Price components to display the cost of an item or service."}}}},t={args:{amount:9.99,sale:!1,size:"small"},play:async({canvasElement:e})=>{const y=x(e);await h(await y.findByText("$9.99")).toBeVisible()}},s={args:{size:"small"},render:e=>a("div",{style:"display: flex; flex-wrap:wrap; gap: 5px",children:[a(r,{...e,amount:59.99,variant:"strikethrough"}),a(r,{...e,amount:55.99,variant:"default"})]})},o={args:{size:"small"},render:e=>a("div",{style:"display: flex; flex-wrap:wrap; gap: 5px",children:[a(r,{...e,amount:59.99,variant:"strikethrough"}),a(r,{...e,amount:55.99,variant:"default",sale:!0})]})};var i,n,l,c,p;t.parameters={...t.parameters,docs:{...(i=t.parameters)==null?void 0:i.docs,source:{originalSource:`{
  args: {
    amount: 9.99,
    sale: false,
    size: 'small'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText('$9.99')).toBeVisible();
  }
}`,...(l=(n=t.parameters)==null?void 0:n.docs)==null?void 0:l.source},description:{story:"```ts\nimport { Price } from '@adobe-commerce/elsie/components/Price';\n```",...(p=(c=t.parameters)==null?void 0:c.docs)==null?void 0:p.description}}};var m,d,u;s.parameters={...s.parameters,docs:{...(m=s.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    size: 'small'
  },
  render: args => <div style="display: flex; flex-wrap:wrap; gap: 5px">
      <Price {...args} amount={59.99} variant={'strikethrough'} />
      <Price {...args} amount={55.99} variant={'default'} />
    </div>
}`,...(u=(d=s.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var g,f,v;o.parameters={...o.parameters,docs:{...(g=o.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    size: 'small'
  },
  render: args => <div style="display: flex; flex-wrap:wrap; gap: 5px">
      <Price {...args} amount={59.99} variant={'strikethrough'} />
      <Price {...args} amount={55.99} variant={'default'} sale />
    </div>
}`,...(v=(f=o.parameters)==null?void 0:f.docs)==null?void 0:v.source}}};const b=["Primary","SpecialDefault","HighContrast"];export{o as HighContrast,t as Primary,s as SpecialDefault,b as __namedExportsOrder,S as default};
//# sourceMappingURL=Price.stories-wkl7R6ja.js.map
