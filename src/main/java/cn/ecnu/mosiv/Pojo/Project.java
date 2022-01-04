package cn.ecnu.mosiv.Pojo;

import lombok.Getter;
import lombok.Setter;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;
import java.util.List;


@XmlAccessorType(XmlAccessType.FIELD)
// XML文件中的根标识
@XmlRootElement(name = "nta")
// 控制JAXB 绑定类中属性和字段的排序
@XmlType(propOrder = {
        "declaration",
        "template",
//        "ststem",
//        "queries",

})
@Getter
@Setter
public class Project {
    private String name;
    private int id;
    private String authorName;
    private String description;
    private String declaration;
    private List<StateDiagram> template;

    @Override
    public String toString() {
        return "Project [declaration=" + declaration + ", Diagrams=" + template
               + "]";
    }
}
