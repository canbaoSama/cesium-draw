import type { Cartesian3 } from 'cesium'

// 地图上的tooltip提示工具
export interface tooltipInterface {
    dom: HTMLElement
    text: string
    showAt: Function
    setVisible: Function
}

export class CreateTooltip {
    tooltip: tooltipInterface = {
        dom: <HTMLElement>document.getElementById('mouse-tooltip'),
        text: '',
        showAt: (position: Cartesian3, text: string) => { // tooltip 更新位置和text
            if (position && text) {
                this.tooltip.setVisible(true)
                if (this.tooltip.text !== text) {
                    this.tooltip.dom.innerHTML = text
                    this.tooltip.text = text
                }
                const width = this.tooltip.dom.clientWidth
                const height = this.tooltip.dom.clientHeight + 24
                this.tooltip.dom.style.left = `${(position.x - width / 2).toFixed(0)}px`
                this.tooltip.dom.style.top = `${(position.y - height).toFixed(0)}px`
            }
        },
        setVisible: (visible: boolean) => { // tooltip 展示控制
            this.tooltip.dom.style.opacity = visible ? '1' : '0'
            this.tooltip.dom.style.zIndex = visible ? '100' : '-1'
        },
    }

    constructor() {
        setTimeout(() => {
            const dom = document.getElementById('mouse-tooltip')
            if (dom)
                this.tooltip.dom = dom
        }, 0)
    }
}
