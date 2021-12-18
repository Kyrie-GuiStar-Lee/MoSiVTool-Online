/**
 * 获取鼠标触发事件元素上的坐标
 * @param event
 * @returns {{x: number, y: number}}
 */
function getMousePosition(event) {
    let x = 0
    let y = 0
    if(event.offsetX || event.layerX) {
        x = event.offsetX == undefined ? event.layerX : event.offsetX
        y = event.offsetY == undefined ? event.layerY : event.offsetY
    }
    return {x: x, y: y}
}

/**
 * 删除列表中值为value的元素
 * @param arr
 * @param value
 */
function remove(arr, value) {
    if(value == null) {
        return;
    }
    let index = arr.indexOf(value);
    arr.splice(index, 1);
}

function deepCopy(obj) {
    let new_obj = Object.create(obj);
    return new_obj;
}

function between(a, x, b) {
    if(a > b) {
        [a, b] = [b ,a];
    }
    return (x >= a && x <= b);
}

function inRect(x, y, corner_a, corner_b) {
    return between(corner_a.x, x, corner_b.x) && between(corner_a.y, y, corner_b.y);
}

function inCircle(x, y, center, r) {
    let distance_square = (x - center.x)*(x - center.x) + (y - center.y)*(y - center.y);
    let r_square = r*r;
    return distance_square <= r_square;
}

