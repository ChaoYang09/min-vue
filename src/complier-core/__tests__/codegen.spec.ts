import { generate } from "../codegen";
import { baseParse } from "../parse"
import { transform } from "../transform"
import { transformElement } from "../transforms/transformElement";
import { transformExpression } from "../transforms/transformExpression";
import { transformText } from "../transforms/transformText";

describe("codegen", () => {
  it('string', () => {
    const ast = baseParse("{{hello}}");
    transform(ast, {
      nodeTransforms: [transformExpression]
    })
    const { code } = generate(ast)
    expect(code).toMatchSnapshot()
  })

  test("element and interpolation", () => {
    const ast = baseParse("<div>hi,{{msg}}</div>");
    transform(ast, {
      nodeTransforms: [transformElement, transformText, transformExpression],
    });

    const { code } = generate(ast);
    expect(code).toMatchSnapshot();
  });


})