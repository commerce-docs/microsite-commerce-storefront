/*! Copyright 2026 Adobe
All Rights Reserved. */
import{T as b,a as t}from"./iframe-BXfH8Ezb.js";import"./preload-helper-C1FmrZbK.js";const{expect:a,within:d}=__STORYBOOK_MODULE_TEST__,{action:c}=__STORYBOOK_MODULE_ACTIONS__,s=200,n=200,J={title:"Components/ImageSwatch",component:b,argTypes:{name:{description:"Field name (used for mapping the value in a form)",type:{required:!1,name:"string"}},label:{description:"Field label",type:{required:!0,name:"string"}},id:{description:"Field id",type:{required:!1,name:"string"}},alt:{description:"Alt Text",type:{required:!1,name:"string"}},value:{description:"Field value",type:{required:!1,name:"string"}},disabled:{description:"ImageSwatch disabled",type:{required:!1,name:"boolean"}},selected:{description:"ImageSwatch active",type:{required:!1,name:"boolean"}},multi:{description:"ImageSwatch multi",type:{required:!1,name:"boolean"}},src:{description:"Image path",type:{required:!0,name:"string"}},groupAriaLabel:{description:"Label name for the swatch group",type:{name:"string"}},outOfStock:{description:"Whether or not the image swatch is out of stock",type:{required:!1,name:"boolean"}},onValue:{description:"Function to handle value changes",type:{required:!1,name:"function"}},onUpdateError:{description:"Function to handle errors",type:{required:!1,name:"function"}}},parameters:{docs:{description:{component:"Use Image Swatches to display thumbnails of photos or illustrations."}}}},r={args:{name:"imageSwatchField",id:"imageSwatch1",label:"imageSwatch1Example",groupAriaLabel:"Image Swatches",value:"imageSwatchExample",src:`https://picsum.photos/${s}/${n}`,alt:"Some alternative text",selected:!1,disabled:!1,outOfStock:!1,onValue:c("onValue")},play:async({canvasElement:e})=>{const l=await d(e).findByRole("radio"),m=document.querySelector(".dropin-image-swatch__span");a(m).toBeVisible(),await a(l).not.toBeChecked()}},u={args:{name:"imageSwatchField",id:"imageSwatch1",label:"imageSwatch1Example",groupAriaLabel:"Image Swatches",value:"imageSwatchExample",src:"https://picsum.photos/400/400",alt:"imageSwatch1Example",selected:!0,disabled:!1,outOfStock:!1,onValue:c("onValue")},play:async({canvasElement:e})=>{const i=d(e),l=await i.findByRole("radio"),m=document.querySelector(".dropin-image-swatch__span");a(m).toBeVisible(),await a(l).toBeChecked(),await a(i.getByLabelText("Image Swatches: imageSwatch1Example swatch selected")).toBeChecked()}},g={args:{name:"imageSwatchField",id:"imageSwatch1",label:"imageSwatch1Example",groupAriaLabel:"Image Swatches",value:"imageSwatchExample",src:`https://picsum.photos/${s}/${n}`,alt:"Some alternative text",selected:!1,disabled:!0,outOfStock:!1,onValue:c("onValue")},play:async({canvasElement:e})=>{const i=d(e);await a(await i.findByRole("radio")).toBeDisabled()}},p={args:{name:"imageSwatchField",id:"imageSwatch1",label:"imageSwatch1Example",groupAriaLabel:"Image Swatches",value:"imageSwatchExample",src:`https://picsum.photos/${s}/${n}`,alt:"Some alternative text",selected:!1,disabled:!1,outOfStock:!0,onValue:c("onValue")}},h={args:{name:"imageSwatchField",id:"imageSwatch1",label:"imageSwatch1Example",groupAriaLabel:"Image Swatches",value:"imageSwatchExample",src:`https://picsum.photos/${s}/${n}`,alt:"Some alternative text",selected:!0,disabled:!1,outOfStock:!0,onValue:c("onValue"),"aria-label":"image swatch example"}},S={args:{name:"imageSwatchField",id:"imageSwatch1",value:"imageSwatchExample",src:`https://picsum.photos/${s}/${n}`,alt:"Some alternative text",selected:!1,disabled:!1,outOfStock:!1,multi:!0,onValue:c("onValue"),"aria-label":"image swatch example"},render:e=>t("div",{style:"display: flex; flex-wrap:wrap; gap: 25px",children:[t(b,{...e,id:"imageSwatch1",value:"image1"}),t(b,{...e,id:"imageSwatch2",value:"image2"}),t(b,{...e,id:"imageSwatch3",value:"image1"})]})},w={args:{name:"customImageSwatch",id:"customImageSwatch1",label:"Custom Image Node VNode Example",groupAriaLabel:"Custom Image Swatches",value:"customImageNode",src:`https://picsum.photos/${s}/${n}`,alt:"Custom Image Node",selected:!1,disabled:!1,outOfStock:!1,onValue:c("onValue"),imageNode:t("div",{style:"position: relative; width: 100%; height: 100%;",children:[t("img",{src:`https://picsum.photos/${s}/${n}?grayscale`,alt:"Custom grayscale image - VNode",style:"width: 100%; height: 100%; object-fit: cover;"}),t("div",{style:"position: absolute; top: 0; left: 0; background: rgba(255,255,255,0.7); padding: 4px 8px; border-radius: 0 0 8px 0;",children:t("span",{style:"font-size: 12px; font-weight: bold; color: #333;",children:"Custom"})})]})},play:async({canvasElement:e})=>{const l=await d(e).findByRole("radio"),m=e.querySelector('div[style*="position: relative"]'),y=e.querySelector('img[alt="Custom grayscale image - VNode"]'),o=e.querySelector('span[style*="font-weight: bold"]');a(l).toBeInTheDocument(),a(m).toBeInTheDocument(),a(y).toBeInTheDocument(),a(o).toBeInTheDocument(),a(o==null?void 0:o.textContent).toBe("Custom")}},f={args:{name:"customImageSwatch",id:"customImageSwatch2",label:"Custom Image Node Render Function Example",groupAriaLabel:"Custom Image Swatches",value:"customImageNode",src:`https://picsum.photos/${s}/${n}`,alt:"Custom Image Node",selected:!1,disabled:!1,outOfStock:!1,onValue:c("onValue"),imageNode:()=>t("div",{style:"position: relative; width: 100%; height: 100%;",children:[t("img",{src:`https://picsum.photos/${s}/${n}?grayscale`,alt:"Custom grayscale image - Render Function",style:"width: 100%; height: 100%; object-fit: cover;"}),t("div",{style:"position: absolute; top: 0; left: 0; background: rgba(255,255,255,0.7); padding: 4px 8px; border-radius: 0 0 8px 0;",children:t("span",{style:"font-size: 12px; font-weight: bold; color: #333;",children:"Custom"})})]})},play:async({canvasElement:e})=>{const l=await d(e).findByRole("radio"),m=e.querySelector('div[style*="position: relative"]'),y=e.querySelector('img[alt="Custom grayscale image - Render Function"]'),o=e.querySelector('span[style*="font-weight: bold"]');a(l).toBeInTheDocument(),a(m).toBeInTheDocument(),a(y).toBeInTheDocument(),a(o).toBeInTheDocument(),a(o==null?void 0:o.textContent).toBe("Custom")}};var v,I,x,E,C;r.parameters={...r.parameters,docs:{...(v=r.parameters)==null?void 0:v.docs,source:{originalSource:`{
  args: {
    name: 'imageSwatchField',
    id: 'imageSwatch1',
    label: 'imageSwatch1Example',
    groupAriaLabel: 'Image Swatches',
    value: 'imageSwatchExample',
    src: \`https://picsum.photos/\${defaultWidth}/\${defaultHeight}\`,
    alt: 'Some alternative text',
    selected: false,
    disabled: false,
    outOfStock: false,
    onValue: action('onValue')
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const imageSwatch = await canvas.findByRole('radio');
    const spanElement = document.querySelector('.dropin-image-swatch__span') as HTMLElement;
    expect(spanElement).toBeVisible();
    await expect(imageSwatch).not.toBeChecked();
  }
}`,...(x=(I=r.parameters)==null?void 0:I.docs)==null?void 0:x.source},description:{story:"```ts\nimport { ImageSwatch } from '@adobe-commerce/elsie/components/ImageSwatch';\n```",...(C=(E=r.parameters)==null?void 0:E.docs)==null?void 0:C.description}}};var B,V,$;u.parameters={...u.parameters,docs:{...(B=u.parameters)==null?void 0:B.docs,source:{originalSource:`{
  args: {
    name: 'imageSwatchField',
    id: 'imageSwatch1',
    label: 'imageSwatch1Example',
    groupAriaLabel: 'Image Swatches',
    value: 'imageSwatchExample',
    src: \`https://picsum.photos/400/400\`,
    alt: 'imageSwatch1Example',
    selected: true,
    disabled: false,
    outOfStock: false,
    onValue: action('onValue')
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const imageSwatch = await canvas.findByRole('radio');
    const spanElement = document.querySelector('.dropin-image-swatch__span') as HTMLElement;
    expect(spanElement).toBeVisible();
    await expect(imageSwatch).toBeChecked();
    await expect(canvas.getByLabelText('Image Swatches: imageSwatch1Example swatch selected')).toBeChecked();
  }
}`,...($=(V=u.parameters)==null?void 0:V.docs)==null?void 0:$.source}}};var O,k,N;g.parameters={...g.parameters,docs:{...(O=g.parameters)==null?void 0:O.docs,source:{originalSource:`{
  args: {
    name: 'imageSwatchField',
    id: 'imageSwatch1',
    label: 'imageSwatch1Example',
    groupAriaLabel: 'Image Swatches',
    value: 'imageSwatchExample',
    src: \`https://picsum.photos/\${defaultWidth}/\${defaultHeight}\`,
    alt: 'Some alternative text',
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
}`,...(N=(k=g.parameters)==null?void 0:k.docs)==null?void 0:N.source}}};var q,T,F;p.parameters={...p.parameters,docs:{...(q=p.parameters)==null?void 0:q.docs,source:{originalSource:`{
  args: {
    name: 'imageSwatchField',
    id: 'imageSwatch1',
    label: 'imageSwatch1Example',
    groupAriaLabel: 'Image Swatches',
    value: 'imageSwatchExample',
    src: \`https://picsum.photos/\${defaultWidth}/\${defaultHeight}\`,
    alt: 'Some alternative text',
    selected: false,
    disabled: false,
    outOfStock: true,
    onValue: action('onValue')
  }
}`,...(F=(T=p.parameters)==null?void 0:T.docs)==null?void 0:F.source}}};var L,D,_;h.parameters={...h.parameters,docs:{...(L=h.parameters)==null?void 0:L.docs,source:{originalSource:`{
  args: {
    name: 'imageSwatchField',
    id: 'imageSwatch1',
    label: 'imageSwatch1Example',
    groupAriaLabel: 'Image Swatches',
    value: 'imageSwatchExample',
    src: \`https://picsum.photos/\${defaultWidth}/\${defaultHeight}\`,
    alt: 'Some alternative text',
    selected: true,
    disabled: false,
    outOfStock: true,
    onValue: action('onValue'),
    'aria-label': 'image swatch example'
  }
}`,...(_=(D=h.parameters)==null?void 0:D.docs)==null?void 0:_.source}}};var R,A,H;S.parameters={...S.parameters,docs:{...(R=S.parameters)==null?void 0:R.docs,source:{originalSource:`{
  args: {
    name: 'imageSwatchField',
    id: 'imageSwatch1',
    value: 'imageSwatchExample',
    src: \`https://picsum.photos/\${defaultWidth}/\${defaultHeight}\`,
    alt: 'Some alternative text',
    selected: false,
    disabled: false,
    outOfStock: false,
    multi: true,
    onValue: action('onValue'),
    'aria-label': 'image swatch example'
  },
  render: args => <div style="display: flex; flex-wrap:wrap; gap: 25px">
      <ImageSwatch {...args} id={'imageSwatch1'} value={'image1'} />
      <ImageSwatch {...args} id={'imageSwatch2'} value={'image2'} />
      <ImageSwatch {...args} id={'imageSwatch3'} value={'image1'} />
    </div>
}`,...(H=(A=S.parameters)==null?void 0:A.docs)==null?void 0:H.source}}};var W,M,j;w.parameters={...w.parameters,docs:{...(W=w.parameters)==null?void 0:W.docs,source:{originalSource:`{
  args: {
    name: 'customImageSwatch',
    id: 'customImageSwatch1',
    label: 'Custom Image Node VNode Example',
    groupAriaLabel: 'Custom Image Swatches',
    value: 'customImageNode',
    src: \`https://picsum.photos/\${defaultWidth}/\${defaultHeight}\`,
    // fallback, not used with imageNode
    alt: 'Custom Image Node',
    selected: false,
    disabled: false,
    outOfStock: false,
    onValue: action('onValue'),
    imageNode: <div style="position: relative; width: 100%; height: 100%;">
        <img src={\`https://picsum.photos/\${defaultWidth}/\${defaultHeight}?grayscale\`} alt="Custom grayscale image - VNode" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; top: 0; left: 0; background: rgba(255,255,255,0.7); padding: 4px 8px; border-radius: 0 0 8px 0;">
          <span style="font-size: 12px; font-weight: bold; color: #333;">
            Custom
          </span>
        </div>
      </div>
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const imageSwatch = await canvas.findByRole('radio');
    const customImageContainer = canvasElement.querySelector('div[style*="position: relative"]');
    const customImage = canvasElement.querySelector('img[alt="Custom grayscale image - VNode"]');
    const customLabel = canvasElement.querySelector('span[style*="font-weight: bold"]');
    expect(imageSwatch).toBeInTheDocument();
    expect(customImageContainer).toBeInTheDocument();
    expect(customImage).toBeInTheDocument();
    expect(customLabel).toBeInTheDocument();
    expect(customLabel?.textContent).toBe('Custom');
  }
}`,...(j=(M=w.parameters)==null?void 0:M.docs)==null?void 0:j.source}}};var z,U,K;f.parameters={...f.parameters,docs:{...(z=f.parameters)==null?void 0:z.docs,source:{originalSource:`{
  args: {
    name: 'customImageSwatch',
    id: 'customImageSwatch2',
    label: 'Custom Image Node Render Function Example',
    groupAriaLabel: 'Custom Image Swatches',
    value: 'customImageNode',
    src: \`https://picsum.photos/\${defaultWidth}/\${defaultHeight}\`,
    // fallback, not used with imageNode
    alt: 'Custom Image Node',
    selected: false,
    disabled: false,
    outOfStock: false,
    onValue: action('onValue'),
    imageNode: () => <div style="position: relative; width: 100%; height: 100%;">
        <img src={\`https://picsum.photos/\${defaultWidth}/\${defaultHeight}?grayscale\`} alt="Custom grayscale image - Render Function" style="width: 100%; height: 100%; object-fit: cover;" />
        <div style="position: absolute; top: 0; left: 0; background: rgba(255,255,255,0.7); padding: 4px 8px; border-radius: 0 0 8px 0;">
          <span style="font-size: 12px; font-weight: bold; color: #333;">
            Custom
          </span>
        </div>
      </div>
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const imageSwatch = await canvas.findByRole('radio');
    const customImageContainer = canvasElement.querySelector('div[style*="position: relative"]');
    const customImage = canvasElement.querySelector('img[alt="Custom grayscale image - Render Function"]');
    const customLabel = canvasElement.querySelector('span[style*="font-weight: bold"]');
    expect(imageSwatch).toBeInTheDocument();
    expect(customImageContainer).toBeInTheDocument();
    expect(customImage).toBeInTheDocument();
    expect(customLabel).toBeInTheDocument();
    expect(customLabel?.textContent).toBe('Custom');
  }
}`,...(K=(U=f.parameters)==null?void 0:U.docs)==null?void 0:K.source}}};const P=["DefaultImageSwatch","ImageSwatchSelected","ImageSwatchDisabled","OutOfStockImageSwatch","SelectedOutOfStockImageSwatch","MultiImageSwatch","CustomImageNodeVNodeSwatch","CustomImageNodeRenderFunctionSwatch"];export{f as CustomImageNodeRenderFunctionSwatch,w as CustomImageNodeVNodeSwatch,r as DefaultImageSwatch,g as ImageSwatchDisabled,u as ImageSwatchSelected,S as MultiImageSwatch,p as OutOfStockImageSwatch,h as SelectedOutOfStockImageSwatch,P as __namedExportsOrder,J as default};
//# sourceMappingURL=ImageSwatch.stories-BuKgv2fM.js.map
