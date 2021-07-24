ul.eq(1).addClass("active open");
ul.eq(1).children().eq(2).children().eq(1).addClass("active");

var userId;
var username;

$("#searchBtn").on("click", function () {
    userId = $("#userId").val();
    username = $("#username").val();
    if (userId === "" && username === "") {
        layer.msg("请填写查询信息");
        return;
    }
    setSearchContentData();
});


function setSearchContentData() {
    $.ajax({
        type: "POST",
        data: {
            "userId": userId,
            "username": username,
            "pageSize": pageSize,
            "pageNum": currentpageNum
        },
        url: "/EasyPlatform/userManage/searchUser",
        dataType: "json",
        success: function (data) {
            /* 总页数 */
            btnNum = data.pages;
            /* 当前页数 */
            currentpageNum = data.pageNum;
            setTable(data.list);
            setPage(btnNum);
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


function toPage(number) {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/userManage/searchUser",
        dataType: "json",
        data: {
            "pageNum": number,
            "pageSize": pageSize,
            "userId": userId,
            "username": username
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
            setSearchContentData();
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