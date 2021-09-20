// --------------------------状态图建模 -------------------------------//
let component_to_transmit = null;

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

    _bindEvents() {
        this.cvs.on('mouseover', (e) => {
            if(component_to_transmit != null) {
                this.component_chose = component_to_transmit;
                this.add(deepCopy(this.component_chose));
                this.component_chose.draw(this.ctx);
                component_to_transmit = null;
            }
        })

        let offset_x = 0;
        let offset_y = 0;
        this.cvs.on('mousedown', (e) => {
            let mouse_pos = getMousePosition(e)
            this.components.forEach((it) => {
                if(it.contain(mouse_pos.x, mouse_pos.y)) {
                    // 未考虑重叠，后期修改
                    this.component_chose = it;
                }
            })
            if(this.component_chose != null) {
                offset_x = this.component_chose.x - mouse_pos.x;
                offset_y = this.component_chose.y - mouse_pos.y;
            }
        })

        this.cvs.on('mousemove', (e) => {
            if(this.component_chose != null && this.component_chose.draggable) {
                let mouse_pos = getMousePosition(e);
                this.component_chose.x = mouse_pos.x + offset_x;
                this.component_chose.y = mouse_pos.y + offset_y;
                this.update();
            }
        })

        this.cvs.on('mouseup', (e) => {
            this.component_chose = null;
            this.update();
        })

        this.cvs.on('mouseout', (e) => {
            this.component_chose = null;
            this.update();
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

    _bindEvents() {
        let offset_x = 0;
        let offset_y = 0;
        this.cvs.on('mousedown', (e) => {
            let mouse_pos = getMousePosition(e)
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

                offset_x = this.component_chose.x - mouse_pos.x;
                offset_y = this.component_chose.y - mouse_pos.y;
            }
        })

        this.cvs.on('mousemove', (e) => {
            if(this.component_chose != null && this.component_chose.draggable) {
                let mouse_pos = getMousePosition(e);
                this.component_chose.x = mouse_pos.x + offset_x;
                this.component_chose.y = mouse_pos.y + offset_y;
                this.update();
            }
        })

        this.cvs.on('mouseup', (e) => {
            remove(this.components, this.component_chose);
            this.component_chose = null;
            this.update();
        })

        this.cvs.on('mouseout', (e) => {
            if(this.component_chose != null) {
                this.component_chose.x = -offset_x;
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
    draggable = false;
    upper_layer = []; // 上层component
    z_index = 1; // 层号

    draw(ctx) {

    }

    contain(x, y) {

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
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    contain(x, y) {
        return inCircle(x, y, {x: this.x, y: this.y}, this.r);
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
        this.x = x;
        this.y = y;
    }

    draw(ctx) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
        ctx.restore();
    }

    contain(x, y) {
        return inCircle(x, y, {x: this.x, y: this.y}, this.r);
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
        this.x = x;
        this.y = y;
        this.r = 15; // 圆角半径
        this.width = width;
        this.height = height;
    }

    draw(ctx) {
        let point_a = {x: this.x + this.r, y: this.y}
        let point_b = {x: this.x + this.width, y: this.y}
        let point_c = {x: this.x + this.width, y: this.y + this.height}
        let point_d = {x: this.x, y: this.y + this.height}
        let point_e = {x: this.x, y: this.y}
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
        let left_border = this.x;
        let right_border = this.x + this.width;
        let top_border = this.y;
        let bottom_border = this.y + this.height;

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