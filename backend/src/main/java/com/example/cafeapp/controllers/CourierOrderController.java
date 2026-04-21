package com.example.cafeapp.controllers;

import com.example.cafeapp.dto.OrderMenuItemResponse;
import com.example.cafeapp.dto.OrderResponse;
import com.example.cafeapp.entities.Order;
import com.example.cafeapp.services.OrderService;
import com.example.cafeapp.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courier/orders")
public class CourierOrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtUtils jwtUtils;

    // Available orders
    // Available orders for courier
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getCourierOrders(
            @RequestHeader("Authorization") String token) {

        String email = jwtUtils.getUserNameFromJwtToken(token.replace("Bearer ", ""));

        List<Order> orders = orderService.getOrdersForCourier();

        List<OrderResponse> response = orders.stream()
                .map(order -> new OrderResponse(
                        order.getId(),
                        order.getStatus(),
                        order.getClientName(),
                        order.getClientPhone(),
                        order.getClientEmail(),
                        order.getAddress(),
                        order.getOrderItems().stream()
                                .map(item -> new OrderMenuItemResponse(
                                        item.getMenuItem().getName(),
                                        item.getMenuItem().getPrice(),
                                        item.getQuantity()
                                ))
                                .toList()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    // My orders
    @GetMapping("/my")
    public ResponseEntity<List<OrderResponse>> getMyCourierOrders(
            @RequestHeader("Authorization") String token) {

        String email = jwtUtils.getUserNameFromJwtToken(token.replace("Bearer ", ""));

        List<Order> orders = orderService.getOrdersAcceptedByCourier(email);

        List<OrderResponse> response = orders.stream()
                .map(order -> new OrderResponse(
                        order.getId(),
                        order.getStatus(),
                        order.getClientName(),
                        order.getClientPhone(),
                        order.getClientEmail(),
                        order.getAddress(),
                        order.getOrderItems().stream()
                                .map(item -> new OrderMenuItemResponse(
                                        item.getMenuItem().getName(),
                                        item.getMenuItem().getPrice(),
                                        item.getQuantity()
                                ))
                                .toList()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    // Accept order by courier
    @PostMapping("/{orderId}/accept")
    public ResponseEntity<String> acceptOrder(@RequestHeader("Authorization") String token,
                                              @PathVariable Long orderId) {
        String email = jwtUtils.getUserNameFromJwtToken(token.replace("Bearer ", ""));
        orderService.acceptOrderByCourier(orderId, email);
        return ResponseEntity.ok("Order accepted successfully!");
    }
}
