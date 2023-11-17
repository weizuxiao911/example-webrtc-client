import { Card, Layout, Table, Typography } from "antd"
import Editor from '@monaco-editor/react'

import 'reactflow/dist/style.css'

const { Title, Paragraph, Text, Link } = Typography

const onkeydown = (e: any) => {
    console.log(e?.target?.innerHTML)
}

const Components = {
    title: (props?: any) => {
        console.log(props)
        return <Title contentEditable suppressContentEditableWarning level={props?.level} onKeyDown={onkeydown}>{props?.children}</Title>
    },
    pre: (props?: any) => {
        return <>{props?.children}</>
    },
    p: (props?: any) => {
        return <Paragraph contentEditable suppressContentEditableWarning>{props?.children}</Paragraph>
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

export default Components