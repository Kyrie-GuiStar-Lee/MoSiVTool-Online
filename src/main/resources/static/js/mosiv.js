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
}

/**
 * 状态图的中止状态类
 */
class EndState extends Component {
    constructor() {
        super();
        this.type = 2;
    }
}

/**
 * 状态图的普通状态类
 */
class State extends Component {
    constructor() {
        super();
        this.type = 3;
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