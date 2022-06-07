package cn.ecnu.mosiv.dao;

import cn.ecnu.mosiv.Pojo.Diagram;
import cn.ecnu.mosiv.Pojo.ParametricDiagram.*;
import net.sf.json.JSONArray;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Mapper
@Repository
public interface ParaDAO {

    void newConstraintBlock(@Param("constraintBlock") ConstraintBlock constraintBlock);

    void newParam(@Param("param") cn.ecnu.mosiv.Pojo.ParametricDiagram.Param param);

    void newValue(@Param("value") Value value);

    void newConnector(@Param("connector") Connector connector);

    String selectConstraintBlock(@Param("id") String id,@Param("paraId")String paraId);

    String selectConnector(@Param("id") String id,@Param("paraId")String paraId);

    String selectParam(@Param("id") String id,@Param("paraId")String paraId);

    String selectValue(@Param("id") String id,@Param("paraId")String paraId);

    List<String> select_constraintBlock_ids(String paraId);

    List<String> select_connector_ids(String paraId);

    List<String> select_param_ids(String paraId);

    List<String> select_value_ids(String paraId);

    List<cn.ecnu.mosiv.Pojo.ParametricDiagram.Param> select_all_params(String paraId);

    List<cn.ecnu.mosiv.Pojo.ParametricDiagram.Connector> select_all_connectors(String paraId);

    List<Value> select_all_values(String paraId);

    List<ConstraintBlock> select_all_constraintBlocks(String paraId);

    void updateParam(@Param("param")cn.ecnu.mosiv.Pojo.ParametricDiagram.Param param);

    void updateDiagram(@Param("para") Diagram para, @Param("paraId") String paraId);

    void updateConnector(@Param("connector") Connector connector);

    void updateValue(@Param("value") Value value);

    void updateConstraintBlock(@Param("constraintBlock") ConstraintBlock constraintBlock);

    void deleteParam(@Param("p_delete") List<String> p_delete,@Param("paraId") String paraId);

    void deleteConnector(@Param("c_delete") List<String> c_delete,@Param("paraId") String paraId);

    void deleteValue(@Param("v_delete")List<String> v_delete,@Param("paraId") String paraId);

    void deleteConstraintBlock(@Param("cb_delete")List<String> cb_delete,@Param("paraId") String paraId);

}
