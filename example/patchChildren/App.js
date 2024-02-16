import { h, ref } from "../../lib/guide-mini-vue/esm.js";

import { AT } from "./ArayToText.js";
import { TT } from "./TextToText.js";
import { TA } from "./TextToArray.js";
import { AA } from "./ArrayToArray.js";

export default {
  setup() {
    return {};
  },
  render() {
    return h("div", { id: "root" }, [h(AA)]);
  },
};
