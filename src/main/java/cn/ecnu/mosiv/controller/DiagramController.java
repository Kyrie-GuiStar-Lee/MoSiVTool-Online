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
    @PostMapping(value = "/add_state_diagram")
    public Result save_state_diagram(@RequestBody Object object) throws JSONException {
        JSONObject jsonObject = JSONObject.fromObject(object);
        Diagram stateDiagram = new Diagram();
        Result result = new Result();
        try {
            stateDiagram.setName(jsonObject.getString("name"));
            stateDiagram.setType(1);//在每个图对应的新建接口中将TYPE写死，1对应的是状态机图
            stateDiagram.setJson("");
            stateDiagram.setBase64("");
        } catch (JSONException e) {
            e.printStackTrace();
            result.setErrmsg("JSON reading error");
            result.setCode("10");
            return result;
        }
        diagramDAO.newStateDiagram(stateDiagram);
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
