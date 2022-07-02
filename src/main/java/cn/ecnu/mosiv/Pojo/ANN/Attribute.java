package cn.ecnu.mosiv.Pojo.ANN;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Attribute {
    private String diagramId;
    private int numOfLayers;
    private int numOfConnectors;
    private String inputType;
    private String outputType;
}
