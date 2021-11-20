package cn.ecnu.mosiv.Pojo;

public class Location {
    private String id;
    private double abscissa;//横坐标
    private double ordinate;//纵坐标
    private Name name;
    private Label label;

    public String getId(){
        return this.id;
    }
    public void setId(String id){
        this.id=id;
    }

    public double getAbscissa(){
        return this.abscissa;
    }
    public void setAbscissa(double abscissa){
        this.abscissa=abscissa;
    }

    public double getOrdinate() {
        return this.ordinate;
    }
    public void setOrdinate(double ordinate) {
        this.ordinate = ordinate;
    }

    public Name getName(){
        return this.name;
    }
    public void setName(Name name){
        this.name = name;
    }

    public Label getLabel(){
        return this.label;
    }
    public void setLabel(Label label){
        this.label=label;
    }


}
