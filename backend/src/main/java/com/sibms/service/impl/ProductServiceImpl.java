package com.sibms.service.impl;

import com.sibms.dto.request.CreateProductRequest;
import com.sibms.dto.request.UpdateProductRequest;
import com.sibms.dto.response.PageResponse;
import com.sibms.dto.response.ProductResponse;
import com.sibms.entity.Category;
import com.sibms.entity.Product;
import com.sibms.entity.Stock;
import com.sibms.exception.DuplicateResourceException;
import com.sibms.exception.ResourceNotFoundException;
import com.sibms.repository.CategoryRepository;
import com.sibms.repository.ProductRepository;
import com.sibms.repository.StockRepository;
import com.sibms.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final StockRepository stockRepository;

    @Override
    @Transactional
    public ProductResponse create(CreateProductRequest req) {
        String sku = req.sku().trim().toUpperCase();
        if (productRepository.existsBySku(sku)) {
            throw new DuplicateResourceException("SKU '" + sku + "' already exists");
        }
        if (req.barcode() != null && !req.barcode().isBlank() && productRepository.existsByBarcode(req.barcode().trim())) {
            throw new DuplicateResourceException("Barcode '" + req.barcode() + "' already exists");
        }

        Category cat = resolveCategory(req.categoryId());

        Product product = Product.builder()
                .sku(sku)
                .barcode(req.barcode() != null && !req.barcode().isBlank() ? req.barcode().trim() : null)
                .name(req.name().trim())
                .brand(req.brand() != null && !req.brand().isBlank() ? req.brand().trim() : "Generic")
                .category(cat)
                .unit(req.unit().trim())
                .pack(req.pack() != null && !req.pack().isBlank() ? req.pack().trim() : ("1 " + req.unit().trim()))
                .costPrice(req.costPrice())
                .sellingPrice(req.sellingPrice())
                .gstPercent(req.gstPercent() != null ? req.gstPercent() : BigDecimal.ZERO)
                .minStock(req.minStock())
                .expiryTracking(req.expiryTracking())
                .build();

        Product saved = productRepository.save(product);

        // Auto-initialize stock record with 0 qty
        if (stockRepository.findByProductId(saved.getId()).isEmpty()) {
            stockRepository.save(Stock.builder()
                    .product(saved)
                    .quantity(0)
                    .build());
        }

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> search(String search, Long categoryId, Boolean active, Pageable pageable) {
        String trimmedSearch = (search != null && !search.isBlank()) ? search.trim() : null;
        return PageResponse.from(productRepository.search(trimmedSearch, categoryId, active, pageable).map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getById(Long id) {
        return toResponse(find(id));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getBySku(String sku) {
        return toResponse(productRepository.findBySku(sku.trim().toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with SKU " + sku)));
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getByBarcode(String barcode) {
        return toResponse(productRepository.findByBarcode(barcode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with barcode " + barcode)));
    }

    @Override
    @Transactional
    public ProductResponse update(Long id, UpdateProductRequest req) {
        Product p = find(id);
        p.setName(req.name().trim());
        if (req.brand() != null && !req.brand().isBlank()) {
            p.setBrand(req.brand().trim());
        }
        p.setCategory(resolveCategory(req.categoryId()));
        p.setUnit(req.unit().trim());
        if (req.pack() != null && !req.pack().isBlank()) {
            p.setPack(req.pack().trim());
        }
        p.setCostPrice(req.costPrice());
        p.setSellingPrice(req.sellingPrice());
        p.setGstPercent(req.gstPercent() != null ? req.gstPercent() : BigDecimal.ZERO);
        p.setMinStock(req.minStock());
        p.setExpiryTracking(req.expiryTracking());
        p.setActive(req.active());
        return toResponse(p);
    }

    @Override
    @Transactional
    public void deactivate(Long id) {
        Product p = find(id);
        p.setActive(false);
    }

    private ProductResponse toResponse(Product p) {
        Integer stockQty = stockRepository.findByProductId(p.getId())
                .map(Stock::getQuantity)
                .orElse(0);
        return ProductResponse.from(p, stockQty);
    }

    private Product find(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
    }

    private Category resolveCategory(Long catId) {
        if (catId == null) {
            return null;
        }
        return categoryRepository.findById(catId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id " + catId));
    }
}
