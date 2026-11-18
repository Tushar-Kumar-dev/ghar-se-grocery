package com.sibms.dto.response;

import com.sibms.entity.PurchaseItem;

import java.math.BigDecimal;

public record PurchaseItemResponse(
    Long id,
    Long productId,
    String productName,
    String productSku,
    int qty,
    BigDecimal costPrice) {

    public static PurchaseItemResponse from(PurchaseItem i) {
        return new PurchaseItemResponse(
                i.getId(),
                i.getProduct().getId(),
                i.getProduct().getName(),
                i.getProduct().getSku(),
                i.getQty(),
                i.getCostPrice());
    }
}
