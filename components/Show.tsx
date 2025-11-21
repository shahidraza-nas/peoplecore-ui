import { ReactNode } from "react";

interface ShowProps {
  children: ReactNode;
}

interface ShowWhenProps {
  isTrue: boolean;
  children: ReactNode;
}

/**
 * Show component for conditional rendering
 * @example
 * <Show>
 *   <Show.When isTrue={isLoading}>
 *     <Spinner />
 *   </Show.When>
 *   <Show.Else>
 *     <Content />
 *   </Show.Else>
 * </Show>
 */
export const Show = ({ children }: ShowProps) => <>{children}</>;

Show.When = ({ isTrue, children }: ShowWhenProps) => (isTrue ? <>{children}</> : null);

Show.Else = ({ children }: ShowProps) => <>{children}</>;

Show.displayName = "Show";
Show.When.displayName = "Show.When";
Show.Else.displayName = "Show.Else";
