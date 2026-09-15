/*! Copyright 2026 Adobe
All Rights Reserved. */
import{ae as y,a as s}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const{expect:t}=__STORYBOOK_MODULE_TEST__,x={title:"Components/Tag",component:y,parameters:{layout:"centered",a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}},docs:{description:{component:"Use Tag components to display the message text inside."}}},args:{label:"Your Message",children:""},argTypes:{label:{control:"text",description:"Allows to enter custom text (ignored if `children` is set)."},children:{control:"text",description:"Overrides the label if provided. Accepts HTML or JSX."}}},l={render:e=>s(y,{...e,children:e.children&&typeof e.children=="string"?s("span",{dangerouslySetInnerHTML:{__html:e.children}}):void 0})},n={...l,args:{label:"Custom Message"},play:async()=>{const e=document.querySelector(".dropin-tag-container"),a=e.querySelector(".dropin-tag-container__label");await t(e).toBeVisible(),await t(a).toHaveTextContent("Custom Message")}},o={...l,args:{label:"SHIPPING"},play:async()=>{const e=document.querySelector(".dropin-tag-container"),a=e.querySelector(".dropin-tag-container__label");await t(e).toBeVisible(),await t(a).toHaveTextContent("SHIPPING")}},r={...l,args:{label:"",children:'CHILDREN TEXT &nbsp;<button aria-label="Close tag">X</button>'},play:async()=>{const e=document.querySelector(".dropin-tag-container"),a=e.querySelector("button");await t(e).toBeVisible(),await t(e).toHaveTextContent("CHILDREN TEXT"),await t(a).toBeVisible()}};var c,i,p;n.parameters={...n.parameters,docs:{...(c=n.parameters)==null?void 0:c.docs,source:{originalSource:`{
  ...Template,
  args: {
    label: 'Custom Message'
  },
  play: async () => {
    const tagElement = document.querySelector('.dropin-tag-container') as HTMLElement;
    const label = tagElement.querySelector('.dropin-tag-container__label');
    await expect(tagElement).toBeVisible();
    await expect(label).toHaveTextContent('Custom Message');
  }
}`,...(p=(i=n.parameters)==null?void 0:i.docs)==null?void 0:p.source}}};var d,m,u;o.parameters={...o.parameters,docs:{...(d=o.parameters)==null?void 0:d.docs,source:{originalSource:`{
  ...Template,
  args: {
    label: 'SHIPPING'
  },
  play: async () => {
    const tagElement = document.querySelector('.dropin-tag-container') as HTMLElement;
    const label = tagElement.querySelector('.dropin-tag-container__label');
    await expect(tagElement).toBeVisible();
    await expect(label).toHaveTextContent('SHIPPING');
  }
}`,...(u=(m=o.parameters)==null?void 0:m.docs)==null?void 0:u.source}}};var g,b,T;r.parameters={...r.parameters,docs:{...(g=r.parameters)==null?void 0:g.docs,source:{originalSource:`{
  ...Template,
  args: {
    label: '',
    children: 'CHILDREN TEXT &nbsp;<button aria-label="Close tag">X</button>'
  },
  play: async () => {
    const tagElement = document.querySelector('.dropin-tag-container') as HTMLElement;
    const actionButton = tagElement.querySelector('button');
    await expect(tagElement).toBeVisible();
    await expect(tagElement).toHaveTextContent('CHILDREN TEXT');
    await expect(actionButton).toBeVisible();
  }
}`,...(T=(b=r.parameters)==null?void 0:b.docs)==null?void 0:T.source}}};const C=["Default","WithUppercase","WithChildren"];export{n as Default,r as WithChildren,o as WithUppercase,C as __namedExportsOrder,x as default};
//# sourceMappingURL=Tag.stories-BtL30DoA.js.map
