package cn.ecnu.mosiv.Pojo;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class Diagram {

    private int id;
    private String name;
    private String json;
    private String base64;
    private int type;
    private int projectId;
    
//    private String local_declaration;
}
