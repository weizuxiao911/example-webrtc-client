import { visit } from 'unist-util-visit'

const initNode = (node: any) => {
    if (!node.data) {
        node.data = {}
    }
    if (!node.data.hProperties) {
        node.data.hProperties = {}
    }
    node.data.hProperties.position = node.position
}

const handle = (): any => {
    return (tree: any) => {
        visit(tree, 'heading', (node: any, index: any, parent: any) => {
            initNode(node)
            node.data.hName = 'title'
            node.data.hProperties = {
                ...node.data.hProperties,
                level: node.depth
            }
        })
        visit(tree, 'inlineCode', (node: any, index: any, parent: any) => {
            initNode(node)
            node.data.hName = 'inlineCode'
        })
        visit(tree, 'code', (node: any, index: any, parent: any) => {
            initNode(node)
            node.data.hName = 'multiCode'
            node.data.hProperties = {
                ...node.data.hProperties,
                lines: node?.position?.end?.line - node?.position?.start?.line,
                lang: node?.lang ?? '',
                meta: new Function('return ' + node.meta + ';')
            }
        })
        return tree
    }
}

export default { handle }