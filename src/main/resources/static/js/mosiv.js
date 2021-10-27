// --------------------------状态图建模 -------------------------------//
let component_to_transmit = null;

// TODO e.which浏览器不兼容

/**
 * 建模元素画布
 */
class StateDiagramCanvas {
    components = [];
    component_chose = null;

    /**
     * 构造函数
     * @param params 以json形式给出的参数
     */
    constructor(params) {
        this.svg = d3.select(params['el'])
        this._bindEvents()
    }

    /**
     * 将建模元素添加进画布
     * @param component 建模元素
     */
    add(component) {
        this.components.push(component);
    }

    draw() {
        this.components.forEach((it) => {
            it.draw(this.svg)
        })
    }

    _bindEvents() {
        this.svg.on('click', (event) => {
            if(component_to_transmit != null) {
                this.component_chose = new component_to_transmit(event.layerX, event.layerY)
                this.components.push(this.component_chose)
                this.component_chose.draw(this.svg)
                component_to_transmit = null
            }
        })
    }
}

class Component {
    /**
     * 组件类型 根据类型 绘制出不同的图形
     * @type {number}
     */
    type = -1;
    // svg节点
    node = null
    data = {
        position: {
            x: 0,
            y: 0
        },
        parent: null
    }

    resizers = []
    children = []

    draw(svg) {

    }

    add_resizer() {

    }

    remove_resizer() {

    }

    resize() {

    }
}

/**
 * 开始状态模型
 * type = 1 表示开始状态
 */
class StartState extends Component {
    /**
     * 构造函数
     * @param x x坐标（圆心）
     * @param y y坐标（圆心）
     */
    constructor(x, y) {
        super();
        let type = 1
        let default_r = 32
        this.data = {
            position: {
                x: x,
                y: y
            },
            r: default_r
        }

        this.add_resizers()
    }

    draw(svg) {
        this.node = svg.datum(this.data)
            .append('circle')
            .attr('cx', (d) => {
                return d.position.x
            })
            .attr('cy', (d) => {
                return d.position.y
            })
            .attr('r', (d) => {
                return d.r
            })
            .node()

        this.resizers.forEach((e) => {
            e.draw(svg)
        })

        this.bindEvents()
    }

    dragstart(event, d) {
        d3.select(this).raise()
    }

    dragmove(event, d) {
        d3.select(this)
            .attr('cx', event.x)
            .attr('cy', event.y)
        d.position.x = event.x
        d.position.y = event.y

        // TODO 拖着resizer一起移动应该可以通过<g>解决
    }

    dragend(event, d) {}

    bindEvents() {
        let drag = d3.drag()
            .subject(function() {
                let tmp = d3.select(this);
                return {
                    x: tmp.attr('cx'),
                    y: tmp.attr('cy')
                }
            })
            .on('start', this.dragstart)
            .on('drag', this.dragmove)
            .on('end', this.dragend)

        d3.select(this.node).call(drag)
    }

    add_resizers() {
        let rect = {
            position: {
                x: this.data.position.x - this.data.r,
                y: this.data.position.y - this.data.r
            },
            width: 2*this.data.r,
            height: 2*this.data.r
        }

        /*
         * 0 2     00 10     x+0,y+0  x+w,y+0
         * 1 3     01 11     x+0,y+h  x+w,y+w
         */
        let resizer0 = new Resizer(0, rect.position.x, rect.position.y, this)
        let resizer1 = new Resizer(1, rect.position.x, rect.position.y + rect.height, this)
        let resizer2 = new Resizer(2, rect.position.x + rect.width, rect.position.y, this)
        let resizer3 = new Resizer(3, rect.position.x + rect.width, rect.position.y + rect.height, this)

        this.resizers.push(resizer0)
        this.resizers.push(resizer1)
        this.resizers.push(resizer2)
        this.resizers.push(resizer3)
    }

    resize(event, number) {
        let opposite_resizer = null // 固定不动
        for(let i = 0; i <= 3; ++i) {
            if((number ^ i) === 3) {
                opposite_resizer = this.resizers[i]
                break
            }
        }

        let rect = {
            width: Math.abs(opposite_resizer.data.position.x - event.sourceEvent.layerX),
            height: Math.abs(opposite_resizer.data.position.y - event.sourceEvent.layerY),
        }
        rect.position = {
            x: opposite_resizer.data.position.x + ((number >> 1) - 1) * rect.width, // 00 01要-width
            y: opposite_resizer.data.position.y + ((number&1) - 1) * rect.height // 00 10要-height
        }

        // 修改本身
        this.data.r = Math.min(rect.width, rect.height)/2
        this.data.position = {
            x: rect.position.x + this.data.r,
            y: rect.position.y + this.data.r
        }
        d3.select(this.node)
            .attr('cx', this.data.position.x)
            .attr('cy', this.data.position.y)
            .attr('r', this.data.r)

        // 根据本身调整rect
        rect.width = 2*this.data.r
        rect.height = 2*this.data.r

        // 修改resizer
        this.resizers.forEach((e) => {
            e.data.position = {
                x: rect.position.x + (e.data.number >> 1) * rect.width,
                y: rect.position.y + (e.data.number & 1) * rect.height
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

/**
 * 调整组件大小
 */
class Resizer extends Component {
    /**
     * @param x 中心
     * @param y 中心
     * @param parent 父组件
     */
    constructor(number, x, y, parent) {
        super()
        this.type = 5
        let default_width = 10
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
            x: this.data.position.x - this.data.width/2,
            y: this.data.position.y - this.data.width/2
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

    dragend(event, d) {}

    bindEvents() {
        let drag = d3.drag()
            .subject(function() {
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

// ################################################################################################################## //
/**
 * 状态图的中止状态类
 */
class EndState extends Component {
    constructor(x, y, r) {
        super();
        this.type = 2;
        this.data = {
            position: {
                x: 0,
                y: 0
            },
            r: r
        }
    }

    draw(svg) {
        svg.append('circle')
            .attr('cx', this.position.x + 'px')
            .attr('cy', this.position.y + 'px')
            .attr('r', this.r + 'px')
    }

    contain(x, y) {
        return inCircle(x, y, {x: this.position.x, y: this.position.y}, this.r);
    }

    drag(mouse_x, mouse_y) {
        this.position = {
            x: mouse_x + this.offset.x,
            y: mouse_y + this.offset.y
        }
    }
}

/**
 * 状态图的普通状态类
 */
class State extends Component {
    constructor(x, y, width, height) {
        super();
        this.type = 3;
        // 外接矩形左上角
        this.data = {
            position: {
                x: 0,
                y: 0
            },
            width: width,
            height: height,
            r: r // 圆角半径
        }
    }

    draw(svg) {
        svg.append('rect')
            .attr('x', this.position.x)
            .attr('y', this.position.y)
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('rx', this.r)
    }

    contain(x, y) {
        let left_border = this.position.x;
        let right_border = this.position.x + this.width;
        let top_border = this.position.y;
        let bottom_border = this.position.y + this.height;

        let left_top_center = {x: left_border + this.r, y: top_border + this.r};
        let right_top_center = {x: right_border - this.r, y: top_border + this.r};
        let left_bottom_center = {x: left_border + this.r, y: bottom_border - this.r};
        let right_bottom_center = {x: right_border - this.r, y: bottom_border - this.r};

        let res = true;

        if(inRect(x, y, {x: left_border, y: top_border}, {x: right_border, y: bottom_border})) {
            if(inRect(x, y, {x: left_border, y: top_border}, left_top_center)) {
                if(!inCircle(x, y, left_top_center, this.r)) {
                    res = false;
                }
            }
            else if(inRect(x, y, {x: right_border, y: top_border}, right_top_center)) {
                if(!inCircle(x, y, right_top_center, this.r)) {
                    res = false;
                }
            }
            else if(inRect(x, y, {x: left_border, y: bottom_border}, left_bottom_center)) {
                if(!inCircle(x, y, left_bottom_center, this.r)) {
                    res = false;
                }
            }
            else if(inRect(x, y, {x: right_border, y: bottom_border}, right_bottom_center)) {
                if(!inCircle(x, y, right_bottom_center, this.r)) {
                    res = false;
                }
            }
        }
        else {
            res = false
        }
        return res;
    }

    drag(mouse_x, mouse_y) {
        this.position = {
            x: mouse_x + this.offset.x,
            y: mouse_y + this.offset.y
        }
    }
}

/**
 * 装态图的连线类
 */
class Link extends Component {
    constructor() {
        super();
        this.type = 4;
    }
}
