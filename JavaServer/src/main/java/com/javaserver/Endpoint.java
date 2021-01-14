package com.javaserver;

import javax.websocket.EndpointConfig;
import javax.websocket.OnMessage;
import javax.websocket.OnOpen;
import javax.websocket.Session;
import javax.websocket.server.ServerEndpoint;

@ServerEndpoint(value = "/test")
public class Endpoint {

    @OnOpen
    public void onOpen(Session session, EndpointConfig config){
        System.out.println("connected");
    }
}
