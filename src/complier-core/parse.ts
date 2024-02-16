import { ElementTypes, NodeTypes } from "./ast";

const enum TagType {
  Start,
  End,
}

export function baseParse(content: string) {
  const context = createParserContext(content)
  return creaRoot(parseChildren(context, []))

}

function parseChildren(context, ancestors) {
  const nodes: any[] = []
  while (!isEnd(context, ancestors)) {
    let node
    let s = context.source
    if (s.startsWith('{{')) {
      node = parseInterpolation(context)
    } else if (s[0] === '<') {
      node = parseElement(context, ancestors)
    }

    if (!node) {
      node = parseText(context)
    }

    nodes.push(node)
  }
  // console.log(nodes);

  return nodes

}

function parseText(context) {
  const s = context.source
  const endTokens = ['<', '{{']
  let endIndex = s.length
  for (let i = 0; i < endTokens.length; i++) {
    const index = s.indexOf(endTokens[i])
    if (index !== -1 && endIndex > index) {
      endIndex = index
    }
  }
  const content = parseTextData(context, endIndex)
  return {
    type: NodeTypes.TEXT,
    content
  }
}

//处理 "{{ }}""
function parseInterpolation(context) {
  const openDelimiter = '{{'
  const closeDelimiter = '}}'

  const openLength = openDelimiter.length
  const closeIndex = context.source.indexOf(closeDelimiter, openLength)
  // 去除{{
  advanceBy(context, openLength)
  const rawContentLength = closeIndex - openLength
  const content = parseTextData(context, rawContentLength).trim()
  // 去除}}
  advanceBy(context, openLength)

  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content
    },
  }
}

function parseElement(context, ancestors) {
  const element: any = parseTag(context, TagType.Start)
  ancestors.push(element)
  element.children = parseChildren(context, ancestors)
  ancestors.pop()

  //开始结束标签匹配上，再把结束标签去掉
  if (startsWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End)
  } else {
    throw new Error(`缺少结束标签:${element.tag}`)
  }
  return element
}

function isEnd(context, ancestors) {
  let s = context.source
  if (s.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      if (startsWithEndTagOpen(s, ancestors[i].tag)) {
        return true
      }
    }
  }
  return !s
}

function startsWithEndTagOpen(source, tag) {
  return source.startsWith('</') && source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
}

function parseTag(context, type) {
  const match: any = /^<\/?([a-z]*)/i.exec(context.source)

  const tag = match[1]
  advanceBy(context, match[0].length)
  advanceBy(context, 1)
  if (type === TagType.End) return
  return {
    type: NodeTypes.ELEMENT,
    tag,
    tagType: ElementTypes.ELEMENT,
    children: [],
  }
}

function parseTextData(context, length) {
  const rawData = context.source.slice(0, length)

  advanceBy(context, length)

  return rawData
}

function advanceBy(context, numberOfCharacters) {
  context.source = context.source.slice(numberOfCharacters)
}

function createParserContext(content) {
  return {
    source: content
  }
}

function creaRoot(children) {
  return {
    type: NodeTypes.ROOT,
    children,
    helpers: []
  }
}