package cn.ecnu.mosiv.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * @author Kyrie Lee
 * @date 2021/7/20 1:13
 */
@Controller
@RequestMapping("UML")
public class UMLController {

    @RequestMapping("stateDiagramEditor1")
    public String toStateEditor1() {
        return "modeling/stateDiagram/stateDiagramEditor1";
    }

    @RequestMapping("stateDiagramEditor")
    public String toStateEditor() {
        return "modeling/stateDiagram/stateDiagramEditor";
    }
}
