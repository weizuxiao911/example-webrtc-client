import React, { ComponentType } from "react"
import { unified } from "unified"                   // 解析器
import remarkParse from "remark-parse"              // 文本解析成ast
import remarkFrontmatter from "remark-frontmatter"  // 前言部分（首段）解析
import remarkStringify from 'remark-stringify'      // ast转化成文本
import remarkRehype from "remark-rehype"            // 文本解析成html
import rehypeReact from "rehype-react"              // html转成react组件
import remarkGfm from 'remark-gfm'                  // 解析table等

import parser from './parse'
import components from './components'

const Markdown = () => {

    /**
     * markdown解析成ast
     * @param text 
     * @param visitors 
     * @returns 
     */
    const parse = (text: string) => {
        const processor = unified()
            .use(remarkParse)
            .use(remarkFrontmatter, { type: 'yaml', fence: '---' })
            .use(remarkGfm)
            .use(parser?.handle)
        const tree = processor.parse(text.trim())
        return processor.runSync(tree)
    }

    /**
     * ast转换成markdown
     */
    const stringify = (mdast: any) => {
        const processor = unified()
            .use(remarkParse)
            .use(remarkFrontmatter, { type: 'yaml', fence: '---' })
            .use(remarkGfm)
            .use(remarkStringify, {
                fences: false,
                incrementListMarker: false
            })
        return processor.stringify(mdast)
    }

    /**
     * ast转换成react组件
     * @param ast 
     * @param components 
     * @returns 
     */
    const react = (mdast: any) => {
        const processor = unified()
            .use(remarkParse)
            .use(remarkFrontmatter, { type: 'yaml', fence: '---' })
            .use(remarkRehype)
            .use(rehypeReact, { createElement: React.createElement, components: components ?? {} })
        const ast = processor.runSync(mdast)
        return processor.stringify(ast)
    }

    return {
        parse,
        stringify,
        react
    }

}

export default Markdown