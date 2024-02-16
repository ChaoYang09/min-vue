import { h, ref } from "../../lib/guide-mini-vue/esm.js";
import Foo from "./Foo.js";
export default {
  setup() {
    const msg = ref("App");
    const count = ref(0);

    const changeMsg = () => {
      msg.value = msg.value + "p";
    };
    const changeCount = () => {
      count.value++;
    };
    return {
      msg,
      count,
      changeMsg,
      changeCount,
    };
  },
  render() {
    return h("div", {}, [
      h("button", { onClick: this.changeCount }, "changeCount"),
      h("div", {}, `count:${this.count}`),
      h("button", { onClick: this.changeMsg }, "changeMsg"),
      h(Foo, { msg: this.msg }),
    ]);
  },
};
