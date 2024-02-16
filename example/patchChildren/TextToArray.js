import { h, ref } from "../../lib/guide-mini-vue/esm.js";
const oldChildren = "old";
const newChildren = [h("div", {}, "A"), h("div", {}, "B")];
export const TA = {
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
