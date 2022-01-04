package cn.ecnu.mosiv.controller;

import cn.ecnu.mosiv.Pojo.*;
import cn.ecnu.mosiv.Pojo.Result;
import jdk.nashorn.internal.objects.annotations.Getter;
import org.springframework.dao.DataAccessException;
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

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.zip.DataFormatException;

@Controller

public class DataController {

    @Autowired
    StategramDAO stategramDAO;

    //todo 能够导入之前绘制的模型，实现工具的互操作


    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/add_state_diagram")
    public Result save_state_diagram(@RequestBody Object object) throws JSONException {
        JSONObject jsonObject = JSONObject.fromObject(object);
        StateDiagram stateDiagram = new StateDiagram();
        Result result = new Result();
        try {
            stateDiagram.setName(jsonObject.getString("name"));
            stateDiagram.setJson("");
        } catch (JSONException e) {
            e.printStackTrace();
            result.setErrmsg("JSON reading error");
            result.setCode("10");
            return result;
        }
        stategramDAO.newStateDiagram(stateDiagram);
        if (stateDiagram.getId() != -1) {
            result.setCode("00");
            result.setData(stateDiagram.getId());
            return result;
        }
        result.setCode("01");
        result.setErrmsg("getting id from database error");
        return result;
    }


    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/save_json")
    public Result save_state(@RequestBody List<Object> data) throws JSONException {
        Result result = new Result();
        JSONArray data1 = JSONArray.fromObject(data);
        JSONObject object = data1.getJSONObject(0);
        String sdgId = object.getString("id");
        List<String> current_states = new ArrayList<>();
        List<String> current_transitions = new ArrayList<>();
        List<String> current_branch_points = new ArrayList<>();
        for (int i = 1; i < data.size(); i++) {
            JSONObject object1 = data1.getJSONObject(i);
            //组件的type是state,保存状态相关信息
//            if(object1.getString("type").equals("state")){
            if (object1.getString("type").equals("1") || object1.getString("type").equals("2") || object1.getString("type").equals("3")) {
                Location location = new Location();
                location.setAbscissa(object1.getInt("abscissa"));
                location.setOrdinate(object1.getInt("ordinate"));
                location.setId(object1.getString("id"));
                location.setSdgId(object1.getString("sdg_id"));
                if (object1.getString("type").equals("1")) {
                    location.setIsInit(true);
                    location.setIsFinal(false);
                }
                if (object1.getString("type").equals("2")) {
                    location.setIsInit(false);
                    location.setIsFinal(true);
                }
                if (object1.getString("type").equals("3")) {
                    location.setIsInit(false);
                    location.setIsFinal(false);
                }
//                location.setIsInit(object1.getBoolean("is_init"));
//                location.setIsFinal(object1.getBoolean("is_final"));
                Name name = null;
                try{
                    JSONObject name1 = object1.getJSONObject("name");
                    name = new Name();
                    name.setAbscissa(name1.getInt("abscissa"));
                    name.setOrdinate(name1.getInt("ordinate"));
                    name.setContent(name1.getString("content"));
                    name.setStateId(name1.getString("state_id"));
                    name.setSdgId(location.getSdgId());
                    location.setName(name.getContent());
                }catch (JSONException e) {
                    e.printStackTrace();

                }
                //保存状态标签的相关信息
                Label label = null;
                try {
                    JSONObject label1 = object1.getJSONObject("label");
                    label = new Label();
                    label.setAbscissa(label1.getInt("abscissa"));
                    label.setOrdinate(label1.getInt("ordinate"));
                    label.setKind(label1.getString("kind"));
                    label.setContent(label1.getString("content"));
                    label.setComponentId(label1.getString("component_id"));
                    label.setSdgId(location.getSdgId());
                } catch (JSONException e) {
                    e.printStackTrace();

                }


                current_states.add(location.getId());

                //如果数据库中没有该状态，则新建；有则更新
                try {
                    if (stategramDAO.selectState(location.getId(),sdgId) == null) {
                        stategramDAO.newState(location);
                        if (name.getContent() != null) {
                            stategramDAO.newName(name);
                        }
                        if (label != null) {
                            stategramDAO.newLabel(label);
                        }
                    } else {
                        stategramDAO.updateState(location);
                        if (name != null) {
                            stategramDAO.updateName(name);
                        }
                        if (label != null) {
                            stategramDAO.updateLabel(label);
                        }
                    }
                } catch (DataAccessException e) {
                    e.printStackTrace();
                    result.setErrmsg("Data access error");
                    result.setCode("01");
                    return result;
                }

            }

            //组件的type是transition，保存transition的相关信息
//            if(object1.getString("type").equals("transition")){
            if (object1.getString("type").equals("4") || object1.getString("type").equals("5")) {
                Transition transition1 = new Transition();
                transition1.setId(object1.getString("id"));
                transition1.setSdgId(object1.getString("sdg_id"));
                transition1.setSource(object1.getString("source"));
                transition1.setTarget(object1.getString("target"));
                //保存transition的label的相关信息
                Label label = null;
                try {
                    JSONObject label1 = object1.getJSONObject("label");
                    label = new Label();
                    label.setAbscissa(label1.getInt("abscissa"));
                    label.setOrdinate(label1.getInt("ordinate"));
                    label.setKind(label1.getString("kind"));
                    label.setContent(label1.getString("content"));
                    label.setComponentId(label1.getString("component_id"));
                    label.setSdgId(transition1.getSdgId());
                } catch (JSONException e) {
                    e.printStackTrace();

                }

                current_transitions.add(transition1.getId());

                //如果数据库中没有该transition，则新建；有则更新
                if (stategramDAO.selectTransition(transition1.getId(),sdgId) == null) {
                    stategramDAO.newTransition(transition1);
                    if (label != null) {
                        stategramDAO.newLabel(label);
                    }
                } else {
                    stategramDAO.updateTransition(transition1);
                    if (label != null) {
                        stategramDAO.updateLabel(label);
                    }
                }

            }

            //保存branch point 相关信息
            if (object1.getString("type").equals("6")) {
                BranchPoint branchPoint = new BranchPoint();
                branchPoint.setId(object1.getString("id"));
                branchPoint.setSdgId(object1.getString("sdg_id"));
                branchPoint.setAbscissa(object1.getInt("abscissa"));
                branchPoint.setOrdinate(object1.getInt("ordinate"));

                current_branch_points.add(branchPoint.getId());
                if (stategramDAO.selectBranchPoint(branchPoint.getId(),sdgId) == null) {
                    stategramDAO.newBranchPoint(branchPoint);
                } else {
                    stategramDAO.updateBranchPoint(branchPoint);
                }
            }
        }


        //判断前端绘图是否删除了之前保存的state、transition和branch_point
//        System.out.println(stategramDAO.select_state_ids());
//        System.out.println(stategramDAO.select_transition_ids());

        List<String> old_states = stategramDAO.select_state_ids(sdgId);
        List<String> old_transitions = stategramDAO.select_transition_ids(sdgId);
        List<String> old_branch_points = stategramDAO.select_branch_point_ids(sdgId);


        for (String t : current_states) {
            if (old_states.contains(t)) {
                old_states.remove(t);
            }
        }
        for (String t : current_transitions) {
            if (old_transitions.contains(t)) {
                old_transitions.remove(t);
            }
        }
        for (String t : current_branch_points) {
            if (old_branch_points.contains(t)) {
                old_branch_points.remove(t);
            }
        }

//        System.out.println(old_states);
//        System.out.println(old_transitions);

        //完成上述操作后，old_states、old_transitions和old_branch_points中剩余的id就是需要删除的state、transition和branch_point的id
        if (old_states.size() > 0) {
            stategramDAO.deleteState(old_states,sdgId);
            stategramDAO.deleteName(old_states,sdgId);
            stategramDAO.deleteLabel(old_states,sdgId);
        }
        if (old_transitions.size() > 0) {
            stategramDAO.deleteTransition(old_transitions,sdgId);
            stategramDAO.deleteLabel(old_transitions,sdgId);
        }
        if (old_branch_points.size() > 0) {
            stategramDAO.deleteBranchPoint(old_branch_points,sdgId);
        }

        //定义向前端返回的result
        if (data != null) {
            result.setCode("00");
            return result;
        } else {
            result.setCode("10");
            result.setErrmsg("JSON reading error");
        }
        return result;
    }

    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/write_xml")
    public Result XmlWriter(@RequestBody String sdgId)
            throws ParserConfigurationException, TransformerException {
        Result result = new Result();

        DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder docBuilder = docFactory.newDocumentBuilder();

        // root elements
        Document doc = docBuilder.newDocument();
        Element rootElement = doc.createElement("nta");
        doc.appendChild(rootElement);

        // declaration

        // add xml elements
        Element declaration = doc.createElement("declaration");
        // add to root
        rootElement.appendChild(declaration);
        // add xml attribute
        declaration.setTextContent("");


        //template
        //todo 多张状态机图存储到同一个xml中？
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


        //状态
        try {
            List<Location> list_s = stategramDAO.select_all_states(sdgId);

            for (Location l : list_s) {

                Element location = doc.createElement("location");
                String ordinate_s = Integer.toString(l.getOrdinate());
                location.setAttribute("y", ordinate_s);
                String abscissa_s = Integer.toString(l.getAbscissa());
                location.setAttribute("x", abscissa_s);
                String id_s = l.getId();
                location.setAttribute("id", id_s);
                template.appendChild(location);

                Name name_ = stategramDAO.selectStateName(id_s,sdgId);
                Element name1 = doc.createElement("name");
                String ordinate_n = Integer.toString(name_.getOrdinate());
                name1.setAttribute("y", ordinate_n);
                String abscissa_n = Integer.toString(name_.getAbscissa());
                name1.setAttribute("x", abscissa_n);
                String content_n = name_.getContent();
                name1.setTextContent(content_n);
                location.appendChild(name1);

                List<Label> list_l = stategramDAO.selectLabels(id_s,sdgId);
                for (Label la : list_l) {
                    Element label = doc.createElement("label");
                    String ordinate_l = Integer.toString(la.getOrdinate());
                    label.setAttribute("y", ordinate_l);
                    String abscissa_l = Integer.toString(la.getAbscissa());
                    label.setAttribute("x", abscissa_l);
                    String kind_l = la.getKind();
                    label.setAttribute("kind", kind_l);
                    String content_l = la.getContent();
                    label.setTextContent(content_l);
                    location.appendChild(label);
                }

                if (l.getIsInit() == true) {
                    Element init = doc.createElement("init");
                    init.setAttribute("ref", l.getId());
                    template.appendChild(init);
                }
                if (l.getIsFinal() == true) {
                    Element fin = doc.createElement("fin");
                    fin.setAttribute("ref", l.getId());
                    template.appendChild(fin);
                }
            }
        } catch (DataAccessException e) {
            e.printStackTrace();
            result.setCode("01");
            result.setErrmsg("data access exception");
            return result;
        }

        //branchpoint
        List<BranchPoint> list_b = stategramDAO.select_all_branch_points(sdgId);
        for (BranchPoint t : list_b) {
            Element branch_point = doc.createElement("branchpoint");
            branch_point.setAttribute("y", Integer.toString(t.getOrdinate()));
            branch_point.setAttribute("x", Integer.toString(t.getAbscissa()));
            branch_point.setAttribute("id", t.getId());
            template.appendChild(branch_point);

        }


        // 迁移
        List<Transition> list_t = stategramDAO.select_all_transitions(sdgId);
        for (Transition t : list_t) {
            Element transition = doc.createElement("transition");
            template.appendChild(transition);

            Element source = doc.createElement("source");
            source.setAttribute("ref", t.getSource());//transition的source
            transition.appendChild(source);

            Element target = doc.createElement("target");
            target.setAttribute("ref", t.getTarget());//transition的target
            transition.appendChild(target);

            List<Label> list_la = stategramDAO.selectLabels(t.getId(),sdgId);
            for (Label la : list_la) {
                Element label1 = doc.createElement("label");
                String ordinate_la = Integer.toString(la.getOrdinate());
                label1.setAttribute("y", ordinate_la);
                String abscissa_la = Integer.toString(la.getAbscissa());
                label1.setAttribute("x", abscissa_la);
                label1.setAttribute("kind", la.getKind());
                label1.setTextContent(la.getContent());
                transition.appendChild(label1);
            }

            Element nail = doc.createElement("nail");
            nail.setAttribute("y", "");//transition上调整的点的纵坐标
            nail.setAttribute("x", "");//transition上调整的点的横坐标
            transition.appendChild(nail);
        }

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
            result.setCode("02");
            result.setErrmsg("xml file write error");
        }

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
