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
        this.cvs = $(params['el'])
        // 获取canvas的画笔
        this.ctx = this.cvs[0].getContext("2d");

        this._bindEvents()
    }

    /**
     * 将建模元素添加进画布
     * @param component 建模元素
     */
    add(component) {
        this.components.push(component);
    }

    /**
     * 统一绘制建模元素
     */
    draw() {
        let length = this.components.length;
        for (let i = 0; i < length; i++) {
            this.components[i].draw(this.ctx);
        }
    }

    update() {
        //清空画布
        this.ctx.clearRect(0, 0, this.cvs.width(), this.cvs.height());
        this.draw();
    }

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
        this.cvs = $(params['el'])
        // 获取canvas的画笔
        this.ctx = this.cvs[0].getContext("2d");

        this._bindEvents();
    }

    /**
     * 将建模元素添加进画板工具栏
     * @param component 建模元素
     */
    add(component) {
        this.components.push(component);
    }

    /**
     * 统一绘制建模元素
     */
    draw() {
        let length = this.components.length;
        for (let i = 0; i < length; i++) {
            this.components[i].draw(this.ctx);
        }
    }

    update() {
        //清空画布
        this.ctx.clearRect(0, 0, this.cvs.width(), this.cvs.height());
        this.draw();
    }

    /**
     * 接收diagram退回的组件
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
                this.component_chose = it;
            }
        })

        if(this.component_chose != null) {
            this.component_chose = deepCopy(this.component_chose);
            this.component_chose.draggable = true;
            this.add(this.component_chose);
            this.component_chose.draw(this.ctx);

            this.component_chose.offset = {
                x: this.component_chose.position.x - mouse_pos.x,
                y: this.component_chose.position.y - mouse_pos.y
            };
        }
    }

    _bindEvents() {
        this.cvs.on('mousemove', (e) => {
            if(e.which == 1) {
                if(this.component_chose == null) {
                    this._choose(e);
                }
                if (this.component_chose != null && this.component_chose.draggable) {
                    let mouse_pos = getMousePosition(e);
                    this.component_chose.position = {
                        x: mouse_pos.x + this.component_chose.offset.x,
                        y: mouse_pos.y + this.component_chose.offset.y
                    }
                    this.update();
                }
            }
            else {
                remove(this.components, this.component_chose);
                this.component_chose = null;
                this.update();
            }
        })

        this.cvs.on('mouseout', (e) => {
            if(this.component_chose != null) {
                component_to_transmit = deepCopy(this.component_chose);
                remove(this.components, this.component_chose);
                this.component_chose = null;
                this.update();
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
    // 组件起始x, y
    position = {
        x: 0,
        y: 0
    }
    // 鼠标点击位置与x, y的偏移
    offset = {
        x: 0,
        y: 0
    }
    draggable = false;
    upper_layer = []; // 上层component
    z_index = 1; // 层号

    draw(ctx) {

    }

    /**
     * 组件是否包含像素点x, y
     * @param x
     * @param y
     */
    contain(x, y) {

    }

    /**
     * 鼠标点击在mouse_x, mouse_y处拖动
     * @param mouse_x
     * @param mouse_yy
     */
    drag(mouse_x, mouse_y) {

    }
}

/**
 * 状态图的开始状态类
 * type = 1 表示开始状态
 */
class StartState extends Component {

    /**
     * 构造函数
     * @param r 半径
     * @param x x坐标
     * @param y y坐标
     */
    constructor(r, x, y) {
        super();
        this.type = 1;
        this.r = r;
        this.position = {
            x: x,
            y: y
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
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
 * 状态图的中止状态类
 */
class EndState extends Component {
    constructor(r, x, y) {
        super();
        this.type = 2;
        this.r = r;
        this.position = {
            x: x,
            y: y
        }
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.position.x, this.position.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
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
        this.position = {
            x: x,
            y: y
        }
        this.r = 15; // 圆角半径
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        let point_a = {x: this.position.x + this.r, y: this.position.y}
        let point_b = {x: this.position.x + this.width, y: this.position.y}
        let point_c = {x: this.position.x + this.width, y: this.position.y + this.height}
        let point_d = {x: this.position.x, y: this.position.y + this.height}
        let point_e = {x: this.position.x, y: this.position.y}
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(point_a.x, point_a.y);
        ctx.arcTo(point_b.x, point_b.y, point_c.x, point_c.y, this.r);
        ctx.arcTo(point_c.x, point_c.y, point_d.x, point_d.y, this.r);
        ctx.arcTo(point_d.x, point_d.y, point_e.x, point_e.y, this.r);
        ctx.arcTo(point_e.x, point_e.y, point_a.x, point_a.y, this.r);
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
        ctx.restore();
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
class SizeAdapter extends Component {
    constructor() {
        super();
        this.type = 5;
    }
}