package cn.ecnu.mosiv.controller;

import cn.ecnu.mosiv.Pojo.Diagram;
import cn.ecnu.mosiv.Pojo.Result;
import cn.ecnu.mosiv.dao.DiagramDAO;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.List;

public class DiagramController {

    @Autowired
    DiagramDAO diagramDAO;

    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/addDiagram")
    public Result save_state_diagram(@RequestBody Object object) throws JSONException {
        JSONObject jsonObject = JSONObject.fromObject(object);
        Diagram diagram = new Diagram();
        Result result = new Result();
        try {
            diagram.setName(jsonObject.getString("name"));
            diagram.setType(jsonObject.getInt("type"));//1对应状态机图，2对应活动图，3对应BDD，4对应IBD
            diagram.setProjectId(jsonObject.getInt("projectId"));
            diagram.setJson("");
            diagram.setBase64("");
        } catch (JSONException e) {
            e.printStackTrace();
            result.setErrmsg("JSON reading error");
            result.setCode("10");
            return result;
        }
        diagramDAO.newDiagram(diagram);
        if (diagram.getId() != -1) {
            result.setCode("00");
            result.setData(diagram.getId());
            return result;
        }
        result.setCode("01");
        result.setErrmsg("getting id from database error");
        return result;
    }

    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/showDiagrams")
    public Result showDiagrams(@RequestBody Object object) {
        Result result = new Result();
        JSONObject jsonObject = JSONObject.fromObject(object);
        List<String> list;
        try{
            list = diagramDAO.searchDiagramByProjectId(jsonObject.getInt("projectId"));
            result.setData(list);
        }catch(DataAccessException e){
            result.setErrmsg("Data access error");
            result.setCode("01");
            return result;
        }
        result.setCode("00");
        return result;
    }
}
