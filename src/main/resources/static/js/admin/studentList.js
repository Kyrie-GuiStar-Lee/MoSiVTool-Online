ul.eq(5).addClass("active open");
ul.eq(5).children().eq(2).children().eq(0).addClass("active");

/**
 * 请求更新学生信息
 * @param studentId  学生信息的id
 */
function updateUser(studentId) {
    layer.open({
        type: 2,
        title: '修改学生信息',
        maxmin: true,
        shadeClose: true, //点击遮罩关闭层
        area: ['620px', '500px'],
        content: '/EasyPlatform/studentManage/toUpdatePage?studentId=' + studentId,
        end: function () {
            // 更新数据
            setContentData();
        }
    });
}

/**
 * 删除学生信息
 * @param studentId   学生信息的id
 */
function deleteUser(studentId) {
    layer.confirm('确认要删除吗？删除后不可恢复，谨慎操作！', {icon: 7, title: '警告'},
        function () {
            //此处请求后台程序，下方是成功后的前台处理……
            $.ajax({
                type: "POST",
                data: {
                    "studentId": studentId
                },
                url: "/EasyPlatform/studentManage/delStudentById",
                dataType: "json",
                success: function (data) {
                    if (data.state == 3) {
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
        url: "/EasyPlatform/studentManage/getStudentInfoList",
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
        url: "/EasyPlatform/studentManage/getStudentInfoList",
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
            '<input onclick="testCheck()" name="ids"' + ' value="' + u.studentId + '" type="checkbox" class="ace"/>' +
            '<span class="lbl"></span>' +
            '</label>' +
            '</td>';
        str += '<td>' + u.studentId + '</td>' +
            '<td>' + u.studentName + '</td>' +
            '<td>' + u.university.universityName + '</td>';
        str += '<td>' + u.studentCardId + '</td>' +
            '<td>' + '<button title="修改学生信息" class="btn btn-warning btn-table" onclick="'
            + 'updateUser(' + u.studentId + ')' + '"' + '>' +
            '<span class="fa fa-pencil">' + '</span>' + '修改' +
            '</button>' + '<button title="删除学生信息" class="btn btn-danger btn-table" ' +
            'onclick="' + 'deleteUser(' + u.studentId + ')' + '"' + '>' +
            '<span class="fa fa-trash-o">' + '</span>' + '删除' + '</button>'
            + '</td>' + '</tr>';
        table.append(str);
    });
}

/**
 * 批量删除学生信息
 */
$("#deleteUsersBtn").on("click", function () {
    var ids = [];
    $("input[name='ids']").each(function () {
        if ($(this).prop("checked")) {
            ids.push(parseInt($(this).val()));
        }
    });
    if (ids.length === 0) {
        layer.msg("请选择要删除的学生信息!");
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
                url: "/EasyPlatform/studentManage/delStudents",
                dataType: "json",
                traditional: true,
                success: function (data) {
                    if (data.state == 3) {
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
 * 添加学生信息
 */
$("#addUserBtn").on("click", function () {
    layer.open({
        type: 2,
        title: '添加学生信息',
        maxmin: false,
        resize: false,
        shadeClose: true, //点击遮罩关闭层
        area: ['600px', '550px'],
        content: '/EasyPlatform/studentManage/toAddStudentPage',
        end: function () {
            setContentData();
        }
    });
});