<script setup lang="ts">
</script>

<template>
    <div id="mouse-tooltip"
        class="absolute min-w-37.5 max-w-75 min-h-5 leading-5 bg-blueColor-1 shadow-water-4 border-0 text-white rounded-2.5 z-100 py-2 px-4 top--25 left--75 transition-opacity duration-800 ease-in-out" />
</template>

<style lang="less" scoped>
#mouse-tooltip:after {
    content: '';
    position: absolute;
    border-width: 10px;
    border-style: solid;
    border-color: @waterColor transparent transparent transparent;
    bottom: -20px;
    left: calc(50% - 10px);
}
</style>
