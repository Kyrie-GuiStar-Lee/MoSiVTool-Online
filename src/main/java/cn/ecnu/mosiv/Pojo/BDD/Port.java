package cn.ecnu.mosiv.Pojo.BDD;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Port {
    private String id;
    private String bddId;
    private String type;
    private double abscissa;//横坐标
    private double ordinate;//纵坐标
}
