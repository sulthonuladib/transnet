/**
 * HTMX Type Definitions for Hono JSX
 * Uses typed-htmx for proper HTMX attributes
 */

import 'typed-htmx';

declare module 'hono/jsx' {
  namespace JSX {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface HTMLAttributes extends HtmxAttributes {}
  }
}
