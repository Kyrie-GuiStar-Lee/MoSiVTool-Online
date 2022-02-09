package cn.ecnu.mosiv.dao;

import cn.ecnu.mosiv.Pojo.*;
import cn.ecnu.mosiv.Pojo.BDD.*;
import net.sf.json.JSONArray;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

public interface BddDAO {

    void newBlock(@Param("block") Block block);

    void newMLComponent(@Param("mlComponent") MLComponent mlComponent);

    void newPort(@Param("port") Port port);

    void newProperty(@Param("property")Property property);

    void newRelationship(@Param("relationship")Relationship relationship);

    String selectBlock(@Param("id") String id,@Param("bddId")String bddId);

    String selectRelationship(@Param("id") String id,@Param("bddId")String bddId);

    String selectPort(@Param("id") String id,@Param("bddId")String bddId);

    List<String> select_block_ids(String bddId);

    List<String> select_relationship_ids(String bddId);

    List<String> select_port_ids(String bddId);

    List<Block> select_all_blocks(String bddId);

    List<Relationship> select_all_relationships(String bddId);

    List<Port> select_all_ports(String bddId);

    List<MLComponent> selectMLComponents(@Param("id") String id,@Param("bddId") String bddId);

    List<Property> selectProperties(@Param("id") String id,@Param("bddId") String bddId);

    void updateBlock(@Param("block") Block block);

    void updateProperty(@Param("property") Property property);

    void updateDiagram(@Param("bdd") Diagram bdd, @Param("bddId") String bddId);

    void updateMLComponent(@Param("mlComponent") MLComponent mlComponent);

    void updateRelationship(@Param("relationship") Relationship relationship);

    void updatePort(@Param("port")Port port);

    void deleteBlock(@Param("b_delete") List<String> b_delete,@Param("bddId") String bddId);

    void deleteRelationship(@Param("r_delete") List<String> r_delete,@Param("bddId") String bddId);

    void deletePort(@Param("p_delete")List<String> p_delete,@Param("bddId") String bddId);

    void deleteProperty(@Param("to_delete")List<String> to_delete,@Param("bddId") String bddId);

    void deleteMLComponent(@Param("to_delete")List<String> to_delete,@Param("bddId") String bddId);


}
