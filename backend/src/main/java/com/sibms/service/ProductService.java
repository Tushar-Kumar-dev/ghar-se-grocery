package com.sibms.service;
import com.sibms.dto.request.CreateProductRequest;
import com.sibms.dto.request.UpdateProductRequest;
import com.sibms.dto.response.PageResponse;
import com.sibms.dto.response.ProductResponse;
import org.springframework.data.domain.Pageable;
public interface ProductService {
    ProductResponse create(CreateProductRequest request);
    PageResponse<ProductResponse> search(String search, Long categoryId, Boolean active, Pageable pageable);
    ProductResponse getById(Long id);
    ProductResponse getBySku(String sku);
    ProductResponse getByBarcode(String barcode);
    ProductResponse update(Long id, UpdateProductRequest request);
    void deactivate(Long id);
}
