import {
  h,
  createTextVNode,
  getCurrentInstance,
  provide,
  inject,
} from "../../lib/guide-mini-vue/esm.js";
import { Foo } from "./Foo.js";
window.self = null;
export const App = {
  setup() {
    const msg = "Hello vue";
    return {
      msg,
    };
  },
  render() {
    self = this;
    const instance = getCurrentInstance();
    console.log(instance);

    provide("appKey", "appValue");
    // const appValue = inject("appkey");

    const foo1 = (value) => [
      h("p", {}, `foo1 default slot ${value}`),
      createTextVNode("text vnode"),
    ];
    const foo2 = (value) => h("p", {}, `foo2 default slot ${value}`);

    return h("div", { id: "root" }, [
      h(
        "div",
        {
          class: "red",
          onClick() {
            console.log("click");
          },
        },
        "red"
      ),
      h("div", { class: "blue" }, this.msg),
      h(
        Foo,
        {
          count: 1,
          onAdd: (...arg) => {
            console.log("add", arg);
          },
          onAddFoo: (...arg) => {
            console.log("addFoo", arg);
          },
        },
        {
          header: foo1,
          footer: foo2,
        }
      ),
    ]);
  },
};
