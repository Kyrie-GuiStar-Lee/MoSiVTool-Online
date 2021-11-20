package cn.ecnu.mosiv.Pojo;

public class Transition {
    private String source;
    private String target;
    private Label label;

    public String getSource() {
        return source;
    }
    public void setSource(String source) {
        this.source = source;
    }

    public String getTarget() {
        return target;
    }
    public void setTarget(String target) {
        this.target = target;
    }

    public Label getLabel(){
        return this.label;
    }
    public void setLabel(Label label){
        this.label=label;
    }
}
