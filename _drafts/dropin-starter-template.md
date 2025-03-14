# Getting started with drop-in templates

This guide helps developers and partner agencies quickly create their own drop-in applications by leveraging Adobe Commerce's Drop-in Template repository.

## What are drop-in component templates?

The Drop-in Template repository is a GitHub Template repository. GitHub Templates allow you to create new repositories with the same directory structure, branches, and files as an existing repository. This feature is particularly useful for setting up new projects quickly and consistently.

For more information on GitHub Templates, you can refer to the following resource:
- [How to Use GitHub Repository Templates](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

## How to Use the Adobe Commerce Drop-in Template

1. **Navigate to the Template Repository**: Go to https://github.com/adobe-commerce/dropin-template.
2. **Create a New Repository**: Click on the "Use this template" button to create a new repository based on the template. This will generate a new repository with the same directory structure and files as the template.
3. **Clone Your New Repository**: You can now clone the newly created repository to your local machine using `git clone`.
4. **Install, Configure, and Launch**: Follow the instructions in your new repo's `README` file to install the dependencies, generate a configuration file, update your Mesh endpoint, and launch your development environment.

That's it! You now have a drop-in application with the same consistency and best practices that Adobe's drop-ins have, built in.

## How to Add Functionality to Your Project

If you've been following the steps in this guide, your new drop-in doesn't actually display any UI yet - let's change that.

## Adding a Shared Component to Your Project

To add a shared component from the Adobe Commerce Storefront SDK to your new project, follow these steps:

1. **Install the `@adobe-commerce/elsie ` Package**: Run the following command to install the Storefront SDK package:
   ```bash
   npm install @adobe-commerce/elsie
   ```

2. **Generate a Container**: Run the following command to generate a Container component:
   ```bash
   npx elsie generate container --pathname <MyContainer>
   ```

3. **Generate a UI Component**: Run the following command to generate a UI component:
   ```bash
   npx elsie generate component --pathname <myUIComponent>
   ```

4. **Use a Component from the SDK**: In your generated UI component, import a shared component from the Storefront SDK package and render it. For example, the `Button` component:
   ```javascript
   import { Button } from '@adobe-commerce/elsie';
   
   function MyUiComponent() {
     return (
       <div>
         <Button label="Click Me" />
       </div>
     );
   }
   ```

5. **Add your Component to your Container**: Add your component to the container created in step 2.

6. **Render the Container**: Update your sandbox environment to render your container in `examples/html-host/index.html`.

## Conclusion

By following this guide, you should be able to quickly set up a new project using the Adobe Commerce Drop-in Template and add shared components from the Storefront SDK package. If you have any questions or need further assistance, please feel free to reach out.
