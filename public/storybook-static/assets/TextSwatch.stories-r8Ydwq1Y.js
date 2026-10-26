/*! Copyright 2026 Adobe
All Rights Reserved. */
import{ah as i,a as t}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const{action:n}=__STORYBOOK_MODULE_ACTIONS__,{expect:a,userEvent:I,within:S}=__STORYBOOK_MODULE_TEST__,z={title:"Components/TextSwatch",component:i,argTypes:{name:{description:"Field name (used for mapping the value in a form)",type:{required:!1,name:"string"}},label:{description:"Field label",type:{required:!0,name:"string"}},groupAriaLabel:{description:"Label name for the swatch group",type:{required:!0,name:"string"}},id:{description:"Field id",type:{required:!0,name:"string"}},value:{description:"Field value",type:{required:!1,name:"string"}},disabled:{description:"Whether or not the text swatch is disabled",type:{required:!1,name:"boolean"}},selected:{description:"Whether or not the text swatch is active",type:{required:!1,name:"boolean"}},multi:{description:"Whether or not the text swatch allows multiple selection",type:{required:!1,name:"boolean"}},outOfStock:{description:"Whether or not the text swatch is out of stock",type:{required:!1,name:"boolean"}},onValue:{description:"Function to handle value changes",type:{required:!1,name:"function"}},onUpdateError:{description:"Function to handle error updates",type:{required:!1,name:"function"}}},parameters:{docs:{description:{component:"Use Text Swatches to display text selections, like sizes or categories."}}}},s={name:"Text Swatch",args:{name:"textSwatchField",label:"Option",groupAriaLabel:"Text Swatches",id:"mediumOption",value:"option",selected:!1,disabled:!1,outOfStock:!1,onValue:n("onValue")},play:async({canvasElement:e})=>{const o=await S(e).findByRole("radio"),l=document.querySelector(".dropin-text-swatch__label");a(l).toBeVisible(),await a(o).not.toBeChecked()}},K=`
  .dropin-text-swatch__label {
    max-width: 100px;
  }
`,r={name:"Long Text Swatch",render:e=>t("div",{children:[t("style",{dangerouslySetInnerHTML:{__html:K}}),t(i,{...e})]}),args:{name:"textSwatchField",label:"Long Text Swatch",groupAriaLabel:"Text Swatches",id:"mediumOption",value:"long text swatch",selected:!1,disabled:!1,outOfStock:!1,onValue:n("onValue")},play:async({canvasElement:e})=>{const o=await S(e).findByRole("radio"),l=document.querySelector(".dropin-text-swatch__label");a(l).toBeVisible(),I.hover(o),await new Promise(U=>setTimeout(U,500));const H=document.querySelector("div[data-tooltip]");a(H.getAttribute("data-tooltip")).toBe("Long Text Swatch")}},d={args:{name:"textSwatchField",label:"Option",groupAriaLabel:"Text Swatches",id:"mediumOption",value:"option",selected:!0,disabled:!1,outOfStock:!1,onValue:n("onValue")},play:async({canvasElement:e})=>{const o=await S(e).findByRole("radio"),l=document.querySelector(".dropin-text-swatch__label");a(l).toBeVisible(),await a(o).toBeChecked()}},u={args:{name:"textSwatchField",label:"Option",groupAriaLabel:"Text Swatches",id:"mediumOption",value:"option",selected:!1,disabled:!0,outOfStock:!1,onValue:n("onValue")},play:async({canvasElement:e})=>{const c=S(e);await a(await c.findByRole("radio")).toBeDisabled()}},p={args:{name:"textSwatchField",label:"Option",groupAriaLabel:"Text Swatches",id:"mediumOption",value:"option",selected:!1,disabled:!1,outOfStock:!0,onValue:n("onValue")}},m={args:{name:"textSwatchField",label:"Option",groupAriaLabel:"Text Swatches",id:"mediumOption",value:"option",selected:!0,disabled:!1,outOfStock:!0,onValue:n("onValue")}},h={args:{name:"multiTextSwatchField",label:"Option",id:"multiOption",value:"option",selected:!1,disabled:!1,outOfStock:!1,multi:!0,onValue:n("onValue")},render:e=>t("div",{style:"display: flex; flex-wrap:wrap; gap: 25px",children:[t(i,{...e,id:"optionS",value:"S",label:"S"}),t(i,{...e,id:"optionM",value:"M",label:"M"}),t(i,{...e,id:"optionL",value:"L",label:"L"})]})};var w,x,b,f,g;s.parameters={...s.parameters,docs:{...(w=s.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'Text Swatch',
  args: {
    name: 'textSwatchField',
    label: 'Option',
    groupAriaLabel: 'Text Swatches',
    id: 'mediumOption',
    value: 'option',
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
    const labelElement = document.querySelector('.dropin-text-swatch__label') as HTMLElement;
    expect(labelElement).toBeVisible();
    await expect(textSwatch).not.toBeChecked();
  }
}`,...(b=(x=s.parameters)==null?void 0:x.docs)==null?void 0:b.source},description:{story:"```ts\nimport { TextSwatch } from '@adobe-commerce/elsie/components/TextSwatch';\n```",...(g=(f=s.parameters)==null?void 0:f.docs)==null?void 0:g.description}}};var v,T,O;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'Long Text Swatch',
  render: args => <div>
      <style dangerouslySetInnerHTML={{
      __html: swatchStyle
    }} />
      <TextSwatch {...args} />
    </div>,
  args: {
    name: 'textSwatchField',
    label: 'Long Text Swatch',
    groupAriaLabel: 'Text Swatches',
    id: 'mediumOption',
    value: 'long text swatch',
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
    const labelElement = document.querySelector('.dropin-text-swatch__label') as HTMLElement;
    expect(labelElement).toBeVisible();
    userEvent.hover(textSwatch);

    // Without this wait test failing
    await new Promise(resolve => setTimeout(resolve, 500));
    const divWithTooltip = document.querySelector('div[data-tooltip]') as HTMLElement;
    expect(divWithTooltip.getAttribute('data-tooltip')).toBe('Long Text Swatch');
  }
}`,...(O=(T=r.parameters)==null?void 0:T.docs)==null?void 0:O.source}}};var y,L,V;d.parameters={...d.parameters,docs:{...(y=d.parameters)==null?void 0:y.docs,source:{originalSource:`{
  args: {
    name: 'textSwatchField',
    label: 'Option',
    groupAriaLabel: 'Text Swatches',
    id: 'mediumOption',
    value: 'option',
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
    const labelElement = document.querySelector('.dropin-text-swatch__label') as HTMLElement;
    expect(labelElement).toBeVisible();
    await expect(textSwatch).toBeChecked();
  }
}`,...(V=(L=d.parameters)==null?void 0:L.docs)==null?void 0:V.source}}};var _,E,k;u.parameters={...u.parameters,docs:{...(_=u.parameters)==null?void 0:_.docs,source:{originalSource:`{
  args: {
    name: 'textSwatchField',
    label: 'Option',
    groupAriaLabel: 'Text Swatches',
    id: 'mediumOption',
    value: 'option',
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
}`,...(k=(E=u.parameters)==null?void 0:E.docs)==null?void 0:k.source}}};var B,F,q;p.parameters={...p.parameters,docs:{...(B=p.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    name: 'textSwatchField',
    label: 'Option',
    groupAriaLabel: 'Text Swatches',
    id: 'mediumOption',
    value: 'option',
    selected: false,
    disabled: false,
    outOfStock: true,
    onValue: action('onValue')
  }
}`,...(q=(F=p.parameters)==null?void 0:F.docs)==null?void 0:q.source}}};var A,M,R;m.parameters={...m.parameters,docs:{...(A=m.parameters)==null?void 0:A.docs,source:{originalSource:`{
  args: {
    name: 'textSwatchField',
    label: 'Option',
    groupAriaLabel: 'Text Swatches',
    id: 'mediumOption',
    value: 'option',
    selected: true,
    disabled: false,
    outOfStock: true,
    onValue: action('onValue')
  }
}`,...(R=(M=m.parameters)==null?void 0:M.docs)==null?void 0:R.source}}};var W,D,C;h.parameters={...h.parameters,docs:{...(W=h.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    name: 'multiTextSwatchField',
    label: 'Option',
    id: 'multiOption',
    value: 'option',
    selected: false,
    disabled: false,
    outOfStock: false,
    multi: true,
    onValue: action('onValue')
  },
  render: args => <div style="display: flex; flex-wrap:wrap; gap: 25px">
      <TextSwatch {...args} id={'optionS'} value={'S'} label={'S'} />
      <TextSwatch {...args} id={'optionM'} value={'M'} label={'M'} />
      <TextSwatch {...args} id={'optionL'} value={'L'} label={'L'} />
    </div>
}`,...(C=(D=h.parameters)==null?void 0:D.docs)==null?void 0:C.source}}};const N=["DefaultTextSwatch","TextSwatchWithLongText","SelectedTextSwatch","DisabledTextSwatch","OutOfStockTextSwatch","SelectedOutOfStockTextSwatch","MultiTextSwatch"];export{s as DefaultTextSwatch,u as DisabledTextSwatch,h as MultiTextSwatch,p as OutOfStockTextSwatch,m as SelectedOutOfStockTextSwatch,d as SelectedTextSwatch,r as TextSwatchWithLongText,N as __namedExportsOrder,z as default};
//# sourceMappingURL=TextSwatch.stories-r8Ydwq1Y.js.map
