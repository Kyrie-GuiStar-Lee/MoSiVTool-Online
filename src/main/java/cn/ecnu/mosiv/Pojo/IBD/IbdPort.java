package cn.ecnu.mosiv.Pojo.IBD;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class IbdPort {
    private String id;
    private String ibdId;
    private String type;
    private double abscissa;//横坐标
    private double ordinate;//纵坐标
    private String name;
    private String description;
}
