# Using the Adobe Commerce Drop-in Template Repository

This guide helps developers and partner agencies quickly create their own drop-in applications by leveraging Adobe Commerce's Drop-in Template repository.

## What are GitHub Templates?

The Drop-in Template repository is a GitHub Template repository. GitHub Templates allow you to create new repositories with the same directory structure, branches, and files as an existing repository. This feature is particularly useful for setting up new projects quickly and consistently.

For more information on GitHub Templates, you can refer to the following resource:
- [How to Use GitHub Repository Templates](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template)

## How to Use the Adobe Commerce Drop-in Template

1. **Navigate to the Template Repository**: Go to https://github.com/adobe-commerce/dropin-template.
2. **Create a New Repository**: Click on the "Use this template" button to create a new repository based on the template. This will generate a new repository with the same directory structure and files as the template.
3. **Clone Your New Repository**: You can now clone the newly created repository to your local machine using `git clone`.
4. **Install, Configure, and Launch**: Follow the instructions in your new repo's `README` file to install, configure, and launch your development environment.

That's it! You now have a drop-in application with the same consistency and best practices that Adobe's drop-ins have, built in.

## How to Add Functionality to Your Project

If you've been following the steps in this guide, your new drop-in doesn't actually display any UI yet - let's change that.

## Adding a Shared Component to Your Project

To add a shared component from the Adobe Commerce Storefront SDK to your new project, follow these steps:

1. **Install the `@dropins/tools` Package**: Run the following command to install the Storefront SDK package:
   ```bash
   npm install @dropins/tools
   ```

2. **Import the Component**: In your project, import the desired component from the `@dropins/tools` package. For example, to import the `Button` component, add the following line to your code:
   ```javascript
   import { Button } from '@dropins/tools';
   ```

3. **Use the Component**: Now you can use the imported component in your project. For example:
   ```javascript
   function App() {
     return (
       <div>
         <Button label="Click Me" />
       </div>
     );
   }
   ```

## Conclusion

By following this guide, you should be able to quickly set up a new project using the Adobe Commerce Drop-in Template and add shared components from the Storefront SDK package. If you have any questions or need further assistance, please feel free to reach out.
