package com.example.cafeapp.controllers;

import com.example.cafeapp.dto.OrderMenuItemResponse;
import com.example.cafeapp.dto.OrderRequest;
import com.example.cafeapp.dto.OrderResponse;
import com.example.cafeapp.entities.Order;
import com.example.cafeapp.services.OrderService;
import com.example.cafeapp.utils.JwtUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private JwtUtils jwtUtils;

    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestHeader("Authorization") String token,
            @RequestBody OrderRequest orderRequest) {

        String jwt = token.replace("Bearer ", "");
        String email = jwtUtils.getUserNameFromJwtToken(jwt);

        orderService.processOrder(orderRequest, email);

        return ResponseEntity.ok().build();
    }



    @PutMapping("/{id}/decline")
    public ResponseEntity<String> declineOrder(@PathVariable Long id) {
        try {
            orderService.declineOrder(id);
            return ResponseEntity.ok("Order declined");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/accept")
    public ResponseEntity<String> acceptOrder(@PathVariable Long id) {
        try {
            orderService.acceptOrder(id);
            return ResponseEntity.ok("Order accepted");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<String> completeOrder(@PathVariable Long id) {
        try {
            orderService.completeOrder(id);
            return ResponseEntity.ok("Order completed");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @PutMapping("/{id}/accept-by-courier")
    public ResponseEntity<String> acceptOrderByCourier(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token
    ) {
        try {
            String jwtToken = token.replace("Bearer ", "");
            String courierEmail = jwtUtils.getUserNameFromJwtToken(jwtToken);

            orderService.acceptOrderByCourier(id, courierEmail);
            return ResponseEntity.ok("Order accepted by courier");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        List<OrderResponse> response = orderService.getAllOrders()
                .stream()
                .map(order -> new OrderResponse(
                        order.getId(),
                        order.getStatus(),
                        order.getClientName(),
                        order.getClientPhone(),
                        order.getClientEmail(),
                        order.getAddress(),
                        order.getOrderItems()
                                .stream()
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

    @GetMapping("/courier")
    public ResponseEntity<List<OrderResponse>> getCourierOrders(
            @RequestHeader("Authorization") String token) {

        String jwtToken = token.replace("Bearer ", "");
        String email = jwtUtils.getUserNameFromJwtToken(jwtToken);

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
    @GetMapping("/user")
    public ResponseEntity<List<OrderResponse>> getUserOrders(
            @RequestHeader("Authorization") String token) {

        String jwtToken = token.replace("Bearer ", "");
        String email = jwtUtils.getUserNameFromJwtToken(jwtToken);

        List<Order> orders = orderService.getOrdersByUserEmail(email);

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
}
