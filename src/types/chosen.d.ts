import "jquery";

declare global {
  interface JQuery {
    chosen(options?: any): JQuery;
  }
}