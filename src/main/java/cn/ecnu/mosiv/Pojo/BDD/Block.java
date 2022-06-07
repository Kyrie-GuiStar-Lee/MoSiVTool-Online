package cn.ecnu.mosiv.Pojo.BDD;


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Block {
    private String id;//由前端赋值
    private double abscissa;//横坐标
    private double ordinate;//纵坐标
    private String bddId;
    private String operation;
    private String constraint;
    //todo 添加name和description属性
}
