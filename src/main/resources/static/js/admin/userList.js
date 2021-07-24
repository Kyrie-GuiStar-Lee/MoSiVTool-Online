ul.eq(1).addClass("active open");
ul.eq(1).children().eq(2).children().eq(0).addClass("active");

/**
 * 请求更新用户信息
 * @param userId  用户的id
 */
function updateUser(userId) {
    layer.open({
        type: 2,
        title: '修改用户信息',
        maxmin: true,
        shadeClose: true, //点击遮罩关闭层
        area: ['620px', '500px'],
        content: '/EasyPlatform/userManage/toUpdatePage?userId=' + userId,
        end: function () {
            // 更新数据
            setContentData();
        }
    });
}

/**
 * 删除用户信息
 * @param userId   用户的id
 */
function deleteUser(userId) {
    layer.confirm('确认要删除吗？删除后不可恢复，谨慎操作！', {icon: 7, title: '警告'},
        function () {
            //此处请求后台程序，下方是成功后的前台处理……
            $.ajax({
                type: "POST",
                data: {
                    "userId": userId,
                    "pageSize": pageSize,
                    "pageNum": currentpageNum
                },
                url: "/EasyPlatform/userManage/delUserById",
                dataType: "json",
                success: function (data) {
                    /* 总页数 */
                    btnNum = data.pages;
                    /* 当前页数 */
                    currentpageNum = data.pageNum;
                    setTable(data.list);
                    setPage(btnNum);
                    layer.msg('已删除!', {icon: 1, time: 2000});
                }
            });
        });
}

/* 第一次访问页面时 获取json数据 */
function setContentData() {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/userManage/getUserList",
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
        url: "/EasyPlatform/userManage/getUserList",
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
    var userType;
    var enableStatus;
    var gender;
    $(list).each(function (i, u) {
        if (u.userType === 1) {
            userType = "普通顾客";
        } else if (u.userType === 2) {
            userType = "认证学生";
        } else {
            userType = "学生店家";
        }
        if (u.enableStatus === 1) {
            enableStatus = "可用";
        } else {
            enableStatus = "禁用";
        }
        if (u.gender === 1) {
            gender = "男";
        } else if (u.gender === 2) {
            gender = "女";
        } else {
            gender = "保密";
        }

        var str =
            '<tr>' +
            '<td class="center">' +
            '<label>' +
            '<input onclick="testCheck()" name="ids"' + ' value="' + u.userId + '" type="checkbox" class="ace"/>' +
            '<span class="lbl"></span>' +
            '</label>' +
            '</td>';
        str += '<td>' + u.userId + '</td>' +
            '<td>' + '<img class="user-photo" alt="用户头像" src="' + u.profileImg
            + '"' + '>' + u.username + '</td>' +
            '<td>' + u.userProfile + '</td>';
        str += '<td>' + userType + '</td>';
        str += '<td>' + enableStatus + '</td>' +
            '<td>' + gender + '</td>' +
            '<td>' + '<button title="修改用户" class="btn btn-warning btn-table" onclick="'
            + 'updateUser(' + u.userId + ')' + '"' + '>' +
            '<span class="fa fa-pencil">' + '</span>' + '修改' +
            '</button>' + '<button title="删除用户" class="btn btn-danger btn-table" ' +
            'onclick="' + 'deleteUser(' + u.userId + ')' + '"' + '>' +
            '<span class="fa fa-trash-o">' + '</span>' + '删除' + '</button>'
            + '</td>' + '</tr>';
        table.append(str);
    });
}

/**
 * 批量删除用户
 */
$("#deleteUsersBtn").on("click", function () {
    var ids = [];
    $("input[name='ids']").each(function () {
        if ($(this).prop("checked")) {
            ids.push(parseInt($(this).val()));
        }
    });
    if (ids.length === 0) {
        layer.msg("请选择要删除的用户!");
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
                url: "/EasyPlatform/userManage/delUsers",
                dataType: "json",
                traditional: true,
                success: function (data) {
                    /* 总页数 */
                    btnNum = data.pages;
                    /* 当前页数 */
                    currentpageNum = data.pageNum;
                    setTable(data.list);
                    setPage(btnNum);
                    layer.msg('已删除!', {icon: 1, time: 2000});
                }
            });
        });
});

/**
 * 添加用户
 */
$("#addUserBtn").on("click", function () {
    layer.open({
        type: 2,
        title: '添加用户',
        maxmin: true,
        shadeClose: true, //点击遮罩关闭层
        area: ['600px', '550px'],
        content: '/EasyPlatform/userManage/toAddUserPage',
        end: function () {
            setContentData();
        }
    });
});