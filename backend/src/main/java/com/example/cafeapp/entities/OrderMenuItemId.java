package com.example.cafeapp.entities;

import java.io.Serializable;
import java.util.Objects;

public class OrderMenuItemId implements Serializable {

    private Long order;
    private Long menuItem;

    // Конструкторы
    public OrderMenuItemId() {}

    public OrderMenuItemId(Long order, Long menuItem) {
        this.order = order;
        this.menuItem = menuItem;
    }

    // equals и hashCode для корректной работы с составным ключом
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OrderMenuItemId that = (OrderMenuItemId) o;
        return Objects.equals(order, that.order) &&
                Objects.equals(menuItem, that.menuItem);
    }

    @Override
    public int hashCode() {
        return Objects.hash(order, menuItem);
    }
}
