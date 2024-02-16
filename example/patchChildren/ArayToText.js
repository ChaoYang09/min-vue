import { h, ref } from "../../lib/guide-mini-vue/esm.js";
const oldChildren = [h("div", {}, "A"), h("div", {}, "B")];
const newChildren = "New";
export const AT = {
  setup() {
    const change = ref(false);
    window.change = change;
    return {
      change,
    };
  },
  render() {
    // const self = this;
    // console.log(self.change);
    return h("div", {}, this.change === true ? newChildren : oldChildren);
  },
};
