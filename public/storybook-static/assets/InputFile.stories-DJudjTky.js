/*! Copyright 2026 Adobe
All Rights Reserved. */
import{X as r}from"./iframe-BXfH8Ezb.js";import{I as n}from"./Icon.stories.helpers-CaF-J1Nd.js";import"./preload-helper-C1FmrZbK.js";const{action:c}=__STORYBOOK_MODULE_ACTIONS__,f={title:"Components/InputFile",component:r,argTypes:{label:{description:"Label for the input file.",type:"string"},accept:{description:"Restrict selectable file types",type:"string"},multiple:{description:"Allow multiple files selection.",type:{name:"boolean",required:!1}},id:{description:"id",type:{required:!1,name:"string"},control:"text"},onChange:{description:"Handler for when the file selection changes.",control:!1,table:{type:{summary:"function"}}},icon:{description:"Optional icon.",table:{type:{summary:"FunctionComponent"}},options:Object.keys(n),mapping:n,control:"select"}},parameters:{docs:{description:{component:"Use InputFile to upload files."}}}},e={args:{label:"Upload File",id:"single-file-input",accept:".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .csv, .jpg, .jpeg, .png, .gif, .bmp, .tiff, .ico, .webp",onChange:c("onChange"),icon:"none"}},t={args:{label:"Upload Multiple Files",id:"multiple-files-input",accept:".pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .csv, .jpg, .jpeg, .png, .gif, .bmp, .tiff, .ico, .webp",multiple:!0,onChange:c("onChange"),icon:"none"}};var p,o,i;e.parameters={...e.parameters,docs:{...(p=e.parameters)==null?void 0:p.docs,source:{originalSource:`{
  args: {
    label: 'Upload File',
    id: 'single-file-input',
    accept: '.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .csv, .jpg, .jpeg, .png, .gif, .bmp, .tiff, .ico, .webp',
    onChange: action('onChange'),
    icon: 'none' as any
  }
}`,...(i=(o=e.parameters)==null?void 0:o.docs)==null?void 0:i.source}}};var l,s,a;t.parameters={...t.parameters,docs:{...(l=t.parameters)==null?void 0:l.docs,source:{originalSource:`{
  args: {
    label: 'Upload Multiple Files',
    id: 'multiple-files-input',
    accept: '.pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, .txt, .csv, .jpg, .jpeg, .png, .gif, .bmp, .tiff, .ico, .webp',
    multiple: true,
    onChange: action('onChange'),
    icon: 'none' as any
  }
}`,...(a=(s=t.parameters)==null?void 0:s.docs)==null?void 0:a.source}}};const u=["Default","MultipleFiles"];export{e as Default,t as MultipleFiles,u as __namedExportsOrder,f as default};
//# sourceMappingURL=InputFile.stories-DJudjTky.js.map
