package cn.ecnu.mosiv.Pojo;

import lombok.Getter;
import lombok.Setter;


@Getter
@Setter
public class Location {
    private String id;
    private double abscissa;//横坐标
    private double ordinate;//纵坐标
    private String sdgId;
    private Boolean isInit;
    private Boolean isFinal;
    private String name;
    private Boolean isCommitted;
    private Boolean isUrgent;


}
