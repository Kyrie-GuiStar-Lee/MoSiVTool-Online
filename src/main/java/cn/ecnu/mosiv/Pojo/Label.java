package cn.ecnu.mosiv.Pojo;

public class Label{
    private String label;
    private String kind;
    private double abscissa;
    private double ordinate;

    public String getLabel(){
        return this.label;
    }
    public void setLabel(String label){
        this.label = label;
    }

    public String getKind(){
        return this.kind;
    }
    public void setKind(String kind){
        this.kind=kind;
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

}
