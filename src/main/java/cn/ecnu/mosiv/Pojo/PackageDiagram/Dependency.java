package cn.ecnu.mosiv.Pojo.PackageDiagram;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Dependency {
    private String id;
    private String diagramId;
    private String source;
    private String target;
    private Boolean isPublic;
    private Boolean isPrivate;
}
