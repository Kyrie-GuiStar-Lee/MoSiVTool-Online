package cn.ecnu.mosiv.Pojo;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class Result {
    private String code;
    private Object data;
    private String errmsg;
}
