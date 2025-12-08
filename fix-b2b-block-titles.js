import { readFileSync, writeFileSync } from 'fs';

// Map of file names to correct titles and sidebar labels
const titleMap = {
    // Purchase Order blocks
    'commerce-b2b-po-approval-flow.mdx': {
        title: 'Purchase Order Approval Flow',
        label: 'PO Approval Flow'
    },
    'commerce-b2b-po-approval-rule-details.mdx': {
        title: 'Purchase Order Approval Rule Details',
        label: 'PO Approval Rule Details'
    },
    'commerce-b2b-po-approval-rule-form.mdx': {
        title: 'Purchase Order Approval Rule Form',
        label: 'PO Approval Rule Form'
    },
    'commerce-b2b-po-approval-rules-list.mdx': {
        title: 'Purchase Order Approval Rules List',
        label: 'PO Approval Rules List'
    },
    'commerce-b2b-po-checkout-success.mdx': {
        title: 'Purchase Order Checkout Success',
        label: 'PO Checkout Success'
    },
    'commerce-b2b-po-comment-form.mdx': {
        title: 'Purchase Order Comment Form',
        label: 'PO Comment Form'
    },
    'commerce-b2b-po-comments-list.mdx': {
        title: 'Purchase Order Comments List',
        label: 'PO Comments List'
    },
    'commerce-b2b-po-company-purchase-orders.mdx': {
        title: 'Purchase Order Company Purchase Orders',
        label: 'PO Company Purchase Orders'
    },
    'commerce-b2b-po-customer-purchase-orders.mdx': {
        title: 'Purchase Order Customer Purchase Orders',
        label: 'PO Customer Purchase Orders'
    },
    'commerce-b2b-po-header.mdx': {
        title: 'Purchase Order Header',
        label: 'PO Header'
    },
    'commerce-b2b-po-history-log.mdx': {
        title: 'Purchase Order History Log',
        label: 'PO History Log'
    },
    'commerce-b2b-po-require-approval-purchase-orders.mdx': {
        title: 'Purchase Order Require Approval Purchase Orders',
        label: 'PO Require Approval Purchase Orders'
    },
    'commerce-b2b-po-status.mdx': {
        title: 'Purchase Order Status',
        label: 'PO Status'
    },

    // Quote Management blocks
    'commerce-b2b-negotiable-quote.mdx': {
        title: 'Negotiable Quote',
        label: 'Negotiable Quote'
    },
    'commerce-b2b-negotiable-quote-template.mdx': {
        title: 'Negotiable Quote Template',
        label: 'Negotiable Quote Template'
    },
    'commerce-b2b-quote-checkout.mdx': {
        title: 'Quote Checkout',
        label: 'Quote Checkout'
    },

    // Requisition List blocks
    'commerce-b2b-requisition-list.mdx': {
        title: 'Requisition Lists',
        label: 'Requisition Lists'
    },
    'commerce-b2b-requisition-list-view.mdx': {
        title: 'Requisition List View',
        label: 'Requisition List View'
    },

    // Company Management blocks
    'commerce-company-accept-invitation.mdx': {
        title: 'Company Accept Invitation',
        label: 'Company Accept Invitation'
    },
    'commerce-company-create.mdx': {
        title: 'Company Create',
        label: 'Company Create'
    },
    'commerce-company-credit.mdx': {
        title: 'Company Credit',
        label: 'Company Credit'
    },
    'commerce-company-profile.mdx': {
        title: 'Company Profile',
        label: 'Company Profile'
    },
    'commerce-company-roles-permissions.mdx': {
        title: 'Company Roles and Permissions',
        label: 'Company Roles and Permissions'
    },
    'commerce-company-structure.mdx': {
        title: 'Company Structure',
        label: 'Company Structure'
    },
    'commerce-company-users.mdx': {
        title: 'Company Users',
        label: 'Company Users'
    },

    // Checkout Account blocks
    'commerce-account-nav.mdx': {
        title: 'Account Navigation',
        label: 'Account Navigation'
    },
    'commerce-checkout-success.mdx': {
        title: 'Checkout Success',
        label: 'Checkout Success'
    },
    'commerce-customer-company.mdx': {
        title: 'Customer Company',
        label: 'Customer Company'
    }
};

let fixed = 0;

for (const [filename, { title, label }] of Object.entries(titleMap)) {
    const filePath = `src/content/docs/merchants/blocks/${filename}`;

    try {
        let content = readFileSync(filePath, 'utf8');

        // Replace title
        content = content.replace(/^title: .+$/m, `title: ${title}`);

        // Replace sidebar label
        content = content.replace(/^  label: .+$/m, `  label: ${label}`);

        writeFileSync(filePath, content, 'utf8');
        fixed++;
        console.log(`✓ ${filename}`);
    } catch (err) {
        console.log(`✗ ${filename}: ${err.message}`);
    }
}

console.log(`\n✅ Fixed titles and labels in ${fixed} B2B blocks`);

