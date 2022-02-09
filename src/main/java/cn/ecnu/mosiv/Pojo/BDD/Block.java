package cn.ecnu.mosiv.Pojo.BDD;


import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class Block {
    private String id;//由前端的ComponentId赋值
    private double abscissa;//横坐标
    private double ordinate;//纵坐标
    private String bddId;
    private String operation;
    private String constraint;

}
