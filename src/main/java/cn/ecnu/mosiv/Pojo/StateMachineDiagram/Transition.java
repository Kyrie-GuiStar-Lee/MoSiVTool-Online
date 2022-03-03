package cn.ecnu.mosiv.Pojo.StateMachineDiagram;

import lombok.Getter;
import lombok.Setter;



@Getter
@Setter
public class Transition {

    private String id;
    private String source;
    private String target;
    private String sdgId;

}
