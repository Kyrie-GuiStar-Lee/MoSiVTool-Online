ul.eq(2).addClass("active open");
ul.eq(2).children().eq(2).children().eq(2).addClass("active");

var shopId;
var shopName;

$("#searchBtn").on("click", function () {
    shopId = $("#shopId").val();
    shopName = $("#shopName").val();
    if (shopId === "" && shopName === "") {
        layer.msg("请填写查询信息");
        return;
    }
    setSearchContentData();
});


function setSearchContentData() {
    $.ajax({
        type: "POST",
        data: {
            "shopId": shopId,
            "shopName": shopName,
            "pageSize": pageSize,
            "pageNum": currentpageNum
        },
        url: "/EasyPlatform/shopManage/searchShop",
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
    var enableStatus;
    var state;
    $(list).each(function (i, u) {

        if (u.enableStatus === 1) {
            enableStatus = "正常运营";
        } else {
            enableStatus = "该店铺正在整改";
        }
        if (u.checkState === 0) {
            state = "待审核";
        } else if (u.checkState === 1) {
            state = "审核已通过";
        } else {
            state = "审核不通过";
        }
        var str =
            '<tr>' + '<td class="center">' + '<label>' +
            '<input onclick="testCheck()" name="ids"' + ' value="' +
            u.shopId + '" type="checkbox" class="ace"/>' +
            '<span class="lbl"></span>' +
            '</label>' +
            '</td>';
        str += '<td>' + u.shopId + '</td>' +
            '<td>' + '<img class="user-photo" alt="用户头像" src="' + u.shopImg + '"' + '>'
            + u.shopName + '</td>' +
            '<td>' + u.shopDesc + '</td>';
        str += '<td>' + u.owner.username + '</td>';
        str += '<td>' + u.university.universityName + '</td>' +
            '<td>' + state + '</td>' + '<td>' + enableStatus + '</td>' +
            '<td>' + '<button title="禁用店铺" class="btn btn-warning btn-table" onclick="'
            + 'forbidShop(' + u.shopId + ')' + '"' + '>' +
            '<span class="fa fa-pencil">' + '</span>禁用' +
            '</button>' + '<button title="删除店铺" class="btn btn-danger btn-table" ' +
            'onclick="' + 'deleteShop(' + u.shopId + ')' + '"' + '>' +
            '<span class="fa fa-trash-o">' + '</span>删除' + '</button>' +
            '<button title="查看详情" class="btn btn-info btn-table" onclick="checkShop(' + u.shopId
            + ')"' + '>' + '<span class="fa fa-eye"></span>查看详情' + '</button>' + '</td>' + '</tr>';
        table.append(str);
    });
}


function toPage(number) {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/shopManage/searchShop",
        dataType: "json",
        data: {
            "pageNum": number,
            "pageSize": pageSize,
            "shopId": shopId,
            "shopName": shopName
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
 * 禁用店铺
 */
function forbidShop(shopId) {
    layer.confirm('确认要禁用该店铺吗？谨慎操作！', {icon: 7, title: '警告'},
        function () {
            //此处请求后台程序，下方是成功后的前台处理……
            $.ajax({
                type: "POST",
                data: {
                    "shopId": shopId
                },
                url: "/EasyPlatform/shopManage/forbidShop",
                dataType: "json",
                // traditional: true,
                success: function (data) {
                    if (data.state === 3) {
                        layer.msg(data.stateInfo, {icon: 1, time: 1000});
                        setContentData();
                    } else {
                        layer.msg(data.stateInfo, {icon: 2, time: 1000});
                    }
                }
            });
        });
}


/**
 * 删除店铺
 */
function deleteShop(shopId) {
    layer.confirm('确认要删除吗？删除后不可恢复，谨慎操作！', {icon: 7, title: '警告'},
        function () {
            //此处请求后台程序，下方是成功后的前台处理……
            $.ajax({
                type: "POST",
                data: {
                    "shopId": shopId
                },
                url: "/EasyPlatform/shopManage/delShop",
                dataType: "json",
                // traditional: true,
                success: function (data) {
                    if (data.state === 4) {
                        layer.msg(data.stateInfo, {icon: 1, time: 1000});
                        setContentData();
                    } else {
                        layer.msg(data.stateInfo, {icon: 2, time: 1000});
                    }
                }
            });
        });
}

/**
 * 查看店铺详情
 */
function checkShop(shopId) {
    layer.open({
        type: 2,
        title: '店铺详情',
        maxmin: true,
        shadeClose: true, //点击遮罩关闭层
        area: ['600px', '550px'],
        content: '/EasyPlatform/shopManage/toShopInfoPage?shopId=' + shopId,
        end: function () {
            setContentData();
        }
    });
}