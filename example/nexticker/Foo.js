import { h, ref } from "../../lib/guide-mini-vue/esm.js";

export default {
  setup({ msg }) {
    const count = ref(0);

    return {
      // msg,
    };
  },
  render() {
    console.log(this);
    return h("div", {}, `msg:${this.msg}`);
  },
};
