package cn.ecnu.mosiv.Pojo.ActivityDiagram;
import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class Node {
    private String id;
    private String actId;
    private double abscissa;
    private double ordinate;
    private String nodeType;
    private String name;
}
