package com.example.cafeapp.services;

import com.example.cafeapp.dto.OrderRequest;
import com.example.cafeapp.entities.Cafe;
import com.example.cafeapp.entities.MenuItem;
import com.example.cafeapp.entities.Order;
import com.example.cafeapp.entities.OrderItem;
import com.example.cafeapp.repositories.CafeRepository;
import com.example.cafeapp.repositories.MenuItemRepository;
import com.example.cafeapp.repositories.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private CafeRepository cafeRepository;

    /* ================================
       CREATE ORDER (CLIENT)
    ================================= */

    public void processOrder(OrderRequest orderRequest, String email) {

        Order order = new Order();

        order.setClientEmail(email);
        order.setClientName(orderRequest.getClientName());
        order.setClientPhone(orderRequest.getClientPhone());
        order.setAddress(orderRequest.getAddress());
        order.setAssignedCafe(orderRequest.getCafe());
        order.setStatus("Pending");

        List<OrderItem> orderItems = orderRequest.getItems()
                .stream()
                .map(item -> {
                    MenuItem menuItem = menuItemRepository
                            .findById(item.getId())
                            .orElseThrow(() ->
                                    new RuntimeException("Menu item not found: " + item.getId()));

                    OrderItem orderItem = new OrderItem();
                    orderItem.setOrder(order);
                    orderItem.setMenuItem(menuItem);
                    orderItem.setQuantity(item.getQuantity());

                    return orderItem;
                })
                .collect(Collectors.toList());

        order.setOrderItems(orderItems);

        orderRepository.save(order);
    }

    /* ================================
       CAFE ACTIONS
    ================================= */

    public void acceptOrder(Long orderId) {

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus("Accepted");
        order.setAcceptanceTime(LocalDateTime.now());

        orderRepository.save(order);
    }

    public void declineOrder(Long orderId) {

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus("Declined");

        orderRepository.save(order);
    }

    public void completeOrder(Long orderId) {

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus("Completed");

        orderRepository.save(order);
    }

    /* ================================
       CAFE ORDERS VIEW
    ================================= */

    public List<Order> getOrdersByCafeEmail(String email) {

        Cafe cafe = cafeRepository
                .findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Cafe not found"));

        return orderRepository.findByAssignedCafe(cafe.getName());
    }

    /* ================================
       USER ORDER HISTORY
    ================================= */

    public List<Order> getOrdersByUserEmail(String email) {
        return orderRepository.findOrdersWithItemsByClientEmail(email);
    }

    /* ================================
       COURIER AVAILABLE ORDERS
    ================================= */

    public List<Order> getOrdersForCourier() {

        List<Order> acceptedOrders = orderRepository.findByStatus("Accepted");

        return acceptedOrders
                .stream()
                .filter(order -> order.getAssignedCourier() == null)
                .filter(order -> {
                    LocalDateTime acceptedTime = order.getAcceptanceTime();
                    return acceptedTime != null &&
                            Duration.between(acceptedTime, LocalDateTime.now()).toMinutes() <= 3;
                })
                .collect(Collectors.toList());
    }

    /* ================================
       COURIER OWN ORDERS
    ================================= */

    public List<Order> getOrdersAcceptedByCourier(String courierEmail) {
        return orderRepository.findByAssignedCourier(courierEmail);
    }

    /* ================================
       COURIER ACCEPT ORDER
    ================================= */

    public void acceptOrderByCourier(Long orderId, String courierEmail) {

        Order order = orderRepository
                .findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        if (!"Accepted".equals(order.getStatus())) {
            throw new RuntimeException("Order must be accepted by cafe first");
        }

        if (order.getAssignedCourier() != null) {
            throw new RuntimeException("Order already taken by another courier");
        }

        order.setAssignedCourier(courierEmail);
        order.setStatus("Accepted by Courier");

        orderRepository.save(order);
    }

    /* ================================
       ADMIN / DEBUG
    ================================= */

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }
}