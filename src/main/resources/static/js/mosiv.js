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
        // 获取canvas的画笔
        // this.ctx = this.cvs[0].getContext("2d");
        //
        // this._bindEvents()
    }

    // /**
    //  * 将建模元素添加进画布
    //  * @param component 建模元素
    //  */
    // add(component) {
    //     this.components.push(component);
    // }

    draw(component) {
        component.draw(this.svg)
    }

    // update() {
    //     //清空画布
    //     this.ctx.clearRect(0, 0, this.cvs.width(), this.cvs.height());
    //     this.draw();
    // }

    /**
     * 接收来自palette的组件
     * @param e
     * @private
     */
    _receive(e) {
        if(component_to_transmit != null) {
            this.component_chose = component_to_transmit;
            let mouse_pos = getMousePosition(e);
            this.component_chose.position = {
                x: mouse_pos.x + this.component_chose.offset.x,
                y: mouse_pos.y + this.component_chose.offset.y
            }
            this.add(deepCopy(this.component_chose));
            this.component_chose.draw(this.ctx);
            component_to_transmit = null;
        }
    }

    /**
     * 选择组件
     * @param e
     * @private
     */
    _choose(e) {
        let mouse_pos = getMousePosition(e);
        this.components.forEach((it) => {
            if(it.contain(mouse_pos.x, mouse_pos.y)) {
                // TODO 未考虑重叠，后期修改
                this.component_chose = it;
            }
        })

        if(this.component_chose != null) {
            this.component_chose.offset = {
                x: this.component_chose.position.x - mouse_pos.x,
                y: this.component_chose.position.y - mouse_pos.y
            }
        }
    }


    _bindEvents() {
        this.cvs.on('mousemove', (e) => {
            if(e.which == 1) {
                if(this.component_chose == null) {
                    this._receive(e);
                    this._choose(e);
                }
                if (this.component_chose != null && this.component_chose.draggable) {
                    let mouse_pos = getMousePosition(e);
                    this.component_chose.drag(mouse_pos.x, mouse_pos.y);
                    this.update();
                }
            }
            else {
                this.component_chose = null;
            }
        })
    }
}

/**
 * 建模元素画板
 */
class StateDiagramPalette {
    components = [];
    component_chose = null;

    /**
     * 构造函数
     * @param params 以json形式给出的参数
     */
    constructor(params) {
        this.svg = d3.select(params['el'])
        // this.svg.call(this.zoomHandler())
    }

    /**
     * 将建模元素添加进画板工具栏
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

    zoomHandler() {
        // TODO unimplemented
        return d3.zoom()
            .scaleExtent([1, 1])
            .translateExtent([-100, 100], this.svg.node().getBoundingClientRect().width, this.svg.node().getBoundingClientRect().height)
            .on('zoom', () => {
                this.svg.attr("transform", "translate("
                    + d3.event.translate
                    + ")scale(" + d3.event.scale + ")")
            })
    }

    _bindEvents() {
        // this.cvs.on('mousemove', (e) => {
        //     if(e.which == 1) {
        //         if(this.component_chose == null) {
        //             this._choose(e);
        //         }
        //         if (this.component_chose != null && this.component_chose.draggable) {
        //             let mouse_pos = getMousePosition(e);
        //             this.component_chose.position = {
        //                 x: mouse_pos.x + this.component_chose.offset.x,
        //                 y: mouse_pos.y + this.component_chose.offset.y
        //             }
        //             this.update();
        //         }
        //     }
        //     else {
        //         remove(this.components, this.component_chose);
        //         this.component_chose = null;
        //         this.update();
        //     }
        // })
        //
        // this.cvs.on('mouseout', (e) => {
        //     if(this.component_chose != null) {
        //         component_to_transmit = deepCopy(this.component_chose);
        //         remove(this.components, this.component_chose);
        //         this.component_chose = null;
        //         this.update();
        //     }
        // })
    }
}

class Component {
    /**
     * 组件类型 根据类型 绘制出不同的图形
     * @type {number}
     */
    type = -1;
    // 组件起始x, y
    node = null
    data = {
        position: {
            x: 0,
            y: 0
        }
    }
    // // 鼠标点击位置与x, y的偏移
    // offset = {
    //     x: 0,
    //     y: 0
    // }

    draw(svg) {

    }

    add_resizer() {

    }

    remove_resizer() {

    }
}

/**
 * 开始状态模型
 * type = 1 表示开始状态
 */
class StartStateModel extends Component {
    /**
     * 构造函数
     * @param r 半径
     * @param x x坐标
     * @param y y坐标
     */
    constructor(x, y, r) {
        super();
        this.type = 1;
        this.data = {
            position: {
                x: x,
                y: y
            },
            r: r
        }
    }

    draw(svg) {
        this.node = svg.datum(this.data)
            .append('circle')
            .attr('cx', (d) => {
                return d.position.x + 'px'
            })
            .attr('cy', (d) => {
                return d.position.y + 'px'
            })
            .attr('r', (d) => {
                return d.r + 'px'
            })
            .node()

        this.bindEvents()
    }

    dragstart(event, d) {
        d3.select(this).raise()
    }

    dragmove(event, d) {
        d3.select(this)
            .attr('cx', event.x)
            .attr('cy', event.y)
        console.log(event.x)
    }

    dragend(event, d) {
        d3.select(this)
            .attr('cx', d.position.x)
            .attr('cy', d.position.y)
    }

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
}

/**
 * 状态图的开始状态类
 */
class StartState extends StartStateModel {
    constructor(x, y, r) {
        super(x, y, r);
    }

    draw(svg) {
        this.node = svg.datum(this.data)
            .append('circle')
            .attr('cx', (d) => {
                return d.position.x + 'px'
            })
            .attr('cy', (d) => {
                return d.position.y + 'px'
            })
            .attr('r', (d) => {
                return d.r + 'px'
            })
            .on('mousedown', () => {
                // TODO unimplemented
                console.log(1)
            })
            .node()

        this.bindEvents()
    }

    dragstart(event, d) {}

    dragmove(event, d) {
        super.dragmove(event, d)
        d.position.x = event.x
        d.position.y = event.y
    }

    dragend(event, d) {}
}

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

/**
 * 调整组件大小
 */
class Resizer extends Component {
    /**
     *
     * @param x 中心
     * @param y 中心
     * @param parent 父组件
     */
    constructor(x, y, parent) {
        super();
        this.type = 5;
        this.position = {
            x: x,
            y: y
        }
        this.width = 20;
        this.parent = parent;

        this.left_top = {
            x: this.position.x - this.width/2,
            y: this.position.y - this.width/2
        }
    }

    draw(ctx) {
        ctx.rect(this.left_top.x, this.left_top.y, this.left_top.x + this.width, this.left_top.y + this.width);
    }

    contain(x, y) {
        return inRect(x, y,
            {x: this.left_top.x, y: this.left_top.y},
            {x: this.left_top.x + this.width, y: this.left_top.y + this.width});
    }

    drag(mouse_x, mouse_y) {
        this.position = {
            x: mouse_x + this.offset.x,
            y: mouse_y + this.offset.y
        }

        this.left_top = {
            x: this.position.x - this.width/2,
            y: this.position.y - this.width/2
        }
    }
}