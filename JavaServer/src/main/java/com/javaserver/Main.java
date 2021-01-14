package com.javaserver;

import jakarta.websocket.DeploymentException;
import org.glassfish.tyrus.server.Server;

import java.util.HashMap;
import java.util.Map;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Server server = new Server("localhost", 80, "/websocket", null, Endpoint.class);

        try {
            server.start();
            Scanner sc = new Scanner(System.in);
            String inp = sc.next();
        } catch (DeploymentException e) {
            e.printStackTrace();
        }
        finally {
            server.stop();
        }
    }
}
