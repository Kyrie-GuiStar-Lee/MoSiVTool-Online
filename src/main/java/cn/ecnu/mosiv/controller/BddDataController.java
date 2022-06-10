package cn.ecnu.mosiv.controller;

import cn.ecnu.mosiv.Pojo.*;
import cn.ecnu.mosiv.Pojo.BDD.*;
import cn.ecnu.mosiv.Pojo.Result;
import cn.ecnu.mosiv.Pojo.StateMachineDiagram.*;
import cn.ecnu.mosiv.dao.BddDAO;
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

public class BddDataController {

    @Autowired
    BddDAO bddDAO;

    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/save_json_bdd")//***这里的url修改过了 2022.1.25
    public Result save_bdd(@RequestBody List<Object> data) throws JSONException, ParserConfigurationException {
        Result result = new Result();
        Diagram bdd = new Diagram();
//        JSONObject data4 = JSONObject.fromObject(data);
//        data4.getString("")
        JSONArray data1 = JSONArray.fromObject(data);//data1是前端传来的整个的JSON数组
        System.out.println(data1);

        JSONObject data2 = data1.getJSONObject(0);//data2中装的是 bdId 和 base64 数据
        String bddId = data2.getString("id");

        bdd.setBase64(data2.getString("base64"));

        //todo 在数据库中根据图ID搜索JSON发送到前端
        String str = data1.toString();
//        System.out.println(str);
        bdd.setJson(str);

        bddDAO.updateDiagram(bdd,bddId);


        List<String> current_blocks = new ArrayList<>();
        List<String> current_relationships = new ArrayList<>();
        List<String> current_ports = new ArrayList<>();
        for (int i = 1; i < data.size(); i++) {
            JSONObject object1 = data1.getJSONObject(i);
            //组件的type是block,保存block相关信息
            if (object1.getString("type").equals("block")) {
                Block block = new Block();
                block.setAbscissa(object1.getDouble("abscissa"));
                block.setOrdinate(object1.getDouble("ordinate"));
                block.setId(object1.getString("id"));
                block.setBddId(bddId);
                block.setOperation(object1.getString("operation"));
                block.setConstraint(object1.getString("constraint"));

                Property property = null;
                try {
                    JSONObject property1 = object1.getJSONObject("property");
                    property = new Property();
                    property.setBlockId(block.getId());
                    property.setValue(property1.getString("value"));
                    property.setPart(property1.getString("part"));
                    property.setReferences(property1.getString("references"));
                    property.setBddId(bddId);
                } catch (JSONException e) {
                    e.printStackTrace();

                }
                //保存状态标签的相关信息
                MLComponent mlComponent = null;
                try {
                    JSONObject mlComponent1 = object1.getJSONObject("mlComponent");
                    System.out.println(mlComponent1+"+"+block.getId());
                    if(mlComponent1!=null) {
                        mlComponent.setBlockId(block.getId());
                        mlComponent.setBddId(bddId);
                        mlComponent.setName(mlComponent1.getString("name"));
                        mlComponent.setType(mlComponent1.getString("type"));
                        mlComponent.setDescription(mlComponent1.getString("description"));
                        mlComponent.setAuthors(mlComponent1.getString("authors"));
                        mlComponent.setIntendedUse(mlComponent1.getString("intendedUse"));
                        mlComponent.setNetwork(mlComponent1.getString("network"));
                        mlComponent.setInput(mlComponent1.getString("input"));
                        mlComponent.setOutput(mlComponent1.getString("output"));
                        mlComponent.setFactor(mlComponent1.getString("factor"));
                        mlComponent.setMetric(mlComponent1.getString("metric"));
                        mlComponent.setAnalyses(mlComponent1.getString("analyses"));
                        mlComponent.setAdditionalInformation(mlComponent1.getString("additionalInformation"));
                        mlComponent.setEthic(mlComponent1.getString("ethic"));
                    }
                } catch (JSONException e) {
                    e.printStackTrace();
                }


                current_blocks.add(block.getId());

                //如果数据库中没有该状态，则新建；有则更新
                try {
                    if (bddDAO.selectBlock(block.getId(), bddId) == null) {
                        bddDAO.newBlock(block);
                        if (property.getBlockId() != null) {
                            bddDAO.newProperty(property);
                        }
                        if (mlComponent != null) {
                            bddDAO.newMLComponent(mlComponent);
                        }
                    } else {
                        bddDAO.updateBlock(block);
                        if (property != null) {
                            bddDAO.updateProperty(property);
                        }
                        if (mlComponent != null) {
                            bddDAO.updateMLComponent(mlComponent);
                        }
                    }
                } catch (DataAccessException e) {
                    e.printStackTrace();
                    result.setErrmsg("Data access error");
                    result.setCode("01");
                    return result;
                }

            }

            //组件的type是relationship，保存relationship的相关信息
                //目前假设relationship只有generalization, dependency, association三种类型
            if (object1.getString("type").equals("generalization") || object1.getString("type").equals("dependency")|| object1.getString("type").equals("association")) {
                Relationship relationship = new Relationship();
                relationship.setId(object1.getString("id"));
                relationship.setBddId(bddId);
                relationship.setType(object1.getString("type"));
                relationship.setSource(object1.getString("source"));
                relationship.setTarget(object1.getString("target"));


                current_relationships.add(relationship.getId());

                //如果数据库中没有该transition，则新建；有则更新
                if (bddDAO.selectRelationship(relationship.getId(), bddId) == null) {
                    bddDAO.newRelationship(relationship);
                } else {
                    bddDAO.updateRelationship(relationship);
                }

            }

            //保存port 相关信息
                //目前假设port只有standardPort和flowPort两种类型
            if (object1.getString("type").equals("standardPort")||object1.getString("type").equals("flowPort")) {
                Port port = new Port();
                port.setId(object1.getString("id"));
                port.setBddId(bddId);
                port.setType(object1.getString("type"));
                port.setAbscissa(object1.getDouble("abscissa"));
                port.setOrdinate(object1.getDouble("ordinate"));

                current_ports.add(port.getId());
                if (bddDAO.selectPort(port.getId(), bddId) == null) {
                    bddDAO.newPort(port);
                } else {
                    bddDAO.updatePort(port);
                }
            }
        }


        //判断前端绘图是否删除了之前保存的state、transition和branch_point
//        System.out.println(stategramDAO.select_state_ids());
//        System.out.println(stategramDAO.select_transition_ids());

        List<String> old_blocks = bddDAO.select_block_ids(bddId);
        List<String> old_relationships = bddDAO.select_relationship_ids(bddId);
        List<String> old_ports = bddDAO.select_port_ids(bddId);


        for (String t : current_blocks) {
            if (old_blocks.contains(t)) {
                old_blocks.remove(t);
            }
        }
        for (String t : current_relationships) {
            if (old_relationships.contains(t)) {
                old_relationships.remove(t);
            }
        }
        for (String t : current_ports) {
            if (old_ports.contains(t)) {
                old_ports.remove(t);
            }
        }

//        System.out.println(old_states);
//        System.out.println(old_transitions);

        //完成上述操作后，old_states、old_transitions和old_branch_points中剩余的id就是需要删除的state、transition和branch_point的id
        if (old_blocks.size() > 0) {
            bddDAO.deleteBlock(old_blocks, bddId);
            bddDAO.deleteProperty(old_blocks, bddId);
            bddDAO.deleteMLComponent(old_blocks, bddId);
        }
        if (old_relationships.size() > 0) {
            bddDAO.deleteRelationship(old_relationships, bddId);
        }
        if (old_ports.size() > 0) {
            bddDAO.deletePort(old_ports, bddId);
        }


        /*
        以下部分为写xml文件的功能实现
        需要进行修改

         */
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


//        //状态
//        try {
//            List<Location> list_s = stategramDAO.select_all_states(sdgId);
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
//                Name name_ = stategramDAO.selectStateName(id_s, sdgId);
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
//                List<Label> list_l = stategramDAO.selectLabels(id_s, sdgId);
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
//                if (stategramDAO.selectIsCommitted(id_s, sdgId)) {
//                    Element committed = doc.createElement("committed");
//                    location.appendChild(committed);
//                }
//
//                if (stategramDAO.selectIsUrgent(id_s, sdgId)) {
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
//        List<BranchPoint> list_b = stategramDAO.select_all_branch_points(sdgId);
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
//        List<Transition> list_t = stategramDAO.select_all_transitions(sdgId);
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
//            List<Label> list_la = stategramDAO.selectLabels(t.getId(), sdgId);
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
//            List<Nail> list_na = stategramDAO.selectNails(t.getId(), sdgId);
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
//                     new FileOutputStream("E:\\test\\bdd"+bddId+".xml")) {
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
    @RequestMapping(value = "/download_xml_bdd")//***这里的url修改过了 2022.2.9
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
