package cn.ecnu.mosiv.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author Kyrie Lee
 * @date 2021/7/19 23:36
 */
@Controller
public class IndexController {

    @RequestMapping("toIndex")
    public String toIndex() {
        return "index";
    }
    
}
