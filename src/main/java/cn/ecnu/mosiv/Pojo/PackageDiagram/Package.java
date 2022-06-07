package cn.ecnu.mosiv.Pojo.PackageDiagram;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Package {
    private String id;
    private String diagramId;
    private double abscissa;
    private double ordinate;
    private String name;
    private String description;
}
