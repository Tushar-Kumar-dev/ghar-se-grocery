package com.sibms.dto.response;
import com.sibms.entity.StockLedger;
import com.sibms.enums.StockMovementType;
import java.time.LocalDateTime;
public record StockLedgerResponse(
    Long id, Long productId, String productName,
    int changeQty, StockMovementType type,
    Long refId, String reason,
    Long userId, String userName, LocalDateTime createdAt) {
    public static StockLedgerResponse from(StockLedger l) {
        return new StockLedgerResponse(l.getId(),
            l.getProduct().getId(), l.getProduct().getName(),
            l.getChangeQty(), l.getType(), l.getRefId(), l.getReason(),
            l.getUser() != null ? l.getUser().getId() : null,
            l.getUser() != null ? l.getUser().getName() : null,
            l.getCreatedAt());
    }
}
