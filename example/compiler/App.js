import {
  h,
  createTextVNode,
  getCurrentInstance,
  provide,
  inject,
  ref,
} from "../../lib/guide-mini-vue/esm.js";

window.self = null;
export const App = {
  template: `<div>{{count}}</div>`,
  setup() {
    self = this;
    const msg = "Hello vue";
    const count = (window.count = ref(0));

    return {
      msg,
      count,
    };
  },
};
