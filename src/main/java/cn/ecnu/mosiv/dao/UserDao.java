package cn.ecnu.mosiv.dao;

import cn.ecnu.mosiv.Pojo.*;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface UserDao {

    void newUser(@Param("user") User user);

    String searchUser(@Param("username")String username);

    String searchPassword(@Param("username")String username);

}
