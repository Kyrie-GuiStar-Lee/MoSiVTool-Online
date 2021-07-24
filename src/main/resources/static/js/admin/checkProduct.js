ul.eq(3).addClass("active open");
ul.eq(3).children().eq(2).children().eq(1).addClass("active");


// 设置数据
function setContentData() {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/productManage/getAllWaitProduct",
        dataType: "json",
        data: {
            "pageNum": currentpageNum,
            "pageSize": pageSize
        },
        /* 填充数据 */
        success: function (data) {
            /* 总页数 */
            btnNum = data.pages;
            /* 当前页数 */
            currentpageNum = data.pageNum;
            /* 初始化时页面设置 */
            setTable(data.list);
            setPage(btnNum);
        },
        /* 提示用户 */
        error: function () {

        }
    });
}


/**
 * 拼接table数据
 */
function setTable(list) {
    table.empty();
    $(list).each(function (i, u) {
        var str =
            '<tr>' + '<td class="center">' + '<label>' +
            '<input onclick="testCheck()" name="ids"' + ' value="' +
            u.productId + '" type="checkbox" class="ace"/>' +
            '<span class="lbl"></span>' +
            '</label>' +
            '</td>';
        str += '<td>' + u.productId + '</td>' +
            '<td>' + '<img class="product-photo" alt="商品图片" src="' + u.imgAddr + '"' + '>'
            + u.productName + '</td>' +
            '<td>' + u.productDesc + '</td>';
        str += '<td>' + u.normalPrice + '元' + '</td>';
        str += '<td>' + u.productCategory.productCategoryName + '</td>' +
            '<td>' + u.shop.shopName + '</td>' +
            '<td>' + '<button title="通过审核" class="btn btn-success btn-table" onclick="'
            + 'passProduct(' + u.productId + ')' + '"' + '>' +
            '<span class="fa fa-check">' + '</span>通过审核' +
            '</button>' + '<button title="审核不通过" class="btn btn-danger btn-table" onclick="'
            + 'failPassProduct(' + u.productId + ')' + '"' + '>' +
            '<span class="fa fa-ban">' + '</span>审核不通过' +
            '</button>' +
            '<button title="查看详情" class="btn btn-warning btn-table" ' +
            'onclick="productInfo(' + u.productId
            + ')"' + '>' + '<span class="fa fa-eye"></span>查看详情' + '</button>'
            + '</td>' + '</tr>';
        table.append(str);
    });
}


function passProduct(productId) {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/productManage/passCheck",
        dataType: "json",
        data: {
            "productId": productId
        },
        /* 填充数据 */
        success: function (data) {
            if (data.state === 6) {
                layer.msg(data.stateInfo, {icon: 1, time: 1000});
                setContentData();
            } else {
                layer.msg(data.stateInfo, {icon: 2, time: 2000});
            }
        },
        /* 提示用户 */
        error: function () {

        }
    });
}

function failPassProduct(productId) {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/productManage/failPassCheck",
        dataType: "json",
        data: {
            "productId": productId
        },
        /* 填充数据 */
        success: function (data) {
            if (data.state === 6) {
                layer.msg(data.stateInfo, {icon: 1, time: 1000});
                setContentData();
            } else {
                layer.msg(data.stateInfo, {icon: 2, time: 2000});
            }
        },
        /* 提示用户 */
        error: function () {

        }
    });
}

function productInfo(productId) {
    window.open(("/EasyPlatform/productManage/productInfo?productId=" + productId));
}


function toPage(number) {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/productManage/getAllWaitProduct",
        dataType: "json",
        data: {
            "pageNum": number,
            "pageSize": pageSize
        },
        /* 填充数据 */
        success: function (data) {
            /* 总页数 */
            btnNum = data.pages;
            /* 当前页数 */
            currentpageNum = data.pageNum;
            setTable(data.list);
            setPage(btnNum);
        },
        /* 提示用户 */
        error: function () {

        }
    });
}