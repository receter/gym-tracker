If you do wording for interface elements, please refer to the Associated Press Stylebook, a comprehensive guide to grammar, punctuation, and usage in journalism and other professional writing.

When importing CSS module styles, please use the following syntax:

```javascript
import styles from "./styles.module.css";
```

If you name a CSS class for the outer most element of a component, please prefer to use the name of the component in camelCase. For example `MyComponent` should have a class name of `myComponent`.

When creating event handlers, please prefer `function handleClick() {}` over `const handleClick = () => {}`.

If you create a TypeScript interface for a component props, please use type instead of interface.

If you create a new component prefer to use function keyword like `function MyComponent() {}` or `export function MyComponent() {}` if the component is exported.

In `.tsx` files you do not need to `import React from "react"` for jsx as it is automatically imported.

If you create something that has specific child components like a `List` component that has `ListItem` components use the following example as a reference:

```javascript
export const List = function ({ children }) {
  return <ul>{children}</ul>;
};

List.Item = function ({ children }) {
  return <li>{children}</li>;
};
```
