ul.eq(3).addClass("active open");
ul.eq(3).children().eq(2).children().eq(2).addClass("active");


// 设置数据
function setContentData() {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/categoryManage/getAllCategoryList",
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
        str += '<td>' + u.productCategoryId + '</td>' +
            '<td>' + u.productCategoryName + '</td>';
        str += '<td>' + '<button title="删除" class="btn btn-danger btn-table" onclick="'
            + 'deleteCategory(' + u.productCategoryId + ')' + '"' + '>' +
            '<span class="fa fa-trash">' + '</span>删除' +
            '</button>' + '<button title="修改" class="btn btn-warning btn-table" onclick="'
            + 'updateCategory(' + u.productCategoryId + ')' + '"' + '>' +
            '<span class="fa fa-pencil">' + '</span>修改' +
            '</button>' + '</td>' + '</tr>';
        table.append(str);
    });
}


function toPage(number) {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/categoryManage/getAllCategoryList",
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

function deleteCategory(categoryId) {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/categoryManage/deleteCategory",
        dataType: "json",
        data: {
            "categoryId": categoryId
        },
        /* 填充数据 */
        success: function (data) {
            if (data.state === 7) {
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

$("#deleteCategories").on("click", function () {
    var ids = [];
    $("input[name='ids']").each(function () {
        if ($(this).prop("checked")) {
            ids.push(parseInt($(this).val()));
        }
    });
    if (ids.length === 0) {
        layer.msg("请选择要删除的分类!");
        return;
    }
    layer.confirm('确认要删除吗？批量删除后不可恢复，谨慎操作！', {icon: 7, title: '警告'},
        function () {
            //此处请求后台程序，下方是成功后的前台处理……
            $.ajax({
                type: "POST",
                data: {
                    "ids": ids
                },
                url: "/EasyPlatform/categoryManage/deleteCategories",
                dataType: "json",
                traditional: true,
                success: function (data) {
                    if (data.state === 8) {
                        layer.msg('已删除!', {icon: 1, time: 2000});
                        setContentData();
                    } else {
                        layer.msg(data.stateInfo, {icon: 2, time: 2000});
                    }
                }
            });
        });
});

$("#addCategory").on("click", function () {
    layer.open({
        type: 2,
        title: '添加分类',
        maxmin: true,
        shadeClose: true, //点击遮罩关闭层
        area: ['600px', '550px'],
        content: '/EasyPlatform/categoryManage/addCategory',
        end: function () {
            setContentData();
        }
    });
});

function updateCategory(productCategoryId) {
    layer.open({
        type: 2,
        title: '添加分类',
        maxmin: true,
        shadeClose: true, //点击遮罩关闭层
        area: ['600px', '550px'],
        content: '/EasyPlatform/categoryManage/updateCategory?productCategoryId=' + productCategoryId,
        end: function () {
            setContentData();
        }
    });
}