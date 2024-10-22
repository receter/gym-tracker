When importing CSS module styles, please use the following syntax:

```javascript
import styles from "./styles.module.css";
```

If you name a CSS class for the outer most element of a component, please prefer to use the name of the component in camelCase. For example `MyComponent` should have a class name of `myComponent`.

When creating event handlers, please prefer `function handleClick() {}` over `const handleClick = () => {}`.
