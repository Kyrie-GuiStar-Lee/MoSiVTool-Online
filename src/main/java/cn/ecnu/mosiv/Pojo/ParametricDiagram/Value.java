package cn.ecnu.mosiv.Pojo.ParametricDiagram;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Value {
    private String id;
    private String diagramId;
    private double abscissa;
    private double ordinate;
    private double value;
    private String name;
    private String description;
}
