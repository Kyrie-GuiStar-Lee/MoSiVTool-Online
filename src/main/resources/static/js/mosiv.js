// --------------------------状态图建模 -------------------------------//
/**
 * 建模元素画板
 */
class StateDiagramPalette {
    components = [];

    /**
     * 构造函数
     * @param params 以json形式给出的参数
     */
    constructor(params) {
        // 获取canvas的画笔
        this.ctx = $(params['el'])[0].getContext("2d");
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
}

class Component {
    /**
     * 组件类型 根据类型 绘制出不同的图形
     * @type {number}
     */
    type = -1;

    draw(ctx) {

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
        let distance_square = (x - this.x)*(x - this.x) + (y - this.y)*(y - this.y)
        let r_square = this.r*this.r
        return distance_square <= r_square
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
}

/**
 * 状态图的普通状态类
 */
class State extends Component {
    constructor(x, y, width, height) {
        super();
        this.type = 3;
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }

    draw(ctx) {
        let r = 15
        let point_a = {x: this.x + r, y: this.y}
        let point_b = {x: this.x + this.width, y: this.y}
        let point_c = {x: this.x + this.width, y: this.y + this.height}
        let point_d = {x: this.x, y: this.y + this.height}
        let point_e = {x: this.x, y: this.y}
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(point_a.x, point_a.y);
        ctx.arcTo(point_b.x, point_b.y, point_c.x, point_c.y, r);
        ctx.arcTo(point_c.x, point_c.y, point_d.x, point_d.y, r);
        ctx.arcTo(point_d.x, point_d.y, point_e.x, point_e.y, r);
        ctx.arcTo(point_e.x, point_e.y, point_a.x, point_a.y, r)
        ctx.stroke();
        ctx.fill();
        ctx.closePath();
        ctx.restore();
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