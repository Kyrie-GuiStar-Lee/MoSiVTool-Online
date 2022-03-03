package cn.ecnu.mosiv.Pojo.IBD;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Connector {
    private String id;
    private String ibdId;
    private String type;
    private String source;
    private String target;
}
