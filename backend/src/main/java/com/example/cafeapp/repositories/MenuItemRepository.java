    package com.example.cafeapp.repositories;

    import com.example.cafeapp.entities.MenuItem;
    import org.springframework.data.jpa.repository.JpaRepository;

    import java.util.List;

    public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

        List<MenuItem> findByCafe_Id(Long cafeId);

    }
