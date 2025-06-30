/**
 * Global Type Definitions for the TransNet project
 */

// Hono JSX Types
declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  type FC<P = {}> = (props: P & { children?: any }) => any;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  type PropsWithChildren<P = {}> = P & { children?: any };
}

// Module augmentation for Hono JSX
declare module 'hono/jsx' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export type FC<P = {}> = (props: P & { children?: any }) => any;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export type PropsWithChildren<P = {}> = P & { children?: any };
}

// This is needed to make the file a module
export {};
