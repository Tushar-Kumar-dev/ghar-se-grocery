package com.sibms.dto.response;

import com.sibms.entity.Product;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ProductResponse(
    Long id,
    String sku,
    String barcode,
    String name,
    String brand,
    String pack,
    Long categoryId,
    String categoryName,
    String cat,
    String unit,
    BigDecimal costPrice,
    Double cost,
    BigDecimal sellingPrice,
    Double price,
    BigDecimal gstPercent,
    Double gstRate,
    int minStock,
    Integer stock,
    boolean expiryTracking,
    boolean active,
    LocalDateTime createdAt
) {
    public static ProductResponse from(Product p, Integer stockQty) {
        String catName = p.getCategory() != null ? p.getCategory().getName() : "General Grocery";
        Double costVal = p.getCostPrice() != null ? p.getCostPrice().doubleValue() : 0.0;
        Double priceVal = p.getSellingPrice() != null ? p.getSellingPrice().doubleValue() : 0.0;
        Double gstRateVal = p.getGstPercent() != null ? p.getGstPercent().doubleValue() / 100.0 : 0.05;

        return new ProductResponse(
            p.getId(),
            p.getSku(),
            p.getBarcode(),
            p.getName(),
            p.getBrand() != null ? p.getBrand() : "Generic",
            p.getPack() != null ? p.getPack() : ("1 " + p.getUnit()),
            p.getCategory() != null ? p.getCategory().getId() : null,
            catName,
            catName,
            p.getUnit(),
            p.getCostPrice(),
            costVal,
            p.getSellingPrice(),
            priceVal,
            p.getGstPercent(),
            gstRateVal,
            p.getMinStock(),
            stockQty != null ? stockQty : 0,
            p.isExpiryTracking(),
            p.isActive(),
            p.getCreatedAt()
        );
    }

    public static ProductResponse from(Product p) {
        return from(p, 0);
    }
}
