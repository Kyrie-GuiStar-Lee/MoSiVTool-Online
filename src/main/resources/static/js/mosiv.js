// --------------------------状态图建模 -------------------------------//
let svg = d3.select("#myDiagram")
// 选中的建模元素
let component_to_transmit = null;

/**
 * 建模元素画布
 */
class StateDiagramSVG {
    stateDiagram = new StateDiagram()
    component_chose = null;

    /**
     * 构造函数
     * @param params 以json形式给出的参数
     */
    constructor() {
        this._bindEvents()
    }

    draw() {
        this.stateDiagram.components.forEach((it) => {
            it.draw(this.svg)
        })
    }

    _bindEvents() {
        svg.on('click', (event) => {
            if (component_to_transmit != null) {
                this.component_chose = new component_to_transmit(event.layerX, event.layerY)
                this.stateDiagram.add(this.component_chose)
                this.component_chose.draw(svg)
                component_to_transmit = null
            }
        })
    }
}

class StateDiagram {
    id = -1
    components = []

    /**
     * 添加将建模元素
     * @param component 建模元素
     */
    add(component) {
        this.components.push(component);
    }

    toJSON() {}

    toXML() {}

    toPNG() {}
}

class Component {
    /**
     * 组件类型 根据类型 绘制出不同的图形
     * @type {number}
     */
    id = -1
    type = -1;
    // svg节点
    node = null

    draw(svg) {

    }
}

class State extends Component {
    datum = {
        position: {
            x: 0,
            y: 0
        },
        label: null
    }
    resizer = null

    dragstart() {}

    dragmove() {}

    dragend() {}

    resize() {}
}

/**
 * 开始状态模型
 * type = 1 表示开始状态
 */
class StartState extends State {
    /**
     * 构造函数
     * @param x x坐标（圆心）
     * @param y y坐标（圆心）
     */
    constructor(x, y) {
        super();
        this.type = 1
        let default_r = 32
        this.datum = {
            // g 左上角
            position: {
                x: x - default_r,
                y: y - default_r
            },
            r: default_r,
            min: {
                r: default_r
            }
        }

        this.transitions = []
    }

    draw(svg) {
        this.node = svg.datum(this.datum)
            .append('g')
            .attr('transform', (d) => {
                return 'translate(' + d.position.x + ',' + d.position.y + ')'
            })
            .node()

        d3.select(this.node)
            .append('circle')
            .attr('cx', (d) => {
                return d.r
            })
            .attr('cy', (d) => {
                return d.r
            })
            .attr('r', (d) => {
                return d.r
            })
            .node()

        // this.resizer.draw(svg)

        this.bindEvents()
    }

    dragstart(event, d) {
        d3.select(this).raise()
    }

    dragmove(event, d) {
        d3.select(this)
            .attr("transform", (d) => {
                return "translate(" + (event.x) + "," + (event.y) + ")"
            })

        d.position.x = event.x
        d.position.y = event.y
    }

    dragend(event, d) {
    }

    bindEvents() {
        let drag = d3.drag()
            .subject(function() {
                let tmp = d3.select(this).attr('transform')
                let reg = /translate\(\d+,\d+\)/
                let str = reg.exec(tmp)[0]
                str = str.substring(10, str.length - 1)
                let s_list = str.split(',')

                return {
                    x: Number(s_list[0]),
                    y: Number(s_list[1])
                }
            })
            .on('start', this.dragstart)
            .on('drag', this.dragmove)
            .on('end', this.dragend)

        d3.select(this.node).call(drag)
    }

    add_resizers() {
        this.data.rect = {
            position: {
                x: this.data.position.x - this.data.r,
                y: this.data.position.y - this.data.r
            },
            width: 2 * this.data.r,
            height: 2 * this.data.r
        }

        /*
         * 0 2     00 10     x+0,y+0  x+w,y+0
         * 1 3     01 11     x+0,y+h  x+w,y+w
         */
        let resizer0 = new Resizer(0, this.data.rect.position.x, this.data.rect.position.y, this)
        let resizer1 = new Resizer(1, this.data.rect.position.x, this.data.rect.position.y + this.data.rect.height, this)
        let resizer2 = new Resizer(2, this.data.rect.position.x + this.data.rect.width, this.data.rect.position.y, this)
        let resizer3 = new Resizer(3, this.data.rect.position.x + this.data.rect.width, this.data.rect.position.y + this.data.rect.height, this)

        this.resizers.push(resizer0)
        this.resizers.push(resizer1)
        this.resizers.push(resizer2)
        this.resizers.push(resizer3)
    }

    resize(event, number) {
        let opposite_resizer = null // 固定不动
        for (let i = 0; i <= 3; ++i) {
            if ((number ^ i) === 3) {
                opposite_resizer = this.resizers[i]
                break
            }
        }

        // 00 01鼠标在定点左侧
        this.data.rect.width = Math.max(2 * this.data.min.r, ((number >> 1) == 0 ? -1 : 1) * (event.sourceEvent.layerX - opposite_resizer.data.position.x))
        // 00 10鼠标在定点上侧
        this.data.rect.height = Math.max(2 * this.data.min.r, ((number & 1) == 0 ? -1 : 1) * (event.sourceEvent.layerY - opposite_resizer.data.position.y))

        // 修改本身
        this.data.r = Math.max(this.data.min.r, Math.min(this.data.rect.width, this.data.rect.height) / 2)
        this.data.position = {
            x: opposite_resizer.data.position.x + ((number >> 1) == 0 ? -1 : 1) * this.data.r, // 00 01 -; 10 11 +
            y: opposite_resizer.data.position.y + ((number & 1) == 0 ? -1 : 1) * this.data.r  // 00 10 -; 01 11 +
        }

        d3.select(this.node)
            .attr('cx', this.data.position.x)
            .attr('cy', this.data.position.y)
            .attr('r', this.data.r)

        // 根据本身调整rect
        this.data.rect.width = 2 * this.data.r
        this.data.rect.height = 2 * this.data.r
        this.data.rect.position = {
            x: opposite_resizer.data.position.x + ((number >> 1) - 1) * this.data.rect.width, // 00 01要-width
            y: opposite_resizer.data.position.y + ((number & 1) - 1) * this.data.rect.height // 00 10要-height
        }

        // 修改resizer
        this.resizers.forEach((e) => {
            e.data.position = {
                x: this.data.rect.position.x + (e.data.number >> 1) * this.data.rect.width,
                y: this.data.rect.position.y + (e.data.number & 1) * this.data.rect.height
            }
            e.data.left_top = {
                x: e.data.position.x - e.data.width / 2,
                y: e.data.position.y - e.data.width / 2
            }
            d3.select(e.node)
                .attr('x', e.data.left_top.x)
                .attr('y', e.data.left_top.y)
        })
    }
}

class EndState extends State {

}

class CommonState extends State {
    constructor() {
        super();
        this.transitons = []
    }
}

class ResizerGroup {

}

/**
 * 调整组件大小
 */
class Resizer {
    /**
     * @param x 中心
     * @param y 中心
     * @param parent 父组件
     */
    constructor(number, x, y, parent) {
        this.type = 5
        let default_width = 12
        this.data = {
            position: {
                x: x,
                y: y
            },
            width: default_width,
            number: number,
            parent: parent
        }
        this.data.left_top = {
            x: this.data.position.x - this.data.width / 2,
            y: this.data.position.y - this.data.width / 2
        }
    }

    draw(svg) {
        this.node = svg.datum(this.data)
            .append('rect')
            .attr('x', (d) => {
                return d.left_top.x
            })
            .attr('y', (d) => {
                return d.left_top.y
            })
            .attr('width', (d) => {
                return d.width
            })
            .attr('height', (d) => {
                return d.width
            })
            .attr('fill', 'lightblue')
            .node()

        this.bindEvents()
    }

    dragstart(event, d) {
        d3.select(this).raise()
    }

    dragmove(event, d) {
        d.parent.resize(event, d.number)
    }

    dragend(event, d) {
    }

    bindEvents() {
        let drag = d3.drag()
            .subject(function () {
                let tmp = d3.select(this);
                return {
                    x: tmp.attr('x'),
                    y: tmp.attr('y')
                }
            })
            .on('start', this.dragstart)
            .on('drag', this.dragmove)
            .on('end', this.dragend)

        d3.select(this.node).call(drag)
    }
}

class Transition extends Component {

}

class CommonTransition extends Transition {

}

class Point {

}
