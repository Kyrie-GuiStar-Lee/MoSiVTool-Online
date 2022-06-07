package cn.ecnu.mosiv.dao;

import cn.ecnu.mosiv.Pojo.*;
import cn.ecnu.mosiv.Pojo.ActivityDiagram.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface ActDAO {
    void newNode(@Param("node") Node node);

    void newName(@Param("name") Name name);

    void newLabel(@Param("label") Label label);
    void newNails(@Param("nails") List<Nail> nails);

    void newEdge(@Param("edge") Edge edge);

    String selectNode(@Param("id") String id,@Param("actId")String actId);

    String selectEdge(@Param("id") String id,@Param("actId")String actId);

    List<String> select_node_ids(String actId);

    List<String> select_edge_ids(String actId);

    List<Node> select_all_nodes(String actId);

    List<Edge> select_all_edges(String actId);

    Name selectComponentName(@Param("id") String id,@Param("diagramId") String diagramId);

    List<Label> selectLabels(@Param("id") String id,@Param("actId") String actId);

    List<Nail> selectNails(@Param("id") String id,@Param("actId") String actId);

    void updateNode(@Param("node") Node node);

    void updateName(@Param("name") Name name);

    void updateDiagram(@Param("actDiagram") Diagram actDiagram, @Param("actId") String actId);

    void updateLabel(@Param("label") Label label);

    void updateNails(@Param("nails") List<Nail> nails);

    void updateEdge(@Param("transition") Edge edge);

    void deleteNode(@Param("nodeDelete") List<String> nodeDelete,@Param("actId") String actId);

    void deleteEdge(@Param("edgeDelete") List<String> edgeDelete,@Param("actId") String actId);

    void deleteName(@Param("nameDelete")List<String> nameDelete,@Param("diagramId") String diagramId);

    void deleteLabel(@Param("labelDelete")List<String> labelDelete,@Param("diagramId") String diagramId);

    void deleteNail(@Param("nailDelete") List<String> nailDelete, @Param("diagramId") String diagramId);
}
