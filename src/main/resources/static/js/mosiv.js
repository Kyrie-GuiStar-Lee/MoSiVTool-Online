// --------------------------状态图建模 -------------------------------//
let svg = d3.select("#myDiagram")
// 选中的建模元素
let component_to_transmit = null; // function

// kld_intersection.js
let ShapeInfo = KldIntersections.ShapeInfo;
let Intersection = KldIntersections.Intersection;

/**
 * always call hide_resizer before calling show_resizer
 */
function hide_resizer() {
    for(let i = 0; i <= 3; ++i) {
        svg.select('#resizer' + i).remove()
    }
}

/**
 * 建模元素画布
 */
class StateDiagramSVG {
    state_diagram_id = 0
    stateDiagram = null
    component_chose = null; // object

    /**
     * 构造函数
     * @param params 以json形式给出的参数
     */
    constructor() {
        this.stateDiagram = new StateDiagram(this.state_diagram_id++)
        this._bindEvents()
    }

    draw() {
        this.stateDiagram.components.forEach((it) => {
            it.draw(svg)
        })
    }

    _bindEvents() {
        // 正在选择的transition
        let transition = null
        // TODO transition未完成就选择其他的component时，要删除完成了一半的transition

        // draw选中的Component
        svg.on('click.add_component', (event) => {
            if(component_to_transmit != null) { // Cursor
                let component = new component_to_transmit(event.layerX, event.layerY)
                if (component instanceof State || component instanceof ProTransition) {
                    this.stateDiagram.add(component)
                    this.component_chose = component
                    this.component_chose.draw()
                }
            }
        })
            .on('click.select_component', (event) => {
                if(component_to_transmit == null || component_to_transmit == CommonTransition) {
                    let target_datum = d3.select(event.target).datum()
                    // 点击空白处取消选中
                    if(target_datum == undefined) {
                        console.log("click.select_component: didn't choose any component")
                        this.component_chose = null
                        hide_resizer()
                        return
                    }
                    let component = this.stateDiagram.get_component_by_id(target_datum.id)
                    component.raise()
                    hide_resizer()
                    component.show_resizer()
                    console.log("click.select_component: " + component)
                    // TODO get_component_by_id() err handler
                    this.component_chose = component
                }
            })
            .on('click.draw_common_transition', (event) => {
                if(component_to_transmit != null) { // Cursor
                    let component = new component_to_transmit(event.layerX, event.layerY)
                    if (component instanceof CommonTransition) {
                        if (transition == null) {
                            transition = component
                            this.stateDiagram.add(transition)
                        }
                        let link_finish = transition.link(event, this.component_chose)
                        if (transition.points.length >= 2) {
                            transition.redraw()
                        }
                        if (link_finish) {
                            console.log("link finish")
                            transition = null
                        }
                    }
                }
            })
    }
}

class StateDiagram {
    id = -1
    components = []
    component_id = 0

    constructor(id) {
        this.id = id
    }

    /**
     * 添加将建模元素
     * @param component 建模元素
     */
    add(component) {
        component.set_id(this.component_id++)
        this.components.push(component);
    }

    get_component_by_id(id) {
        for(let i = 0; i < this.components.length; ++i) {
            if(this.components[i].datum.id === id) {
                return this.components[i]
            }
        }

        // TODO throw exception
        console.log("get_component_by_id: can't find component")
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
    datum = {
        id: -1,
        type: -1
    }
    // svg节点
    node = null

    set_id() {}

    draw() {}

    /**
     * 浮于顶层
     */
    raise() {}
}

class State extends Component {
    datum = {
        id: -1,
        type: -1,
        position: {
            x: 0,
            y: 0
        },
        label: null,
        font_size: 0
    }
    resizer = null

    set_id(id) {
        this.datum.id = id
    }

    drag() {}

    /**
     * 状态的中点
     */
    center() {
        return {
            x: this.datum.position.x + this.datum.width / 2,
            y: this.datum.position.y + this.datum.height / 2
        }
    }

    show_resizer() {
        this.resizer.update({
            position: this.datum.position,
            width: this.datum.width,
            height: this.datum.height
        })
        this.resizer.draw()
    }

    resize() {}

    /**
     * drag, resize时更新transition
     * @param center 中心坐标
     */
    update_transitions(center) {}
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
        let default_width = 64
        let default_font_size = 14
        this.datum = {
            // g 左上角
            position: {
                x: x - default_width / 2,
                y: y - default_width / 2
            },
            width: default_width,
            height: default_width,
            r: default_width / 2,
            min: {
                r: default_width / 2
            },
            label: null,
            font_size: default_font_size
        }

        this.resizer = new ResizerGroup({
            position: this.datum.position,
            width: this.datum.width,
            height: this.datum.height
        }, {
            width: this.datum.width,
            height: this.datum.height
        }, this, "==")
    }

    set_label(label) {
        this.datum.label = label
    }

    /**
     * 返回g对应的矩形（绝对坐标）
     * @returns {{width, position: {x: number, y: number}, height}}
     */
    get_rect() {
        return {
            position: this.datum.position,
            width: this.datum.width,
            height: this.datum.height
        }
    }

    /**
     * 返回component实际形状对应的ShapeInfo
     * @returns {*}
     */
    get_kld_border_shapeInfo() {
        return ShapeInfo.circle([this.datum.position.x + this.datum.r, this.datum.position.y + this.datum.r], this.datum.r)
    }

    draw() {
        this.node = svg
            .append('g')
            .datum(this.datum)
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
            .text((d) => {
                return d.label
            })
            .attr('x', (d) => {
                return d.r
            })
            .attr('y', (d) => {
                return d.r
            })
            .attr('font-size', (d) => {
                return d.font_size
            })
            // 文字垂直、水平居中
            .attr('text-anchor',"middle")
            .attr('dy','.35em')

        hide_resizer()
        this.show_resizer()

        this._bindEvents()
    }

    drag() {
        let that = this

        function dragstart(event, d) {
            hide_resizer()
        }

        function dragmove(event, d) {
            /* important! https://observablehq.com/@d3/click-vs-drag
                If you call raise() in dragstart, click events will not work properly.
                Oh my! So torturing to fix this!
            */
            d3.select(this).raise()
                .attr("transform", () => {
                    return "translate(" + (event.x) + "," + (event.y) + ")"
                })

            d.position = {
                x: event.x,
                y: event.y
            }

            that.update_transitions(that.center())
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

    raise() {
        d3.select(this.node).raise()
    }

    _bindEvents() {
        this.drag()
    }

    /**
     * 根据resizer返回的rect修改component
     * @param rect
     */
    resize(rect) {
        this.datum.width = rect.width
        this.datum.height = rect.height
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

        this.update_transitions(this.center())
    }
}

class StartState extends StartEndState {
    constructor(x, y) {
        super(x, y);
        this.datum.type = 1
        this.set_label("开始")
        this.out_transitions = [] // drag
    }

    update_transitions(center) {
        // 更新出边
        this.out_transitions.forEach((transition) => {
            transition.update_start_point(center.x, center.y)
            transition.redraw()
        })
    }
}

class EndState extends StartEndState {
    constructor(x, y) {
        super(x, y);
        this.datum.type = 2
        this.set_label("结束")
        this.in_transitions = [] // drag
    }

    update_transitions(center) {
        // 更新入边
        this.in_transitions.forEach((transition) => {
            transition.update_end_point(center.x, center.y)
            transition.redraw()
        })
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
        this.node = svg
            .append('rect')
            .datum(this.datum)
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

        this._bindEvents()
    }

    drag() {
        function dragstart(event, d) {
            d3.select(this).raise()
        }

        function dragmove(event, d) {
            d.parent.resize(event, d.number)
        }

        function dragend(event, d) {}

        let drag = d3.drag()
            .subject(function () {
                let tmp = d3.select(this);
                return {
                    x: tmp.attr('x'),
                    y: tmp.attr('y')
                }
            })
            .on('start', dragstart)
            .on('drag', dragmove)
            .on('end', dragend)

        d3.select(this.node).call(drag)
    }

    _bindEvents() {
        this.drag()
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
    points = []
    guard = []
    curve_generator = d3.line()
        .x((d, i) => {
            return d.datum.position.x
        })
        .y((d, i) => {
            return d.datum.position.y
        })
        .curve(d3.curveNatural)

    marker = svg.append("marker")
            .attr("id", "arrow")
            .attr("markerUnits","strokeWidth")//设置为strokeWidth箭头会随着线的粗细发生变化
            // .attr("viewBox", "0 0 12 12")//坐标系的区域
            .attr("refX", 9)//箭头坐标
            .attr("refY", 6)
            .attr("markerWidth", 12)
            .attr("markerHeight", 12)
            .attr("orient", "auto")//绘制方向，可设定为：auto（自动确认方向）和 角度值
            .append("path")
            .attr("d", "M2,2 L10,6 L2,10 L2,2")//箭头的路径
            .attr('fill', 'black');//箭头颜色

    constructor() {
        super();
    }
}

class CommonTransition extends Transition {
    constructor() {
        super();
        this.source_state = null
        this.target_state = null
    }

    link(event, component_chose) {
        // 选择的是State
        // TODO ProTransition
        if(component_chose instanceof State) {
            console.log(component_chose)
            // 若未选则起点，则选择的是起点
            if(this.source_state == null) {
                this.source_state = component_chose
                let center = this.source_state.center()
                let point = new Point(center.x, center.y)
                this.points.push(point)
            }
            // 优先处理起点, 后处理终点
            else if(this.target_state == null) {
                this.target_state = component_chose
                let center = this.target_state.center()
                let point = new Point(center.x, center.y)
                this.points.push(point)
                // 只有两个点，修正第一个点
                if(this.points.length === 2) {
                    this._modify_start_point()
                }
                // 修正终点
                this._modify_end_point()
                // 更新 state
                this.source_state.out_transitions.push(this)
                this.target_state.in_transitions.push(this)
                return true
            }
        }
        else {
            // 起点确定才能选择后续的点
            if(this.source_state == null) {
                return
            }
            let point = new Point(event.layerX, event.layerY)
            this.points.push(point)
            // 根据第一二个点的连线修正第一个点
            if(this.points.length === 2) {
                this._modify_start_point()
            }
        }
        return false
    }

    _modify_start_point() {
        let curve = this.curve_generator(this.points.slice(0, 2))
        let kld_curve = ShapeInfo.path(curve)
        let kld_border = this.source_state.get_kld_border_shapeInfo()
        console.log(kld_curve, kld_border)
        let intersection = Intersection.intersect(kld_curve, kld_border).points[0]
        // 无交点，一般发生在drag中，两个component靠太近，此时transition被遮挡
        if(intersection == undefined) {
            return
        }

        this.points[0].datum.position = {
            x: intersection.x,
            y: intersection.y
        }
    }

    _modify_end_point() {
        let curve = this.curve_generator(this.points.slice(-2))
        let kld_curve = ShapeInfo.path(curve)
        let kld_border = this.target_state.get_kld_border_shapeInfo()
        let intersection = Intersection.intersect(kld_curve, kld_border).points[0]
        // 无交点，一般发生在drag中，两个component靠太近，此时transition被遮挡
        if(intersection == undefined) {
            return
        }

        this.points.slice(-1)[0].datum.position = {
            x: intersection.x,
            y: intersection.y
        }
    }

    update_start_point(x, y) {
        this.points[0].datum.position = {
            x: x,
            y: y
        }
        this.points.slice(-1)[0].datum.position = this.target_state.center()
        this._modify_start_point()
        this._modify_end_point()
    }

    update_end_point(x, y) {
        this.points[0].datum.position = this.source_state.center()
        this.points.slice(-1)[0].datum.position = {
            x: x,
            y: y
        }
        this._modify_start_point()
        this._modify_end_point()
    }

    draw() {
        this.node = svg.append("path")
            .attr("d", this.curve_generator(this.points))
            .attr("fill", "none")
            .attr("stroke","black")
            .attr("stroke-width", 1)
            .attr("marker-end","url(#arrow)")
            .node()
    }

    redraw() {
        if(this.node != null) {
            d3.select(this.node).remove()
        }

        this.draw()
    }
}

class ProTransition extends Transition {
    constructor(x, y) {
        super();
        this.from_state = -1
        this.to_state = []
    }

    drag() {

    }
}

class Point {
    constructor(x, y) {
        let default_width = 14
        this.datum = {
            // 外接矩形左上角
            position: {
                x: x - default_width / 2,
                y: y - default_width / 2
            },
            width: default_width,
            height: default_width,
            r: default_width / 2
        }
    }

    draw() {
        this.node = svg.append('circle')
            .datum(this.datum)
            .attr('cx', (d) => {
                return d.position.x + d.r
            })
            .attr('cy', (d) => {
                return d.position.y + d.r
            })
            .attr('r', (d) => {
                return d.r
            })
            .attr('fill', 'white')
            .attr('stroke', 'black')
            .node()
    }

    drag() {

    }
}
