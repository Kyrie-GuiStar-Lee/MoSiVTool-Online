package cn.ecnu.mosiv.controller;

import cn.ecnu.mosiv.Pojo.*;
import cn.ecnu.mosiv.Pojo.Result;
import cn.ecnu.mosiv.Pojo.ActivityDiagram.*;
import cn.ecnu.mosiv.dao.ActDAO;
import org.apache.tomcat.util.http.fileupload.IOUtils;
import org.springframework.dao.DataAccessException;
import org.springframework.web.bind.annotation.*;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.servlet.http.HttpServletResponse;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import javax.xml.transform.*;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import java.io.*;

import net.sf.json.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;

import java.util.ArrayList;
import java.util.List;

@Controller

public class ActDataController {

    @Autowired
    ActDAO actDAO;

    //todo 能够导入之前绘制的模型，实现工具的互操作


    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/save_json_act")//***这里的url修改过了 2022.1.25
    public Result save_state_sdg(@RequestBody List<Object> data) throws JSONException, ParserConfigurationException {
        Result result = new Result();
        Diagram activityDiagram = new Diagram();
//        JSONObject data4 = JSONObject.fromObject(data);
//        data4.getString("")
        JSONArray data1 = JSONArray.fromObject(data);//data1是前端传来的整个的JSON数组
        System.out.println(data1);

        JSONObject data2 = data1.getJSONObject(0);//data2中装的是 sdgId 和 base64 数据
        String actId = data2.getString("id");

        activityDiagram.setBase64(data2.getString("base64"));

        //todo 在数据库中根据图ID搜索JSON发送到前端
        String str = data1.toString();
//        System.out.println(str);
        activityDiagram.setJson(str);

        actDAO.updateDiagram(activityDiagram,actId);


        List<String> current_nodes = new ArrayList<>();
        List<String> current_edges = new ArrayList<>();
        List<String> current_branch_points = new ArrayList<>();
        for (int i = 1; i < data.size(); i++) {
            JSONObject object1 = data1.getJSONObject(i);
            //组件的type是node,保存节点相关信息
           //todo 修改节点的判断逻辑
            if (object1.getString("type").equals("1") || object1.getString("type").equals("2") || object1.getString("type").equals("3")) {
                Node node = new Node();
                node.setAbscissa(object1.getDouble("abscissa"));
                node.setOrdinate(object1.getDouble("ordinate"));
                node.setId(object1.getString("id"));
                node.setActId(actId);
                node.setNodeType(object1.getString("type"));

                Name name = null;
                try {
                    JSONObject name1 = object1.getJSONObject("name");
                    name = new Name();
                    name.setAbscissa(name1.getDouble("abscissa"));
                    name.setOrdinate(name1.getDouble("ordinate"));
                    name.setContent(name1.getString("content"));
                    name.setComponentId(name1.getString("nodeId"));
                    name.setDiagramId(node.getActId());
                    node.setName(name.getContent());
                } catch (JSONException e) {
                    e.printStackTrace();

                }
                //保存状态标签的相关信息
                Label label = null;
                try {
                    JSONObject label1 = object1.getJSONObject("invariant");
                    label = new Label();
                    label.setAbscissa(label1.getDouble("abscissa"));
                    label.setOrdinate(label1.getDouble("ordinate"));
                    label.setKind("invariant");
                    label.setContent(label1.getString("content"));
                    label.setComponentId(label1.getString("component_id"));
                    label.setDiagramId(node.getActId());
                } catch (JSONException e) {
                    e.printStackTrace();
                }


                current_nodes.add(node.getId());

                //如果数据库中没有该状态，则新建；有则更新
                try {
                    if (actDAO.selectNode(node.getId(), actId) == null) {
                        actDAO.newNode(node);
                        if (name.getContent() != null) {
                            actDAO.newName(name);
                        }
                        if (label != null) {
                            actDAO.newLabel(label);
                        }
                    } else {
                        actDAO.updateNode(node);
                        if (name != null) {
                            actDAO.updateName(name);
                        }
                        if (label != null) {
                            actDAO.updateLabel(label);
                        }
                    }
                } catch (DataAccessException e) {
                    e.printStackTrace();
                    result.setErrmsg("Data access error");
                    result.setCode("01");
                    return result;
                }

            }

            //组件的type是edge，保存边的相关信息
            //todo 修改edge的判定条件，需要和前端协商
            if (object1.getString("type").equals("4") || object1.getString("type").equals("5")) {
                Edge edge = new Edge();
                edge.setId(object1.getString("id"));
                edge.setActId(object1.getString("sdg_id"));
                edge.setSource(object1.getString("source"));
                edge.setTarget(object1.getString("target"));
                edge.setEdgeType(object1.getString("edgeType"));
                edge.setEdgeData(object1.getString("edgeData"));
                //保存edge的label的相关信息
                Label label = null;
                try {
                    JSONObject label1 = object1.getJSONObject("select");
                    label = new Label();
                    label.setAbscissa(label1.getDouble("abscissa"));
                    label.setOrdinate(label1.getDouble("ordinate"));
                    label.setKind("select");//不知道前端对edge的label如何处理，先放着。
                    label.setContent(label1.getString("content"));
                    label.setComponentId(label1.getString("component_id"));
                    label.setDiagramId(edge.getActId());
                } catch (JSONException e) {
                    e.printStackTrace();

                }


                List<Nail> list_n = new ArrayList<>() ;
                try{
                    JSONArray nails = object1.getJSONArray("nails");
                    for(int t=0; t<nails.size(); t++){
                        Nail nail = new Nail();
                        nail.setAbscissa(nails.getJSONObject(t).getDouble("abscissa"));
                        nail.setOrdinate(nails.getJSONObject(t).getDouble("ordinate"));
                        nail.setComponentId(edge.getId());
                        nail.setDiagramId(actId);
                        list_n.add(nail);
                    }

                } catch (JSONException e) {
                    e.printStackTrace();

                }

               /* Nail nail = null;
                try{
                    JSONObject nail1 = object1.getJSONObject("nail");
                    nail = new Nail();
                    nail.setAbscissa(nail1.getDouble("abscissa"));
                    nail.setOrdinate(nail1.getDouble("ordinate"));
                    nail.setTransitionId(transition1.getId());
                    nail.setSdgId(sdgId);
                }catch (JSONException e) {
                    e.printStackTrace();

                }*/



                current_edges.add(edge.getId());

                //如果数据库中没有该transition，则新建；有则更新
                if (actDAO.selectEdge(edge.getId(), actId) == null) {
                    actDAO.newEdge(edge);
                    if (label != null) {
                        actDAO.newLabel(label);
                    }
                    if( list_n != null ) {
                        actDAO.newNails(list_n);
                    }
                } else {
                    actDAO.updateEdge(edge);
                    if (label != null) {
                        actDAO.updateLabel(label);
                    }
                    if( list_n != null) {
                        actDAO.updateNails(list_n);
                    }
                }

            }

        }


        //判断前端绘图是否删除了之前保存的state、transition和branch_point
//        System.out.println(stategramDAO.select_state_ids());
//        System.out.println(stategramDAO.select_transition_ids());

        List<String> old_nodes = actDAO.select_node_ids(actId);
        List<String> old_edges = actDAO.select_edge_ids(actId);


        for (String t : current_nodes) {
            if (old_nodes.contains(t)) {
                old_nodes.remove(t);
            }
        }
        for (String t : current_edges) {
            if (old_edges.contains(t)) {
                old_edges.remove(t);
            }
        }

//        System.out.println(old_states);
//        System.out.println(old_transitions);

        //完成上述操作后，old_states、old_transitions和old_branch_points中剩余的id就是需要删除的state、transition和branch_point的id
        if (old_nodes.size() > 0) {
            actDAO.deleteNode(old_nodes, actId);
            actDAO.deleteName(old_nodes, actId);
            actDAO.deleteLabel(old_nodes, actId);
        }
        if (old_edges.size() > 0) {
            actDAO.deleteEdge(old_edges, actId);
            actDAO.deleteLabel(old_edges, actId);
            actDAO.deleteNail(old_edges,actId);
        }


//        DocumentBuilderFactory docFactory = DocumentBuilderFactory.newInstance();
//        DocumentBuilder docBuilder = docFactory.newDocumentBuilder();
//
//        // root elements
//        Document doc = docBuilder.newDocument();
//        Element rootElement = doc.createElement("nta");
//        doc.appendChild(rootElement);
//
//        // declaration
//
//        // add xml elements
//        Element declaration = doc.createElement("declaration");
//        // add to root
//        rootElement.appendChild(declaration);
//        // add xml attribute
//        declaration.setTextContent("");
//
//
//        //template
//        //todo 多张状态机图存储到同一个xml中？
//        Element template = doc.createElement("template");
//        rootElement.appendChild(template);
//
//        Element name = doc.createElement("name");
//        name.setTextContent("");//状态图名称
//        template.appendChild(name);
//
//        Element parameter = doc.createElement("parameter");
//        parameter.setTextContent("");//从前端获取parameter
//        template.appendChild(parameter);
//
//        Element declaration1 = doc.createElement("declaration");
//        declaration1.setTextContent("");//从前端获取template的declaration
//        template.appendChild(declaration1);
//
//
//        //状态
//        try {
//            List<Location> list_s = sdgDAO.select_all_states(sdgId);
//
//            for (Location l : list_s) {
//
//                Element location = doc.createElement("location");
//                String ordinate_s = Double.toString(l.getOrdinate());
//                location.setAttribute("y", ordinate_s);
//                String abscissa_s = Double.toString(l.getAbscissa());
//                location.setAttribute("x", abscissa_s);
//                String id_s = l.getId();
//                location.setAttribute("id", id_s);
//                template.appendChild(location);
//
//                Name name_ = sdgDAO.selectStateName(id_s, sdgId);
//                if(name_!=null) {
//                    Element name1 = doc.createElement("name");
//                    String ordinate_n = Double.toString(name_.getOrdinate());
//                    name1.setAttribute("y", ordinate_n);
//                    String abscissa_n = Double.toString(name_.getAbscissa());
//                    name1.setAttribute("x", abscissa_n);
//                    String content_n = name_.getContent();
//                    name1.setTextContent(content_n);
//                    location.appendChild(name1);
//                }
//
//                List<Label> list_l = sdgDAO.selectLabels(id_s, sdgId);
//                if(list_l!=null) {
//                    for (Label la : list_l) {
//                        Element label = doc.createElement("label");
//                        String ordinate_l = Double.toString(la.getOrdinate());
//                        label.setAttribute("y", ordinate_l);
//                        String abscissa_l = Double.toString(la.getAbscissa());
//                        label.setAttribute("x", abscissa_l);
//                        String kind_l = la.getKind();
//                        label.setAttribute("kind", kind_l);
//                        String content_l = la.getContent();
//                        label.setTextContent(content_l);
//                        location.appendChild(label);
//                    }
//                }
//
//                if (sdgDAO.selectIsCommitted(id_s, sdgId)) {
//                    Element committed = doc.createElement("committed");
//                    location.appendChild(committed);
//                }
//
//                if (sdgDAO.selectIsUrgent(id_s, sdgId)) {
//                    Element urgent = doc.createElement("urgent");
//                    location.appendChild(urgent);
//                }
//
//
//                if (l.getIsInit() == true) {
//                    Element init = doc.createElement("init");
//                    init.setAttribute("ref", l.getId());
//                    template.appendChild(init);
//                }
//                if (l.getIsFinal() == true) {
//                    Element fin = doc.createElement("fin");
//                    fin.setAttribute("ref", l.getId());
//                    template.appendChild(fin);
//                }
//            }
//        } catch (DataAccessException e) {
//            e.printStackTrace();
//            result.setCode("01");
//            result.setErrmsg("data access exception");
//            return result;
//        }
//
//        //branchpoint
//        List<BranchPoint> list_b = sdgDAO.select_all_branch_points(sdgId);
//        if(list_b!=null) {
//            for (BranchPoint t : list_b) {
//                Element branch_point = doc.createElement("branchpoint");
//                branch_point.setAttribute("y", Double.toString(t.getOrdinate()));
//                branch_point.setAttribute("x", Double.toString(t.getAbscissa()));
//                branch_point.setAttribute("id", t.getId());
//                template.appendChild(branch_point);
//
//            }
//        }
//
//
//        // 迁移
//        List<Transition> list_t = sdgDAO.select_all_transitions(sdgId);
//        for (Transition t : list_t) {
//            Element transition = doc.createElement("transition");
//            template.appendChild(transition);
//
//            Element source = doc.createElement("source");
//            source.setAttribute("ref", t.getSource());//transition的source
//            transition.appendChild(source);
//
//            Element target = doc.createElement("target");
//            target.setAttribute("ref", t.getTarget());//transition的target
//            transition.appendChild(target);
//
//            List<Label> list_la = sdgDAO.selectLabels(t.getId(), sdgId);
//            if(list_la!=null) {
//                for (Label la : list_la) {
//                    Element label1 = doc.createElement("label");
//                    String ordinate_la = Double.toString(la.getOrdinate());
//                    label1.setAttribute("y", ordinate_la);
//                    String abscissa_la = Double.toString(la.getAbscissa());
//                    label1.setAttribute("x", abscissa_la);
//                    label1.setAttribute("kind", la.getKind());
//                    label1.setTextContent(la.getContent());
//                    transition.appendChild(label1);
//                }
//            }
//
//
//            List<Nail> list_na = sdgDAO.selectNails(t.getId(), sdgId);
//            if(list_na!=null) {
//                for (Nail na : list_na) {
//                    Element nail1 = doc.createElement("nail");
//                    String ordinate_na = Double.toString(na.getOrdinate());
//                    nail1.setAttribute("y", ordinate_na);
//                    String abscissa_na = Double.toString(na.getAbscissa());
//                    nail1.setAttribute("x", abscissa_na);
//                    transition.appendChild(nail1);
//                }
//            }
//
//        }
//
//        Element system = doc.createElement("system");
//        rootElement.appendChild(system);
//        system.setTextContent("");
//
//        Element queries = doc.createElement("queries");
//        rootElement.appendChild(queries);
//
//        Element query = doc.createElement("query");
//        queries.appendChild(query);
//
//        Element formula = doc.createElement("formula");
//        query.appendChild(formula);
//        formula.setTextContent("");
//
//        Element comment = doc.createElement("comment");
//        query.appendChild(comment);
//        comment.setTextContent("");
//
//
//        // print XML to system console
//        try (FileOutputStream output =
//                     new FileOutputStream("E:\\test\\sdg"+sdgId+".xml")) {
//            writeXml(doc, output);
//        } catch (IOException | TransformerException e) {
//            e.printStackTrace();
//            result.setCode("02");
//            result.setErrmsg("xml file write error");
//        }
//
//
//        //定义向前端返回的result
//        if (data != null) {
//            result.setCode("00");
//            return result;
//        } else {
//            result.setCode("10");
//            result.setErrmsg("JSON reading error");
//        }

        return result;
    }

    @CrossOrigin
    @ResponseBody
    @RequestMapping(value = "/download_xml_act")//***这里的url修改过了 2022.2.9
    public Result XmlWriter(@RequestParam String sdgId, HttpServletResponse response)
            throws ParserConfigurationException, TransformerException {
        Result result = new Result();

        //todo 判断要传的xml文件的名称
        File file = new File("E:\\test\\test-dom.xml");
        try(InputStream inputStream =  new FileInputStream(file);
            OutputStream outputStream = response.getOutputStream();){
            response.setContentType("application/x-download");
            response.addHeader("Content-Disposition", "attachment;filename=test.xml");
            IOUtils.copy(inputStream, outputStream);
            outputStream.flush();
        }catch (Exception e){
            e.printStackTrace();
        }



        return result;
    }

    @CrossOrigin
    @ResponseBody
    @GetMapping(value = "/parse_xml_act")
    public Result XmlParser() {
        Result result = new Result();

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