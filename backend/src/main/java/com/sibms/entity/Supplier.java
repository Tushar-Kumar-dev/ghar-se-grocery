package com.sibms.entity;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity @Table(name = "suppliers")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Supplier {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(nullable = false, length = 150)
    private String name;
    @Column(length = 20)
    private String phone;
    @Column(length = 20)
    private String gstin;
    @Column(length = 255)
    private String address;
    @Builder.Default
    @Column(name = "payable_balance", nullable = false, precision = 12, scale = 2)
    private BigDecimal payableBalance = BigDecimal.ZERO;
    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private boolean active = true;
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
