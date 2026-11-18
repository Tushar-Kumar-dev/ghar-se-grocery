package com.sibms.dto.response;
import com.sibms.entity.Stock;
import java.time.LocalDateTime;
public record StockResponse(
    Long productId, String productSku, String productName,
    int quantity, int minStock, boolean lowStock, LocalDateTime updatedAt) {
    public static StockResponse from(Stock s) {
        return new StockResponse(
            s.getProduct().getId(), s.getProduct().getSku(), s.getProduct().getName(),
            s.getQuantity(), s.getProduct().getMinStock(),
            s.getQuantity() <= s.getProduct().getMinStock(),
            s.getUpdatedAt());
    }
}
