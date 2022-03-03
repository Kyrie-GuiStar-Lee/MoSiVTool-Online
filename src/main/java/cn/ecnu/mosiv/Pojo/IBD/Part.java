package cn.ecnu.mosiv.Pojo.IBD;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Part {
    private String id;//由前端赋值
    private double abscissa;//横坐标
    private double ordinate;//纵坐标
    private String ibdId;
    private String name;
    private String description;
}
