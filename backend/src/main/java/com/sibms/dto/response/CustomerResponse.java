package com.sibms.dto.response;
import com.sibms.entity.Customer;
import java.math.BigDecimal;
import java.time.LocalDateTime;
public record CustomerResponse(
    Long id, String name, String phone, String email,
    String address, String gstin, BigDecimal outstandingBalance,
    boolean active, LocalDateTime createdAt) {
    public static CustomerResponse from(Customer c) {
        return new CustomerResponse(c.getId(), c.getName(), c.getPhone(),
            c.getEmail(), c.getAddress(), c.getGstin(),
            c.getOutstandingBalance(), c.isActive(), c.getCreatedAt());
    }
}
