import {
  h,
  ref,
  getCurrentInstance,
  nextTick,
} from "../../lib/guide-mini-vue/esm.js";
import Foo from "./Foo.js";
export default {
  setup() {
    const instance = getCurrentInstance();
    console.log(instance);
    const count = ref(0);
    const changeCount = async () => {
      for (let i = 0; i < 100; i++) {
        count.value++;
      }
      // nextTick(() => {
      //   console.log(instance);
      // });
      await nextTick();
      // console.log(instance);
    };
    return {
      count,
      changeCount,
    };
  },
  render() {
    return h("div", {}, [
      h("button", { onClick: this.changeCount }, "changeCount"),
      h("div", {}, `count:${this.count}`),
      h(Foo, { msg: "Foo" }, []),
    ]);
  },
};
