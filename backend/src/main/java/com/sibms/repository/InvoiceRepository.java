package com.sibms.repository;

import com.sibms.entity.Invoice;
import com.sibms.enums.InvoiceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByInvoiceNo(String invoiceNo);

    @Query("SELECT MAX(i.id) FROM Invoice i")
    Optional<Long> findMaxId();

    @Query("SELECT i FROM Invoice i WHERE (:customerId IS NULL OR i.customer.id = :customerId) AND (:status IS NULL OR i.status = :status) AND (:from IS NULL OR i.createdAt >= :from) AND (:to IS NULL OR i.createdAt <= :to)")
    Page<Invoice> search(@Param("customerId") Long customerId,
                         @Param("status") InvoiceStatus status,
                         @Param("from") LocalDateTime from,
                         @Param("to") LocalDateTime to,
                         Pageable pageable);

    @Query("SELECT COUNT(i) FROM Invoice i WHERE i.createdAt >= :from AND i.createdAt <= :to")
    long countBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i WHERE i.createdAt >= :from AND i.createdAt <= :to")
    BigDecimal sumTotalBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);

    @Query("SELECT COALESCE(SUM(i.total), 0) FROM Invoice i")
    BigDecimal sumTotalAll();
}
