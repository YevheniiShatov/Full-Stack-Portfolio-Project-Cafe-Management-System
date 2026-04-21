package com.example.cafeapp.entities;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "order_menu_items")
@IdClass(OrderMenuItemId.class)
public class OrderItem {

    @Id
    @ManyToOne
    @JoinColumn(name = "order_id", nullable = false)
    @JsonBackReference // Указывает, что это "обратная" сторона связи
    private Order order;

    @Id
    @ManyToOne
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @NotNull(message = "Quantity cannot be null")
    private Integer quantity;

    public Integer getQuantity() {
        return quantity != null ? quantity : 0;
    }
}
