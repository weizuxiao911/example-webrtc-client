import React from "react"
import { forwardRef, useEffect, useRef, useState } from "react"

import { unified } from "unified"
import remarkParse from "remark-parse"              // 文本解析成ast
import remarkFrontmatter from "remark-frontmatter"  // 前言部分（首段）解析
import remarkStringify from 'remark-stringify'      // ast转化成文本
import remarkRehype from "remark-rehype"            // 文本解析成html
import rehypeReact from "rehype-react"              // html转成react组件
import remarkGfm from 'remark-gfm'                  // 解析table等
import { visit } from 'unist-util-visit'
import Editor from '@monaco-editor/react'

import './index.css'

import { Card, Layout, Table, Typography } from "antd"

const { Title, Paragraph, Text, Link } = Typography

export type ModuleEditorProps = {
    id?: string,
    text?: string
}

let ModuleEditor: React.FC<ModuleEditorProps> = (props: ModuleEditorProps, ref: any) => {

    const [text, setText] = useState<string>(props?.text ?? '')
    const [root, setRoot] = useState<any>()
    const [data, setData] = useState<any>()

    const [current, setCurrent] = useState<number>()



    /**
     * 键盘输入
     */
    const onkeyup = (e: any) => {
        const id = e.target.dataset?.id
        const text = e.target.textContent
        const deleted = e.target.dataset.deleted
        console.log('text:', text, 'keyCode:', e.keyCode, 'deleted:', deleted)
        if ('true' === deleted && 8 === e.keyCode) {
            remove(id)
            return
        }
        if (8 === e.keyCode) {
            e.target.dataset.deleted = !text.length ? 'true' : ''
            return 
        }
        if (32 === e.keyCode) {
            update(id, text, false)
            return
        }
        if (13 === e.keyCode) {
            e?.stopPropagation()
            e?.preventDefault()
            update(id, text, true)
            return
        }
    }

    /**
     * 删除
     */
    const remove = (id: string) => {
        let i: number = 0
        const elements = root?.children.filter((it: any, index: number) => id && id === it?.data?.hProperties?.id && (i = index))
        if (elements && elements.length) {
            const el = elements[0]
            const start = el.position.start.line - 1
            const end = el.position.end.line
            let s = text.split(/\n/g)
            setCurrent(i > 0 ? (i - 1) : i)
            s.splice(start, end - start)
            setText(s.join('\n'))
        }
    }

    /**
     * 更新
     * @param id 
     * @param text 
     */
    const update = (id: string, content: any, insert?: boolean) => {
        content = content.replace(/&nbsp;/g, '').trim()
        let i: number = 0
        const elements = root?.children.filter((it: any, index: number) => id && id === it?.data?.hProperties?.id && (i = index))
        if (elements && elements.length) {
            const el = elements[0]
            const start = el.position.start.line - 1
            const end = el.position.end.line
            const els: string[] = [el.types(content)]
            if (insert) {
                els.push('\n&nbsp; ')
            }
            setCurrent(insert ? (i + 1) : i)
            let s = text.split(/\n/g)
            s.splice(start, end - start, ...els)
            setText(s.join('\n'))
        }
    }

    /**
     * 自定义组件
     */
    const components = {
        title: (props?: any) => {
            return <Title
                id={props?.id}
                data-id={props?.id}
                contentEditable
                suppressContentEditableWarning
                data-start-line={props?.position?.start?.line}
                data-start-column={props?.position?.start?.column}
                data-start-offset={props?.position?.start?.offset}
                data-end-line={props?.position?.end?.line}
                data-end-column={props?.position?.end?.column}
                data-end-offset={props?.position?.end?.offset}
                onKeyUp={onkeyup}
                level={props?.level}>{props?.children}</Title>
        },
        pre: (props?: any) => {
            return <>{props?.children}</>
        },
        p: (props?: any) => {
            return <Paragraph
                id={props?.id}
                data-id={props?.id}
                contentEditable
                suppressContentEditableWarning
                data-start-line={props?.position?.start?.line}
                data-start-column={props?.position?.start?.column}
                data-start-offset={props?.position?.start?.offset}
                data-end-line={props?.position?.end?.line}
                data-end-column={props?.position?.end?.column}
                data-end-offset={props?.position?.end?.offset}
                onKeyUp={onkeyup}>{props?.children}</Paragraph>
        },
        strong: (props?: any) => {
            return <Text contentEditable suppressContentEditableWarning strong>{props?.children}</Text>
        },
        inlineCode: (props: any) => {
            return <Text contentEditable suppressContentEditableWarning code>{props?.children}</Text>
        },
        multiCode: (props?: any) => {
            const value = props?.children[0]
            return <Card className="code-block" title={props?.lang} extra={<Text copyable={{ text: value }}></Text>} bordered={true}>
                <Editor
                    theme={props?.theme ?? 'vs-dark'} // 编辑器主题颜色
                    language={props?.lang ?? 'plain'}
                    width="100%"
                    height={((props?.lines ?? 10) + 1) * 16}
                    value={value}
                    options={{
                        folding: true, // 是否折叠
                        foldingHighlight: true, // 折叠等高线
                        foldingStrategy: 'auto', // 折叠方式  auto | indentation
                        showFoldingControls: 'always', // 是否一直显示折叠 always | mouseover
                        disableLayerHinting: true, // 等宽优化
                        emptySelectionClipboard: false, // 空选择剪切板
                        selectionClipboard: false, // 选择剪切板
                        automaticLayout: true, // 自动布局
                        codeLens: false, // 代码镜头
                        scrollBeyondLastLine: false, // 滚动完最后一行后再滚动一屏幕
                        colorDecorators: true, // 颜色装饰器
                        accessibilitySupport: 'auto', // 辅助功能支持  "auto" | "off" | "on"
                        lineNumbers: 'on', // 行号 取值： "on" | "off" | "relative" | "interval" | function
                        lineNumbersMinChars: 5, // 行号最小字符   number
                        readOnly: false, //是否只读  取值 true | false
                    }}
                />
            </Card>
        },
    }

    /**
     * 解析成mdast
     * @param text 
     * @returns 
     */
    const parse = (text: string) => {
        const beforeHandle = (node: any) => {
            node.types = (content: string) => {
                if ('heading' === node.type) {
                    return [Array(node.depth).fill("#").join(''), content].join(' ')
                }
                return content
            }
            if (!node.data) {
                node.data = {}
            }
            if (!node.data.hProperties) {
                node.data.hProperties = {}
            }
            node.data.hProperties.id = `${node.position.start.line}-${node.position.end.line}`
            node.data.hProperties.position = node.position
        }
        const processor = unified()
            .use(remarkParse)
            .use(remarkFrontmatter, { type: 'yaml', fence: '---' })
            .use(remarkGfm)
            .use(() => (tree: any) => {
                visit(tree, 'paragraph', (node: any, index: any, parent: any) => {
                    beforeHandle(node)
                    node.data.hName = 'p'
                })
                visit(tree, 'heading', (node: any, index: any, parent: any) => {
                    beforeHandle(node)
                    node.data.hName = 'title'
                    node.data.hProperties = {
                        ...node.data.hProperties,
                        level: node.depth
                    }
                })
                visit(tree, 'inlineCode', (node: any, index: any, parent: any) => {
                    beforeHandle(node)
                    node.data.hName = 'inlineCode'
                })
                visit(tree, 'code', (node: any, index: any, parent: any) => {
                    beforeHandle(node)
                    node.data.hName = 'multiCode'
                    node.data.hProperties = {
                        ...node.data.hProperties,
                        lines: node?.position?.end?.line - node?.position?.start?.line,
                        lang: node?.lang ?? '',
                        meta: new Function('return ' + node.meta + ';')
                    }
                })
                return tree
            })
        const tree = processor.parse(text.trim())
        return processor.runSync(tree)
    }

    /**
     * mdast转换文本
     * @param mdast 
     * @returns 
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
     * mdast格式化成react组件
     * @param mdast 
     * @returns 
     */
    const format = (mdast: any) => {
        const processor = unified()
            .use(remarkParse)
            .use(remarkFrontmatter, { type: 'yaml', fence: '---' })
            .use(remarkRehype)
            .use(rehypeReact, { createElement: React.createElement, components: components })
        const ast = processor.runSync(mdast)
        return processor.stringify(ast)
    }

    /**
     * 初始化
     */
    useEffect(() => {
        return () => {
            setText('')
            setRoot(null)
        }
    }, [])

    /**
     * 文本变化时
     */
    useEffect(() => {
        const _root = parse(text)
        setRoot(_root)
    }, [text])

    useEffect(() => {
        if (root) {
            const _react = format(root)
            setData(_react)
        }
    }, [root])

    useEffect(() => {
        if (data) {
            const elements = root?.children.filter((it: any, index: number) => current === index)
            if (elements && elements.length) {
                const el = elements[0]
                console.log(el)
                const html = document.getElementById(el?.data?.hProperties?.id)
                console.log(html)
                html?.focus()
                if (html) {
                    // 将光标置为最后  
                    var range = document.createRange()
                    var selection = window.getSelection()
                    range.selectNodeContents(html)
                    range.collapse(false) // collapse to end  
                    selection?.removeAllRanges()
                    selection?.addRange(range)
                }
            }
            console.log('text ->', text)
        }
    }, [data])


    return <div className="module-editor">
        {data}
    </div>

}

ModuleEditor = forwardRef(ModuleEditor as any)

export default ModuleEditor