package com.sibms.repository;
import com.sibms.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.Optional;
public interface ProductRepository extends JpaRepository<Product, Long> {
    boolean existsBySku(String sku);
    boolean existsByBarcode(String barcode);
    Optional<Product> findBySku(String sku);
    Optional<Product> findByBarcode(String barcode);
    @Query("SELECT p FROM Product p WHERE (:search IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%',:search,'%')) OR LOWER(p.sku) LIKE LOWER(CONCAT('%',:search,'%'))) AND (:categoryId IS NULL OR p.category.id = :categoryId) AND (:active IS NULL OR p.active = :active)")
    Page<Product> search(@Param("search") String search, @Param("categoryId") Long categoryId, @Param("active") Boolean active, Pageable pageable);
}
