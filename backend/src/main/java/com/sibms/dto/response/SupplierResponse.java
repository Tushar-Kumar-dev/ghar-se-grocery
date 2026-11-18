package com.sibms.dto.response;
import com.sibms.entity.Supplier;
import java.math.BigDecimal;
import java.time.LocalDateTime;
public record SupplierResponse(
    Long id, String name, String phone, String gstin,
    String address, BigDecimal payableBalance,
    boolean active, LocalDateTime createdAt) {
    public static SupplierResponse from(Supplier s) {
        return new SupplierResponse(s.getId(), s.getName(), s.getPhone(),
            s.getGstin(), s.getAddress(), s.getPayableBalance(),
            s.isActive(), s.getCreatedAt());
    }
}
