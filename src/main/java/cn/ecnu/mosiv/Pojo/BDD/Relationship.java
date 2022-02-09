package cn.ecnu.mosiv.Pojo.BDD;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Relationship {
    private String id;
    private String bddId;
    private String type;
    private String source;
    private String target;
}
