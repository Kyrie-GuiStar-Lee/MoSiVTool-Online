package cn.ecnu.mosiv.dao;

import cn.ecnu.mosiv.Pojo.*;
import cn.ecnu.mosiv.Pojo.IBD.*;
import net.sf.json.JSONArray;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

public interface IbdDAO {

    void newPart(@Param("part") Part part);

    void newIbdPort(@Param("ibdPort") IbdPort ibdPort);

    void newConnector(@Param("connector")Connector connector);

    String selectPart(@Param("id") String id,@Param("ibdId")String ibdId);

    String selectConnector(@Param("id") String id,@Param("ibdId")String ibdId);

    String selectIbdPort(@Param("id") String id,@Param("ibdId")String ibdId);

    List<String> select_part_ids(String ibdId);

    List<String> select_connector_ids(String ibdId);

    List<String> select_ibdPort_ids(String ibdId);

    List<Part> select_all_parts(String ibdId);

    List<Connector> select_all_connectors(String ibdId);

    List<IbdPort> select_all_ibdPorts(String ibdId);

    void updatePart(@Param("part") Part part);

    void updateDiagram(@Param("ibd") Diagram ibd, @Param("ibdId") String ibdId);

    void updateConnector(@Param("connector") Connector connector);

    void updateIbdPort(@Param("ibdPort") IbdPort ibdPort);

    void deletePart(@Param("p_delete") List<String> p_delete,@Param("ibdId") String ibdId);

    void deleteConnector(@Param("c_delete") List<String> c_delete,@Param("ibdId") String ibdId);

    void deleteIbdPort(@Param("ip_delete")List<String> ip_delete,@Param("ibdId") String ibdId);


}
