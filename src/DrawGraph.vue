<script setup lang="ts">
import type { Ref } from 'vue'
import { onUnmounted, reactive, ref } from 'vue'
import { ScreenSpaceEventHandler, ScreenSpaceEventType, defined } from 'cesium'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'

import type { DrawEntity, configInterface } from '@/types/cesiumDraw'
import { DRAW_GRAPH_MAP } from '@/constants/cesium'
import { useCesiumStore } from '@/store/cesium'
import { OPERATE_STATUS } from '@/constants/index'
import { drawConfig } from '@/utils/cesium/drawGraph/config'

const cesiumStore = useCesiumStore()

const drawing: Ref<boolean> = ref(false)
const drawingType = ref('')

let handler: ScreenSpaceEventHandler | undefined
const flag: Ref<string> = ref(OPERATE_STATUS.NONE)
// 保存的已经绘制的图形数据信息
const drawedShape: { [key: string | number]: any } = {}

// 进入或者切换绘制状态,开始绘制
function enterDrawStatus(type: string, flagType?: string) {
    if (!drawing.value)
        return
    exitOperateStatus()

    if (flagType)
        flag.value = flagType

    if (type === drawingType.value)
        return
    drawingType.value = type
    cesiumStore.DrawGraphType(type)
    if (type) {
        cesiumStore.drawGraph.dialogVisible = dialogVisible
        cesiumStore.drawGraph?.startDraw()
    }
}

// 选择图形移除
function removeDrawGraph() {
    if (!drawing.value)
        return
    ElMessage({
        message: '点击图形进行删除!',
        duration: 5000,
        type: 'warning',
        offset: (window.innerHeight - 48) / 2,
    })
    flag.value = OPERATE_STATUS.DELETE
    enterDrawStatus('')
    bindGloveEvent()
}
// 选择图形进入编辑状态
function editDrawGraph() {
    if (!drawing.value)
        return
    ElMessage({
        message: '点击图形进行编辑!',
        duration: 5000,
        type: 'warning',
        offset: (window.innerHeight - 48) / 2,
    })
    flag.value = OPERATE_STATUS.EDIT
    enterDrawStatus('')
    bindGloveEvent()
}
// 给绘制的图形绑定点击事件
function bindGloveEvent() {
    handler = new ScreenSpaceEventHandler(cesiumStore.viewer.scene.canvas)
    handler.setInputAction((movement: any) => {
        const pick = cesiumStore.viewer.scene.pick(movement.position)
        if (defined(pick)) {
            const obj = pick?.id
            if (!obj || !obj.layerId || flag.value === OPERATE_STATUS.NONE)
                return

            if (flag.value === OPERATE_STATUS.EDIT)
                enterDrawEditing(obj.timeStampId, obj.drawType)
            else if (flag.value === OPERATE_STATUS.DELETE)
                clearEntityById(obj.timeStampId)
        }
    }, ScreenSpaceEventType.LEFT_CLICK)
}
function clearEntityById(timeStampId: number) {
    const entityList = cesiumStore.viewer.entities.values
    if (!entityList || entityList.length < 1)
        return

    for (let i = 0; i < entityList.length; i++) {
        const entity: DrawEntity = entityList[i]
        if (entity.layerId === drawConfig.layerId && entity.timeStampId === timeStampId) {
            cesiumStore.viewer.entities.remove(entity)
            i--
        }
    }
}
function enterDrawEditing(timeStampId: number, drawType: string) {
    // 先移除entity
    clearEntityById(timeStampId)
    enterDrawStatus(drawType)
    cesiumStore.drawGraph?.reEnterModify(drawedShape[timeStampId], timeStampId)
}
// 保存绘制,将锚点和监听清除
function saveDrawGraph() {
    const saveData = cesiumStore.drawGraph.saveDraw()
    if (saveData)
        drawedShape[cesiumStore.drawGraph?.timeStampId] = saveData

    enterDrawStatus('', OPERATE_STATUS.NONE)
}
// 取消绘制,则移除当前正在绘制的数据
function cancelDrawGraph() {
    cesiumStore.drawGraph?.clearDrawing()
    if (flag.value === OPERATE_STATUS.EDIT) // 编辑状态需要重新绘制旧图形
        cesiumStore.drawGraph?.drawOldData()
    enterDrawStatus('', OPERATE_STATUS.NONE)
}
// 退出当前操作状态
function exitOperateStatus() {
    if (handler) {
        handler.destroy()
        handler = undefined
    }
}

const rules = reactive<FormRules>({
    radius: [
        {
            type: 'number',
            required: true,
            validator: (rule: any, value: any, callback: any) => {
                if (!value)
                    callback(new Error('缓冲区半径不能为空'))

                if (value < 1 || value > 9999)
                    callback(new Error('缓冲区半径只能为1 到 9999 的正整数'))

                callback()
            },
            trigger: 'change',
        },
    ],
})
const configFormRef = ref<FormInstance>()
const config: Ref<configInterface> = ref({
    radius: 1,
})
const visible: Ref<boolean> = ref(false)
// 信息配置框展示
function dialogVisible(isOpen: boolean) {
    visible.value = isOpen
}
// 保存配置的信息并传入绘制 class
async function saveConfig() {
    await configFormRef.value?.validate()
    cesiumStore.drawGraph?.saveConfig(config.value)
    dialogVisible(false)
}

onUnmounted(() => {
    exitOperateStatus()
})
</script>

<template>
    <div class="draw-graph absolute right-5 top-15 px-3 py-2 rounded-1 shadow-gray-4 z-1 max-w-94">
        <div class="header-btns border-0 border-b-1 border-solid border-grayColor-3 pb-2 flex justify-between">
            <div class="right-btns">
                <ElButton class="public-cesium-btn" :class="`${flag === OPERATE_STATUS.EDIT ? 'active' : ''} ${drawing ? '' : 'undrawing'}`" @click="editDrawGraph">
                    编辑图形
                </ElButton>
                <ElButton class="public-cesium-btn" :class="`${flag === OPERATE_STATUS.DELETE ? 'active' : ''} ${drawing ? '' : 'undrawing'}`" @click="removeDrawGraph">
                    删除图形
                </ElButton>
            </div>
        </div>
        <div class="control-btns flex  flex-wrap justify-between">
            <ElButton v-for="(item, key) in DRAW_GRAPH_MAP" :key="key" class="public-cesium-btn" :class="`${drawingType === item.key ? 'active' : ''} ${drawing ? '' : 'undrawing'}`"
                @click="enterDrawStatus(item.key, OPERATE_STATUS.NONE)">
                {{ `${item.name}` }}
            </ElButton>
        </div>

        <div id="drawPopConfirmLayer" class="fixed top-20 left-[calc(50%-4.375rem)] bg-white py-2 px-5 w-35 rounded-0.5 hidden">
            <ElButton @click="cancelDrawGraph">
                取消
            </ElButton>
            <ElButton type="primary" @click="saveDrawGraph">
                保存
            </ElButton>
        </div>

        <ElDialog v-model="visible" title="图形绘制参数配置" width="400px" :close-on-click-modal="false" :close-on-press-escape="false" :show-close="false">
            <ElForm ref="configFormRef" :model="config" :rules="rules">
                <ElFormItem label="缓冲区半径" prop="radius">
                    <ElInput v-model="config.radius" placeholder="请输入缓冲区半径">
                        <template #append>
                            KM
                        </template>
                    </ElInput>
                </ElFormItem>
            </ElForm>
            <template #footer>
                <span class="dialog-footer">
                    <ElButton @click="visible = false">取消</ElButton>
                    <ElButton type="primary" @click="saveConfig">
                        保存
                    </ElButton>
                </span>
            </template>
        </ElDialog>
    </div>
</template>

<style lang="less" scoped>
.header-btns .public-cesium-btn {
    width: auto;
    padding: 0px 8px;
    border-radius: 4px;
}

.control-btns .public-cesium-btn {
    width: auto;
    color: #fff;
    padding: 0 16px;
    margin: 8px 4px;
    border-radius: 4px;
}

.undrawing {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>

<style lang="less">
.draw-graph {
    .el-dialog__body {
        padding: 8px 20px;
    }
}
</style>
