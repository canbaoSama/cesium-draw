import { resolve } from 'node:path'

import { defineConfig } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig(() => {
    return {
        base: './',
        plugins: [
            viteStaticCopy({
                targets: [
                    {
                        src: '../src/assets/turf.min.js',
                        dest: './',
                    },
                ],
            }),
        ],
        resolve: {
            alias: [
                {
                    find: '@',
                    replacement: resolve(__dirname, '../src'),
                },
                {
                    find: '@@',
                    replacement: resolve(__dirname, '../src/assets'),
                },
            ],
        },
        build: {
            outDir: 'dist', // 指定输出路径
            assetsDir: 'assets', // 指定生成静态资源的存放路径
            lib: {
                entry: resolve(__dirname, './npm.ts'),
                name: 'cesium-draw-ts', // 全局变量的名称
                fileName: 'cesium-draw-ts', // 输出文件的名字
            },
            rollupOptions: {
                input: './npm.ts',
                // 确保外部化处理那些你不想打包进库的依赖
                external: ['vue'],
                output: {
                    // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                    globals: {
                        vue: 'Vue',
                    },
                },
            },
        },
    }
})
