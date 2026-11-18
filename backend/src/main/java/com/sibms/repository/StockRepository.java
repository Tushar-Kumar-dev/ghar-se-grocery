package com.sibms.repository;

import com.sibms.entity.Stock;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface StockRepository extends JpaRepository<Stock, Long> {
    Optional<Stock> findByProductId(Long productId);

    @Query("SELECT s FROM Stock s JOIN FETCH s.product p WHERE s.quantity <= p.minStock AND p.active = true")
    List<Stock> findLowStock();

    @Query("SELECT s FROM Stock s JOIN s.product p WHERE (:active IS NULL OR p.active = :active)")
    Page<Stock> findAllByActiveProduct(@Param("active") Boolean active, Pageable pageable);
}
