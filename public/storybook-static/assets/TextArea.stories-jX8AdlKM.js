/*! Copyright 2026 Adobe
All Rights Reserved. */
import{af as m,a3 as h,ag as x,a as T}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const{expect:s,userEvent:o,within:b}=__STORYBOOK_MODULE_TEST__,M={title:"Components/TextArea",component:m,parameters:{layout:"centered",a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},args:{label:"Your Message",name:"message",errorMessage:"",value:""},argTypes:{label:{control:"text",description:"Input field label, indicating expected information."},name:{control:"text",description:"Unique name attribute for the input, used in form submissions."},errorMessage:{control:"text",description:"Error messages."},value:{control:"text",description:"Field textarea value."},disabled:{description:"disable textarea field",control:"boolean"},onChange:{action:"clicked",defaultValue:()=>{console.info("onChange")},description:"Function called when the value of the input changes. It is used to capture and handle the input data."},onBlur:{action:"clicked",defaultValue:()=>{console.info("onBlur")},description:"Function called when the input loses focus. This can be used to trigger validation or other effects when the user moves away from the input field."}}},g={render:e=>{const[a,t]=h(e.value),y=x(f=>{t(f.target.value)},[]);return T(m,{...e,value:a,onChange:y})}},n={...g,parameters:{layout:"centered",a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},args:{label:"Your Message",name:"message",value:"Initial"},play:async({canvasElement:e})=>{const a=b(e),t=document.querySelector("textarea");await o.type(t," Storybook Test Text! input max length"),await s(await a.findByDisplayValue("Initial Storybook Test Text! input max length")).toBeTruthy(),await o.clear(t),await s(await a.findByDisplayValue("")).toBeTruthy()}},r={...g,parameters:{layout:"centered",a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},args:{label:"Your Message",name:"message",errorMessage:"Message cannot be empty"}};var l,i,c;n.parameters={...n.parameters,docs:{...(l=n.parameters)==null?void 0:l.docs,source:{originalSource:`{
  ...Template,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [{
          id: 'color-contrast',
          enabled: false
        }]
      }
    }
  },
  args: {
    label: 'Your Message',
    name: 'message',
    value: 'Initial'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const inputField = document.querySelector('textarea') as HTMLElement;
    await userEvent.type(inputField, ' Storybook Test Text! input max length');
    await expect(await canvas.findByDisplayValue('Initial Storybook Test Text! input max length')).toBeTruthy();
    await userEvent.clear(inputField);
    await expect(await canvas.findByDisplayValue('')).toBeTruthy();
  }
}`,...(c=(i=n.parameters)==null?void 0:i.docs)==null?void 0:c.source}}};var u,d,p;r.parameters={...r.parameters,docs:{...(u=r.parameters)==null?void 0:u.docs,source:{originalSource:`{
  ...Template,
  parameters: {
    layout: 'centered',
    a11y: {
      config: {
        rules: [{
          id: 'color-contrast',
          enabled: false
        }]
      }
    }
  },
  args: {
    label: 'Your Message',
    name: 'message',
    errorMessage: 'Message cannot be empty'
  }
}`,...(p=(d=r.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};const E=["DefaultWithValue","WithError"];export{n as DefaultWithValue,r as WithError,E as __namedExportsOrder,M as default};
//# sourceMappingURL=TextArea.stories-jX8AdlKM.js.map
