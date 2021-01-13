package com.javaserver;

import jakarta.websocket.DeploymentException;
import org.glassfish.tyrus.server.Server;

import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
//        Map<String, Object> props = new HashMap<>();
        Server server = new Server("localhost", 80, null, Endpoint.class);
//        new Server()

        try {
            server.start();
            Thread.sleep(10000);
        } catch (DeploymentException | InterruptedException e) {
            e.printStackTrace();
        }
        finally {
            server.stop();
        }
    }
}
