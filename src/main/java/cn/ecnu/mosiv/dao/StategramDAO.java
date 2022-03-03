package cn.ecnu.mosiv.dao;

import cn.ecnu.mosiv.Pojo.*;
import cn.ecnu.mosiv.Pojo.StateMachineDiagram.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface StategramDAO {
    void newState(@Param("location") Location location);
    void newBranchPoint(@Param("branch_point") BranchPoint branchPoint);
    void newName(@Param("name") Name name);
    void newLabel(@Param("label") Label label);
    void newNails(@Param("nails") List<Nail> nails);
    void newTransition(@Param("transition") Transition transition);
    String selectState(@Param("id") String id,@Param("sdgId")String sdgId);
    String selectTransition(@Param("id") String id,@Param("sdgId")String sdgId);
    String selectBranchPoint(@Param("id") String id,@Param("sdgId")String sdgId);
    List<String> select_state_ids(String sdgId);
    List<String> select_transition_ids(String sdgId);
    List<String> select_branch_point_ids(String sdgId);
    List<Location> select_all_states(String sdgId);
    List<Transition> select_all_transitions(String sdgId);
    List<BranchPoint> select_all_branch_points(String sdgId);
    Boolean selectIsCommitted(String id, String sdgId);
    Boolean selectIsUrgent(String id, String sdgId);
    Name selectStateName(@Param("id") String id,@Param("sdgId") String sdgId);
    List<Label> selectLabels(@Param("id") String id,@Param("sdgId") String sdgId);
    List<Nail> selectNails(@Param("id") String id,@Param("sdgId") String sdgId);
    void updateState(@Param("location") Location location);
    void updateName(@Param("name") Name name);
    void updateDiagram(@Param("stateDiagram") Diagram stateDiagram, @Param("sdgId") String sdgId);
    void updateLabel(@Param("label") Label label);
    void updateNails(@Param("nails") List<Nail> nails);
    void updateTransition(@Param("transition") Transition transition);
    void updateBranchPoint(@Param("branch_point")BranchPoint branchPoint);
    void deleteState(@Param("s_delete") List<String> s_delete,@Param("sdgId") String sdgId);
    void deleteTransition(@Param("t_delete") List<String> t_delete,@Param("sdgId") String sdgId);
    void deleteBranchPoint(@Param("b_delete")List<String> b_delete,@Param("sdgId")String sdgId);
    void deleteName(@Param("to_delete")List<String> to_delete,@Param("sdgId")String sdgId);
    void deleteLabel(@Param("to_delete")List<String> to_delete,@Param("sdgId")String sdgId);
    void deleteNail(@Param("to_delete") List<String> to_delete, @Param("sdgId") String sdgId);
}
