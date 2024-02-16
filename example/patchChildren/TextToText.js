import { h, ref } from "../../lib/guide-mini-vue/esm.js";
const oldChildren = "Old";
const newChildren = "New";
export const TT = {
  setup() {
    const change = ref(false);
    window.change = change;
    return {
      change,
    };
  },
  render() {
    return h("div", {}, this.change === true ? newChildren : oldChildren);
  },
};
