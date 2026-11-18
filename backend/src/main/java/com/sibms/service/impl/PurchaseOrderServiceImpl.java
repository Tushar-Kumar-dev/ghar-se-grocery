package com.sibms.service.impl;

import com.sibms.dto.request.CreatePurchaseOrderRequest;
import com.sibms.dto.request.PurchaseItemRequest;
import com.sibms.dto.response.PageResponse;
import com.sibms.dto.response.PurchaseOrderResponse;
import com.sibms.entity.*;
import com.sibms.enums.PurchaseOrderStatus;
import com.sibms.enums.StockMovementType;
import com.sibms.exception.BadRequestException;
import com.sibms.exception.ResourceNotFoundException;
import com.sibms.repository.*;
import com.sibms.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class PurchaseOrderServiceImpl implements PurchaseOrderService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final StockRepository stockRepository;
    private final StockLedgerRepository stockLedgerRepository;

    @Override
    @Transactional
    public PurchaseOrderResponse create(CreatePurchaseOrderRequest req, String userEmail) {
        Supplier supplier = supplierRepository.findById(req.supplierId())
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found"));
        User user = userRepository.findByEmail(userEmail).orElse(null);

        long nextId = purchaseOrderRepository.findMaxId().orElse(0L) + 1;
        String poNo = String.format("PO-%05d", nextId);

        PurchaseOrder po = PurchaseOrder.builder()
                .poNo(poNo)
                .supplier(supplier)
                .createdBy(user)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (PurchaseItemRequest itemReq : req.items()) {
            Product product = productRepository.findById(itemReq.productId())
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found: " + itemReq.productId()));

            PurchaseItem item = PurchaseItem.builder()
                    .purchaseOrder(po)
                    .product(product)
                    .qty(itemReq.qty())
                    .costPrice(itemReq.costPrice())
                    .build();

            po.getItems().add(item);
            total = total.add(itemReq.costPrice().multiply(BigDecimal.valueOf(itemReq.qty())));
        }

        po.setTotal(total);
        return PurchaseOrderResponse.from(purchaseOrderRepository.save(po));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<PurchaseOrderResponse> search(Long supplierId, PurchaseOrderStatus status, Pageable pageable) {
        return PageResponse.from(purchaseOrderRepository.search(supplierId, status, pageable).map(PurchaseOrderResponse::from));
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseOrderResponse getById(Long id) {
        return PurchaseOrderResponse.from(purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id " + id)));
    }

    @Override
    @Transactional
    public PurchaseOrderResponse updateStatus(Long id, PurchaseOrderStatus newStatus, String userEmail) {
        PurchaseOrder po = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase order not found with id " + id));

        if (po.getStatus() == PurchaseOrderStatus.RECEIVED) {
            throw new BadRequestException("Cannot change status of an already received order");
        }

        if (newStatus == PurchaseOrderStatus.RECEIVED) {
            User user = userRepository.findByEmail(userEmail).orElse(null);
            for (PurchaseItem item : po.getItems()) {
                Product product = item.getProduct();
                Stock stock = stockRepository.findByProductId(product.getId())
                        .orElseGet(() -> Stock.builder().product(product).quantity(0).build());

                stock.setQuantity(stock.getQuantity() + item.getQty());
                stockRepository.save(stock);

                stockLedgerRepository.save(StockLedger.builder()
                        .product(product)
                        .changeQty(item.getQty())
                        .type(StockMovementType.PURCHASE)
                        .refId(po.getId())
                        .reason("PO " + po.getPoNo())
                        .user(user)
                        .build());

                // Update product's cost price with latest PO cost price
                product.setCostPrice(item.getCostPrice());
                productRepository.save(product);
            }
            po.setReceivedAt(LocalDateTime.now());
        }

        po.setStatus(newStatus);
        return PurchaseOrderResponse.from(po);
    }
}
