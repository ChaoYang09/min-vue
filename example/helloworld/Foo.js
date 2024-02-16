import {
  h,
  renderSlot,
  getCurrentInstance,
  inject,
  provide,
} from "../../lib/guide-mini-vue/esm.js";
import { FooChild } from "./FooChild.js";

export const Foo = {
  setup(props, { emit }) {
    // props只读
    // props.count++;
    // console.log("Foo Props", props);
    const emitAdd = () => {
      emit("add", 1, 2);
      emit("add-foo");
    };
    return {
      emitAdd,
    };
  },
  render() {
    const instance = getCurrentInstance();
    // console.log(instance);
    const name = "foo prop";
    const appValue = inject("appKey");
    console.log(appValue);
    provide("fooKey", "fooValue");
    provide("appKey", "app_foo_Value");

    const btn = h("button", { onClick: this.emitAdd }, "add");
    const count = h("div", { class: "yellow" }, `count:${this.count}`);
    return h("div", {}, [
      count,
      btn,
      renderSlot(this.$slots, "footer", name),
      renderSlot(this.$slots, "header", name),
      h(FooChild),
    ]);
  },
};
