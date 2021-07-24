ul.eq(3).addClass("active open");
ul.eq(3).children().eq(2).children().eq(0).addClass("active");

// 设置数据
function setContentData() {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/productManage/getAllPassProduct",
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
    var quantity;
    $(list).each(function (i, u) {
        if (u.quantity === 0) {
            quantity = "已售空";
        } else {
            quantity = u.quantity + "件";
        }
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
            '<td>' + quantity + '</td>' +
            '<td>' + u.productDesc + '</td>';
        str += '<td>' + u.normalPrice + '元' + '</td>';
        str += '<td>' + u.productCategory.productCategoryName + '</td>' +
            '<td>' + u.shop.shopName + '</td>' +
            '<td>' + '<button title="禁售" class="btn btn-danger btn-table" onclick="'
            + 'banProduct(' + u.productId + ')' + '"' + '>' +
            '<span class="fa fa-ban">' + '</span>禁售' +
            '</button>' +
            '<button title="查看详情" class="btn btn-warning btn-table" ' +
            'onclick="productInfo(' + u.productId
            + ')"' + '>' + '<span class="fa fa-eye"></span>查看详情' + '</button>'
            + '</td>' + '</tr>';
        table.append(str);
    });
}


function toPage(number) {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/productManage/getAllPassProduct",
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


function banProduct(productId) {
    layer.confirm('确认要禁售该商品么？谨慎操作！', {icon: 7, title: '警告'},
        function () {
            //此处请求后台程序，下方是成功后的前台处理……
            $.ajax({
                type: "POST",
                data: {
                    "productId": productId
                },
                url: "/EasyPlatform/productManage/banProduct",
                dataType: "json",
                traditional: true,
                success: function (data) {
                    if (data.state === 5) {
                        layer.msg(data.stateInfo, {icon: 1, time: 1000});
                        setContentData();
                    } else {
                        layer.msg(data.stateInfo, {icon: 2, time: 1000});
                    }
                }
            });
        });
}

function productInfo(productId) {
    window.open(("/EasyPlatform/productManage/productInfo?productId=" + productId));
}