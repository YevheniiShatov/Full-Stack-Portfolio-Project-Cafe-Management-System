package com.example.cafeapp.controllers;

import com.example.cafeapp.dto.OrderMenuItemResponse;
import com.example.cafeapp.dto.OrderResponse;
import com.example.cafeapp.entities.Order;
import com.example.cafeapp.services.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cafe/orders")
public class CafeOrderController {

    @Autowired
    private OrderService orderService;

    // Orders for a specific cafe
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getOrdersForCafe(@RequestParam String email) {

        List<Order> orders = orderService.getOrdersByCafeEmail(email);

        List<OrderResponse> response = orders.stream()
                .map(order -> new OrderResponse(
                        order.getId(),
                        order.getStatus(),
                        order.getClientName(),
                        order.getClientPhone(),
                        order.getClientEmail(),
                        order.getAddress(),
                        order.getOrderItems().stream()
                                .map(orderItem -> new OrderMenuItemResponse(
                                        orderItem.getMenuItem().getName(),
                                        orderItem.getMenuItem().getPrice(),
                                        orderItem.getQuantity()
                                ))
                                .toList()
                ))
                .toList();

        return ResponseEntity.ok(response);
    }

    // All orders (for example, for cafe admin)
    @GetMapping("/all")
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

    // Accepting an order by the cafe
    @PostMapping("/{orderId}/accept")
    public ResponseEntity<String> acceptOrder(@PathVariable Long orderId) {
        orderService.acceptOrder(orderId);
        return ResponseEntity.ok("Order accepted!");
    }
}
