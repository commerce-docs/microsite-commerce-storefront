/*
 *  ADOBE CONFIDENTIAL
 *  Copyright 2024 Adobe All Rights Reserved.
 *  NOTICE:  All information contained herein is, and remains the property of Adobe and its suppliers, if any.
 *  The intellectual and technical concepts contained herein are proprietary to Adobe and its suppliers and are protected by all applicable intellectual property laws, including trade secret and copyright laws.
 *  Dissemination of this information or reproduction of this material is strictly forbidden unless prior written permission is obtained from Adobe.
 */

// This job relates to the <a href='https://experienceleague.adobe.com/developer/commerce/storefront/'>Adobe Commerce Storefront</a> microsite.<br/>
// It builds the source code from the develop branch of the <a href='https://github.com/commerce-docs/microsite-commerce-storefront'>GitHub mirror</a>, pushes it to the build branch of the <a href='https://git.corp.adobe.com/AdobeDocs/microsite-commerce-storefront'>corporate</a> mainline, and opens a draft pull request.

@Library('jenkins-shared-libs') _

micrositeBuildDeliverPipeline(
    repoName: 'microsite-commerce-storefront',
    runBuildScript: 'node --version && corepack enable && corepack prepare pnpm@latest-9 --activate && pnpm version && pnpm install && pnpm run build:prod',
    deliverBuildScript: 'cp -r dist/* storefront',
    dockerImage: 'node:20.13.1'
)
