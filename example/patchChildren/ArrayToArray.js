import { h, ref } from "../../lib/guide-mini-vue/esm.js";
//右侧 new 比 old 多
// const oldChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ];
// const newChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
// ];

//左侧 new 比 old 多
// const oldChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ];
// const newChildren = [
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ];

//右侧 old 比 new 多
// const oldChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
// ];
// const newChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ];

//左侧 old 比 new 多
// const oldChildren = [
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ];
// const newChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
// ];

// const oldChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "F" }, "F"),
//   h("div", { key: "G" }, "G"),
// ];
// const newChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "F" }, "F"),
//   h("div", { key: "G" }, "G"),
// ];

//创建新节点
// a, b, (c, e), f, g;
// a, b, (e, c, d), f, g;
// const oldChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "F" }, "F"),
//   h("div", { key: "G" }, "G"),
// ];
// const newChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "F" }, "F"),
//   h("div", { key: "G" }, "G"),
// ];

//综合例子
// a,b,[c,d,e,z],f,g;
// a,b,[d,c,y,e],f,g;
// const oldChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "Z" }, "Z"),
//   h("div", { key: "F" }, "F"),
//   h("div", { key: "G" }, "G"),
// ];
// const newChildren = [
//   h("div", { key: "A" }, "A"),
//   h("div", { key: "B" }, "B"),
//   h("div", { key: "D" }, "D"),
//   h("div", { key: "C" }, "C"),
//   h("div", { key: "Y" }, "Y"),
//   h("div", { key: "E" }, "E"),
//   h("div", { key: "F" }, "F"),
//   h("div", { key: "G" }, "G"),
// ];

// index 作为key
const oldChildren = [
  h("div", { key: 0 }, "A"),
  h("div", { key: 1 }, "B"),
  h("div", { key: 2 }, "C"),
];
const newChildren = [
  h("div", { key: 0 }, "D"),
  h("div", { key: 1 }, "A"),
  h("div", { key: 2 }, "B"),
  h("div", { key: 3 }, "C"),
];

export const AA = {
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
