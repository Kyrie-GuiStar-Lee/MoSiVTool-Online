package cn.ecnu.mosiv.util;

import sun.misc.BASE64Decoder;

import java.io.File;
import java.io.FileOutputStream;
import java.io.OutputStream;
import java.util.UUID;

public class Base64ToImage {
    public static String BASE64CodeToBeImage(String BASE64str,String path,String ext){
        File fileDir = new File(path);
        if (!fileDir.exists()) {
            fileDir.setWritable(true);
            fileDir.mkdirs();
        }
        //文件名称
        String uploadFileName = UUID.randomUUID().toString() + "."+ext;
        File targetFile = new File(path, uploadFileName);
        BASE64Decoder decoder = new BASE64Decoder();
        try{
            OutputStream out = new FileOutputStream(targetFile);
            byte[] b = decoder.decodeBuffer(BASE64str);
            for (int i = 0; i <b.length ; i++) {
                if (b[i] <0) {
                    b[i]+=256;
                }
            }
            out.write(b);
            out.flush();
            return  path+"/"+uploadFileName+"."+ext;
        }catch (Exception e){
            e.printStackTrace();
            return null;
        }
    }
}
