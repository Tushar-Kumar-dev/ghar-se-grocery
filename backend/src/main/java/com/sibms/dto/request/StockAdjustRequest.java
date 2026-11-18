package com.sibms.dto.request;
import com.sibms.enums.StockMovementType;
import jakarta.validation.constraints.NotNull;
public record StockAdjustRequest(
    @NotNull Long productId,
    @NotNull Integer changeQty,
    @NotNull StockMovementType type,
    String reason
) {}
