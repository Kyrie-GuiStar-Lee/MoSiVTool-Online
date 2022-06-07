package cn.ecnu.mosiv.dao;

import cn.ecnu.mosiv.Pojo.*;
import net.sf.json.JSONArray;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Mapper
@Repository

public interface DiagramDAO {

    void newDiagram(@Param("diagram") Diagram diagram);

    List<String> searchDiagramByProjectId(@Param("projectId") int projectId);
}
