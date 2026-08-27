/*! Copyright 2026 Adobe
All Rights Reserved. */
import{b as J,a}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const{expect:t,within:G,userEvent:m}=__STORYBOOK_MODULE_TEST__,Z={title:"Components/Checkbox",component:J,argTypes:{name:{description:"Field name (used for mapping the value in a form)",type:{required:!1,name:"string"}},value:{description:"Field value",type:"string"},label:{description:"Label for the checkbox",control:{type:"text"},table:{type:{summary:"string | VNode"}}},description:{description:"Additional secondary description if needed. This can be a string or a Nodes",type:"string",summary:"Optional description text goes here"},size:{description:"Available sizes for the checkbox label and description texts",type:"string",options:["medium","large"],default:"medium",control:{type:"radio",default:"medium"}},disabled:{description:"Whether or not the checkbox is disabled",type:"boolean",default:!1},checked:{description:"Whether or not the checkbox is active",type:"boolean",default:!1},error:{description:"Whether or not the checkbox is on error status",type:"boolean",default:!1}},parameters:{docs:{description:{component:"Use Checkboxes to let users pick multiple options from a list or mark a single item as selected."}}}},n={name:"Enabled and not Active",args:{name:"checkboxField",label:"Option",description:"Optional description text goes here"},play:async({canvasElement:e})=>{const c=G(e),o=document.querySelector('input[name="checkboxField"]');await t(o).not.toBeChecked(),await m.click(c.getByText("Option")),await t(o).toBeChecked(),await m.click(o),await t(o).not.toBeChecked()}},i={name:"Enabled and Active",args:{name:"checkboxField",label:"Option",description:"Optional description text goes here",checked:!0},play:async({canvasElement:e})=>{const c=G(e),o=document.querySelector('input[name="checkboxField"]');await t(o).toBeChecked(),await m.click(c.getByText("Option")),await t(o).not.toBeChecked(),await m.click(o),await t(o).toBeChecked()}},r={name:"Enabled and not Active with Error",args:{name:"checkboxField",label:"Option",description:"Optional description text goes here",error:!0}},s={name:"Enabled and Active with Error",args:{name:"checkboxField",label:"Option",description:"Optional description text goes here",checked:!0,error:!0}},d={name:"Disabled",args:{name:"checkboxField",label:"Option",description:"Optional description text goes here",disabled:!0},play:async()=>{const e=document.querySelector('input[name="checkboxField"]');await t(e).not.toBeChecked(),await t(e).toBeDisabled()}},l={name:"Disabled with a link",args:{name:"checkboxField",label:a("span",{children:["Option with"," ",a("a",{href:"https://www.adobe.com",target:"_blank",rel:"noreferrer",children:"a link"})]}),description:"Optional description text goes here",disabled:!0},play:async()=>{const e=document.querySelector('input[name="checkboxField"]');await t(e).not.toBeChecked(),await t(e).toBeDisabled()}},p={name:"Disabled and Active",args:{name:"checkboxField",label:"Option",description:"Optional description text goes here",disabled:!0,checked:!0},play:async()=>{const e=document.querySelector('input[name="checkboxField"]');await t(e).toBeChecked(),await t(e).toBeDisabled()}},h={name:"Active with label and description as Nodes",args:{name:"checkboxField",label:a("span",{children:"Option"}),description:a("div",{children:"Optional description text goes here"}),checked:!0},play:async()=>{const e=document.querySelector('input[name="checkboxField"]');await t(e).toBeChecked()}},b={name:"With a link in the label",args:{name:"checkboxField",label:a("span",{children:["Option with"," ",a("a",{href:"https://www.adobe.com",target:"_blank",rel:"noreferrer",children:"a link"})," ","and a"," ",a("a",{href:"https://www.adobe.com",target:"_blank",rel:"noreferrer",children:"second link"})]}),description:"Optional description text goes here",checked:!1},play:async()=>{const e=document.querySelector('input[name="checkboxField"]'),c=document.querySelector(".dropin-checkbox a");await t(e).not.toBeChecked(),await t(c).toBeDefined()}},k={name:"With a long label",args:{name:"checkboxField",label:a("span",{style:{width:"200px",display:"inline-block"},children:["Option with"," ",a("a",{href:"https://www.adobe.com",target:"_blank",rel:"noreferrer",children:"a link"})," ","and a"," ",a("a",{href:"https://www.adobe.com",target:"_blank",rel:"noreferrer",children:"second link"})," ","plus a long text to test the wrapping and the checkbox alignment to the top of the label"]}),description:"Optional description text goes here",checked:!1},play:async()=>{const e=document.querySelector('input[name="checkboxField"]'),c=document.querySelector(".dropin-checkbox a");await t(e).not.toBeChecked(),await t(c).toBeDefined()}};var x,u,w,g,y;n.parameters={...n.parameters,docs:{...(x=n.parameters)==null?void 0:x.docs,source:{originalSource:`{
  name: 'Enabled and not Active',
  args: {
    name: 'checkboxField',
    label: 'Option',
    description: 'Optional description text goes here'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const checkboxField = document.querySelector('input[name="checkboxField"]') as HTMLElement;
    await expect(checkboxField).not.toBeChecked();
    await userEvent.click(canvas.getByText('Option'));
    await expect(checkboxField).toBeChecked();
    await userEvent.click(checkboxField);
    await expect(checkboxField).not.toBeChecked();
  }
}`,...(w=(u=n.parameters)==null?void 0:u.docs)==null?void 0:w.source},description:{story:"Import the Checkbox component\n\n```ts\nimport { Checkbox } from '@adobe-commerce/elsie/components/Checkbox';\n```",...(y=(g=n.parameters)==null?void 0:g.docs)==null?void 0:y.description}}};var F,O,C;i.parameters={...i.parameters,docs:{...(F=i.parameters)==null?void 0:F.docs,source:{originalSource:`{
  name: 'Enabled and Active',
  args: {
    name: 'checkboxField',
    label: 'Option',
    description: 'Optional description text goes here',
    checked: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const checkboxField = document.querySelector('input[name="checkboxField"]') as HTMLElement;
    await expect(checkboxField).toBeChecked();
    await userEvent.click(canvas.getByText('Option'));
    await expect(checkboxField).not.toBeChecked();
    await userEvent.click(checkboxField);
    await expect(checkboxField).toBeChecked();
  }
}`,...(C=(O=i.parameters)==null?void 0:O.docs)==null?void 0:C.source}}};var f,E,v;r.parameters={...r.parameters,docs:{...(f=r.parameters)==null?void 0:f.docs,source:{originalSource:`{
  name: 'Enabled and not Active with Error',
  args: {
    name: 'checkboxField',
    label: 'Option',
    description: 'Optional description text goes here',
    error: true
  }
}`,...(v=(E=r.parameters)==null?void 0:E.docs)==null?void 0:v.source}}};var B,A,S;s.parameters={...s.parameters,docs:{...(B=s.parameters)==null?void 0:B.docs,source:{originalSource:`{
  name: 'Enabled and Active with Error',
  args: {
    name: 'checkboxField',
    label: 'Option',
    description: 'Optional description text goes here',
    checked: true,
    error: true
  }
}`,...(S=(A=s.parameters)==null?void 0:A.docs)==null?void 0:S.source}}};var L,D,q;d.parameters={...d.parameters,docs:{...(L=d.parameters)==null?void 0:L.docs,source:{originalSource:`{
  name: 'Disabled',
  args: {
    name: 'checkboxField',
    label: 'Option',
    description: 'Optional description text goes here',
    disabled: true
  },
  play: async () => {
    const checkboxField = document.querySelector('input[name="checkboxField"]') as HTMLElement;
    await expect(checkboxField).not.toBeChecked();
    await expect(checkboxField).toBeDisabled();
  }
}`,...(q=(D=d.parameters)==null?void 0:D.docs)==null?void 0:q.source}}};var T,W,_;l.parameters={...l.parameters,docs:{...(T=l.parameters)==null?void 0:T.docs,source:{originalSource:`{
  name: 'Disabled with a link',
  args: {
    name: 'checkboxField',
    label: <span>
        Option with{' '}
        <a href="https://www.adobe.com" target="_blank" rel="noreferrer">
          a link
        </a>
      </span>,
    description: 'Optional description text goes here',
    disabled: true
  },
  play: async () => {
    const checkboxField = document.querySelector('input[name="checkboxField"]') as HTMLElement;
    await expect(checkboxField).not.toBeChecked();
    await expect(checkboxField).toBeDisabled();
  }
}`,...(_=(W=l.parameters)==null?void 0:W.docs)==null?void 0:_.source}}};var M,H,N;p.parameters={...p.parameters,docs:{...(M=p.parameters)==null?void 0:M.docs,source:{originalSource:`{
  name: 'Disabled and Active',
  args: {
    name: 'checkboxField',
    label: 'Option',
    description: 'Optional description text goes here',
    disabled: true,
    checked: true
  },
  play: async () => {
    const checkboxField = document.querySelector('input[name="checkboxField"]') as HTMLElement;
    await expect(checkboxField).toBeChecked();
    await expect(checkboxField).toBeDisabled();
  }
}`,...(N=(H=p.parameters)==null?void 0:H.docs)==null?void 0:N.source}}};var z,P,U;h.parameters={...h.parameters,docs:{...(z=h.parameters)==null?void 0:z.docs,source:{originalSource:`{
  name: 'Active with label and description as Nodes',
  args: {
    name: 'checkboxField',
    label: <span>Option</span>,
    description: <div>Optional description text goes here</div>,
    checked: true
  },
  play: async () => {
    const checkboxField = document.querySelector('input[name="checkboxField"]') as HTMLElement;
    await expect(checkboxField).toBeChecked();
  }
}`,...(U=(P=h.parameters)==null?void 0:P.docs)==null?void 0:U.source}}};var I,K,R;b.parameters={...b.parameters,docs:{...(I=b.parameters)==null?void 0:I.docs,source:{originalSource:`{
  name: 'With a link in the label',
  args: {
    name: 'checkboxField',
    label: <span>
        Option with{' '}
        <a href="https://www.adobe.com" target="_blank" rel="noreferrer">
          a link
        </a>{' '}
        and a{' '}
        <a href="https://www.adobe.com" target="_blank" rel="noreferrer">
          second link
        </a>
      </span>,
    description: 'Optional description text goes here',
    checked: false
  },
  play: async () => {
    const checkboxField = document.querySelector('input[name="checkboxField"]') as HTMLElement;
    const checkboxLink = document.querySelector('.dropin-checkbox a') as HTMLElement;
    await expect(checkboxField).not.toBeChecked();
    await expect(checkboxLink).toBeDefined();
  }
}`,...(R=(K=b.parameters)==null?void 0:K.docs)==null?void 0:R.source}}};var V,Y,j;k.parameters={...k.parameters,docs:{...(V=k.parameters)==null?void 0:V.docs,source:{originalSource:`{
  name: 'With a long label',
  args: {
    name: 'checkboxField',
    label: <span style={{
      width: '200px',
      display: 'inline-block'
    }}>
        Option with{' '}
        <a href="https://www.adobe.com" target="_blank" rel="noreferrer">
          a link
        </a>{' '}
        and a{' '}
        <a href="https://www.adobe.com" target="_blank" rel="noreferrer">
          second link
        </a>{' '}
        plus a long text to test the wrapping and the checkbox alignment to the
        top of the label
      </span>,
    description: 'Optional description text goes here',
    checked: false
  },
  play: async () => {
    const checkboxField = document.querySelector('input[name="checkboxField"]') as HTMLElement;
    const checkboxLink = document.querySelector('.dropin-checkbox a') as HTMLElement;
    await expect(checkboxField).not.toBeChecked();
    await expect(checkboxLink).toBeDefined();
  }
}`,...(j=(Y=k.parameters)==null?void 0:Y.docs)==null?void 0:j.source}}};const $=["Primary","CheckboxEnabledAndActive","CheckboxEnabledAndNotActiveWithError","CheckboxEnabledAndActiveWithError","CheckboxDisabled","CheckboxDisabledWithALink","CheckboxDisabledAndActive","CheckboxWithNodeLabelAndDescription","CheckboxWithALink","CheckboxWithLongLabel"];export{d as CheckboxDisabled,p as CheckboxDisabledAndActive,l as CheckboxDisabledWithALink,i as CheckboxEnabledAndActive,s as CheckboxEnabledAndActiveWithError,r as CheckboxEnabledAndNotActiveWithError,b as CheckboxWithALink,k as CheckboxWithLongLabel,h as CheckboxWithNodeLabelAndDescription,n as Primary,$ as __namedExportsOrder,Z as default};
//# sourceMappingURL=Checkbox.stories-C743G80g.js.map
