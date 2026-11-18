package com.sibms.repository;

import com.sibms.entity.PurchaseOrder;
import com.sibms.enums.PurchaseOrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {

    @Query("SELECT MAX(p.id) FROM PurchaseOrder p")
    Optional<Long> findMaxId();

    @Query("SELECT p FROM PurchaseOrder p WHERE (:supplierId IS NULL OR p.supplier.id = :supplierId) AND (:status IS NULL OR p.status = :status)")
    Page<PurchaseOrder> search(@Param("supplierId") Long supplierId, @Param("status") PurchaseOrderStatus status, Pageable pageable);

    long countByStatus(PurchaseOrderStatus status);
}
