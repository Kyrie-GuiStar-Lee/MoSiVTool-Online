package cn.ecnu.mosiv.controller;

import cn.ecnu.mosiv.Pojo.Result;
import cn.ecnu.mosiv.Pojo.User;
import cn.ecnu.mosiv.dao.UserDao;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class LoginController {

    @Autowired
    UserDao userDao;

    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/newUser")
    public Result newUser(@RequestBody Object object) throws JSONException {
        Result result = new Result();
        JSONObject jsonObject = JSONObject.fromObject(object);
        User user = new User();
        try {
            user.setEmail(jsonObject.getString("email"));
            user.setUsername(jsonObject.getString("username"));
            user.setPassword(jsonObject.getString("password"));
            user.setPhoneNumber(jsonObject.getString("phoneNumber"));
        } catch (JSONException e) {
            e.printStackTrace();
            result.setErrmsg("JSON reading error");
            result.setCode("10");
            return result;
        }

        if (userDao.searchUser(user.getUsername()) == null) {
            userDao.newUser(user);
        } else {
            result.setErrmsg("用户名已存在，请修改用户名");
            result.setCode("100");
            return result;
        }
        return result;
    }

    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/logIn")
    public Result logIn(@RequestBody Object object) throws JSONException {
        Result result = new Result();
        JSONObject jsonObject = JSONObject.fromObject(object);
        User user = new User();
        try {
            user.setUsername(jsonObject.getString("username"));
            user.setPassword(jsonObject.getString("password"));
        } catch (JSONException e) {
            e.printStackTrace();
            result.setErrmsg("JSON reading error");
            result.setCode("10");
            return result;
        }
        String username = user.getUsername();
        String password = user.getPassword();
        if (userDao.searchUser(username) == null) {
            result.setErrmsg("用户名不存在");
            result.setCode("101");
        } else {
            String res = userDao.searchPassword(username);
            if (password == res) {
                result.setData("登录成功");
                result.setCode("00");
            } else {
                result.setErrmsg("用户名或密码不正确");
                result.setCode("102");
            }
        }
        return result;

    }
}
