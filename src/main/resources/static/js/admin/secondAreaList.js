ul.eq(4).addClass("active open");
ul.eq(4).children().eq(2).children().eq(1).addClass("active");

// 设置数据
function setContentData() {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/areaManage/getSecondAreaList",
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
    var type;
    $(list).each(function (i, u) {
        if (u.type === 1) {
            type = "省级";
        } else if (u.type === 2) {
            type = "市级";
        } else {
            type = "区/县级";
        }
        var str =
            '<tr>' + '<td class="center">' + '<label>' +
            '<input onclick="testCheck()" name="ids"' + ' value="' +
            u.areaId + '" type="checkbox" class="ace"/>' +
            '<span class="lbl"></span>' +
            '</label>' +
            '</td>';
        str += '<td>' + u.areaId + '</td>' +
            '<td>' + u.areaName + '</td>' +
            '<td>' + type + '</td>' +
            '<td>' + u.parent.areaName + '</td>';
        str += '<td>' + '<button title="删除" class="btn btn-danger btn-table" onclick="'
            + 'deleteArea(' + u.areaId + ')' + '"' + '>' +
            '<span class="fa fa-trash">' + '</span>删除' +
            '</button>' +
            '<button title="修改" class="btn btn-warning btn-table" ' +
            'onclick="updateArea(' + u.areaId
            + ')"' + '>' + '<span class="fa fa-pencil"></span>修改' + '</button>'
            + '</td>' + '</tr>';
        table.append(str);
    });
}

function updateArea(areaId) {
    layer.open({
        type: 2,
        title: '修改地区',
        maxmin: true,
        shadeClose: true, //点击遮罩关闭层
        area: ['600px', '550px'],
        content: '/EasyPlatform/areaManage/updateSecondAreaPage?areaId=' + areaId,
        end: function () {
            setContentData();
        }
    });
}

function deleteArea(areaId) {
    layer.confirm('确认要删除吗？删除后不可恢复，谨慎操作！', {icon: 7, title: '警告'},
        function () {
            //此处请求后台程序，下方是成功后的前台处理……
            $.ajax({
                type: "POST",
                url: "/EasyPlatform/areaManage/deleteArea",
                data: {
                    "areaId": areaId
                },
                /* 填充数据 */
                success: function (data) {
                    if ("success" == data) {
                        layer.msg("删除成功", {icon: 1, time: 2000});
                        setContentData();
                    } else {
                        layer.msg("删除失败", {icon: 2, time: 2000});
                    }
                },
                /* 提示用户 */
                error: function () {

                }
            });
        });
}

$("#deleteAreas").on("click", function () {
    var ids = [];
    $("input[name='ids']").each(function () {
        if ($(this).prop("checked")) {
            ids.push(parseInt($(this).val()));
        }
    });
    if (ids.length === 0) {
        layer.msg("请选择要删除的区域!");
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
                url: "/EasyPlatform/areaManage/deleteAreas",
                traditional: true,
                success: function (data) {
                    if ("success" == data) {
                        layer.msg("删除成功", {icon: 1, time: 2000});
                        setContentData();
                    } else {
                        layer.msg("删除失败", {icon: 2, time: 2000});
                    }
                }
            });
        });
});

function toPage(number) {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/areaManage/getSecondAreaList",
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

$("#addArea").on("click", function () {
    layer.open({
        type: 2,
        title: '添加地区',
        maxmin: true,
        shadeClose: true, //点击遮罩关闭层
        area: ['600px', '550px'],
        content: '/EasyPlatform/areaManage/addSecondAreaPage',
        end: function () {
            setContentData();
        }
    });
});