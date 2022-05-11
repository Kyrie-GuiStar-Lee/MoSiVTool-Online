package cn.ecnu.mosiv.Pojo.ActivityDiagram;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Edge {
    private String id;
    private String actId;
    private String source;
    private String target;
    private String edgeType;
    private String edgeData;
}
