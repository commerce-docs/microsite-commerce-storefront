/*! Copyright 2026 Adobe
All Rights Reserved. */
import{Y as y,a as f}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const{expect:t,userEvent:a,within:m,fn:g}=__STORYBOOK_MODULE_TEST__,b={title:"Components/InputPassword",component:y,parameters:{layout:"fullscreen",a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},args:{name:"password",required:!0,defaultValue:"password",minLength:8,requiredCharacterClasses:2,hideStatusIndicator:!0,validateLengthConfig:{status:"success",icon:"success",message:"Strong password"}},argTypes:{name:{control:"text",description:"Field identifier, used for form data."},placeholder:{description:"placeholder text",control:"text"},floatingLabel:{description:"enable floating label",control:"text"},defaultValue:{control:"text",description:"The initial value of the password field. This is typically used as a default value or placeholder for the password input field in a form."},required:{control:"boolean",description:"Marks field as mandatory."},errorMessage:{description:"Sets a custom error message for display in the interface",control:"text"},className:{control:"text",description:"Custom CSS class name."},autoComplete:{control:"text",description:"Enables browser autocomplete."},hideStatusIndicator:{control:"boolean",description:"Hides the status indicator."},onValue:{description:"Callback function to handle value change",type:"function"},onBlur:{description:"Callback function to handle blur event",type:"function"}}},r={parameters:{layout:"centered",a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},args:{required:!0,onBlur:g()},play:async({canvasElement:w})=>{const o=m(w),e=document.querySelector("input"),s=document.querySelector(".dropin-input-password__eye-icon");t(e).toHaveAttribute("type","password"),await a.click(s),t(e).toHaveAttribute("type","text"),await a.clear(e),await t(await o.findByDisplayValue("")).toBeTruthy(),await a.type(e,"passwordtest"),await t(await o.findByDisplayValue("passwordtest")).toBeTruthy(),await a.clear(e),await t(await o.findByDisplayValue("")).toBeTruthy(),await a.click(s),t(e).toHaveAttribute("type","password")}},n={parameters:{layout:"centered",a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},render:()=>f(y,{errorMessage:"custom error message",defaultValue:"error"})};var i,c,l;r.parameters={...r.parameters,docs:{...(i=r.parameters)==null?void 0:i.docs,source:{originalSource:`{
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
    required: true,
    onBlur: fn()
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const passwordInput = document.querySelector('input') as HTMLElement;
    const toggleButton = document.querySelector('.dropin-input-password__eye-icon') as HTMLElement;
    expect(passwordInput).toHaveAttribute('type', 'password');
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'text');
    await userEvent.clear(passwordInput);
    await expect(await canvas.findByDisplayValue('')).toBeTruthy();
    await userEvent.type(passwordInput, 'passwordtest');
    await expect(await canvas.findByDisplayValue('passwordtest')).toBeTruthy();
    await userEvent.clear(passwordInput);
    await expect(await canvas.findByDisplayValue('')).toBeTruthy();
    await userEvent.click(toggleButton);
    expect(passwordInput).toHaveAttribute('type', 'password');
  }
}`,...(l=(c=r.parameters)==null?void 0:c.docs)==null?void 0:l.source}}};var u,d,p;n.parameters={...n.parameters,docs:{...(u=n.parameters)==null?void 0:u.docs,source:{originalSource:`{
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
  render: () => {
    return <InputPassword errorMessage={'custom error message'} defaultValue={'error'} />;
  }
}`,...(p=(d=n.parameters)==null?void 0:d.docs)==null?void 0:p.source}}};const B=["Default","WithError"];export{r as Default,n as WithError,B as __namedExportsOrder,b as default};
//# sourceMappingURL=InputPassword.stories-Bv3bQjr9.js.map
