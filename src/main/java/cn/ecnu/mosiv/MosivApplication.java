package cn.ecnu.mosiv;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;

@SpringBootApplication
@EntityScan("controller")
public class MosivApplication {

    public static void main(String[] args) {
        SpringApplication.run(MosivApplication.class, args);
    }

}
