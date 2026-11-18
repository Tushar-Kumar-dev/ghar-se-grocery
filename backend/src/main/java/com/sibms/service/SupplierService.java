package com.sibms.service;
import com.sibms.dto.request.CreateSupplierRequest;
import com.sibms.dto.request.UpdateSupplierRequest;
import com.sibms.dto.response.PageResponse;
import com.sibms.dto.response.SupplierResponse;
import org.springframework.data.domain.Pageable;
public interface SupplierService {
    SupplierResponse create(CreateSupplierRequest request);
    PageResponse<SupplierResponse> search(String search, Pageable pageable);
    SupplierResponse getById(Long id);
    SupplierResponse update(Long id, UpdateSupplierRequest request);
    void deactivate(Long id);
}
