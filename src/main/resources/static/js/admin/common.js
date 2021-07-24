var ulPages = $("#pages");
var table = $("#table");

var pageSize = 10;
var currentpageNum = 1;
var btnNum;

var ul = $('ul.nav-list').children();
/* 设置选择页数大小 */
var pageSizeBtn = $("#pageSizeBtn");
var pageSizeList = $("#pageSizeList");

var lis = pageSizeList.children();
for (var i = 0; i < lis.size(); i++) {
    lis[i].onclick = function () {
        // 点击时，更换页数大小
        pageSize = parseInt(this.children[0].innerText);
        // 更换内容
        pageSizeBtn.html(this.children[0].innerText + '' +
            '<i style="margin-left: 5px;" class="fa fa-angle-down icon-on-right"></i>');
        for (var j = 0; j < lis.size(); j++) {
            lis[j].classList.remove("hidden")
        }
        this.classList.add("hidden");
        setContentData();
    }
}
$(function () {
    setHeadData();
    setContentData();
});

function setHeadData() {
    $.ajax({
        type: "POST",
        url: "/EasyPlatform/admin/adminInfo",
        dataType: "json",
        /* 填充数据 */
        success: function (data) {
            $('#userImg').attr("src", data.profileImg);
            $('#usernameSpan').text(data.username);
        },
        /* 提示用户 */
        error: function () {

        }
    });
}

/**
 * 跳页
 */
function jumpPage() {
    var num = $("#goPageInput").val();
    toPage(num);
}


/**
 * 上一页
 */
function prev() {
    currentpageNum -= 1;
    toPage(currentpageNum);
}

/**
 * 下一页
 */
function nextPage() {
    currentpageNum += 1;
    toPage(currentpageNum);
}


/**
 * 实现多选
 */
$("#checkMaster").on("click", function () {
    $("input[name='ids']").prop("checked", $("#checkMaster").prop("checked"));
});

/**
 * 当多选时，去掉从属的选框时，总选框也不能勾上
 */
function testCheck() {
    $("input[name='ids']").each(function () {
        $("#checkMaster").prop("checked",
            $("input[name='ids']").size() === $("input[name='ids']:checked").size());
        return false;
    })
}


/**
 * 拼接页码数据 默认只显示7个页码
 */
function setPage(btnNum) {
    ulPages.empty();
    // 不是第一页时，需要设置上一页按钮
    if (currentpageNum !== 1) {
        ulPages.append("<li onclick='prev()' id=\"prev\" class=\"page-item prev\">" +
            "<button class=\"icon-arrowdown2\">" +
            "上一页" + "</button>" + "</li>");
    }

    if (currentpageNum - 1 > 3 && btnNum - currentpageNum > 3) {
        var index = -2;
        for (var k = 1; k <= btnNum; k++) {
            if (index === -2 && k === 1) {
                ulPages.append("<li class='page-item' onclick='toPage(" + 1 + ")'>" +
                    "<button class=\"pagination-btn\">" + 1 + "</button>" + "</li>");
                ulPages.append("<strong>...</strong>");
            } else if (index === 3) {
                ulPages.append("<strong>...</strong>");
                ulPages.append("<li class='page-item' onclick='toPage(" + btnNum + ")'>" +
                    "<button class=\"pagination-btn\">" + btnNum + "</button>" + "</li>");
                break;
            } else {
                ulPages.append("<li class='page-item' onclick='toPage(" + (currentpageNum + index) + ")'>" +
                    "<button class=\"pagination-btn\">" + (currentpageNum + index) + "</button>" + "</li>");
                index++;
            }
        }
    } else if (currentpageNum - 1 > 3) {
        var index = 0;
        for (var k = 1; k <= btnNum; k++) {
            if (k === 8) {
                break;
            }
            if (k === 1) {
                ulPages.append("<li class='page-item' onclick='toPage(" + 1 + ")'>" +
                    "<button class=\"pagination-btn\">" + 1 + "</button>" + "</li>");
                if (btnNum > 7) {
                    ulPages.append("<strong>...</strong>");
                }
            } else {
                if (btnNum > 7) {
                    ulPages.append("<li class='page-item' onclick='toPage(" + (btnNum - 5 + index) + ")'>" +
                        "<button class=\"pagination-btn\">" + (btnNum - 5 + index) + "</button>" + "</li>");
                    index++;
                } else {
                    ulPages.append("<li class='page-item' onclick='toPage(" + k + ")'>" +
                        "<button class=\"pagination-btn\">" + k + "</button>" + "</li>");
                }
            }
        }
    } else {
        var index = 0;
        for (var k = 1; k <= btnNum; k++) {
            if (k === 7 && btnNum > 7) {
                ulPages.append("<strong>...</strong>");
                ulPages.append("<li class='page-item' onclick='toPage(" + btnNum + ")'>" +
                    "<button class=\"pagination-btn\">" + btnNum + "</button>" + "</li>");
                break;
            } else {
                index++;
                ulPages.append("<li class='page-item' onclick='toPage(" + index + ")'>" +
                    "<button class=\"pagination-btn\">" + index + "</button>" + "</li>");
            }
        }
    }
    // 只要当前页不是最后一页  就要显示下一页按钮
    if (currentpageNum !== btnNum && btnNum !== 0) {
        ulPages.append("<li onclick='nextPage()' class=\"page-item next\">" +
            "<button class=\"nav-btn iconfont icon-arrowdown3\">" +
            "下一页" + "</button>" + "</li>\n");
    }

    // 只要总页数不等于1  就要显示跳转到页面
    if (btnNum !== 1 && btnNum !== 0) {
        ulPages.append("<li class=\"page-item jump-pager\">" +
            "跳转到<input id='goPageInput' name=\"pageNum\" type=\"text\">页" + "</li>" +
            "<li class=\"page-item\" onclick='jumpPage()'>" + "<button id=\"go\">Go</button>" +
            "</li>");
    }
    // 设置当前页激活样式
    for (var i = 0; i < btnNum; i++) {
        ulPages.children().eq(i).removeClass("active");
    }

    // 设置排版
    if (currentpageNum - 1 > 3 && btnNum - currentpageNum > 3) {
        ulPages.children().eq(5).addClass("active");
    } else if (currentpageNum - 1 > 3) {
        for (var i = 0; i < ulPages.children().size(); i++) {
            if (currentpageNum === btnNum) {
                if (btnNum > 7) {
                    ulPages.children().eq(8).addClass("active");
                } else {
                    ulPages.children().eq(currentpageNum).addClass("active");
                }
            } else {
                if (btnNum > 7) {
                    ulPages.children().eq(8 - (btnNum - currentpageNum)).addClass("active");
                } else {
                    ulPages.children().eq(currentpageNum).addClass("active");
                }
            }
        }
    } else {
        if (currentpageNum === 1) {
            ulPages.children().eq(0).addClass("active");
        } else {
            ulPages.children().eq(currentpageNum).addClass("active");
        }
    }
}