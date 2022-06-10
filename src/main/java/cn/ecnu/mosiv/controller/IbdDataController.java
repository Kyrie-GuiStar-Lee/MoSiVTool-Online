package cn.ecnu.mosiv.controller;

import cn.ecnu.mosiv.Pojo.Diagram;
import cn.ecnu.mosiv.Pojo.IBD.*;
import cn.ecnu.mosiv.Pojo.Result;
import cn.ecnu.mosiv.dao.IbdDAO;
import lombok.extern.slf4j.Slf4j;
import net.sf.json.JSONArray;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;
import org.w3c.dom.Document;
import org.w3c.dom.Element;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.util.ArrayList;
import java.util.List;

@Controller
@Slf4j
public class IbdDataController {

    @Autowired
    IbdDAO ibdDAO;

    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/save_json_ibd")//***这里的url修改过了 2022.1.25
    public Result save_para(@RequestBody List<Object> data) throws JSONException, ParserConfigurationException {
        Result result = new Result();
        Diagram ibd = new Diagram();
//        JSONObject data4 = JSONObject.fromObject(data);
//        data4.getString("")
        JSONArray data1 = JSONArray.fromObject(data);//data1是前端传来的整个的JSON数组
        System.out.println(data1);

        JSONObject data2 = data1.getJSONObject(0);//data2中装的是 diagramId 和 base64 数据
        String ibdId = data2.getString("id");

        ibd.setBase64(data2.getString("base64"));

        //todo 在数据库中根据图ID搜索JSON发送到前端
        String str = data1.toString();
//        System.out.println(str);
        ibd.setJson(str);

        ibdDAO.updateDiagram(ibd,ibdId);


        List<String> current_parts = new ArrayList<>();
        List<String> current_connectors = new ArrayList<>();
        List<String> current_ibdPorts = new ArrayList<>();
        for (int i = 1; i < data.size(); i++) {
            JSONObject object1 = data1.getJSONObject(i);
            //组件的type是block,保存block相关信息
            if (object1.getString("type").equals("part")) {
                Part part = new Part();
                part.setAbscissa(object1.getDouble("abscissa"));
                part.setOrdinate(object1.getDouble("ordinate"));
                part.setId(object1.getString("id"));
                part.setIbdId(ibdId);
                part.setName(object1.getString("name"));
                part.setDescription(object1.getString("description"));

                current_parts.add(part.getId());

                //如果数据库中没有该状态，则新建；有则更新
                try {
                    if (ibdDAO.selectPart(part.getId(), ibdId) == null) {
                        ibdDAO.newPart(part);
                    } else {
                        ibdDAO.updatePart(part);
                    }
                } catch (DataAccessException e) {
                    e.printStackTrace();
                    result.setErrmsg("Data access error");
                    result.setCode("01");
                    return result;
                }

            }

            //组件的type是connector，保存connector的相关信息
            if (object1.getString("type").equals("connector")) {
                Connector connector = new Connector();
                connector.setId(object1.getString("id"));
                connector.setIbdId(ibdId);
                connector.setSource(object1.getString("source"));
                connector.setTarget(object1.getString("target"));
                connector.setType(object1.getString("type"));

                current_connectors.add(connector.getId());

                //如果数据库中没有该connector，则新建；有则更新
                if (ibdDAO.selectConnector(connector.getId(), ibdId) == null) {
                    ibdDAO.newConnector(connector);
                } else {
                    ibdDAO.updateConnector(connector);
                }

            }

            //保存ibdPort 相关信息
            if (object1.getString("type").equals("ibdPort")) {
                IbdPort ibdPort = new IbdPort();
                ibdPort.setId(object1.getString("id"));
                ibdPort.setIbdId(ibdId);
                ibdPort.setAbscissa(object1.getDouble("abscissa"));
                ibdPort.setOrdinate(object1.getDouble("ordinate"));
                ibdPort.setName(object1.getString("name"));
                ibdPort.setDescription(object1.getString("description"));
                ibdPort.setType(object1.getString("type"));

                current_ibdPorts.add(ibdPort.getId());

                if (ibdDAO.selectIbdPort(ibdPort.getId(), ibdId) == null) {
                    ibdDAO.newIbdPort(ibdPort);
                } else {
                    ibdDAO.updateIbdPort(ibdPort);
                }
            }


        }


        //判断前端绘图是否删除了之前保存的part,connector和ibdPort
//        System.out.println(stategramDAO.select_state_ids());
//        System.out.println(stategramDAO.select_transition_ids());

        List<String> old_parts = ibdDAO.select_part_ids(ibdId);
        List<String> old_connectors = ibdDAO.select_connector_ids(ibdId);
        List<String> old_ibdPorts = ibdDAO.select_ibdPort_ids(ibdId);



        for (String t : current_parts) {
            if (old_parts.contains(t)) {
                old_parts.remove(t);
            }
        }
        for (String t : current_connectors) {
            if (old_connectors.contains(t)) {
                old_connectors.remove(t);
            }
        }
        for (String t : current_ibdPorts) {
            if (old_ibdPorts.contains(t)) {
                old_ibdPorts.remove(t);
            }
        }

//        System.out.println(old_states);
//        System.out.println(old_transitions);

        //完成上述操作后，old_states、old_transitions和old_branch_points中剩余的id就是需要删除的state、transition和branch_point的id
        if (old_parts.size() > 0) {
            ibdDAO.deletePart(old_parts, ibdId);
        }
        if (old_connectors.size() > 0) {
            ibdDAO.deleteConnector(old_connectors, ibdId);
        }
        if (old_ibdPorts.size() > 0) {
            ibdDAO.deleteIbdPort(old_ibdPorts, ibdId);
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
}
