package cn.ecnu.mosiv.controller;

import cn.ecnu.mosiv.Pojo.*;
import cn.ecnu.mosiv.Pojo.Result;
import org.springframework.web.bind.annotation.*;
import org.w3c.dom.CDATASection;
import org.w3c.dom.Comment;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.OutputStream;

import net.sf.json.*;
import cn.ecnu.mosiv.dao.StategramDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;

@Controller

public class DataController {

    @Autowired
    StategramDAO stategramDAO;

    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/save_state_diagram")
    public Result save_state_diagram(@RequestBody Object object) throws JSONException{
        JSONObject jsonObject = JSONObject.fromObject(object);
        StateDiagram stateDiagram = new StateDiagram();
        stateDiagram.setName(jsonObject.getString("name"));
        stategramDAO.newStateDiagram(stateDiagram);
        Result result = new Result();
        if (stateDiagram.getId() != 0){
            result.setId("00");
            result.setData(stateDiagram.getId());
            return result;
        }
        result.setId("01");
        return result;
    }

    @CrossOrigin
    @ResponseBody
    @PostMapping (value = "/save_json" )
    public Result save_state(@RequestBody List<Object> data) throws JSONException {
        JSONArray data1 = JSONArray.fromObject(data);
        List<String> current_states = new ArrayList<>();
        List<String> current_transitions = new ArrayList<>();
        for(int i=0; i<data.size();i++){
            JSONObject object1 = data1.getJSONObject(i);
//            if(object1.getString("type").equals("state_diagram")){
//                StateDiagram stateDiagram = new StateDiagram();
//                stateDiagram.setId(object1.getString("id"));
//                stateDiagram.setName(object1.getString("name"));
//            }
            if(object1.getString("type").equals("state")){
                Location location = new Location();
                location.setAbscissa(object1.getInt("abscissa"));
                location.setOrdinate(object1.getInt("ordinate"));
                location.setId(object1.getString("id"));
                location.setSdgId(object1.getString("sdg_id"));
                location.setIsInit(object1.getBoolean("is_init"));
                location.setIsFinal(object1.getBoolean("is_final"));
                System.out.println(object1.getJSONObject("name"));
                Name name = new Name();
                JSONObject name1 = object1.getJSONObject("name");
                name.setAbscissa(name1.getInt("abscissa"));
                name.setOrdinate(name1.getInt("ordinate"));
                name.setContent(name1.getString("content"));
                name.setStateId(name1.getString("state_id"));
                location.setName(name.getContent());
                Label label = new Label();
                JSONObject label1 = object1.getJSONObject("label");
                label.setAbscissa(label1.getInt("abscissa"));
                label.setOrdinate(label1.getInt("ordinate"));
                label.setKind(label1.getString("kind"));
                label.setContent(label1.getString("content"));
                label.setComponentId(label1.getString("component_id"));


                current_states.add(location.getId());

                if(stategramDAO.selectState(location.getId())==null){
                    stategramDAO.newState(location);
                    stategramDAO.newName(name);
                    stategramDAO.newLabel(label);
                }
                else{
                    stategramDAO.updateState(location);
                    stategramDAO.updateName(name);
                    stategramDAO.updateLabel(label);
                }

            }

            if(object1.getString("type").equals("transition")){
                Transition transition1 = new Transition();
                transition1.setId(object1.getString("id"));
                transition1.setSdgId(object1.getString("sdg_id"));
                transition1.setSource(object1.getString("source"));
                transition1.setTarget(object1.getString("target"));
                Label label = new Label();
                JSONObject label1 = object1.getJSONObject("label");
                label.setAbscissa(label1.getInt("abscissa"));
                label.setOrdinate(label1.getInt("ordinate"));
                label.setKind(label1.getString("kind"));
                label.setContent(label1.getString("content"));
                label.setComponentId(label1.getString("component_id"));

                current_transitions.add(transition1.getId());

                if(stategramDAO.selectTransition(transition1.getId())==null){
                    stategramDAO.newTransition(transition1);
                    stategramDAO.newLabel(label);
                }
                else{
                    stategramDAO.updateTransition(transition1);
                    stategramDAO.updateLabel(label);
                }

            }

        }


        //判断前端绘图是否删除了之前保存的state和transition

        System.out.println(stategramDAO.select_state_ids());
        System.out.println(stategramDAO.select_transition_ids());

        List<String> old_states = stategramDAO.select_state_ids();
        List<String> old_transitions = stategramDAO.select_transition_ids();


        for(String t : current_states){
            if(old_states.contains(t)){
                old_states.remove(t);
            }
        }
        for(String t : current_transitions){
            if(old_transitions.contains(t)){
                old_transitions.remove(t);
            }
        }

        System.out.println(old_states);
        System.out.println(old_transitions);

        //完成上述操作后，old_states和old_transitions中剩余的id就是需要删除的state和transition的id
        if(old_states.size()>0){
            stategramDAO.deleteState(old_states);
            stategramDAO.deleteName(old_states);
            stategramDAO.deleteLabel(old_states);
        }
        if(old_transitions.size()>0){
            stategramDAO.deleteTransition(old_transitions);
            stategramDAO.deleteLabel(old_transitions);
        }

        Result result = new Result();
        if (data!=null){
            result.setId("00");
            return result;
        }
        result.setId("01");
        return result;
    }

    @CrossOrigin
    @ResponseBody
    @GetMapping(value = "/write_xml" )
    public Result XmlWriter()
            throws ParserConfigurationException, TransformerException {
        DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder = docFactory.newDocumentBuilder();

        // root elements
        Document doc = docBuilder.newDocument();
        Element rootElement = doc.createElement("nta");
        doc.appendChild(rootElement);

        // declaration

        // add xml elements
        Element declaration = doc.createElement("declaration");
        // add staff to root
        rootElement.appendChild(declaration);
        // add xml attribute
        declaration.setTextContent("");

        // alternative
        // Attr attr = doc.createAttribute("id");
        // attr.setValue("1001");
        // staff.setAttributeNode(attr);

        //template
        Element template = doc.createElement("template");
        rootElement.appendChild(template);

        Element name = doc.createElement("name");
        name.setTextContent("");//状态图名称
        template.appendChild(name);

        Element parameter = doc.createElement("parameter");
        parameter.setTextContent("");//从前端获取parameter
        template.appendChild(parameter);

        Element declaration1 = doc.createElement("declaration");
        declaration1.setTextContent("");//从前端获取template的declaration
        template.appendChild(declaration1);

//        // add xml comment
//        Comment comment = doc.createComment(
//                "for special characters like < &, need CDATA");
//        staff.appendChild(comment);

        //状态
        //todo 查询数据库中state表，每个state对应一个location
        //todo 如果状态是起始或者结束状态，那么在该状态下面打上init/final标签

        Element location = doc.createElement("location");
        location.setAttribute("y","");
        location.setAttribute("x","");
        location.setAttribute("id","");
        template.appendChild(location);

        Element name1 = doc.createElement("name");
        name1.setAttribute("y","");
        name1.setAttribute("x","");
        name1.setTextContent("");
        location.appendChild(name1);

        Element label = doc.createElement("label");
        label.setAttribute("y","");
        label.setAttribute("x","");
        label.setAttribute("kind","");
        label.setTextContent("");
        location.appendChild(label);


        // 迁移
        Element transition = doc.createElement("transition");
        template.appendChild(transition);

        Element source = doc.createElement("source");
        source.setAttribute("ref","");//transition的source
        transition.appendChild(source);

        Element target = doc.createElement("target");
        target.setAttribute("ref","");//transition的target
        transition.appendChild(target);

        Element label1 = doc.createElement("label");
        label1.setAttribute("y","");
        label1.setAttribute("x","");
        label1.setAttribute("kind","");
        label1.setTextContent("");
        transition.appendChild(label1);

        Element nail = doc.createElement("nail");
        nail.setAttribute("y","");//transition上调整的点的纵坐标
        nail.setAttribute("x","");//transition上调整的点的横坐标
        transition.appendChild(nail);

        Element system = doc.createElement("system");
        rootElement.appendChild(system);
        system.setTextContent("");

        Element queries = doc.createElement("queries");
        rootElement.appendChild(queries);

        Element query = doc.createElement("query");
        queries.appendChild(query);

        Element formula = doc.createElement("formula");
        query.appendChild(formula);
        formula.setTextContent("");

        Element comment = doc.createElement("comment");
        query.appendChild(comment);
        comment.setTextContent("");


        // print XML to system console
        try (FileOutputStream output =
                     new FileOutputStream("E:\\test\\test-dom.xml")) {
            writeXml(doc, output);
        } catch (IOException e) {
            e.printStackTrace();
        }

        Result result = new Result();
        if (docFactory!=null){
            result.setId("00");
            return result;
        }
        result.setId("01");
        return result;
    }

    // write doc to output stream
    private static void writeXml(Document doc,
                                 OutputStream output)
            throws TransformerException {

        TransformerFactory transformerFactory = TransformerFactory.newInstance();
        Transformer transformer = transformerFactory.newTransformer();

        // pretty print
        transformer.setOutputProperty(OutputKeys.INDENT, "yes");

        DOMSource source = new DOMSource(doc);
        StreamResult result = new StreamResult(output);

        transformer.transform(source, result);

    }
}
