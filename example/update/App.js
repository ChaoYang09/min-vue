import { h, ref } from "../../lib/guide-mini-vue/esm.js";

export default {
  setup() {
    const count = ref(0);
    const add = () => {
      count.value++;
    };
    const prop = ref({
      foo: "foo",
      bar: "bar",
    });
    const updateFoo = () => {
      prop.value.foo = "new-foo";
    };
    const updateBar = () => {
      prop.value.bar = null;
    };
    const deleteFoo = () => {
      prop.value = {
        bar: "bar",
      };
    };
    return {
      count,
      add,
      prop,
      updateFoo,
      updateBar,
      deleteFoo,
    };
  },
  render() {
    return h("div", { ...this.prop }, [
      h("button", { onClick: this.add }, "Add"),
      h("p", {}, `count:${this.count}`),
      h("button", { onClick: this.updateFoo }, "updateFoo"),
      h("button", { onClick: this.updateBar }, "updateBar"),
      h("button", { onClick: this.deleteFoo }, "deleteFoo"),
    ]);
  },
};
