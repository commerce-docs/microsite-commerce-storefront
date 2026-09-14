/*! Copyright 2026 Adobe
All Rights Reserved. */
import{a3 as l,a0 as d,a as u}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const{expect:s,userEvent:g,within:T}=__STORYBOOK_MODULE_TEST__,{action:S}=__STORYBOOK_MODULE_ACTIONS__,O={title:"Components/Pagination",component:l,argTypes:{totalPages:{control:{type:"number"},description:"The total number of pages in the pagination component.",defaultValue:10},currentPage:{control:{type:"number"},description:"The current active page in the pagination.",defaultValue:1},onChange:{action:"pageChanged",description:"Called when the page number is changed, and it takes the resulting page number."},routePage:{description:"Optional function that generates hrefs for each page. When provided, pagination will render anchor tags instead of buttons, enabling proper SEO and link behavior."}},parameters:{docs:{description:{component:'A component that divides large content sets into multiple pages, allowing users to navigate through the data with controls like "Next," "Previous," or page numbers, enhancing performance and usability by limiting the number of items displayed per page.'}}}},r={name:"Short pagination list",args:{totalPages:5},play:async({canvasElement:a})=>{const t=T(a),o=t.getByTestId("dropin-pagination_list-item--1"),i=t.getByTestId("dropin-pagination_list-item--2"),n=t.getByTestId("dropin-pagination_list-item--5"),e=t.getByTestId("next-button");s(o).toHaveClass("dropin-pagination_list-item--active"),s(i).not.toHaveClass("dropin-pagination_list-item--active"),await g.click(e),s(o).not.toHaveClass("dropin-pagination_list-item--active"),s(i).toHaveClass("dropin-pagination_list-item--active"),await g.click(e),await g.click(e),await g.click(e),s(n).toHaveClass("dropin-pagination_list-item--active")},render:a=>{const[t,o]=d(1),i=a.totalPages;return u(l,{totalPages:i,currentPage:t,onChange:e=>{o(e)}})}},c={name:"Long pagination list",render:()=>{const[a,t]=d(1);return u(l,{totalPages:20,currentPage:a,onChange:n=>{t(n)}})}},p={name:"As anchor tags",render:()=>{const[a,t]=d(1);return u(l,{totalPages:10,currentPage:a,onChange:(n,e)=>{e==null||e.preventDefault(),t(n),S("pageChanged")(n,e)},routePage:n=>`?page=${n}`})}};var m,P,h,C,v;r.parameters={...r.parameters,docs:{...(m=r.parameters)==null?void 0:m.docs,source:{originalSource:`{
  name: 'Short pagination list',
  args: {
    totalPages: 5
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    const item1 = canvas.getByTestId('dropin-pagination_list-item--1');
    const item2 = canvas.getByTestId('dropin-pagination_list-item--2');
    const item5 = canvas.getByTestId('dropin-pagination_list-item--5');
    const nextButton = canvas.getByTestId('next-button');
    expect(item1).toHaveClass('dropin-pagination_list-item--active');
    expect(item2).not.toHaveClass('dropin-pagination_list-item--active');
    await userEvent.click(nextButton);
    expect(item1).not.toHaveClass('dropin-pagination_list-item--active');
    expect(item2).toHaveClass('dropin-pagination_list-item--active');
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);
    await userEvent.click(nextButton);
    expect(item5).toHaveClass('dropin-pagination_list-item--active');
  },
  render: args => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = args.totalPages;
    const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
    };
    return <Pagination totalPages={totalPages} currentPage={currentPage} onChange={handlePageChange} />;
  }
}`,...(h=(P=r.parameters)==null?void 0:P.docs)==null?void 0:h.source},description:{story:"```ts\nimport { Pagination } from '@adobe-commerce/elsie/components/Pagination';\n```",...(v=(C=r.parameters)==null?void 0:C.docs)==null?void 0:v.description}}};var _,w,y;c.parameters={...c.parameters,docs:{...(_=c.parameters)==null?void 0:_.docs,source:{originalSource:`{
  name: 'Long pagination list',
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 20;
    const handlePageChange = (newPage: number) => {
      setCurrentPage(newPage);
    };
    return <Pagination totalPages={totalPages} currentPage={currentPage} onChange={handlePageChange} />;
  }
}`,...(y=(w=c.parameters)==null?void 0:w.docs)==null?void 0:y.source}}};var b,x,B;p.parameters={...p.parameters,docs:{...(b=p.parameters)==null?void 0:b.docs,source:{originalSource:`{
  name: 'As anchor tags',
  render: () => {
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = 10;
    const handlePageChange = (newPage: number, e?: Event) => {
      e?.preventDefault();
      setCurrentPage(newPage);
      action('pageChanged')(newPage, e);
    };
    return <Pagination totalPages={totalPages} currentPage={currentPage} onChange={handlePageChange} routePage={page => \`?page=\${page}\`} />;
  }
}`,...(B=(x=p.parameters)==null?void 0:x.docs)==null?void 0:B.source}}};const k=["ShortPagination","LongPagination","WithAnchors"];export{c as LongPagination,r as ShortPagination,p as WithAnchors,k as __namedExportsOrder,O as default};
//# sourceMappingURL=Pagination.stories-D4PU1msO.js.map
