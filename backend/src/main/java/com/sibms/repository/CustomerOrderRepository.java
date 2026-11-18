package com.sibms.repository;

import com.sibms.entity.CustomerOrder;
import com.sibms.enums.CustomerOrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    Optional<CustomerOrder> findByOrderNumber(String orderNumber);
    List<CustomerOrder> findAllByOrderByPlacedAtDesc();
    List<CustomerOrder> findByCustomerPhoneOrderByPlacedAtDesc(String customerPhone);
    List<CustomerOrder> findByStatusOrderByPlacedAtDesc(CustomerOrderStatus status);
    boolean existsByOrderNumber(String orderNumber);
}
