ul.eq(6).addClass("active open");
ul.eq(6).children().eq(2).children().eq(0).addClass("active");

/**
 * 请求更新大学信息
 * @param universityId  大学信息的id
 */
function updateUser(universityId) {
    layer.open({
        type: 2,
        title: '修改大学信息',
        maxmin: true,
        shadeClose: true, //点击遮罩关闭层
        area: ['620px', '500px'],
        content: '/EasyPlatform/universityManage/toUpdatePage?universityId=' + universityId,
        end: function () {
            // 更新数据
            setContentData();
        }
    });
}

/**
 * 删除大学信息
 * @param universityId   大学信息的id
 */
function deleteUser(universityId) {
    layer.confirm('确认要删除吗？删除后不可恢复，谨慎操作！', {icon: 7, title: '警告'},
        function () {
            //此处请求后台程序，下方是成功后的前台处理……
            $.ajax({
                type: "POST",
                data: {
                    "universityId": universityId
                },
                url: "/EasyPlatform/universityManage/delUniversityById",
                dataType: "json",
                success: function (data) {
                    if (data.state === 2) {
                        layer.msg(data.stateInfo, {icon: 1, time: 1000});
                        setContentData();
                    } else {
                        layer.msg(data.stateInfo, {icon: 2, time: 2000});
                    }
                }
            });
        });
}

/* 第一次访问页面时 获取json数据 */
function setContentData() {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/universityManage/getUniversityInfoList",
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
            /* 填充table数据 */
            setTable(data.list);
            /* 填充页数数据 */
            setPage(btnNum);
        },
        /* 提示用户 */
        error: function () {

        }
    });
}


function toPage(number) {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/universityManage/getUniversityInfoList",
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


/**
 * 拼接table数据
 */
function setTable(list) {
    table.empty();
    $(list).each(function (i, u) {
        var str =
            '<tr>' +
            '<td class="center">' +
            '<label>' +
            '<input onclick="testCheck()" name="ids"' + ' value="' + u.universityId + '" type="checkbox" class="ace"/>' +
            '<span class="lbl"></span>' +
            '</label>' +
            '</td>';
        str += '<td>' + u.universityId + '</td>' +
            '<td>' + u.universityName + '</td>';
        str += '<td>' + u.areaWrapper.province + ' ' + u.areaWrapper.city + ' ' + u.areaWrapper.region + '</td>';
        str += '<td>' + '<button title="修改大学信息" class="btn btn-warning btn-table" onclick="'
            + 'updateUser(' + u.universityId + ')' + '"' + '>' +
            '<span class="fa fa-pencil">' + '</span>' + '修改' +
            '</button>' + '<button title="删除大学信息" class="btn btn-danger btn-table" ' +
            'onclick="' + 'deleteUser(' + u.universityId + ')' + '"' + '>' +
            '<span class="fa fa-trash-o">' + '</span>' + '删除' + '</button>'
            + '</td>' + '</tr>';
        testCheck();
        table.append(str);
    });
}

/**
 * 批量删除大学信息
 */
$("#deleteUsersBtn").on("click", function () {
    var ids = [];
    $("input[name='ids']").each(function () {
        if ($(this).prop("checked")) {
            ids.push(parseInt($(this).val()));
        }
    });
    if (ids.length === 0) {
        layer.msg("请选择要删除的大学信息!");
        return;
    }
    layer.confirm('确认要删除吗？批量删除后不可恢复，谨慎操作！', {icon: 7, title: '警告'},
        function () {
            //此处请求后台程序，下方是成功后的前台处理……
            $.ajax({
                type: "POST",
                data: {
                    "ids": ids,
                    "pageSize": pageSize,
                    "pageNum": currentpageNum
                },
                url: "/EasyPlatform/universityManage/delUniversities",
                dataType: "json",
                traditional: true,
                success: function (data) {
                    if (data.state === 2) {
                        layer.msg(data.stateInfo, {icon: 1, time: 1000});
                        setContentData();
                    } else {
                        layer.msg(data.stateInfo, {icon: 2, time: 2000});
                    }
                }
            });
        });
});

/**
 * 添加大学信息
 */
$("#addUserBtn").on("click", function () {
    layer.open({
        type: 2,
        title: '添加大学信息',
        maxmin: false,
        resize: false,
        shadeClose: true, //点击遮罩关闭层
        area: ['700px', '500px'],
        content: '/EasyPlatform/universityManage/toAddUniversityPage',
        end: function () {
            setContentData();
        }
    });
});