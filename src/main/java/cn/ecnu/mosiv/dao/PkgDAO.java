package cn.ecnu.mosiv.dao;

import cn.ecnu.mosiv.Pojo.Diagram;
import cn.ecnu.mosiv.Pojo.PackageDiagram.*;
import cn.ecnu.mosiv.Pojo.PackageDiagram.Package;
import com.sun.xml.internal.bind.v2.runtime.reflect.Lister;
import net.sf.json.JSONArray;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Map;

@Mapper
@Repository
public interface PkgDAO {

    void newPackage(@Param("package") Package pkg);

    void newDependency(@Param("dependency") Dependency dependency);

    String selectPackage(@Param("id") String id,@Param("pkgId")String pkgId);

    String selectDependency(@Param("id") String id,@Param("pkgId")String pkgId);

    List<String> select_package_ids(String pkgId);

    List<String> select_dependency_ids(String pkgId);

    List<cn.ecnu.mosiv.Pojo.ParametricDiagram.Param> select_all_packages(String pkgId);

    List<cn.ecnu.mosiv.Pojo.ParametricDiagram.Connector> select_all_dependencies(String pkgId);

    void updatePackage(@Param("package") Package pkg);

    void updateDiagram(@Param("pkg") Diagram pkg, @Param("pkgId")String pkgId);

    void updateDependency(@Param("dependency") Dependency dependency);

    void deletePackage(@Param("p_delete") List<String> p_delete,@Param("pkgId")String pkgId);

    void deleteDependency(@Param("d_delete") List<String> d_delete,@Param("pkgId")String pkgId);

}
