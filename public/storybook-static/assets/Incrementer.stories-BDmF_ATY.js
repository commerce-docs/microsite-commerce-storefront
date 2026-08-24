/*! Copyright 2026 Adobe
All Rights Reserved. */
import{c as V}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const{action:c}=__STORYBOOK_MODULE_ACTIONS__,{expect:a,userEvent:e,within:f}=__STORYBOOK_MODULE_TEST__,g={title:"Components/Incrementer",component:V,argTypes:{name:{description:"Field name (used for mapping the value in a form)",type:{required:!1,name:"string"}},value:{description:"Field value",type:"string"},size:{description:"medium | large",defaultValue:{summary:"medium"},options:["medium","large"],control:{type:"radio"},type:"string"},min:{description:"Minimum value",type:"number"},max:{description:"Maximum value",type:"number"},disabled:{description:"Whether or not the field is disabled",control:"boolean",defaultValue:!1},"aria-label":{description:"Aria label",type:"string"},onValue:{description:"Callback function to handle value change",type:"function"},onUpdateError:{description:"Callback function to handle error",type:"function"},error:{description:"Whether or not the field shows an error",type:"boolean"},success:{description:"Whether or not the field value has been updated successfully",type:"boolean"},maxLength:{description:"Maximum length of the input field",type:"number"},showButtons:{description:"Show increase/decrease buttons",control:"boolean"}},parameters:{docs:{description:{component:"Use Incrementer to let users increase or decrease a value."}}}},o={args:{size:"medium",onValue:c("onValue"),name:"incrementerField",value:"1",min:1,max:100,disabled:!1,"aria-label":"Quantity"},play:async()=>{const u=document.querySelector("#storybook-root"),t=f(u),r=document.querySelector('button[aria-label="Decrease Quantity"]'),n=document.querySelector("input"),i=document.querySelector('button[aria-label="Increase Quantity"]');await new Promise(T=>setTimeout(T,500)),await e.click(i),await a(await t.findByDisplayValue("2")).toBeTruthy(),await e.click(r),await a(await t.findByDisplayValue("1")).toBeTruthy(),await e.clear(n),await e.type(n,"99"),await a(await t.findByDisplayValue("99")).toBeTruthy(),await e.click(i),await a(await t.findByDisplayValue("100")).toBeTruthy(),await e.click(i),await a(await t.findByDisplayValue("100")).toBeTruthy(),await e.click(r),await a(await t.findByDisplayValue("99")).toBeTruthy(),await e.clear(n),await e.type(n,"1"),await a(await t.findByDisplayValue("1")).toBeTruthy()}},s={args:{size:"medium",onValue:c("onValue"),onBlur:c("onBlur"),name:"incrementerField",value:"1001",min:1,max:100,disabled:!1,"aria-label":"Quantity"},play:async()=>{const u=document.querySelector("#storybook-root"),t=f(u),r=document.querySelector('button[aria-label="Increase Quantity"]');await new Promise(i=>setTimeout(i,500)),await e.click(r),await a(await t.findByDisplayValue("1001")).toBeTruthy();const n=document.querySelector(".dropin-incrementer__content--error-message");await a(n).toBeVisible(),await a(n).toHaveTextContent("Maximum quantity is 100")}},l={args:{size:"medium",onValue:c("onValue"),name:"incrementerField",value:"1",min:1,max:100,disabled:!1,"aria-label":"Quantity",showButtons:!1}};var m,d,y;o.parameters={...o.parameters,docs:{...(m=o.parameters)==null?void 0:m.docs,source:{originalSource:`{
  args: {
    size: 'medium',
    onValue: action('onValue'),
    name: 'incrementerField',
    value: '1',
    min: 1,
    max: 100,
    disabled: false,
    'aria-label': 'Quantity'
  },
  play: async () => {
    const canvasElement = document.querySelector('#storybook-root') as HTMLElement;
    const canvas = within(canvasElement);
    const decreaseButton = document.querySelector('button[aria-label="Decrease Quantity"]') as HTMLElement;
    const inputField = document.querySelector('input') as HTMLElement;
    const increaseButton = document.querySelector('button[aria-label="Increase Quantity"]') as HTMLElement;

    // Without this wait test failing intermittently as click event is triggering before even element fully loaded
    await new Promise(resolve => setTimeout(resolve, 500));
    await userEvent.click(increaseButton);
    await expect(await canvas.findByDisplayValue('2')).toBeTruthy();
    await userEvent.click(decreaseButton);
    await expect(await canvas.findByDisplayValue('1')).toBeTruthy();
    await userEvent.clear(inputField);
    await userEvent.type(inputField, '99');
    await expect(await canvas.findByDisplayValue('99')).toBeTruthy();
    await userEvent.click(increaseButton);
    await expect(await canvas.findByDisplayValue('100')).toBeTruthy();
    await userEvent.click(increaseButton);
    await expect(await canvas.findByDisplayValue('100')).toBeTruthy();
    await userEvent.click(decreaseButton);
    await expect(await canvas.findByDisplayValue('99')).toBeTruthy();
    await userEvent.clear(inputField);
    await userEvent.type(inputField, '1');
    await expect(await canvas.findByDisplayValue('1')).toBeTruthy();
  }
}`,...(y=(d=o.parameters)==null?void 0:d.docs)==null?void 0:y.source}}};var p,w,B;s.parameters={...s.parameters,docs:{...(p=s.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    size: 'medium',
    onValue: action('onValue'),
    onBlur: action('onBlur'),
    name: 'incrementerField',
    value: '1001',
    min: 1,
    max: 100,
    disabled: false,
    'aria-label': 'Quantity'
  },
  play: async () => {
    const canvasElement = document.querySelector('#storybook-root') as HTMLElement;
    const canvas = within(canvasElement);
    const increaseButton = document.querySelector('button[aria-label="Increase Quantity"]') as HTMLElement;
    await new Promise(resolve => setTimeout(resolve, 500));
    await userEvent.click(increaseButton);
    await expect(await canvas.findByDisplayValue('1001')).toBeTruthy();
    const error = document.querySelector('.dropin-incrementer__content--error-message') as HTMLElement;
    await expect(error).toBeVisible();
    await expect(error).toHaveTextContent('Maximum quantity is 100');
  }
}`,...(B=(w=s.parameters)==null?void 0:w.docs)==null?void 0:B.source}}};var v,h,b;l.parameters={...l.parameters,docs:{...(v=l.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    size: 'medium',
    onValue: action('onValue'),
    name: 'incrementerField',
    value: '1',
    min: 1,
    max: 100,
    disabled: false,
    'aria-label': 'Quantity',
    showButtons: false
  }
}`,...(b=(h=l.parameters)==null?void 0:h.docs)==null?void 0:b.source}}};const S=["Primary","WithError","WithoutButtons"];export{o as Primary,s as WithError,l as WithoutButtons,S as __namedExportsOrder,g as default};
//# sourceMappingURL=Incrementer.stories-BDmF_ATY.js.map
