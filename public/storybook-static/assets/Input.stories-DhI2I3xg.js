/*! Copyright 2026 Adobe
All Rights Reserved. */
import{I as b,a as m,l as f,r as h}from"./iframe-CKgIZA8l.js";import{I as s}from"./Icon.stories.helpers-BjapTuwK.js";import"./preload-helper-C1FmrZbK.js";const{action:T}=__STORYBOOK_MODULE_ACTIONS__,{expect:o,userEvent:i,within:g}=__STORYBOOK_MODULE_TEST__,S={title:"Components/Input",component:b,argTypes:{name:{description:"Field name (used for mapping the value in a form)",type:{required:!1,name:"string"}},value:{description:"Field value",type:"string"},variant:{description:"Button variant: `primary`, or `secondary`",defaultValue:{summary:"primary"},type:"string",options:["primary","secondary"],control:{type:"radio"}},size:{options:["medium","large"],control:{type:"radio"}},placeholder:{description:"placeholder text",control:"text"},floatingLabel:{description:"enable floating label",control:"text"},disabled:{description:"disable input field",control:"boolean"},error:{description:"enable error handling",control:"boolean"},success:{description:"enable success handling",control:"boolean"},icon:{description:"left ornamental icon",options:Object.keys(s),mapping:s,control:{type:"select"}},onValue:{description:"Callback function to handle value change",type:"function"},maxLength:{description:"Maximum length of the input field",type:"number"},onUpdateError:{description:"Callback function to handle error",type:"function"},id:{description:"Field id",type:{required:!1,name:"string"}}},parameters:{docs:{description:{component:"Use Input to let users enter and edit text."}}}},n={args:{name:"inputField",value:"",variant:"primary",size:"medium",floatingLabel:"",placeholder:"Placeholder",disabled:!1,error:!1,success:!1,onValue:T("onValue"),maxLength:20,icon:m(h,{source:f})},play:async({canvasElement:r})=>{const e=g(r),a=document.querySelector("input");await i.type(a,"Storybook Test Text! input max length"),await o(await e.findByDisplayValue("Storybook Test Text!")).toBeTruthy(),await i.clear(a),await o(await e.findByDisplayValue("")).toBeTruthy()}},t={args:{name:"inputField",value:"Storybook Test Text!",variant:"secondary",size:"medium",floatingLabel:"",placeholder:"Placeholder",disabled:!1,error:!1,success:!1,onValue:T("onValue"),maxLength:20,icon:m(h,{source:f})},play:async({canvasElement:r})=>{const e=g(r),a=document.querySelector("input");await i.type(a,"Storybook Test Text! input max length"),await o(await e.findByDisplayValue("Storybook Test Text!")).toBeTruthy(),await i.clear(a),await o(await e.findByDisplayValue("")).toBeTruthy()}};var l,c,u;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    name: 'inputField',
    value: '',
    variant: 'primary',
    size: 'medium',
    floatingLabel: '',
    placeholder: 'Placeholder',
    disabled: false,
    error: false,
    success: false,
    onValue: action('onValue'),
    maxLength: 20,
    icon: <Icon source={Cart} />
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const inputField = document.querySelector('input') as HTMLElement;
    await userEvent.type(inputField, 'Storybook Test Text! input max length');
    await expect(await canvas.findByDisplayValue('Storybook Test Text!')).toBeTruthy();
    await userEvent.clear(inputField);
    await expect(await canvas.findByDisplayValue('')).toBeTruthy();
  }
}`,...(u=(c=n.parameters)==null?void 0:c.docs)==null?void 0:u.source}}};var p,d,y;t.parameters={...t.parameters,docs:{...(p=t.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    name: 'inputField',
    value: 'Storybook Test Text!',
    variant: 'secondary',
    size: 'medium',
    floatingLabel: '',
    placeholder: 'Placeholder',
    disabled: false,
    error: false,
    success: false,
    onValue: action('onValue'),
    maxLength: 20,
    icon: <Icon source={Cart} />
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const inputField = document.querySelector('input') as HTMLElement;
    await userEvent.type(inputField, 'Storybook Test Text! input max length');
    await expect(await canvas.findByDisplayValue('Storybook Test Text!')).toBeTruthy();
    await userEvent.clear(inputField);
    await expect(await canvas.findByDisplayValue('')).toBeTruthy();
  }
}`,...(y=(d=t.parameters)==null?void 0:d.docs)==null?void 0:y.source}}};const B=["Primary","Secondary"];export{n as Primary,t as Secondary,B as __namedExportsOrder,S as default};
//# sourceMappingURL=Input.stories-DhI2I3xg.js.map
