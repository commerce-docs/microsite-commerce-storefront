/*! Copyright 2026 Adobe
All Rights Reserved. */
import{aB as Y,a as t,S as N,p as L}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const k="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAABXklEQVR4Ae2U303DMBDGL2ki5dEbkA3oY14SvEFhgsIElAkIE1AmaDsBbEAekvcyQT2CeYuUf3xXJVVaUSGIK176k053tpX7nPPZRGf+G0tK6VdV9YxYkGGKorhzkDxGLJumWZNBLMvyXdddOIgvMFCs1i3ati3YaBiPMJ8FNHYvobYh8yhnNBo9oEwr2j8DFtU0kLquNZ/BArE8XETZaCjYvHLaWGHHKzIIznCCnGIrgEClaRqTQcIw9OGubDoxDhkgCALf8zyd57lgnySJNiLQvgLvCNlrtLqApyiKYpR9XwCT95i8/i4RuuGmv6uOsixnfGMRcoNMYQq2Rh4WeONO3AlA2TrSmj/dB74zm963qr+4E8iybA43p1+Ai7TE302QPG6nfNgMgi+YE52AxmCMtrqlP4BkS7gx7AN2iVyfMH44p/DaQmKu+yudAIg/bQuHbhDcYmSQw3Y9c5QvERuYDI0g+mUAAAAASUVORK5CYII=",{expect:o,within:G}=__STORYBOOK_MODULE_TEST__,D={title:"Components/ToggleButton",component:Y,argTypes:{icon:{description:"Icon of the Toggle button"},label:{description:"Label of the Toggle button",required:!0,table:{type:{summary:"string | VNode"}},control:{type:"text"}},name:{description:"Field name (used for mapping the value in a form)",type:{required:!0,name:"string"},control:{type:"text"}},value:{description:"Field value",type:{required:!0,name:"string"},control:{type:"text"}},selected:{description:"Whether or not the Toggle button is selected",type:{required:!0,name:"boolean"},control:{type:"boolean"}},busy:{description:"Whether or not the Toggle button is in a loading state",type:{name:"boolean"},control:{type:"boolean"}},disabled:{description:"Whether or not the Toggle button is disabled",type:{name:"boolean"},control:{type:"boolean"}},onChange:{description:"Function to be called when the Toggle button is clicked",type:{name:"function"},control:!1}},parameters:{docs:{description:{component:"Use ToggleButtons to let users select one option from a set of mutually exclusive choices."}}}},a={name:"Toggle Button",args:{label:"Toggle Button label",name:"toggle-button-name",value:"value",selected:!0},play:async({canvasElement:c})=>{const n=await G(c).findByRole("radio"),e=n.closest(".dropin-toggle-button"),i=e==null?void 0:e.querySelector(".dropin-toggle-button__content");await o(e).toHaveClass("dropin-toggle-button__selected"),await o(i).toHaveTextContent("Toggle Button label"),await o(n).toBeChecked()}},l={name:"Toggle Button not selected",args:{label:"Toggle Button label",name:"toggle-button-name",value:"value",selected:!1},play:async({canvasElement:c})=>{const n=await G(c).findByRole("radio"),e=n.closest(".dropin-toggle-button"),i=e==null?void 0:e.querySelector(".dropin-toggle-button__content");await o(e).not.toHaveClass("dropin-toggle-button__selected"),await o(i).toHaveTextContent("Toggle Button label"),await o(n).not.toBeChecked()}},g={name:"Toggle Button with icon",args:{label:"Toggle Button label",name:"toggle-button-name",value:"value",selected:!0,icon:t(N,{})}},r={name:"Toggle Button with image",args:{label:"Toggle Button label",name:"toggle-button-name",value:"value",selected:!0,icon:t("img",{src:k,alt:"alt"})}},s={name:"Toggle Button with HTML",args:{label:t("p",{children:["Toggle Button label ","",t("a",{href:"https://www.adobe.com/",target:"_blank",rel:"noreferrer",children:"with a link"})]}),name:"toggle-button-name",value:"value",selected:!0,icon:t("img",{src:k,alt:"alt"})}},u={name:"Toggle Button with Price",args:{label:t("p",{children:[t(L,{currency:"USD",value:100})," Toggle Button label"]}),name:"toggle-button-name",value:"value",selected:!0}};var d,m,p;a.parameters={...a.parameters,docs:{...(d=a.parameters)==null?void 0:d.docs,source:{originalSource:`{
  name: 'Toggle Button',
  args: {
    label: 'Toggle Button label',
    name: 'toggle-button-name',
    value: 'value',
    selected: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggleButtonInput = await canvas.findByRole('radio');
    const toggleButton = toggleButtonInput.closest('.dropin-toggle-button');
    const toggleButtonText = toggleButton?.querySelector('.dropin-toggle-button__content');
    await expect(toggleButton).toHaveClass('dropin-toggle-button__selected');
    await expect(toggleButtonText).toHaveTextContent('Toggle Button label');
    await expect(toggleButtonInput).toBeChecked();
  }
}`,...(p=(m=a.parameters)==null?void 0:m.docs)==null?void 0:p.source}}};var b,B,T;l.parameters={...l.parameters,docs:{...(b=l.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'Toggle Button not selected',
  args: {
    label: 'Toggle Button label',
    name: 'toggle-button-name',
    value: 'value',
    selected: false
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const toggleButtonInput = await canvas.findByRole('radio');
    const toggleButton = toggleButtonInput.closest('.dropin-toggle-button');
    const toggleButtonText = toggleButton?.querySelector('.dropin-toggle-button__content');
    await expect(toggleButton).not.toHaveClass('dropin-toggle-button__selected');
    await expect(toggleButtonText).toHaveTextContent('Toggle Button label');
    await expect(toggleButtonInput).not.toBeChecked();
  }
}`,...(T=(B=l.parameters)==null?void 0:B.docs)==null?void 0:T.source}}};var v,h,y;g.parameters={...g.parameters,docs:{...(v=g.parameters)==null?void 0:v.docs,source:{originalSource:`{
  name: 'Toggle Button with icon',
  args: {
    label: 'Toggle Button label',
    name: 'toggle-button-name',
    value: 'value',
    selected: true,
    icon: <CardSVG />
  }
}`,...(y=(h=g.parameters)==null?void 0:h.docs)==null?void 0:y.source}}};var w,A,C;r.parameters={...r.parameters,docs:{...(w=r.parameters)==null?void 0:w.docs,source:{originalSource:`{
  name: 'Toggle Button with image',
  args: {
    label: 'Toggle Button label',
    name: 'toggle-button-name',
    value: 'value',
    selected: true,
    icon: <img src={CardPNG} alt="alt" />
  }
}`,...(C=(A=r.parameters)==null?void 0:A.docs)==null?void 0:C.source}}};var x,S,f;s.parameters={...s.parameters,docs:{...(x=s.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: 'Toggle Button with HTML',
  args: {
    label: <p>
        Toggle Button label {''}
        <a href="https://www.adobe.com/" target="_blank" rel="noreferrer">
          with a link
        </a>
      </p>,
    name: 'toggle-button-name',
    value: 'value',
    selected: true,
    icon: <img src={CardPNG} alt="alt" />
  }
}`,...(f=(S=s.parameters)==null?void 0:S.docs)==null?void 0:f.source}}};var _,I,E;u.parameters={...u.parameters,docs:{...(_=u.parameters)==null?void 0:_.docs,source:{originalSource:`{
  name: 'Toggle Button with Price',
  args: {
    label: <p>
        <Price currency="USD" value={100} /> Toggle Button label
      </p>,
    name: 'toggle-button-name',
    value: 'value',
    selected: true
  }
}`,...(E=(I=u.parameters)==null?void 0:I.docs)==null?void 0:E.source}}};const M=["ToggleButtonStory","ToggleButtonNotSelected","ToggleButtonWithIcon","ToggleButtonWithImage","ToggleButtonWithHTML","ToggleButtonWithPrice"];export{l as ToggleButtonNotSelected,a as ToggleButtonStory,s as ToggleButtonWithHTML,g as ToggleButtonWithIcon,r as ToggleButtonWithImage,u as ToggleButtonWithPrice,M as __namedExportsOrder,D as default};
//# sourceMappingURL=ToggleButton.stories-C4qqEUni.js.map
