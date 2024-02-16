import {
  inject,
  h,
  getCurrentInstance,
  provide,
} from "../../lib/guide-mini-vue/esm.js";

export const FooChild = {
  setup() {
    const fooValue = inject("fooKey");
    const appValue = inject("appKey");
    // const baz = inject("baz", () => "baz");
    provide("baz", "baz");
    const baz = inject("baz");

    const instance = getCurrentInstance();
    console.log("🚀 ~ file: FooChild.js:8 ~ setup ~ instance:", instance);

    return {
      fooValue,
      appValue,
      baz,
    };
  },
  render() {
    return h(
      "div",
      {},
      `Fool child: fooKey: ${this.fooValue}----appKey: ${this.appValue}---baz: ${this.baz}`
    );
  },
};
