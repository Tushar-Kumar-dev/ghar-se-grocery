package com.sibms.entity;

import com.sibms.enums.CustomerOrderStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "customer_orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "order_number", nullable = false, unique = true, length = 50)
    private String orderNumber;

    @Column(name = "store_name", nullable = false, length = 100)
    @Builder.Default
    private String storeName = "Apna Bazar Supermarket";

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "fulfillment_mode", nullable = false, length = 20)
    private String fulfillmentMode; // DELIVERY or PICKUP

    @Column(name = "delivery_address", nullable = false, columnDefinition = "TEXT")
    private String deliveryAddress;

    @Column(name = "list_type", nullable = false, length = 30)
    private String listType; // PARCHI_PHOTO or MANUAL_ITEMS

    @Lob
    @Column(name = "parchi_image_url", columnDefinition = "LONGTEXT")
    private String parchiImageUrl; // Base64 data URL or storage link

    @Column(name = "items_summary", columnDefinition = "TEXT")
    private String itemsSummary;

    @Lob
    @Column(name = "items_json", columnDefinition = "LONGTEXT")
    private String itemsJson;

    @Column(name = "estimated_total", precision = 12, scale = 2, nullable = false)
    @Builder.Default
    private BigDecimal estimatedTotal = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private CustomerOrderStatus status = CustomerOrderStatus.PENDING_REVIEW;

    @CreationTimestamp
    @Column(name = "placed_at", nullable = false, updatable = false)
    private LocalDateTime placedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
