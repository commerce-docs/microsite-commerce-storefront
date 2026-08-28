/*! Copyright 2026 Adobe
All Rights Reserved. */
import{F as c,a as n,b as H,c as C,I as _,P}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const{expect:a,within:m,userEvent:i}=__STORYBOOK_MODULE_TEST__,M={title:"Components/Field",component:c,argTypes:{label:{description:"Label",control:"text"},hint:{description:"Helper Text",control:"text"},error:{description:"Error Text",control:"text"},success:{description:"Success Text",control:"text"},size:{description:"",options:["medium","large"],control:{type:"radio"},defaultValue:{summary:"medium"}},disabled:{description:"Whether or not the field is disabled",control:"boolean",defaultValue:{summary:!1}}},parameters:{docs:{description:{component:"Use Field Labels to wrap form inputs with titles and help text."}}}},r={render:t=>n(c,{...t,children:n(_,{name:"inputField",placeholder:"Input"})}),args:{label:"Label",hint:"Helper Text",error:"",success:"",size:"medium",disabled:!1},play:async({canvasElement:t})=>{const e=m(t);await i.type(e.getByPlaceholderText("Input"),"Test Content"),await a(await e.findByDisplayValue("Test Content")).toBeVisible(),await a(e.getByText("Label")).toBeVisible(),await a(e.getByText("Helper Text")).toBeVisible()}},o={render:t=>n(c,{...t,children:n(C,{name:"incrementerField",value:"0",min:0,max:100})}),args:{label:"Label",hint:"Helper Text",error:"",success:"",size:"medium",disabled:!1},play:async()=>{const t=document.querySelector("#storybook-root"),e=m(t),s=document.querySelector('button[aria-label="Decrease Quantity"]'),d=document.querySelector("input"),u=document.querySelector('button[aria-label="Increase Quantity"]');await new Promise(L=>setTimeout(L,500)),await i.click(u),await a(await e.findByDisplayValue("1")).toBeTruthy(),await i.click(s),await a(await e.findByDisplayValue("0")).toBeTruthy(),await i.type(d,"99"),await a(await e.findByDisplayValue("99")).toBeTruthy(),await i.click(u),await a(await e.findByDisplayValue("100")).toBeTruthy(),await i.click(u),await a(await e.findByDisplayValue("100")).toBeTruthy(),await i.click(s),await a(await e.findByDisplayValue("99")).toBeTruthy(),await i.clear(d),await i.type(d,"0"),await a(await e.findByDisplayValue("0")).toBeTruthy()}},l={render:t=>n(c,{...t,children:n(P,{name:"pickerField",placeholder:"Select an option",options:[{value:"option1",text:"Option 1"},{value:"option2",text:"Option 2",disabled:!0},{value:"option3",text:"Option 3"}],disabled:!1})}),args:{label:"Label",hint:"Helper Text",error:"",success:"",size:"medium",disabled:!1},play:async({canvasElement:t})=>{const e=m(t);await i.click(e.getByText("Select an option")),await a(e.getByText("Option 1")).toBeVisible(),await a(e.getByText("Option 2")).toBeVisible();const s=document.querySelector(".dropin-picker__select");await i.selectOptions(s,"option3"),await a(s.textContent).toContain("Option 3")}},p={render:t=>n(c,{...t,children:n(H,{name:"checkboxField",label:"Option",description:"Optional description text goes here"})}),args:{label:"Label",hint:"Helper Text",error:"",success:"",size:"medium",disabled:!1}};var y,w,b,x,B;r.parameters={...r.parameters,docs:{...(y=r.parameters)==null?void 0:y.docs,source:{originalSource:`{
  render: args => <Field {...args}>
      <Input name="inputField" placeholder="Input" />
    </Field>,
  args: {
    label: 'Label',
    hint: 'Helper Text',
    error: '',
    success: '',
    size: 'medium',
    disabled: false
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByPlaceholderText('Input'), 'Test Content');
    await expect(await canvas.findByDisplayValue('Test Content')).toBeVisible();
    await expect(canvas.getByText('Label')).toBeVisible();
    await expect(canvas.getByText('Helper Text')).toBeVisible();
  }
}`,...(b=(w=r.parameters)==null?void 0:w.docs)==null?void 0:b.source},description:{story:"```ts\nimport { Field } from '@adobe-commerce/elsie/components/Field';\nimport { Input } from '@adobe-commerce/elsie/components/Input';\n```",...(B=(x=r.parameters)==null?void 0:x.docs)==null?void 0:B.description}}};var T,h,v,f,g;o.parameters={...o.parameters,docs:{...(T=o.parameters)==null?void 0:T.docs,source:{originalSource:`{
  render: args => <Field {...args}>
      <Incrementer name="incrementerField" value="0" min={0} max={100} />
    </Field>,
  args: {
    label: 'Label',
    hint: 'Helper Text',
    error: '',
    success: '',
    size: 'medium',
    disabled: false
  },
  play: async () => {
    const canvasElement = document.querySelector('#storybook-root') as HTMLElement;
    const canvas = within(canvasElement);
    const decreaseButton = document.querySelector('button[aria-label="Decrease Quantity"]') as HTMLElement;
    const inputField = document.querySelector('input') as HTMLElement;
    const increaseButton = document.querySelector('button[aria-label="Increase Quantity"]') as HTMLElement;

    // Without this wait test failing intermittently as click event is triggerning before even element fully loaded
    await new Promise(resolve => setTimeout(resolve, 500));
    await userEvent.click(increaseButton);
    await expect(await canvas.findByDisplayValue('1')).toBeTruthy();
    await userEvent.click(decreaseButton);
    await expect(await canvas.findByDisplayValue('0')).toBeTruthy();
    await userEvent.type(inputField, '99');
    await expect(await canvas.findByDisplayValue('99')).toBeTruthy();
    await userEvent.click(increaseButton);
    await expect(await canvas.findByDisplayValue('100')).toBeTruthy();
    await userEvent.click(increaseButton);
    await expect(await canvas.findByDisplayValue('100')).toBeTruthy();
    await userEvent.click(decreaseButton);
    await expect(await canvas.findByDisplayValue('99')).toBeTruthy();
    await userEvent.clear(inputField);
    await userEvent.type(inputField, '0');
    await expect(await canvas.findByDisplayValue('0')).toBeTruthy();
  }
}`,...(v=(h=o.parameters)==null?void 0:h.docs)==null?void 0:v.source},description:{story:"```ts\nimport { Field } from '@adobe-commerce/elsie/components/Field';\nimport { Incrementer } from '@adobe-commerce/elsie/components/Incrementer';\n```",...(g=(f=o.parameters)==null?void 0:f.docs)==null?void 0:g.description}}};var F,k,E,V,O;l.parameters={...l.parameters,docs:{...(F=l.parameters)==null?void 0:F.docs,source:{originalSource:`{
  render: args => <Field {...args}>
      <Picker name="pickerField" placeholder="Select an option" options={[{
      value: 'option1',
      text: 'Option 1'
    }, {
      value: 'option2',
      text: 'Option 2',
      disabled: true
    }, {
      value: 'option3',
      text: 'Option 3'
    }]} disabled={false} />
    </Field>,
  args: {
    label: 'Label',
    hint: 'Helper Text',
    error: '',
    success: '',
    size: 'medium',
    disabled: false
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByText('Select an option'));
    await expect(canvas.getByText('Option 1')).toBeVisible();
    await expect(canvas.getByText('Option 2')).toBeVisible();
    const select = document.querySelector('.dropin-picker__select') as HTMLSelectElement;
    await userEvent.selectOptions(select, 'option3');
    await expect(select.textContent).toContain('Option 3');
  }
}`,...(E=(k=l.parameters)==null?void 0:k.docs)==null?void 0:E.source},description:{story:"```ts\nimport { Field } from '@adobe-commerce/elsie/components/Field';\nimport { Picker } from '@adobe-commerce/elsie/components/Picker';\n```",...(O=(V=l.parameters)==null?void 0:V.docs)==null?void 0:O.description}}};var S,D,I;p.parameters={...p.parameters,docs:{...(S=p.parameters)==null?void 0:S.docs,source:{originalSource:`{
  render: args => <Field {...args}>
      <Checkbox name="checkboxField" label="Option" description="Optional description text goes here" />
    </Field>,
  args: {
    label: 'Label',
    hint: 'Helper Text',
    error: '',
    success: '',
    size: 'medium',
    disabled: false
  }
}`,...(I=(D=p.parameters)==null?void 0:D.docs)==null?void 0:I.source}}};const Q=["InputField","IncrementerField","PickerField","CheckboxField"];export{p as CheckboxField,o as IncrementerField,r as InputField,l as PickerField,Q as __namedExportsOrder,M as default};
//# sourceMappingURL=Field.stories-zwMYsF_Z.js.map
