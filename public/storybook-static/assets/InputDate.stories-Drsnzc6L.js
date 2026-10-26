/*! Copyright 2026 Adobe
All Rights Reserved. */
import{W as y,a as o}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const{action:l}=__STORYBOOK_MODULE_ACTIONS__,{fireEvent:b,userEvent:i,within:D}=__STORYBOOK_MODULE_TEST__,T={title:"Components/InputDate",component:y,parameters:{layout:"fullscreen",a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},args:{name:"birthdate",label:"Birthdate",error:""},argTypes:{name:{control:"text",description:"Form field identifier."},value:{control:"text",description:"Field value in YYYY-MM-DD format. Displayed to the user in their browser locale format (e.g. MM/DD/YYYY in en-US)."},label:{control:"text",description:"Displayed field label."},error:{control:"text",description:"Field-specific error messages."},onChange:{action:"changed",defaultValue:l("onChange"),description:"Function called when the value of the input changes. It is used to capture and handle the input data."},onBlur:{action:"blurred",defaultValue:l("onBlur"),description:"Function called when the input loses focus. This can be used to trigger validation or other effects when the user moves away from the input field."}}},r={render:n=>o("div",{style:{margin:"40px auto",maxWidth:"1200px"},children:o(y,{...n})})},e={...r,args:{label:"Birthdate"},play:async({canvasElement:n})=>{const s=D(n).getByRole("textbox",{name:/date/i});await i.click(s),b.change(s,{target:{value:"2023-07-29"}}),await i.tab()}},a={...r,parameters:{layout:"padded",a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},args:{...e.args,error:"This field is required"}},t={...r,parameters:{layout:"padded",a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},args:{...e.args,value:"2023-07-29"}};var c,d,u;e.parameters={...e.parameters,docs:{...(c=e.parameters)==null?void 0:c.docs,source:{originalSource:`{
  ...Template,
  args: {
    label: 'Birthdate'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByRole('textbox', {
      name: /date/i
    });
    await userEvent.click(dateInput);
    fireEvent.change(dateInput, {
      target: {
        value: '2023-07-29'
      }
    });
    await userEvent.tab();
  }
}`,...(u=(d=e.parameters)==null?void 0:d.docs)==null?void 0:u.source}}};var p,m,f;a.parameters={...a.parameters,docs:{...(p=a.parameters)==null?void 0:p.docs,source:{originalSource:`{
  ...Template,
  parameters: {
    layout: 'padded',
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
    ...Default.args,
    error: 'This field is required'
  }
}`,...(f=(m=a.parameters)==null?void 0:m.docs)==null?void 0:f.source}}};var g,h,v;t.parameters={...t.parameters,docs:{...(g=t.parameters)==null?void 0:g.docs,source:{originalSource:`{
  ...Template,
  parameters: {
    layout: 'padded',
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
    ...Default.args,
    value: '2023-07-29'
  }
}`,...(v=(h=t.parameters)==null?void 0:h.docs)==null?void 0:v.source}}};const w=["Default","WithError","CustomValue"];export{t as CustomValue,e as Default,a as WithError,w as __namedExportsOrder,T as default};
//# sourceMappingURL=InputDate.stories-Drsnzc6L.js.map
