package cn.ecnu.mosiv.dao;

import cn.ecnu.mosiv.Pojo.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface StategramDAO {

    void newStateDiagram(@Param("stateDiagram") StateDiagram stateDiagram);

    void newState(@Param("location")Location location);

    void newName(@Param("name") Name name);

    void newLabel(@Param("label")Label label);

    void newTransition(@Param("transition") Transition transition);

    String selectState(String id);

    String selectTransition(String id1);

    List<String> select_state_ids();

    List<String> select_transition_ids();

    List<Location> select_all_states();

    List<Transition> select_all_transitions();

    List<Name> select_all_names();

    List<Label> select_all_labels();

    void updateState(@Param("location") Location location);

    void updateName(@Param("name") Name name);

    void updateLabel(@Param("label") Label label);

    void updateTransition(@Param("transition") Transition transition);

    void deleteState(List<String> s_delete);

    void deleteTransition(List<String> t_delete);

    void deleteName(List<String> to_delete);

    void deleteLabel(List<String> to_delete);

}
