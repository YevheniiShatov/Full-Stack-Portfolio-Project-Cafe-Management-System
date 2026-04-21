package com.example.cafeapp.services;

import com.example.cafeapp.entities.Cafe;
import com.example.cafeapp.entities.MenuItem;
import com.example.cafeapp.repositories.CafeRepository;
import com.example.cafeapp.repositories.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {

    private final MenuItemRepository menuItemRepository;
    private final CafeRepository cafeRepository;

    public MenuItem addMenuItem(Long cafeId, MenuItem menuItem) {
        Cafe cafe = cafeRepository.findById(cafeId)
                .orElseThrow(() -> new IllegalArgumentException("Cafe not found"));
        menuItem.setCafe(cafe);
        return menuItemRepository.save(menuItem);
    }

    public List<MenuItem> getMenuItemsByCafe(Long cafeId) {
        return menuItemRepository.findByCafe_Id(cafeId);
    }
}
