import { resolve } from 'node:path'

import UnoCSS from 'unocss/vite'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VueSetupExtend from 'vite-plugin-vue-setup-extend'
import { viteExternalsPlugin } from 'vite-plugin-externals'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import { h, insertHtml } from 'vite-plugin-insert-html'

export default defineConfig(() => {
    return {
        base: './',
        plugins: [
            vue(),
            // script setup语法糖增强插件 @
            VueSetupExtend(),
            viteExternalsPlugin(
                {
                    // key 是要外部化的依赖名，value 是全局访问的名称，这里填写的是 'Cesium'
                    // 意味着外部化后的 cesium 依赖可以通过 window['Cesium'] 访问；
                    // 支持链式访问，参考此插件的文档
                    cesium: 'Cesium',
                },
                {
                    disableInServe: true, // 开发模式时不外部化
                },
            ),
            viteStaticCopy({
                targets: [
                    {
                        src: 'node_modules/cesium/Build/CesiumUnminified/Cesium.js',
                        dest: 'libs/cesium/',
                    },
                    {
                        src: 'node_modules/cesium/Build/CesiumUnminified/Assets/*',
                        dest: 'libs/cesium/Assets/',
                    },
                    {
                        src: 'node_modules/cesium/Build/CesiumUnminified/ThirdParty/*',
                        dest: 'libs/cesium/ThirdParty/',
                    },
                    {
                        src: 'node_modules/cesium/Build/CesiumUnminified/Workers/*',
                        dest: 'libs/cesium/Workers/',
                    },
                    {
                        src: 'node_modules/cesium/Build/CesiumUnminified/Widgets/*',
                        dest: 'libs/cesium/Widgets/',
                    },
                ],
            }),
            insertHtml({
                // 打包时在index.html文件的body中插入文件引用
                body: [
                    h('script', {
                        src: 'libs/cesium/Cesium.js',
                    }),
                ],
            }),
            UnoCSS(),
        ],
        resolve: {
            alias: [
                {
                    find: '@',
                    replacement: resolve(__dirname, './src'),
                },
                {
                    find: '@@',
                    replacement: resolve(__dirname, './src/assets'),
                },
            ],
        },
        css: {
            // css预处理器
            preprocessorOptions: {
                less: {
                    charset: false,
                    additionalData: '@import "./src/styles/index.less";',
                },
            },
        },
        server: {
            host: '0.0.0.0',
            port: 8080,
        },
        build: {
            sourcemap: true,
            // terserOptions: {
            //     compress: {
            //         drop_console: true,
            //     },
            // },
            outDir: 'dist', // 指定输出路径
            assetsDir: 'assets', // 指定生成静态资源的存放路径
            lib: {
                entry: [resolve(__dirname, './src/npm.ts'), resolve(__dirname, './src/unocss.ts')],
                name: 'draw-viewer', // 全局变量的名称
                fileName: 'draw-viewer', // 输出文件的名字
            },
            rollupOptions: {
                // 确保外部化处理那些你不想打包进库的依赖
                external: ['vue'],
                output: {
                    manualChunks() {
                        // 将全局库实例打包进vendor，避免和页面一起打包造成资源重复引入
                    },
                    // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
                    globals: {
                        vue: 'Vue',
                    },
                },
            },
        },
    }
})
