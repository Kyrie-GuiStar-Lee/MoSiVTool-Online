package cn.ecnu.mosiv.Pojo.ANN;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Layer {
    private String id;
    private String diagramId;
    private String name;
    private String type;
    private String description;
    private double abscissa;
    private double ordinate;
    private String input;
    private String output;
    private String loss;
    private String bias;
    private String weights;
    private String data;
}
