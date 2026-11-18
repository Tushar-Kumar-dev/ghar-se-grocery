package com.sibms.repository;
import com.sibms.entity.StockLedger;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
public interface StockLedgerRepository extends JpaRepository<StockLedger, Long> {
    Page<StockLedger> findByProductId(Long productId, Pageable pageable);
}
