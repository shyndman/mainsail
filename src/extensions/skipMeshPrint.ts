import axios from 'axios'
import { escapePath } from '@/plugins/helpers'

const SKIP_MESH_PARAM = 'SKIP_MESH=1'
const SKIP_MESH_SUFFIX = '.skipmesh'
const PRINT_START_LINE = /^\s*PRINT_START\b/i
const SKIP_MESH_ASSIGNMENT = /SKIP_MESH=\S+/i

export class SkipMeshMacroNotFoundError extends Error {
    constructor() {
        super('No PRINT_START command found in the gcode file.')
        this.name = 'SkipMeshMacroNotFoundError'
    }
}

export function injectSkipMesh(content: string): string {
    const lines = content.split('\n')
    const idx = lines.findIndex((line) => PRINT_START_LINE.test(line))
    if (idx === -1) throw new SkipMeshMacroNotFoundError()

    const hasCR = lines[idx].endsWith('\r')
    const body = hasCR ? lines[idx].slice(0, -1) : lines[idx]
    const updated = SKIP_MESH_ASSIGNMENT.test(body)
        ? body.replace(SKIP_MESH_ASSIGNMENT, SKIP_MESH_PARAM)
        : `${body} ${SKIP_MESH_PARAM}`
    lines[idx] = hasCR ? `${updated}\r` : updated

    return lines.join('\n')
}

export function skipMeshSiblingFilename(filename: string): string {
    const slash = filename.lastIndexOf('/')
    const dot = filename.lastIndexOf('.')
    if (dot > slash) return `${filename.slice(0, dot)}${SKIP_MESH_SUFFIX}${filename.slice(dot)}`
    return `${filename}${SKIP_MESH_SUFFIX}`
}

export async function startPrintSkipMesh(args: { apiUrl: string; filename: string }): Promise<void> {
    const url = `${args.apiUrl}/server/files/${escapePath(`gcodes/${args.filename}`)}?${Date.now()}`
    const res = await axios.get(url, { responseType: 'blob' })
    const content: string = await (res.data as Blob).text()

    const modified = injectSkipMesh(content)

    const sibling = skipMeshSiblingFilename(args.filename)
    const slash = sibling.lastIndexOf('/')
    const path = slash >= 0 ? sibling.slice(0, slash) : ''
    const name = slash >= 0 ? sibling.slice(slash + 1) : sibling

    const formData = new FormData()
    formData.append('file', new File([modified], name, { type: 'text/plain' }), name)
    formData.append('root', 'gcodes')
    if (path) formData.append('path', path)
    formData.append('print', 'true')

    await axios.post(`${args.apiUrl}/server/files/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
}
