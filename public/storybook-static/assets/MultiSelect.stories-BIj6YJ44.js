/*! Copyright 2026 Adobe
All Rights Reserved. */
import{$ as ne,a0 as x,a1 as se,a as I,a2 as oe}from"./iframe-CKgIZA8l.js";import"./preload-helper-C1FmrZbK.js";const{expect:t,userEvent:o,waitFor:b,within:c}=__STORYBOOK_MODULE_TEST__,ie={title:"Components/MultiSelect",component:ne,parameters:{layout:"fullscreen",docs:{description:{component:`
The MultiSelect component allows users to select multiple options from a dropdown list. 
It includes features like search filtering, keyboard navigation, bulk selection/deselection, 
and comprehensive accessibility support.

## Key Features
- **Keyboard Navigation**: Full arrow key navigation with Enter to select
- **Search Filtering**: Type to filter available options
- **Bulk Actions**: Select All and Deselect All buttons
- **Accessibility**: Screen reader announcements, proper ARIA attributes
- **Floating Labels**: Optional floating label support
- **Error/Success States**: Visual feedback for form validation
        `}},a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},args:{options:[],value:[]},argTypes:{onChange:{action:"changed"},options:{description:"Array of selectable options",control:{type:"object"}},value:{description:"Currently selected values",control:{type:"object"}},placeholder:{description:"Placeholder text shown when no options are selected",control:{type:"text"}},floatingLabel:{description:"Floating label text",control:{type:"text"}},disabled:{description:"Disable the entire component",control:{type:"boolean"}},error:{description:"Show error state styling",control:{type:"boolean"}},success:{description:"Show success state styling",control:{type:"boolean"}}}},l={render:n=>{const[e]=x(()=>[1,2,3,4,5,6,7,8,9,10].map(i=>({value:i,label:`Option ${i}`}))),[a,s]=x(()=>n.value||[]);return se(()=>{s(n.value||[])},[]),I("div",{style:{minHeight:"400px",padding:"50px"},children:[I("label",{htmlFor:`${n.id||n.name||"multi-select-sdk"}-search`,style:{position:"absolute",width:"1px",height:"1px",padding:0,margin:"-1px",overflow:"hidden",clip:"rect(0 0 0 0)",whiteSpace:"nowrap",border:0},children:"Search"}),oe(ne,{...n,key:JSON.stringify(n.value??[]),options:e,value:a,onChange:s})]})}},d={...l,parameters:{layout:"fullscreen",a11y:{config:{rules:[{id:"color-contrast",enabled:!1}]}}},args:{placeholder:"Select your options",selectAllText:"Select All",deselectAllText:"Deselect All",noResultsText:"No results found",name:"example-multi-select",disabled:!1,floatingLabel:"",error:!1,success:!1,id:"multi-select-id"},play:async({canvasElement:n})=>{const e=c(n),a=e.getByTestId("multi-select-container");await t(e.getByTestId("multi-select")).toBeInTheDocument(),await t(e.queryByTestId("multi-select-dropdown")).not.toBeInTheDocument(),await o.click(a),await t(e.getByTestId("multi-select-dropdown")).toBeInTheDocument(),await t(e.getByTestId("multi-select-options")).toBeInTheDocument(),await t(e.getByTestId("multi-select-select-all")).toBeInTheDocument(),await t(e.getByTestId("multi-select-deselect-all")).toBeInTheDocument();const s=e.getByTestId("multi-select-option-0");await o.click(s),await t(s.className).toMatch(/--selected/);const i=e.getByTestId("multi-select-tags-area");await t(i).toHaveTextContent("Option 1")}},p={...l,args:{floatingLabel:"Floating label text",placeholder:"Start typing..."},play:async({canvasElement:n})=>{const a=c(n).queryByText("Floating label text");await t(a).toBeInTheDocument()}},u={...l,args:{disabled:!0},play:async({canvasElement:n})=>{const e=c(n),a=e.getByTestId("multi-select-container"),s=e.getByTestId("multi-select-hidden-input");await t(s).toBeDisabled(),await o.click(a),await t(e.queryByTestId("multi-select-dropdown")).not.toBeInTheDocument(),await t(a.className).toMatch(/--disabled/)}},m={...l,args:{error:!0},play:async({canvasElement:n})=>{const a=c(n).getByTestId("multi-select-container");await t(a.className).toMatch(/--error/)}},y={...l,args:{success:!0},play:async({canvasElement:n})=>{const a=c(n).getByTestId("multi-select-container");await t(a.className).toMatch(/--success/)}},h={...l,args:{placeholder:"Pick items",selectAllText:"Add All",deselectAllText:"Remove All",noResultsText:"Nothing matches"},play:async({canvasElement:n})=>{const e=c(n),a=e.getByTestId("multi-select-container"),s=e.getByRole("combobox");await t(s).toHaveAttribute("placeholder","Pick items"),await o.click(a),await t(e.getByTestId("multi-select-dropdown")).toBeInTheDocument(),await t(e.getByText("Add All")).toBeInTheDocument(),await t(e.getByText("Remove All")).toBeInTheDocument(),await o.clear(s),await o.type(s,"xyz"),await t(e.getByTestId("multi-select-no-results")).toHaveTextContent("Nothing matches")}},w={...l,args:{name:"custom-name",id:"custom-id"},play:async({canvasElement:n})=>{const e=c(n),a=e.getByTestId("multi-select-hidden-input");await t(a).toHaveAttribute("name","custom-name"),await t(a).toHaveAttribute("id","custom-id");const s=e.getByRole("combobox");await t(s).toHaveAttribute("id","custom-id-search")}},g={...l,args:{value:[1,3,5],placeholder:"Already selected"},play:async({canvasElement:n})=>{const e=c(n),a=e.getByTestId("multi-select-tags-area");await t(a).toBeInTheDocument(),await t(e.queryByText("Option 1")).toBeInTheDocument(),await t(e.queryByText("Option 3")).toBeInTheDocument(),await t(e.queryByText("Option 5")).toBeInTheDocument(),await t(a.className).toMatch(/--has-values/)}},v={...l,args:{placeholder:"Use keyboard to navigate"},play:async({canvasElement:n})=>{const e=c(n),a=e.getByRole("combobox");await o.click(a),await t(a).toHaveFocus(),await o.keyboard("{ArrowDown}"),await t(e.getByTestId("multi-select-dropdown")).toBeInTheDocument(),await o.keyboard("{ArrowDown}"),await o.keyboard("{Enter}");const s=e.queryAllByTestId("dropin-tag-container");await t(s.length).toBeGreaterThan(0),await o.keyboard("{Escape}"),await t(e.queryByTestId("multi-select-dropdown")).not.toBeInTheDocument(),await t(a).toHaveFocus()}},T={...l,args:{placeholder:"Type to search options"},play:async({canvasElement:n})=>{const e=c(n),a=e.getByRole("combobox");await o.type(a,"1"),await t(e.getByTestId("multi-select-dropdown")).toBeInTheDocument();const s=e.getByTestId("multi-select-option-0");await t(s).toBeInTheDocument();const i=e.getByTestId("multi-select-dropdown");await t(i).toHaveTextContent("Option 1"),await t(i).toHaveTextContent("Option 10"),await o.clear(a),await o.type(a,"xyz");const r=e.getByTestId("multi-select-no-results");await t(r).toBeInTheDocument(),await t(r).toHaveTextContent('"xyz"')}},B={...l,args:{placeholder:"Demonstrate bulk selection"},play:async({canvasElement:n})=>{const e=c(n),a=e.getByTestId("multi-select-container");await o.click(a),await t(e.getByTestId("multi-select-dropdown")).toBeInTheDocument();const s=e.getByTestId("multi-select-deselect-all");await t(s).toBeDisabled(),await b(()=>{t(e.getByTestId("multi-select-options").children.length).toBeGreaterThan(0)});const i=e.getByTestId("multi-select-select-all");await o.click(i);const r=e.getByTestId("multi-select-tags-area");await b(async()=>{await t(r).toHaveTextContent("Option 1"),await t(r).toHaveTextContent("Option 2"),await t(r).toHaveTextContent("Option 10")}),await t(s).not.toBeDisabled(),await o.click(s),await t(r).not.toHaveTextContent("Option 1"),await t(r).not.toHaveTextContent("Option 2"),await t(s).toBeDisabled()}};var A,f,D;d.parameters={...d.parameters,docs:{...(A=d.parameters)==null?void 0:A.docs,source:{originalSource:`{
  ...Template,
  parameters: {
    layout: 'fullscreen',
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
    placeholder: 'Select your options',
    selectAllText: 'Select All',
    deselectAllText: 'Deselect All',
    noResultsText: 'No results found',
    name: 'example-multi-select',
    disabled: false,
    floatingLabel: '',
    error: false,
    success: false,
    id: 'multi-select-id'
  },
  play: async ({
    canvasElement
  }: any) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('multi-select-container');

    // Verify initial state
    await expect(canvas.getByTestId('multi-select')).toBeInTheDocument();
    await expect(canvas.queryByTestId('multi-select-dropdown')).not.toBeInTheDocument();

    // Open dropdown
    await userEvent.click(container);
    await expect(canvas.getByTestId('multi-select-dropdown')).toBeInTheDocument();

    // Verify dropdown contents
    await expect(canvas.getByTestId('multi-select-options')).toBeInTheDocument();
    await expect(canvas.getByTestId('multi-select-select-all')).toBeInTheDocument();
    await expect(canvas.getByTestId('multi-select-deselect-all')).toBeInTheDocument();

    // Select an option
    const firstOption = canvas.getByTestId('multi-select-option-0');
    await userEvent.click(firstOption);

    // Verify option was selected (should show selected state)
    await expect(firstOption.className).toMatch(/--selected/);

    // Verify tag appears in the tags area (be more specific to avoid multiple matches)
    const tagsArea = canvas.getByTestId('multi-select-tags-area');
    await expect(tagsArea).toHaveTextContent('Option 1');
  }
}`,...(D=(f=d.parameters)==null?void 0:f.docs)==null?void 0:D.source}}};var E,k,S;p.parameters={...p.parameters,docs:{...(E=p.parameters)==null?void 0:E.docs,source:{originalSource:`{
  ...Template,
  args: {
    floatingLabel: 'Floating label text',
    placeholder: 'Start typing...'
  },
  play: async ({
    canvasElement
  }: any) => {
    const canvas = within(canvasElement);
    // floating label should be visible
    const label = canvas.queryByText('Floating label text');
    await expect(label).toBeInTheDocument();
  }
}`,...(S=(k=p.parameters)==null?void 0:k.docs)==null?void 0:S.source}}};var O,C,H;u.parameters={...u.parameters,docs:{...(O=u.parameters)==null?void 0:O.docs,source:{originalSource:`{
  ...Template,
  args: {
    disabled: true
  },
  play: async ({
    canvasElement
  }: any) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('multi-select-container');
    // input should be disabled and dropdown shouldn't open on click
    const hiddenInput = canvas.getByTestId('multi-select-hidden-input');
    await expect(hiddenInput).toBeDisabled();
    await userEvent.click(container);
    // dropdown should not open
    await expect(canvas.queryByTestId('multi-select-dropdown')).not.toBeInTheDocument();
    // container should have disabled class
    await expect(container.className).toMatch(/--disabled/);
  }
}`,...(H=(C=u.parameters)==null?void 0:C.docs)==null?void 0:H.source}}};var F,N,R;m.parameters={...m.parameters,docs:{...(F=m.parameters)==null?void 0:F.docs,source:{originalSource:`{
  ...Template,
  args: {
    error: true
  },
  play: async ({
    canvasElement
  }: any) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('multi-select-container');
    // container should have error class
    await expect(container.className).toMatch(/--error/);
  }
}`,...(R=(N=m.parameters)==null?void 0:N.docs)==null?void 0:R.source}}};var q,V,M;y.parameters={...y.parameters,docs:{...(q=y.parameters)==null?void 0:q.docs,source:{originalSource:`{
  ...Template,
  args: {
    success: true
  },
  play: async ({
    canvasElement
  }: any) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('multi-select-container');
    // container should have success class
    await expect(container.className).toMatch(/--success/);
  }
}`,...(M=(V=y.parameters)==null?void 0:V.docs)==null?void 0:M.source}}};var L,_,P;h.parameters={...h.parameters,docs:{...(L=h.parameters)==null?void 0:L.docs,source:{originalSource:`{
  ...Template,
  args: {
    placeholder: 'Pick items',
    selectAllText: 'Add All',
    deselectAllText: 'Remove All',
    noResultsText: 'Nothing matches'
  },
  play: async ({
    canvasElement
  }: any) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('multi-select-container');
    const input = canvas.getByRole('combobox');

    // Verify custom placeholder is used
    await expect(input).toHaveAttribute('placeholder', 'Pick items');

    // Open dropdown to check custom button texts
    await userEvent.click(container);
    await expect(canvas.getByTestId('multi-select-dropdown')).toBeInTheDocument();

    // Verify custom button texts
    await expect(canvas.getByText('Add All')).toBeInTheDocument();
    await expect(canvas.getByText('Remove All')).toBeInTheDocument();

    // Clear any existing input and type something that won't match to test no results text
    await userEvent.clear(input);
    await userEvent.type(input, 'xyz');

    // Wait for no results to appear and verify custom no results text
    await expect(canvas.getByTestId('multi-select-no-results')).toHaveTextContent('Nothing matches');
  }
}`,...(P=(_=h.parameters)==null?void 0:_.docs)==null?void 0:P.source}}};var W,z,K;w.parameters={...w.parameters,docs:{...(W=w.parameters)==null?void 0:W.docs,source:{originalSource:`{
  ...Template,
  args: {
    name: 'custom-name',
    id: 'custom-id'
  },
  play: async ({
    canvasElement
  }: any) => {
    const canvas = within(canvasElement);
    // Verify the hidden input has the correct name and id
    const hiddenInput = canvas.getByTestId('multi-select-hidden-input');
    await expect(hiddenInput).toHaveAttribute('name', 'custom-name');
    await expect(hiddenInput).toHaveAttribute('id', 'custom-id');

    // Verify the search input has the correct id pattern
    const searchInput = canvas.getByRole('combobox');
    await expect(searchInput).toHaveAttribute('id', 'custom-id-search');
  }
}`,...(K=(z=w.parameters)==null?void 0:z.docs)==null?void 0:K.source}}};var G,U,$;g.parameters={...g.parameters,docs:{...(G=g.parameters)==null?void 0:G.docs,source:{originalSource:`{
  ...Template,
  args: {
    value: [1, 3, 5],
    placeholder: 'Already selected'
  },
  play: async ({
    canvasElement
  }: any) => {
    const canvas = within(canvasElement);
    // Tags area should contain the preselected labels
    const tagArea = canvas.getByTestId('multi-select-tags-area');
    await expect(tagArea).toBeInTheDocument();
    // Check for the presence of tags - they should be rendered as Tag components
    await expect(canvas.queryByText('Option 1')).toBeInTheDocument();
    await expect(canvas.queryByText('Option 3')).toBeInTheDocument();
    await expect(canvas.queryByText('Option 5')).toBeInTheDocument();
    // Verify the tags area has the appropriate class for having values
    await expect(tagArea.className).toMatch(/--has-values/);
  }
}`,...($=(U=g.parameters)==null?void 0:U.docs)==null?void 0:$.source}}};var j,J,Y;v.parameters={...v.parameters,docs:{...(j=v.parameters)==null?void 0:j.docs,source:{originalSource:`{
  ...Template,
  args: {
    placeholder: 'Use keyboard to navigate'
  },
  play: async ({
    canvasElement
  }: any) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole('combobox');

    // Focus the input and open dropdown
    await userEvent.click(searchInput);
    await expect(searchInput).toHaveFocus();

    // Open dropdown with Arrow Down
    await userEvent.keyboard('{ArrowDown}');
    await expect(canvas.getByTestId('multi-select-dropdown')).toBeInTheDocument();

    // Test that keyboard navigation works by verifying we can:
    // 1. Open dropdown with keyboard ✓ (done above)
    // 2. Navigate and select an option
    // 3. Close dropdown with Escape

    // Navigate and select with keyboard
    await userEvent.keyboard('{ArrowDown}'); // Move to first option
    await userEvent.keyboard('{Enter}'); // Select first option

    // Verify selection occurred by checking if a tag component appears
    const tags = canvas.queryAllByTestId('dropin-tag-container');
    await expect(tags.length).toBeGreaterThan(0);

    // Test escape closes the dropdown
    await userEvent.keyboard('{Escape}');
    await expect(canvas.queryByTestId('multi-select-dropdown')).not.toBeInTheDocument();

    // Verify the search input still has focus after closing
    await expect(searchInput).toHaveFocus();
  }
}`,...(Y=(J=v.parameters)==null?void 0:J.docs)==null?void 0:Y.source}}};var Q,X,Z;T.parameters={...T.parameters,docs:{...(Q=T.parameters)==null?void 0:Q.docs,source:{originalSource:`{
  ...Template,
  args: {
    placeholder: 'Type to search options'
  },
  play: async ({
    canvasElement
  }: any) => {
    const canvas = within(canvasElement);
    const searchInput = canvas.getByRole('combobox');

    // Type to search and open dropdown
    await userEvent.type(searchInput, '1');
    await expect(canvas.getByTestId('multi-select-dropdown')).toBeInTheDocument();

    // Should show only options containing '1' (Option 1, Option 10)
    const firstFilteredOption = canvas.getByTestId('multi-select-option-0');
    await expect(firstFilteredOption).toBeInTheDocument();
    // Check the dropdown contains the filtered options
    const dropdown = canvas.getByTestId('multi-select-dropdown');
    await expect(dropdown).toHaveTextContent('Option 1');
    await expect(dropdown).toHaveTextContent('Option 10');

    // Clear search and type something that doesn't match
    await userEvent.clear(searchInput);
    await userEvent.type(searchInput, 'xyz');

    // Should show no results state
    const noResultsElement = canvas.getByTestId('multi-select-no-results');
    await expect(noResultsElement).toBeInTheDocument();
    // Verify the search term appears in quotes (the specific message may vary)
    await expect(noResultsElement).toHaveTextContent('"xyz"');
  }
}`,...(Z=(X=T.parameters)==null?void 0:X.docs)==null?void 0:Z.source}}};var ee,te,ae;B.parameters={...B.parameters,docs:{...(ee=B.parameters)==null?void 0:ee.docs,source:{originalSource:`{
  ...Template,
  args: {
    placeholder: 'Demonstrate bulk selection'
  },
  play: async ({
    canvasElement
  }: any) => {
    const canvas = within(canvasElement);
    const container = canvas.getByTestId('multi-select-container');

    // Open dropdown
    await userEvent.click(container);
    await expect(canvas.getByTestId('multi-select-dropdown')).toBeInTheDocument();

    // Initially, Deselect All should be disabled (no selections)
    const deselectAllButton = canvas.getByTestId('multi-select-deselect-all');
    await expect(deselectAllButton).toBeDisabled();

    // Wait for options to render before clicking Select All
    await waitFor(() => {
      expect(canvas.getByTestId('multi-select-options').children.length).toBeGreaterThan(0);
    });

    // Click Select All
    const selectAllButton = canvas.getByTestId('multi-select-select-all');
    await userEvent.click(selectAllButton);

    // Wait for all options to be selected - check tags appear in the tags area
    const tagsArea = canvas.getByTestId('multi-select-tags-area');
    await waitFor(async () => {
      await expect(tagsArea).toHaveTextContent('Option 1');
      await expect(tagsArea).toHaveTextContent('Option 2');
      await expect(tagsArea).toHaveTextContent('Option 10');
    });

    // Deselect All should now be enabled
    await expect(deselectAllButton).not.toBeDisabled();

    // Click Deselect All
    await userEvent.click(deselectAllButton);

    // Tags should be gone from tags area
    await expect(tagsArea).not.toHaveTextContent('Option 1');
    await expect(tagsArea).not.toHaveTextContent('Option 2');

    // Deselect All should be disabled again
    await expect(deselectAllButton).toBeDisabled();
  }
}`,...(ae=(te=B.parameters)==null?void 0:te.docs)==null?void 0:ae.source}}};const re=["DefaultView","WithFloatingLabel","DisabledState","ErrorState","SuccessState","CustomTexts","WithNameAndId","PreselectedValues","KeyboardNavigation","SearchFiltering","BulkSelectionActions"];export{B as BulkSelectionActions,h as CustomTexts,d as DefaultView,u as DisabledState,m as ErrorState,v as KeyboardNavigation,g as PreselectedValues,T as SearchFiltering,y as SuccessState,p as WithFloatingLabel,w as WithNameAndId,re as __namedExportsOrder,ie as default};
//# sourceMappingURL=MultiSelect.stories-BIj6YJ44.js.map
