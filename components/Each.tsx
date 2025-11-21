import { Children, ReactNode } from "react";

interface EachProps<T> {
  render: (item: T, index: number) => ReactNode;
  of: T[];
}

/**
 * Each component for clean list rendering
 * @example
 * <Each
 *   of={users}
 *   render={(user, index) => <UserCard key={user.id} user={user} />}
 * />
 */
export const Each = <T,>({ render, of }: EachProps<T>) => {
  return Children.toArray(of.map((item, index) => render(item, index)));
};

Each.displayName = "Each";
