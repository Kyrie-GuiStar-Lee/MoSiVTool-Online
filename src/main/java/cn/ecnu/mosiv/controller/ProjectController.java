package cn.ecnu.mosiv.controller;

import cn.ecnu.mosiv.Pojo.Project;
import cn.ecnu.mosiv.Pojo.Result;
import cn.ecnu.mosiv.dao.ProjectDAO;
import net.sf.json.JSONException;
import net.sf.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseBody;

import java.util.ArrayList;
import java.util.List;

@Controller
public class ProjectController {

    @Autowired
    ProjectDAO projectDAO;

    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/addProject")
    public Result newProject(@RequestBody Object object) {
        //需要传入的数据有：name（必传）, userId（必传）, author, description
        Result result = new Result();
        JSONObject jsonObject = JSONObject.fromObject(object);
        Project project = new Project();
        try {
            project.setName(jsonObject.getString("name"));
            project.setUserId(jsonObject.getInt("userId"));
        } catch (JSONException e) {
            e.printStackTrace();
            result.setErrmsg("JSON reading error");
            result.setCode("10");
            return result;
        }
        try {
            project.setAuthorName(jsonObject.getString("author"));
            project.setDescription(jsonObject.getString("description"));
        } catch (JSONException e) {

        }
        projectDAO.newProject(project);
        if (project.getId() != -1) {
            result.setCode("00");
            result.setData(project.getId());
            return result;
        }
        result.setCode("01");
        result.setErrmsg("getting id from database error");
        return result;
    }

    @CrossOrigin
    @ResponseBody
    @PostMapping(value = "/showProjects")
    public Result showProjects(@RequestBody Object object) {
        Result result = new Result();
        JSONObject jsonObject = JSONObject.fromObject(object);
        List<Integer> list;
        try{
            list = projectDAO.searchProjectByUserId(jsonObject.getInt("userId"));
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
