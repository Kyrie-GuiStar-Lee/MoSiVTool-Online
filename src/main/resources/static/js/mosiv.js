// --------------------------状态图建模 -------------------------------//
let svg = d3.select("#myDiagram")
// 选中的建模元素
let component_to_transmit = null;

function hide_resizer() {
    for(let i = 0; i <= 3; ++i) {
        svg.select('#resizer' + i).remove()
    }
}

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
            it.draw(svg)
        })
    }

    _bindEvents() {
        svg.on('click', (event) => {
            if (component_to_transmit != null) {
                this.component_chose = new component_to_transmit(event.layerX, event.layerY)
                this.stateDiagram.add(this.component_chose)
                this.component_chose.draw()
                component_to_transmit = null
            }
            // TODO 判断hide_resizer()
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

    draw() {

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

    drag() {}

    show_resizer() {}

    resize() {}
}

/**
 * 开始状态模型
 * type = 1 表示开始状态
 */
class StartEndState extends State {
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

        this.resizer = new ResizerGroup({
            position: this.datum.position,
            width: 2 * this.datum.r,
            height: 2 * this.datum.r
        }, {
            width: 2 * this.datum.r,
            height: 2 * this.datum.r
        }, this, "==")
    }

    setLabel(label) {
        this.label = label
    }

    draw() {
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
            .attr('stroke', 'black')
            .attr('fill', 'white')

        d3.select(this.node)
            .append('text')
            .text(this.label)
            .attr('x', this.datum.r)
            .attr('y', this.datum.r)
            .attr('font-size', 14)
            .attr('text-anchor',"middle")
            .attr('dy','.35em')

        this.bindEvents()
    }

    drag() {
        let that = this

        function dragstart(event, d) {
            hide_resizer()
            d3.select(this).raise()
        }

        function dragmove(event, d) {
            d3.select(this)
                .attr("transform", () => {
                    return "translate(" + (event.x) + "," + (event.y) + ")"
                })

            d.position.x = event.x
            d.position.y = event.y
        }

        function dragend(event, d) {
            that.show_resizer()
        }

        let drag = d3.drag()
            .subject(function() {
                let tmp = d3.select(this).attr('transform')
                let reg = /translate\((-)?\d+(\.\d+)?,(-)?\d+(\.\d+)?\)/ // TODO 可能有(1px,  2px)的情况
                let str = reg.exec(tmp)[0]
                str = str.substring(10, str.length - 1)
                let s_list = str.split(',')

                return {
                    x: Number(s_list[0]),
                    y: Number(s_list[1])
                }
            })
            .on('start', dragstart)
            .on('drag', dragmove)
            .on('end', dragend)

        d3.select(this.node).call(drag)
    }

    click() {
        let that = this

        function click(event, d) {
            d3.select(this).raise()
            // 删除其他已显示的resizer
            hide_resizer()
            that.show_resizer()
        }
    }

    show_resizer() {
        this.resizer.update({
            position: this.datum.position,
            width: 2 * this.datum.r,
            height: 2 * this.datum.r
        })
        this.resizer.draw()
    }

    bindEvents() {
        this.drag()
        this.click()
    }

    /**
     * 根据resizer返回的rect修改component
     * @param rect
     */
    resize(rect) {
        this.datum.r = rect.width / 2
        this.datum.position = rect.position

        d3.select(this.node)
            .select('circle')
            .attr('cx', this.datum.r)
            .attr('cy', this.datum.r)
            .attr('r', this.datum.r)

        d3.select(this.node)
            .select('text')
            .attr('x', this.datum.r)
            .attr('y', this.datum.r)

        d3.select(this.node)
            .attr('transform', () => {
                return 'translate(' + (this.datum.position.x) + ',' + (this.datum.position.y) + ')'
            })
    }
}

class StartState extends StartEndState {
    constructor(x, y) {
        super(x, y);
        this.label = "开始"
        this.transitions = []
    }
}

class EndState extends StartEndState {
    constructor(x, y) {
        super(x, y);
        this.label = "结束"
    }
}


class CommonState extends State {
    constructor() {
        super();
        this.transitons = []
        this.invirants = []
    }
}

class ResizerGroup {
    resizers = []

    constructor(rect, min, parent, zoom_type) {
        this.rect = rect
        this.min = min
        this.parent = parent
        this.zoom_type = zoom_type
        /*
         * 0 2     00 10     x+0,y+0  x+w,y+0
         * 1 3     01 11     x+0,y+h  x+w,y+w
         */
        let resizer0 = new Resizer(0, this.rect.position.x, this.rect.position.y, this)
        let resizer1 = new Resizer(1, this.rect.position.x, this.rect.position.y + this.rect.height, this)
        let resizer2 = new Resizer(2, this.rect.position.x + this.rect.width, this.rect.position.y, this)
        let resizer3 = new Resizer(3, this.rect.position.x + this.rect.width, this.rect.position.y + this.rect.height, this)

        this.resizers.push(resizer0)
        this.resizers.push(resizer1)
        this.resizers.push(resizer2)
        this.resizers.push(resizer3)
    }

    draw() {
        this.resizers.forEach((resizer) => {
            resizer.draw()
        })
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
        this.rect.width = Math.max(this.min.width, ((number >> 1) == 0 ? -1 : 1) * (event.sourceEvent.layerX - opposite_resizer.datum.position.x))
        // 00 10鼠标在定点上侧
        this.rect.height = Math.max(this.min.height, ((number & 1) == 0 ? -1 : 1) * (event.sourceEvent.layerY - opposite_resizer.datum.position.y))

        // 高宽相等且等比例缩放
        if(this.zoom_type == "==") {
            this.rect.width = Math.min(this.rect.width, this.rect.height)
            this.rect.height = this.rect.width
        }

        this.rect.position = {
            x: opposite_resizer.datum.position.x + ((number >> 1) - 1) * this.rect.width, // 00 01 -width
            y: opposite_resizer.datum.position.y + ((number & 1) - 1) * this.rect.height // 00 10 -height
        }

        // 修改resizer
        this.resizers.forEach((e) => {
            e.datum.position = {
                x: this.rect.position.x + (e.datum.number >> 1) * this.rect.width,
                y: this.rect.position.y + (e.datum.number & 1) * this.rect.height
            }
            e.datum.left_top = {
                x: e.datum.position.x - e.datum.width / 2,
                y: e.datum.position.y - e.datum.width / 2
            }
            d3.select(e.node)
                .attr('x', e.datum.left_top.x)
                .attr('y', e.datum.left_top.y)
        })

        this.parent.resize(this.rect, number)
    }

    // 由于resizer在component静止时才显示，所以拖动完成后被show_resizer()调用，以更新resizer的位置
    update(rect) {
        for(let i = 0; i <= 3; ++i) {
            this.resizers[i].update({
                x: rect.position.x + (i >> 1) * rect.width,
                y: (rect.position.y + (i & 1) * rect.height)
            })
        }
    }
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
        let default_width = 12
        this.datum = {
            position: {
                x: x,
                y: y
            },
            width: default_width,
            number: number,
            parent: parent
        }
        this.datum.left_top = {
            x: this.datum.position.x - this.datum.width / 2,
            y: this.datum.position.y - this.datum.width / 2
        }
    }

    draw() {
        this.node = svg.datum(this.datum)
            .append('rect')
            .attr('id', 'resizer' + this.datum.number)
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

    dragend(event, d) {}

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

    update(position) {
        this.datum.position = position

        this.datum.left_top = {
            x: this.datum.position.x - this.datum.width / 2,
            y: this.datum.position.y - this.datum.width / 2
        }

        svg.select("#resizer" + this.datum.number)
            .attr('x', this.datum.left_top.x)
            .attr('y', this.datum.left_top.y)
    }
}

class Transition extends Component {

}

class CommonTransition extends Transition {

}

class Point {

}
