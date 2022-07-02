package cn.ecnu.mosiv.controller;

import cn.ecnu.mosiv.Pojo.*;
import cn.ecnu.mosiv.Pojo.ANN.*;
import cn.ecnu.mosiv.Pojo.Result;
import cn.ecnu.mosiv.dao.AnnDAO;
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

public class AnnDataController {

    @Autowired
    AnnDAO annDAO;

    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/save_json_ann")//***这里的url修改过了 2022.1.25
    public Result save_ann(@RequestBody List<Object> data) throws JSONException, ParserConfigurationException {
        Result result = new Result();
        Diagram ann = new Diagram();
//        JSONObject data4 = JSONObject.fromObject(data);
//        data4.getString("")
        JSONArray data1 = JSONArray.fromObject(data);//data1是前端传来的整个的JSON数组
        System.out.println(data1);

        JSONObject data2 = data1.getJSONObject(0);//data2中装的是 bdId 和 base64 数据
        String annId = data2.getString("id");

        ann.setBase64(data2.getString("base64"));

        //todo 在数据库中根据图ID搜索JSON发送到前端
        String str = data1.toString();
//        System.out.println(str);
        ann.setJson(str);

        annDAO.updateDiagram(ann,annId);


        List<String> current_layers = new ArrayList<>();
        List<String> current_propagations = new ArrayList<>();
        for (int i = 1; i < data.size(); i++) {
            JSONObject object1 = data1.getJSONObject(i);
            //组件的type是layer,保存layer相关信息
            if (object1.getString("type").equals("layer")) {
                Layer layer = new Layer();
                layer.setName(object1.getString("name"));
                layer.setType(object1.getString("type"));
                layer.setId(object1.getString("id"));
                layer.setDiagramId(annId);
                layer.setAbscissa(object1.getDouble("abscissa"));
                layer.setOrdinate(object1.getDouble("ordinate"));
                layer.setDescription(object1.getString("description"));
                layer.setInput(object1.getString("input"));
                layer.setBias(object1.getString("bias"));
                layer.setLoss(object1.getString("loss"));
                layer.setOutput(object1.getString("output"));
                layer.setWeights(object1.getString("weights"));
                layer.setData(object1.getString("data"));


                current_layers.add(layer.getId());

                //如果数据库中没有该状态，则新建；有则更新
                try {
                    if (annDAO.selectLayer(layer.getId(), annId) == null) {
                        annDAO.newLayer(layer);
                    } else {
                        annDAO.updateLayer(layer);
                    }
                } catch (DataAccessException e) {
                    e.printStackTrace();
                    result.setErrmsg("Data access error");
                    result.setCode("01");
                    return result;
                }

            }

            //组件的type是propagation，保存propagation的相关信息
            if (object1.getString("type").equals("propagation")){
                Propagation propagation = new Propagation();
                propagation.setId(object1.getString("id"));
                propagation.setDiagramId(annId);
                propagation.setSource(object1.getString("source"));
                propagation.setTarget(object1.getString("target"));


                current_propagations.add(propagation.getId());

                //如果数据库中没有该transition，则新建；有则更新
                if (annDAO.selectPropagation(propagation.getId(), annId) == null) {
                    annDAO.newPropagation(propagation);
                } else {
                    annDAO.updatePropagation(propagation);
                }

            }

            //保存Attribute相关信息
            if (object1.getString("type").equals("attribute")) {
                Attribute attribute = new Attribute();
                attribute.setDiagramId(annId);
                attribute.setInputType(object1.getString("inputType"));
                attribute.setOutputType(object1.getString("outputType"));
                attribute.setNumOfConnectors(object1.getInt("numOfConnectors"));
                attribute.setNumOfLayers(object1.getInt("numOfLayers"));

                if (annDAO.selectAttribute(annId) == null) {
                    annDAO.newAttribute(attribute);
                } else {
                    annDAO.updateAttribute(attribute);
                }
            }

            if (object1.getString("type").equals("compile")) {
                Compile compile = new Compile();
                compile.setData(object1.getString("data"));
                compile.setDiagramId(annId);

                if (annDAO.selectCompile(annId) == null) {
                    annDAO.newCompile(compile);
                } else {
                    annDAO.updateCompile(compile);
                }
            }

            if (object1.getString("type").equals("trustworthy")) {
                TrustWorthy trustWorthy = new TrustWorthy();
                trustWorthy.setData(object1.getString("data"));
                trustWorthy.setDiagramId(object1.getString("diagramId"));

                if (annDAO.selectTrustWorthy(annId) == null) {
                    annDAO.newTrustworthy(trustWorthy);
                } else {
                    annDAO.updateTrustworthy(trustWorthy);
                }
            }

        }


        //判断前端绘图是否删除了之前保存的state、transition和branch_point
//        System.out.println(stategramDAO.select_state_ids());
//        System.out.println(stategramDAO.select_transition_ids());

        List<String> old_layers = annDAO.select_layer_ids(annId);
        List<String> old_propagations = annDAO.select_propagation_ids(annId);


        for (String t : current_layers) {
            if (old_layers.contains(t)) {
                old_layers.remove(t);
            }
        }
        for (String t : current_propagations) {
            if (old_propagations.contains(t)) {
                old_propagations.remove(t);
            }
        }

        if (old_layers.size() > 0) {
            annDAO.deleteLayer(old_layers, annId);
        }
        if (old_propagations.size() > 0) {
            annDAO.deletePropagation(old_propagations, annId);
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
//                     new FileOutputStream("E:\\test\\bdd"+annId+".xml")) {
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
    @RequestMapping(value = "/download_xml_ann")//***这里的url修改过了 2022.2.9
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
