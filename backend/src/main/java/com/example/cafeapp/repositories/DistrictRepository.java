    package com.example.cafeapp.repositories;

    import com.example.cafeapp.entities.Cafe;
    import com.example.cafeapp.entities.District;
    import org.springframework.data.jpa.repository.JpaRepository;
    import org.springframework.data.jpa.repository.Query;
    import org.springframework.data.repository.query.Param;
    import org.springframework.stereotype.Repository;

    import java.util.List;

    @Repository
    public interface DistrictRepository extends JpaRepository<District, Long> {
        @Query("""
        SELECT DISTINCT d.cafe
        FROM District d
        WHERE d.cafe IS NOT NULL
          AND function('ST_Intersects',
                       d.boundary,
                       function('ST_GeomFromText',
                                concat('POINT(', :lat, ' ', :lon, ')'),
                                4326)
                      ) = true
        """)
        List<Cafe> findCafesByCoordinates(@Param("lon") double lon,
                                          @Param("lat") double lat);
    }
