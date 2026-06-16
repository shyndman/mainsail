import { describe, expect, it } from 'vitest'
import { injectSkipMesh, skipMeshSiblingFilename, SkipMeshMacroNotFoundError } from '@/extensions/skipMeshPrint'

describe('skipMeshPrint', () => {
    describe('injectSkipMesh', () => {
        const realLine =
            "PRINT_START BED=55 HOTEND=210 FILAMENT_TYPE='PETG-CF' NOZZLE_DIAMETER=0.6 RETRACT_LENGTH=1 RETRACT_SPEED=40 UNRETRACT_SPEED=40"

        it('appends SKIP_MESH=1 to the PRINT_START line keeping original params', () => {
            const result = injectSkipMesh(realLine)
            expect(result.endsWith(' SKIP_MESH=1')).toBe(true)
            expect(result).toContain("FILAMENT_TYPE='PETG-CF'")
            expect(result).toContain('UNRETRACT_SPEED=40')
        })

        it('only modifies the PRINT_START line', () => {
            const input = ['G28', realLine, 'M104 S210'].join('\n')
            const lines = injectSkipMesh(input).split('\n')
            expect(lines[0]).toBe('G28')
            expect(lines[2]).toBe('M104 S210')
            expect(lines[1].endsWith(' SKIP_MESH=1')).toBe(true)
        })

        it('replaces an existing SKIP_MESH assignment instead of appending', () => {
            const result = injectSkipMesh('PRINT_START BED=55 SKIP_MESH=0')
            expect(result).toBe('PRINT_START BED=55 SKIP_MESH=1')
            expect(result.match(/SKIP_MESH=/g)?.length).toBe(1)
        })

        it('preserves a trailing CR on the PRINT_START line', () => {
            const input = 'G28\r\nPRINT_START BED=55\r\nG28\r\n'
            const lines = injectSkipMesh(input).split('\n')
            expect(lines[1]).toBe('PRINT_START BED=55 SKIP_MESH=1\r')
        })

        it('does not match PRINT_STARTED', () => {
            expect(() => injectSkipMesh('PRINT_STARTED BED=55')).toThrow(SkipMeshMacroNotFoundError)
        })

        it('does not match a commented PRINT_START line', () => {
            expect(() => injectSkipMesh(';PRINT_START BED=55')).toThrow(SkipMeshMacroNotFoundError)
        })

        it('throws when no PRINT_START exists', () => {
            expect(() => injectSkipMesh('G28\nM104 S210')).toThrow(SkipMeshMacroNotFoundError)
        })
    })

    describe('skipMeshSiblingFilename', () => {
        it('inserts suffix before the extension', () => {
            expect(skipMeshSiblingFilename('foo.gcode')).toBe('foo.skipmesh.gcode')
        })

        it('handles nested paths', () => {
            expect(skipMeshSiblingFilename('sub/dir/foo.gcode')).toBe('sub/dir/foo.skipmesh.gcode')
        })

        it('appends suffix when there is no extension', () => {
            expect(skipMeshSiblingFilename('noext')).toBe('noext.skipmesh')
        })
    })
})
