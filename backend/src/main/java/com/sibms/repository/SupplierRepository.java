package com.sibms.repository;
import com.sibms.entity.Supplier;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
public interface SupplierRepository extends JpaRepository<Supplier, Long> {
    @Query("SELECT s FROM Supplier s WHERE (:search IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%',:search,'%')) OR s.phone LIKE CONCAT('%',:search,'%'))")
    Page<Supplier> search(@Param("search") String search, Pageable pageable);
}
