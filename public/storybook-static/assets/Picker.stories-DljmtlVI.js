/*! Copyright 2026 Adobe
All Rights Reserved. */
import{P as R,a as u,z as K}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const{expect:d,userEvent:v,within:Y}=__STORYBOOK_MODULE_TEST__,N={title:"Components/Picker",component:R,argTypes:{name:{description:"Field name (used for mapping the value in a form)",type:{required:!1,name:"string"}},value:{description:"Field value",type:"string"},variant:{description:"Variant of the picker",control:{type:"radio"},type:"string",defaultValue:{summary:"primary"},options:["primary","secondary"]},size:{description:"Size of the picker",control:"radio",options:["medium","large"],defaultValue:{summary:"medium"}},floatingLabel:{description:"Floating label text",type:{required:!1,name:"string"}},placeholder:{description:"Placeholder text (will be overridden by floatingLabel if provided)",type:{required:!1,name:"string"}},defaultOption:{description:"Default available option from the options array",type:{required:!1,name:"object"}},error:{description:"Whether or not the field has an error",type:"boolean",defaultValue:{summary:!1}},options:{description:"Array of options",type:{required:!0,name:"Array"}},disabled:{description:"Whether or not the field is disabled",type:"boolean",defaultValue:{summary:!1}},disableWhenSingle:{description:"Automatically disable the picker when only one option is available. Defaults to true to preserve the original behavior (e.g. checkout country picker). Pass false to keep the picker interactive even with a single option.",type:"boolean",defaultValue:{summary:!0}},icon:{description:"Icon to display in the Picker"},handleSelect:{description:"Callback function for when a value is selected",type:"function",defaultValue:{summary:"() => {}"},action:"Value Selected"}},decorators:[s=>u("div",{style:{width:"300px"},children:s()})],parameters:{docs:{description:{component:"Use Pickers to let users select values or items from predefined lists."}}}},e={args:{name:"pickerField",variant:"primary",defaultOption:{value:"option1",text:"A Option 1"},placeholder:"Select an option",options:[{value:"option1",text:"A Option 1"},{value:"option2",text:"B Option 2",disabled:!0},{value:"option3",text:"C Option 3"}]},play:async({canvasElement:s})=>{const c=Y(s);v.click(c.getByText("A Option 1")),d(c.getByText("A Option 1")).toBeVisible(),d(c.getByText("B Option 2")).toBeVisible();const m=document.querySelector(".dropin-picker__select");v.selectOptions(m,"option3"),d(m.textContent).toContain("C Option 3")}},n={name:"Secondary with icon",args:{name:"pickerField",variant:"secondary",defaultOption:{value:"option2",text:"B Option 2"},placeholder:"Select an option",icon:u(K,{}),options:[{value:"option1",text:"A Option 1"},{value:"option2",text:"B Option 2"},{value:"option3",text:"C Option 3",disabled:!0}]}},t={name:"Secondary with placeholder",args:{name:"pickerField",variant:"primary",placeholder:"Select an option",icon:u(K,{}),options:[{value:"option1",text:"A Option 1"},{value:"option2",text:"B Option 2"},{value:"option3",text:"C Option 3",disabled:!0}]}},o={name:"Floating label",args:{name:"pickerField",variant:"primary",floatingLabel:"Floating label",options:[{value:"option1",text:"A Option 1"},{value:"option2",text:"B Option 2"},{value:"option3",text:"C Option 3",disabled:!0}]}},a={name:"Floating label with default option",args:{name:"pickerField",variant:"primary",floatingLabel:"Floating label",defaultOption:{value:"option2",text:"B Option 2"},options:[{value:"option1",text:"A Option 1"},{value:"option2",text:"B Option 2"},{value:"option3",text:"C Option 3",disabled:!0}]}},i={name:"Floating label with value",args:{name:"pickerField",variant:"primary",floatingLabel:"Floating label",value:"option2",options:[{value:"option1",text:"A Option 1"},{value:"option2",text:"B Option 2"},{value:"option3",text:"C Option 3",disabled:!0}]}},r={name:"Mandatory field floating label with value",args:{name:"pickerFieldPrimary",variant:"primary",floatingLabel:"Floating label",value:"option2",required:!0,options:[{value:"option1",text:"A Option 1"},{value:"option2",text:"B Option 2"},{value:"option3",text:"C Option 3",disabled:!0}]}},l={name:"Single option (auto-disabled)",args:{name:"pickerField",variant:"primary",placeholder:"Select an option",options:[{value:"option1",text:"Only Option"}]}},p={name:"Single option (disableWhenSingle: false)",args:{name:"pickerField",variant:"primary",placeholder:"Select an option",disableWhenSingle:!1,options:[{value:"option1",text:"Only Option"}]}};var g,O,y,b,x;e.parameters={...e.parameters,docs:{...(g=e.parameters)==null?void 0:g.docs,source:{originalSource:`{
  args: {
    name: 'pickerField',
    variant: 'primary',
    defaultOption: {
      value: 'option1',
      text: 'A Option 1'
    },
    placeholder: 'Select an option',
    options: [{
      value: 'option1',
      text: 'A Option 1'
    }, {
      value: 'option2',
      text: 'B Option 2',
      disabled: true
    }, {
      value: 'option3',
      text: 'C Option 3'
    }]
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    userEvent.click(canvas.getByText('A Option 1'));
    expect(canvas.getByText('A Option 1')).toBeVisible();
    expect(canvas.getByText('B Option 2')).toBeVisible();
    const select = document.querySelector('.dropin-picker__select') as HTMLSelectElement;
    userEvent.selectOptions(select, 'option3');
    expect(select.textContent).toContain('C Option 3');
  }
}`,...(y=(O=e.parameters)==null?void 0:O.docs)==null?void 0:y.source},description:{story:"```ts\nimport { Picker } from '@/checkout/components/Picker';\n```",...(x=(b=e.parameters)==null?void 0:b.docs)==null?void 0:x.description}}};var h,f,S;n.parameters={...n.parameters,docs:{...(h=n.parameters)==null?void 0:h.docs,source:{originalSource:`{
  name: 'Secondary with icon',
  args: {
    name: 'pickerField',
    variant: 'secondary',
    defaultOption: {
      value: 'option2',
      text: 'B Option 2'
    },
    placeholder: 'Select an option',
    icon: <Placeholder />,
    options: [{
      value: 'option1',
      text: 'A Option 1'
    }, {
      value: 'option2',
      text: 'B Option 2'
    }, {
      value: 'option3',
      text: 'C Option 3',
      disabled: true
    }]
  }
}`,...(S=(f=n.parameters)==null?void 0:f.docs)==null?void 0:S.source}}};var F,k,B;t.parameters={...t.parameters,docs:{...(F=t.parameters)==null?void 0:F.docs,source:{originalSource:`{
  name: 'Secondary with placeholder',
  args: {
    name: 'pickerField',
    variant: 'primary',
    placeholder: 'Select an option',
    icon: <Placeholder />,
    options: [{
      value: 'option1',
      text: 'A Option 1'
    }, {
      value: 'option2',
      text: 'B Option 2'
    }, {
      value: 'option3',
      text: 'C Option 3',
      disabled: true
    }]
  }
}`,...(B=(k=t.parameters)==null?void 0:k.docs)==null?void 0:B.source}}};var A,C,L;o.parameters={...o.parameters,docs:{...(A=o.parameters)==null?void 0:A.docs,source:{originalSource:`{
  name: 'Floating label',
  args: {
    name: 'pickerField',
    variant: 'primary',
    floatingLabel: 'Floating label',
    options: [{
      value: 'option1',
      text: 'A Option 1'
    }, {
      value: 'option2',
      text: 'B Option 2'
    }, {
      value: 'option3',
      text: 'C Option 3',
      disabled: true
    }]
  }
}`,...(L=(C=o.parameters)==null?void 0:C.docs)==null?void 0:L.source}}};var P,w,V;a.parameters={...a.parameters,docs:{...(P=a.parameters)==null?void 0:P.docs,source:{originalSource:`{
  name: 'Floating label with default option',
  args: {
    name: 'pickerField',
    variant: 'primary',
    floatingLabel: 'Floating label',
    defaultOption: {
      value: 'option2',
      text: 'B Option 2'
    },
    options: [{
      value: 'option1',
      text: 'A Option 1'
    }, {
      value: 'option2',
      text: 'B Option 2'
    }, {
      value: 'option3',
      text: 'C Option 3',
      disabled: true
    }]
  }
}`,...(V=(w=a.parameters)==null?void 0:w.docs)==null?void 0:V.source}}};var W,T,_;i.parameters={...i.parameters,docs:{...(W=i.parameters)==null?void 0:W.docs,source:{originalSource:`{
  name: 'Floating label with value',
  args: {
    name: 'pickerField',
    variant: 'primary',
    floatingLabel: 'Floating label',
    value: 'option2',
    options: [{
      value: 'option1',
      text: 'A Option 1'
    }, {
      value: 'option2',
      text: 'B Option 2'
    }, {
      value: 'option3',
      text: 'C Option 3',
      disabled: true
    }]
  }
}`,...(_=(T=i.parameters)==null?void 0:T.docs)==null?void 0:_.source}}};var E,q,M;r.parameters={...r.parameters,docs:{...(E=r.parameters)==null?void 0:E.docs,source:{originalSource:`{
  name: 'Mandatory field floating label with value',
  args: {
    name: 'pickerFieldPrimary',
    variant: 'primary',
    floatingLabel: 'Floating label',
    value: 'option2',
    required: true,
    options: [{
      value: 'option1',
      text: 'A Option 1'
    }, {
      value: 'option2',
      text: 'B Option 2'
    }, {
      value: 'option3',
      text: 'C Option 3',
      disabled: true
    }]
  }
}`,...(M=(q=r.parameters)==null?void 0:q.docs)==null?void 0:M.source}}};var D,z,I;l.parameters={...l.parameters,docs:{...(D=l.parameters)==null?void 0:D.docs,source:{originalSource:`{
  name: 'Single option (auto-disabled)',
  args: {
    name: 'pickerField',
    variant: 'primary',
    placeholder: 'Select an option',
    options: [{
      value: 'option1',
      text: 'Only Option'
    }]
  }
}`,...(I=(z=l.parameters)==null?void 0:z.docs)==null?void 0:I.source}}};var U,j,H;p.parameters={...p.parameters,docs:{...(U=p.parameters)==null?void 0:U.docs,source:{originalSource:`{
  name: 'Single option (disableWhenSingle: false)',
  args: {
    name: 'pickerField',
    variant: 'primary',
    placeholder: 'Select an option',
    disableWhenSingle: false,
    options: [{
      value: 'option1',
      text: 'Only Option'
    }]
  }
}`,...(H=(j=p.parameters)==null?void 0:j.docs)==null?void 0:H.source}}};const Q=["Primary","SecondaryWithIcon","PlaceholderText","FloatingLabel","FloatingLabelWithDefaultOption","FloatingLabelWithValue","MandatoryFieldFloatingLabelWithValue","SingleOption","SingleOptionEnabled"];export{o as FloatingLabel,a as FloatingLabelWithDefaultOption,i as FloatingLabelWithValue,r as MandatoryFieldFloatingLabelWithValue,t as PlaceholderText,e as Primary,n as SecondaryWithIcon,l as SingleOption,p as SingleOptionEnabled,Q as __namedExportsOrder,N as default};
//# sourceMappingURL=Picker.stories-DljmtlVI.js.map
