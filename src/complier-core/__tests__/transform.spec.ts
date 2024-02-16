import { baseParse } from "../parse"
import { transform } from "../transform"

describe("transform", () => {
  it('transform', () => {
    const ast = baseParse("hi")
    const plugin = function (node, context) {
      if (node.content === 'hi') {
        node.content = 'hi,miniVue'
      }
    }
    transform(ast, {
      nodeTransforms: [plugin]
    })
    expect(ast.children[0].content).toBe("hi,miniVue")
  })

})