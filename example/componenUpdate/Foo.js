import { h } from "../../lib/guide-mini-vue/esm.js";

export default {
  setup({ msg }) {
    return {
      // msg,
    };
  },
  render() {
    console.log(this);
    return h("div", {}, `msg:${this.msg}`);
  },
};
