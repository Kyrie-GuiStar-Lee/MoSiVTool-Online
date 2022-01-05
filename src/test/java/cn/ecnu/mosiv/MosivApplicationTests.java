package cn.ecnu.mosiv;

import org.apache.commons.io.IOUtils;
import org.json.JSONObject;
import org.json.XML;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.io.InputStream;

@SpringBootTest
class MosivApplicationTests {

    @Test
    void contextLoads() {
    }

    @Test
    void XmlParser() throws IOException {
        InputStream in = MosivApplicationTests.class.getResourceAsStream("/test-dom.xml");
        System.out.println(in);
        String xml = IOUtils.toString(in);
        JSONObject xmlJSONObj = XML.toJSONObject(xml);
        System.out.println(xmlJSONObj.toString());
    }

}
