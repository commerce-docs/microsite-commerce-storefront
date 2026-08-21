/*! Copyright 2026 Adobe
All Rights Reserved. */
import{aa as B}from"./iframe-BXfH8Ezb.js";import{I as s}from"./Icon.stories.helpers-CaF-J1Nd.js";import"./preload-helper-C1FmrZbK.js";const{expect:r,userEvent:v,within:h}=__STORYBOOK_MODULE_TEST__,S={title:"Components/RadioButton",component:B,argTypes:{label:{description:"Label to be shown beside of the radio button",type:{required:!0,name:"string"}},name:{description:"Field name (used for mapping the value in a form)",type:{required:!0,name:"string"}},value:{description:"Field value",type:{required:!0,name:"string"}},description:{description:"Additional secondary description if needed",type:{required:!1,name:"string"}},disabled:{description:"Whether or not the radio button is disabled",type:{required:!1,name:"boolean"}},error:{description:"Whether or not the radio button is in error state",type:{required:!1,name:"boolean"}},size:{description:"Available sizes for the checkbox label and description texts",type:"string",options:["medium","large"],defaultValue:{summary:"medium"},control:{type:"radio",default:"medium"}},checked:{description:"Whether or not the radio button is checked",type:{required:!1,name:"boolean"}},busy:{description:"Whether or not the radio button is busy",type:{required:!1,name:"boolean"}},icon:{description:"Optional icon to display before the label (SVG or img element)",options:Object.keys(s),mapping:s,control:{type:"select"}}},parameters:{docs:{description:{component:"Use Radio Buttons to let users select one option from a set of mutually exclusive choices."}}}},n={name:"Radio button",args:{name:"standard",label:"Standard",value:"standard",description:"Description",size:"medium",disabled:!1,error:!1},play:async({canvasElement:o})=>{const a=h(o),i=await a.findByRole("radio"),e=await a.findByText("Standard");await r(i).not.toBeChecked(),await v.click(e),await r(i).toBeChecked()}},t={name:"Radio button with icon",args:{name:"shipping",label:"Free Shipping",value:"free-shipping",description:"Delivery in 5-7 business days",size:"medium",disabled:!1,error:!1,icon:"Delivery"},play:async({canvasElement:o})=>{const e=(await h(o).findByRole("radio")).closest(".dropin-radio-button"),f=e==null?void 0:e.querySelector(".dropin-radio-button__icon");await r(f).toBeInTheDocument()}};var d,c,l,p,u;n.parameters={...n.parameters,docs:{...(d=n.parameters)==null?void 0:d.docs,source:{originalSource:`{
  name: 'Radio button',
  args: {
    name: 'standard',
    label: 'Standard',
    value: 'standard',
    description: 'Description',
    size: 'medium',
    disabled: false,
    error: false
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const radioButton = await canvas.findByRole('radio');
    const radioButtonText = await canvas.findByText('Standard');
    await expect(radioButton).not.toBeChecked();
    await userEvent.click(radioButtonText);
    await expect(radioButton).toBeChecked();
  }
}`,...(l=(c=n.parameters)==null?void 0:c.docs)==null?void 0:l.source},description:{story:"```ts\nimport { RadioButton } from '@adobe-commerce/elsie/components/RadioButton';\n```",...(u=(p=n.parameters)==null?void 0:p.docs)==null?void 0:u.description}}};var m,y,b;t.parameters={...t.parameters,docs:{...(m=t.parameters)==null?void 0:m.docs,source:{originalSource:`{
  name: 'Radio button with icon',
  args: {
    name: 'shipping',
    label: 'Free Shipping',
    value: 'free-shipping',
    description: 'Delivery in 5-7 business days',
    size: 'medium',
    disabled: false,
    error: false,
    // @ts-ignore - icon is mapped from IconsList
    icon: 'Delivery'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const radioButton = await canvas.findByRole('radio');
    const radioButtonContainer = radioButton.closest('.dropin-radio-button');
    const icon = radioButtonContainer?.querySelector('.dropin-radio-button__icon');
    await expect(icon).toBeInTheDocument();
  }
}`,...(b=(y=t.parameters)==null?void 0:y.docs)==null?void 0:b.source}}};const x=["RadioButtonStory","RadioButtonWithIcon"];export{n as RadioButtonStory,t as RadioButtonWithIcon,x as __namedExportsOrder,S as default};
//# sourceMappingURL=RadioButton.stories-Ch8f4zkP.js.map
