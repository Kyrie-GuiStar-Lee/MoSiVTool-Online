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
        "name",
//        "parameter",

//        "declaration",
        "location",
        "transition",
})

@Getter
@Setter
public class StateDiagram {

    private int id;
    private String name;
    private String json;
    private List<Location> location;
    private List<Transition> transition;
//    private String local_declaration;
}
