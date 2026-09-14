/*! Copyright 2026 Adobe
All Rights Reserved. */
import{N as u,a as l}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const{action:o}=__STORYBOOK_MODULE_ACTIONS__,{expect:a,within:h}=__STORYBOOK_MODULE_TEST__,R={title:"Components/ColorSwatch",component:u,argTypes:{name:{description:"Field name (used for mapping the value in a form)",type:{required:!1,name:"string"}},label:{description:"Field label",type:{required:!0,name:"string"}},groupAriaLabel:{description:"Label name for the swatch group",type:{required:!0,name:"string"}},id:{description:"Field id",type:{required:!1,name:"string"}},size:{description:"Size of the color swatch",type:{required:!1,name:"string"},defaultValue:{summary:"medium"},options:["medium","large"],control:{type:"radio"}},color:{description:"Color of the swatch",type:{required:!1,name:"string"}},value:{description:"Field value",type:{required:!1,name:"string"}},disabled:{description:"Whether or not the color swatch is disabled",type:{required:!1,name:"boolean"}},selected:{description:"Whether or not the color swatch is active",type:{required:!1,name:"boolean"}},multi:{description:"Whether or not the color swatch allows multiple selection",type:{required:!1,name:"boolean"}},onUpdateError:{description:"Function to handle errors",type:{required:!1,name:"function"}},outOfStock:{description:"Whether or not the color swatch is out of stock",type:{required:!1,name:"boolean"}},onValue:{description:"Function to handle value changes",type:{required:!1,name:"function"}}},parameters:{docs:{description:{component:"Use Color Swatches to display fills — such as colors, gradients, and textures — that can be applied to an object."}}}},r={args:{name:"colorSwatchField",id:"graySwatch",label:"gray",groupAriaLabel:"Color Swatch",value:"gray",size:"medium",color:"#E8E8E8",selected:!1,disabled:!1,outOfStock:!1,onValue:o("onValue")},play:async({canvasElement:e})=>{const p=await h(e).findByRole("radio"),m=document.querySelector(".dropin-color-swatch__span");a(m).toBeVisible(),await a(p).not.toBeChecked()}},n={args:{name:"colorSwatchField",id:"graySwatch",value:"gray",label:"gray",groupAriaLabel:"Color Swatch",size:"medium",color:"#E8E8E8",selected:!0,disabled:!1,outOfStock:!1,onValue:o("onValue")},play:async({canvasElement:e})=>{const t=h(e),p=await t.findByRole("radio"),m=document.querySelector(".dropin-color-swatch__span");a(m).toBeVisible(),await a(p).toBeChecked(),await a(t.getByLabelText("Color Swatch: gray swatch selected")).toBeChecked()}},c={args:{name:"colorSwatchField",id:"graySwatch",value:"gray",label:"gray",groupAriaLabel:"Color Swatch",size:"medium",color:"#E8E8E8",selected:!1,disabled:!0,outOfStock:!1,onValue:o("onValue")},play:async({canvasElement:e})=>{const t=h(e);await a(await t.findByRole("radio")).toBeDisabled()}},s={args:{name:"colorSwatchField",id:"graySwatch",label:"gray",groupAriaLabel:"Color Swatch",value:"gray",size:"medium",color:"#E8E8E8",selected:!1,disabled:!1,outOfStock:!0,onValue:o("onValue")}},i={args:{name:"colorSwatch_Field",id:"graySwatch",value:"gray",label:"gray",groupAriaLabel:"Color Swatch",size:"medium",color:"#E8E8E8",selected:!0,disabled:!1,outOfStock:!0,onValue:o("onValue")}},d={args:{name:"colorSwatchField",id:"graySwatch",value:"gray",size:"medium",color:"#E8E8E8",selected:!1,disabled:!1,outOfStock:!1,multi:!0,onValue:o("onValue"),"aria-label":"Grey Color Swatch"},render:e=>l("div",{style:"display: flex; flex-wrap:wrap; gap: 25px",children:[l(u,{...e,id:"colorSwatch1",value:"green",color:"green"}),l(u,{...e,id:"colorSwatch2",value:"blue",color:"blue"}),l(u,{...e,id:"colorSwatch3",value:"yellow",color:"yellow"})]})};var w,S,g,y,f;r.parameters={...r.parameters,docs:{...(w=r.parameters)==null?void 0:w.docs,source:{originalSource:`{
  args: {
    name: 'colorSwatchField',
    id: 'graySwatch',
    label: 'gray',
    groupAriaLabel: 'Color Swatch',
    value: 'gray',
    size: 'medium',
    color: '#E8E8E8',
    selected: false,
    disabled: false,
    outOfStock: false,
    onValue: action('onValue')
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const textSwatch = await canvas.findByRole('radio');
    const spanElement = document.querySelector('.dropin-color-swatch__span') as HTMLElement;
    expect(spanElement).toBeVisible();
    await expect(textSwatch).not.toBeChecked();
  }
}`,...(g=(S=r.parameters)==null?void 0:S.docs)==null?void 0:g.source},description:{story:"```ts\nimport { ColorSwatch } from '@adobe-commerce/elsie/components/ColorSwatch';\n```",...(f=(y=r.parameters)==null?void 0:y.docs)==null?void 0:f.description}}};var b,E,v;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    name: 'colorSwatchField',
    id: 'graySwatch',
    value: 'gray',
    label: 'gray',
    groupAriaLabel: 'Color Swatch',
    size: 'medium',
    color: '#E8E8E8',
    selected: true,
    disabled: false,
    outOfStock: false,
    onValue: action('onValue')
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const textSwatch = await canvas.findByRole('radio');
    const spanElement = document.querySelector('.dropin-color-swatch__span') as HTMLElement;
    expect(spanElement).toBeVisible();
    await expect(textSwatch).toBeChecked();
    await expect(canvas.getByLabelText('Color Swatch: gray swatch selected')).toBeChecked();
  }
}`,...(v=(E=n.parameters)==null?void 0:E.docs)==null?void 0:v.source}}};var C,O,V;c.parameters={...c.parameters,docs:{...(C=c.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    name: 'colorSwatchField',
    id: 'graySwatch',
    value: 'gray',
    label: 'gray',
    groupAriaLabel: 'Color Swatch',
    size: 'medium',
    color: '#E8E8E8',
    selected: false,
    disabled: true,
    outOfStock: false,
    onValue: action('onValue')
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole('radio')).toBeDisabled();
  }
}`,...(V=(O=c.parameters)==null?void 0:O.docs)==null?void 0:V.source}}};var k,x,_;s.parameters={...s.parameters,docs:{...(k=s.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    name: 'colorSwatchField',
    id: 'graySwatch',
    label: 'gray',
    groupAriaLabel: 'Color Swatch',
    value: 'gray',
    size: 'medium',
    color: '#E8E8E8',
    selected: false,
    disabled: false,
    outOfStock: true,
    onValue: action('onValue')
  }
}`,...(_=(x=s.parameters)==null?void 0:x.docs)==null?void 0:_.source}}};var B,F,L;i.parameters={...i.parameters,docs:{...(B=i.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    name: 'colorSwatch_Field',
    id: 'graySwatch',
    value: 'gray',
    label: 'gray',
    groupAriaLabel: 'Color Swatch',
    size: 'medium',
    color: '#E8E8E8',
    selected: true,
    disabled: false,
    outOfStock: true,
    onValue: action('onValue')
  }
}`,...(L=(F=i.parameters)==null?void 0:F.docs)==null?void 0:L.source}}};var q,z,A;d.parameters={...d.parameters,docs:{...(q=d.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    name: 'colorSwatchField',
    id: 'graySwatch',
    value: 'gray',
    size: 'medium',
    color: '#E8E8E8',
    selected: false,
    disabled: false,
    outOfStock: false,
    multi: true,
    onValue: action('onValue'),
    'aria-label': 'Grey Color Swatch'
  },
  render: args => <div style="display: flex; flex-wrap:wrap; gap: 25px">
      <ColorSwatch {...args} id={'colorSwatch1'} value={'green'} color={'green'} />
      <ColorSwatch {...args} id={'colorSwatch2'} value={'blue'} color={'blue'} />
      <ColorSwatch {...args} id={'colorSwatch3'} value={'yellow'} color={'yellow'} />
    </div>
}`,...(A=(z=d.parameters)==null?void 0:z.docs)==null?void 0:A.source}}};const M=["DefaultColorSwatch","SelectedColorSwatch","DisabledColorSwatch","OutOfStockColorSwatch","SelectedOutOfStockColorSwatch","MultiColorSwatch"];export{r as DefaultColorSwatch,c as DisabledColorSwatch,d as MultiColorSwatch,s as OutOfStockColorSwatch,n as SelectedColorSwatch,i as SelectedOutOfStockColorSwatch,M as __namedExportsOrder,R as default};
//# sourceMappingURL=ColorSwatch.stories-6y0xzVHS.js.map
