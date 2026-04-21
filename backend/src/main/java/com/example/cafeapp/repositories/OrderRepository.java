package com.example.cafeapp.repositories;

import com.example.cafeapp.entities.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByStatus(String status);

    List<Order> findByAssignedCafe(String assignedCafe);

    List<Order> findByClientEmail(String clientEmail);


    List<Order> findByAssignedCourier(String assignedCourier);

    @Query("""
            SELECT DISTINCT o
            FROM Order o
            LEFT JOIN FETCH o.orderItems oi
            LEFT JOIN FETCH oi.menuItem
            WHERE o.clientEmail = :email
            """)
    List<Order> findOrdersWithItemsByClientEmail(String email);
}
