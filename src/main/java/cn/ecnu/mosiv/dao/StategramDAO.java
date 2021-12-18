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

    void newBranchPoint(@Param("branch_point")BranchPoint branchPoint);

    void newName(@Param("name") Name name);

    void newLabel(@Param("label")Label label);

    void newTransition(@Param("transition") Transition transition);

    String selectState(String id);

    String selectTransition(String id1);

    String selectBranchPoint(String id2);

    List<String> select_state_ids();

    List<String> select_transition_ids();

    List<String> select_branch_point_ids();

    List<Location> select_all_states();

    List<Transition> select_all_transitions();

    List<BranchPoint> select_all_branch_points();

    Name selectStateName(@Param("id") String id);

    List<Label> selectLabels(@Param(("id")) String id);

    void updateState(@Param("location") Location location);

    void updateName(@Param("name") Name name);

    void updateLabel(@Param("label") Label label);

    void updateTransition(@Param("transition") Transition transition);

    void updateBranchPoint(@Param("branch_point")BranchPoint branchPoint);

    void deleteState(List<String> s_delete);

    void deleteTransition(List<String> t_delete);

    void deleteBranchPoint(List<String> b_delete);

    void deleteName(List<String> to_delete);

    void deleteLabel(List<String> to_delete);

}
