import { accessibleOnClick, cn } from "@sys42/utils";

import styles from "./styles.module.css";

type ResourceListProps = {
  className?: string;
  children:
    | React.ReactElement<typeof ResourceListItem>
    | React.ReactElement<typeof ResourceListItem>[];
};

export const ResourceList = function ({
  children,
  className,
}: ResourceListProps) {
  return <div className={cn(styles.resourceList, className)}>{children}</div>;
};

function ResourceListItem({
  children,
  className,
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={cn(
        styles.resourceListItem,
        className,
        onClick && styles.resourceListItem_hasOnClick,
      )}
      {...(onClick && accessibleOnClick(onClick as () => void))}
    >
      {children}
    </div>
  );
}

ResourceList.Item = ResourceListItem;
