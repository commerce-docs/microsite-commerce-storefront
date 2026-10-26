/*! Copyright 2026 Adobe
All Rights Reserved. */
import{a9 as o,a as e,C as h,B as U,r as q,E as A,T as u,A as _,aa as g}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const{expect:l}=__STORYBOOK_MODULE_TEST__,M={title:"Components/ProgressSpinner",component:o,argTypes:{size:{type:"select",table:{defaultValue:{summary:"small"}},options:["small","medium","big","large"],description:"Size of the spinner"},stroke:{type:"select",table:{defaultValue:{summary:"4"}},options:["1","2","3","4"],description:"Stroke of the spinner"},active:{type:"boolean",table:{defaultValue:{summary:"true"}},options:[!0,!1],description:"Whether the spinner is active or not (not a prop, just for story)."},ariaLabel:{type:{required:!1,name:"string"},table:{defaultValue:{summary:"Updating"}},description:"Aria label for the spinner"}},parameters:{docs:{description:{component:"Use Progress Spinners to display ongoing activity or loading status."}}}},n={args:{ariaLabel:"Updating",size:"small",stroke:"4"},render:({ariaLabel:a,size:t,stroke:s})=>e(o,{"aria-label":a,size:t,stroke:s}),play:async()=>{const a=document.querySelector('div[class*="dropin-progress-spinner"]');await l(a).toBeVisible()}},d={args:{ariaLabel:"Updating",size:"large",stroke:"4",active:!0},render:({ariaLabel:a,size:t,stroke:s,active:r})=>{const i=e(h,{variant:"secondary",children:[e("h2",{style:{font:"var(--type-headline-2-strong-font)"},children:"Title"}),e("p",{style:{font:"var(--type-body-2-default-font)"},children:"This is a short description of the item and should be kept to two or three lines as maximum."}),e(_,{disabled:r,children:"Action"})]});return r?e(o,{"aria-label":a,size:t,stroke:s,style:{backgroundColor:"var(--color-neutral-200);"},children:i}):i},play:async()=>{const a=document.querySelector('div[class*="dropin-progress-spinner"]');await l(a).toBeVisible()}},c={args:{ariaLabel:"Updating",size:"medium",stroke:"4",active:!0},render:({ariaLabel:a,size:t,stroke:s,active:r})=>{const i=e("div",{children:[e("p",{style:{font:"var(--type-body-2-default-font)"},children:"This is a short description of the item and should be kept to two or three lines as maximum."}),e(g,{label:"Option 1",value:"1",name:"radio",description:"first option",disabled:r}),e(g,{label:"Option 2",value:"2",name:"radio",description:"second option",disabled:r})]});return e(h,{variant:"secondary",children:[e("h2",{style:{font:"var(--type-headline-2-strong-font)"},children:"Title"}),r?e(o,{"aria-label":a,size:t,stroke:s,children:i}):i]})},play:async()=>{const a=document.querySelector('div[class*="dropin-progress-spinner"]');await l(a).toBeVisible()}},p={args:{ariaLabel:"Updating",size:"small",stroke:"2",active:!0},render:({ariaLabel:a,size:t,stroke:s,active:r})=>e(h,{variant:"secondary",children:[e("h2",{style:{font:"var(--type-headline-2-strong-font)"},children:"Title"}),e("p",{style:{font:"var(--type-body-2-default-font)"},children:"This is a short description of the item and should be kept to two or three lines as maximum."}),e("div",{children:e(U,{size:"medium",style:{width:"100%",background:"var(--color-brand-500) 0 0% no-repeat padding-box"},"aria-hidden":r,"aria-label":r?"loading":"Action",disabled:r,children:r?[e(o,{"aria-label":a,tabIndex:-1,size:t,stroke:s},"spinner")]:["Action!",e(q,{source:A,size:"24",className:"storybook_icon",stroke:"1",viewBox:"0 0 24 24","aria-label":"Search"},"4")]})})]}),play:async()=>{const a=document.querySelector('div[class*="dropin-progress-spinner"]');await l(a).toBeVisible()}},m={args:{ariaLabel:"Updating",size:"small",stroke:"2"},render:({ariaLabel:a,size:t,stroke:s})=>e(o,{"aria-label":a,size:t,stroke:s,children:e("div",{style:{display:"flex",justifyContent:"space-between",gap:"20px"},children:[e(u,{name:"imageSwatchField",id:"imageSwatchExample1",src:"https://picsum.photos/20/20",value:"imageExample",disabled:!0}),e(u,{name:"imageSwatchField",id:"imageSwatchExample2",src:"https://picsum.photos/20/20",value:"imageExample",disabled:!0}),e(u,{name:"imageSwatchField",id:"imageSwatchExample3",src:"https://picsum.photos/20/20",value:"imageExample",selected:!0,disabled:!0})]})}),play:async()=>{const a=document.querySelector('div[class*="dropin-progress-spinner"]');await l(a).toBeVisible()}};var b,y,v,S,f;n.parameters={...n.parameters,docs:{...(b=n.parameters)==null?void 0:b.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Updating',
    size: 'small',
    stroke: '4'
  },
  render: ({
    ariaLabel,
    size,
    stroke
  }) => <ProgressSpinner aria-label={ariaLabel} size={size} stroke={stroke} />,
  play: async () => {
    const loaderIcon = document.querySelector('div[class*="dropin-progress-spinner"]') as HTMLElement;
    await expect(loaderIcon).toBeVisible();
  }
}`,...(v=(y=n.parameters)==null?void 0:y.docs)==null?void 0:v.source},description:{story:"```ts\nimport { ProgressSpinner } from '@adobe-commerce/elsie/components/ProgressSpinner';\n```",...(f=(S=n.parameters)==null?void 0:S.docs)==null?void 0:f.description}}};var k,w,x;d.parameters={...d.parameters,docs:{...(k=d.parameters)==null?void 0:k.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Updating',
    size: 'large',
    stroke: '4',
    active: true
  },
  render: ({
    ariaLabel,
    size,
    stroke,
    active
  }) => {
    const components = <Card variant={'secondary'}>
        <h2 style={{
        font: 'var(--type-headline-2-strong-font)'
      }}>Title</h2>
        <p style={{
        font: 'var(--type-body-2-default-font)'
      }}>
          This is a short description of the item and should be kept to two or
          three lines as maximum.
        </p>
        <ActionButton disabled={active} children={'Action'} />
      </Card>;
    return active ? <ProgressSpinner aria-label={ariaLabel} size={size} stroke={stroke} style={{
      backgroundColor: 'var(--color-neutral-200);'
    }}>
        {components}
      </ProgressSpinner> : components;
  },
  play: async () => {
    const loaderIcon = document.querySelector('div[class*="dropin-progress-spinner"]') as HTMLElement;
    await expect(loaderIcon).toBeVisible();
  }
}`,...(x=(w=d.parameters)==null?void 0:w.docs)==null?void 0:x.source}}};var z,L,B;c.parameters={...c.parameters,docs:{...(z=c.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Updating',
    size: 'medium',
    stroke: '4',
    active: true
  },
  render: ({
    ariaLabel,
    size,
    stroke,
    active
  }) => {
    const components = <div>
        <p style={{
        font: 'var(--type-body-2-default-font)'
      }}>
          This is a short description of the item and should be kept to two or
          three lines as maximum.
        </p>
        <RadioButton label={'Option 1'} value={'1'} name={'radio'} description={'first option'} disabled={active} />
        <RadioButton label={'Option 2'} value={'2'} name={'radio'} description={'second option'} disabled={active} />
      </div>;
    return <Card variant={'secondary'}>
        <h2 style={{
        font: 'var(--type-headline-2-strong-font)'
      }}>Title</h2>
        {active ? <ProgressSpinner aria-label={ariaLabel} size={size} stroke={stroke}>
            {components}
          </ProgressSpinner> : components}
      </Card>;
  },
  play: async () => {
    const loaderIcon = document.querySelector('div[class*="dropin-progress-spinner"]') as HTMLElement;
    await expect(loaderIcon).toBeVisible();
  }
}`,...(B=(L=c.parameters)==null?void 0:L.docs)==null?void 0:B.source}}};var I,T,E;p.parameters={...p.parameters,docs:{...(I=p.parameters)==null?void 0:I.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Updating',
    size: 'small',
    stroke: '2',
    active: true
  },
  render: ({
    ariaLabel,
    size,
    stroke,
    active
  }) => <Card variant={'secondary'}>
      <h2 style={{
      font: 'var(--type-headline-2-strong-font)'
    }}>Title</h2>
      <p style={{
      font: 'var(--type-body-2-default-font)'
    }}>
        This is a short description of the item and should be kept to two or
        three lines as maximum.
      </p>
      <div>
        <Button size="medium" style={{
        width: '100%',
        background: 'var(--color-brand-500) 0 0% no-repeat padding-box'
      }} aria-hidden={active} aria-label={active ? 'loading' : 'Action'} disabled={active} children={active ? [<ProgressSpinner aria-label={ariaLabel} tabIndex={-1} size={size} stroke={stroke} key="spinner" />] : ['Action!', <Icon source={Search} size="24" className="storybook_icon" stroke="1" viewBox="0 0 24 24" aria-label="Search" key={'4'} />]} />
      </div>
    </Card>,
  play: async () => {
    const loaderIcon = document.querySelector('div[class*="dropin-progress-spinner"]') as HTMLElement;
    await expect(loaderIcon).toBeVisible();
  }
}`,...(E=(T=p.parameters)==null?void 0:T.docs)==null?void 0:E.source}}};var C,V,P;m.parameters={...m.parameters,docs:{...(C=m.parameters)==null?void 0:C.docs,source:{originalSource:`{
  args: {
    ariaLabel: 'Updating',
    size: 'small',
    stroke: '2'
  },
  render: ({
    ariaLabel,
    size,
    stroke
  }) => {
    return <ProgressSpinner aria-label={ariaLabel} size={size} stroke={stroke}>
        <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '20px'
      }}>
          <ImageSwatch name="imageSwatchField" id="imageSwatchExample1" src="https://picsum.photos/20/20" value="imageExample" disabled={true} />
          <ImageSwatch name="imageSwatchField" id="imageSwatchExample2" src="https://picsum.photos/20/20" value="imageExample" disabled={true} />
          <ImageSwatch name="imageSwatchField" id="imageSwatchExample3" src="https://picsum.photos/20/20" value="imageExample" selected={true} disabled={true} />
        </div>
      </ProgressSpinner>;
  },
  play: async () => {
    const loaderIcon = document.querySelector('div[class*="dropin-progress-spinner"]') as HTMLElement;
    await expect(loaderIcon).toBeVisible();
  }
}`,...(P=(V=m.parameters)==null?void 0:V.docs)==null?void 0:P.source}}};const R=["SmallSpinner","LargeSpinnerWithCard","MediumSpinnerWithRadio","SmallSpinnerReplaceButton","SpinnerForBoxShadow"];export{d as LargeSpinnerWithCard,c as MediumSpinnerWithRadio,n as SmallSpinner,p as SmallSpinnerReplaceButton,m as SpinnerForBoxShadow,R as __namedExportsOrder,M as default};
//# sourceMappingURL=ProgressSpinner.stories-CYY2-iiP.js.map
