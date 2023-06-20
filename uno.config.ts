import { defineConfig, presetAttributify, presetUno } from 'unocss'

export default defineConfig({
    shortcuts: [
        {
            'wh-full': 'w-full h-full',
            'flex-center-center': 'flex justify-center items-center',
            'bg-img-cover': 'bg-center bg-no-repeat bg-cover',
            'absolute-full': 'absolute wh-full top-0 left-0',
        },
    ],
    rules: [
        ['shadow-blue-12', { 'box-shadow': '0px 0px 12px 4px #4989e5' }],
        ['shadow-gray-4', { 'box-shadow': '0px 0px 4px 4px #303336' }],
        ['shadow-water-4', { 'box-shadow': '0 0 4px 4px #73c9c4' }],
    ],
    theme: {
        colors: {
            'blue': '#4989e5', // 蓝色, 登录框shadow色
            'blueColor-1': 'rgba(30, 72, 131, 0.5)', // 透明弹窗背景色

            'waterColor': '#73c9c4', // 水色，infowindow 的 shadow 颜色

            'grayColor': '#303336', // 地图按钮背景色
            'grayColor-3': '#ebeef5', // 播放条底色
            'grayColor-4': '#ababab', // 播放条缓存颜色  设备状态颜色

            'greenColor': '#62ff85', // 绿色

            'redColor-1': '#b25862',
        },
    },
    presets: [
        presetUno(), // 预设的超集
        presetAttributify(), // 简写
        // presetIcons(), // icons
    ],
})
