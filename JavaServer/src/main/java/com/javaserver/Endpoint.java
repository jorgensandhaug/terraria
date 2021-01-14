package com.javaserver;

import jakarta.websocket.EndpointConfig;
import jakarta.websocket.OnMessage;
import jakarta.websocket.OnOpen;
import jakarta.websocket.Session;
import jakarta.websocket.server.ServerEndpoint;




@ServerEndpoint("/test")
public class Endpoint {

    @OnOpen
    public void onOpen(Session session, EndpointConfig config){
        System.out.println("connected");
    }

    @OnMessage
    public void onMessage(Session session, String message){
        return;
    }

}
