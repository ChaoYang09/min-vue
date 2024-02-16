import { ElementTypes, NodeTypes } from "../ast";
import { baseParse } from "../parse";

describe("parser", () => {
  describe("Interpolation", () => {
    test("simple interpolation", () => {
      // 1. 看看是不是一个 {{ 开头的
      // 2. 是的话，那么就作为 插值来处理
      // 3. 获取内部 message 的内容即可
      const ast = baseParse("{{ message }}");
      const interpolation = ast.children[0];

      expect(interpolation).toStrictEqual({
        type: NodeTypes.INTERPOLATION,
        content: {
          type: NodeTypes.SIMPLE_EXPRESSION,
          content: `message`,
        },
      });
    });
  });

  describe("Element", () => {
    test("simple div", () => {
      const ast = baseParse("<div>hello</div>");
      const element = ast.children[0];

      expect(element).toStrictEqual({
        type: NodeTypes.ELEMENT,
        tag: "div",
        tagType: ElementTypes.ELEMENT,
        children: [
          {
            type: NodeTypes.TEXT,
            content: "hello",
          },
        ],
      });
    });
  })

  describe("text", () => {
    test("simple text", () => {
      const ast = baseParse("some text");
      const text = ast.children[0];
      expect(text).toStrictEqual({
        type: NodeTypes.TEXT,
        content: "some text",
      });
    });
  })

  test("element with interpolation and text", () => {
    const ast = baseParse("<div>hi,{{ msg }}</div>");
    const element = ast.children[0];

    expect(element).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      tagType: ElementTypes.ELEMENT,
      children: [
        {
          type: NodeTypes.TEXT,
          content: "hi,",
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "msg",
          },
        },
      ],
    });
  });


  test("nested element", () => {
    const ast = baseParse("<div><p>hello</p>hi,{{ msg }}</div>");
    const element = ast.children[0];

    expect(element).toStrictEqual({
      type: NodeTypes.ELEMENT,
      tag: "div",
      tagType: ElementTypes.ELEMENT,
      children: [
        {
          type: NodeTypes.ELEMENT,
          tag: "p",
          tagType: ElementTypes.ELEMENT,
          children: [{
            type: NodeTypes.TEXT,
            content: "hello",
          }]
        },
        {
          type: NodeTypes.TEXT,
          content: "hi,",
        },
        {
          type: NodeTypes.INTERPOLATION,
          content: {
            type: NodeTypes.SIMPLE_EXPRESSION,
            content: "msg",
          },
        },
      ],
    });
  });

  test("should throw error when lack end tag", () => {
    expect(() => baseParse("<div><span></div>")).toThrow("缺少结束标签:span")
  })

})