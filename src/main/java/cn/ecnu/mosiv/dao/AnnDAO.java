package cn.ecnu.mosiv.dao;

import cn.ecnu.mosiv.Pojo.ANN.*;
import cn.ecnu.mosiv.Pojo.Diagram;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface AnnDAO {

    void newLayer(@Param("layer") Layer layer);

    void newPropagation(@Param("propagation")Propagation propagation);

    void newAttribute(@Param("attribute") Attribute attribute);

    void newCompile(@Param("compile")Compile compile);

    void newTrustworthy(@Param("trustworthy") TrustWorthy trustWorthy);

    String selectLayer(@Param("id") String id,@Param("annId")String annId);

    String selectPropagation(@Param("id") String id,@Param("annId")String annId);

    String selectAttribute(@Param("annId")String annId);

    String selectTrustWorthy(@Param("annId")String annId);

    String selectCompile(@Param("annId")String annId);

    List<String> select_layer_ids(String annId);

    List<String> select_propagation_ids(String annId);

    List<Layer> select_all_layers(String annId);

    List<Propagation> select_all_propagations(String annId);

    void updateLayer(@Param("layer") Layer layer);

    void updatePropagation(@Param("propagation")Propagation propagation);

    void updateAttribute(@Param("attribute") Attribute attribute);

    void updateCompile(@Param("compile")Compile compile);

    void updateTrustworthy(@Param("trustworthy") TrustWorthy trustWorthy);

    void updateDiagram(@Param("ann") Diagram ann, @Param("annId") String annId);

    void deleteLayer(@Param("l_delete") List<String> l_delete,@Param("annId") String annId);

    void deletePropagation(@Param("p_delete") List<String> p_delete,@Param("annId") String annId);


}
