package com.sibms.service.impl;
import com.sibms.dto.request.CreateSupplierRequest;
import com.sibms.dto.request.UpdateSupplierRequest;
import com.sibms.dto.response.PageResponse;
import com.sibms.dto.response.SupplierResponse;
import com.sibms.entity.Supplier;
import com.sibms.exception.ResourceNotFoundException;
import com.sibms.repository.SupplierRepository;
import com.sibms.service.SupplierService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Service
@RequiredArgsConstructor
public class SupplierServiceImpl implements SupplierService {
    private final SupplierRepository supplierRepository;
    @Override @Transactional
    public SupplierResponse create(CreateSupplierRequest req) {
        Supplier saved = supplierRepository.save(Supplier.builder()
            .name(req.name().trim()).phone(req.phone()).gstin(req.gstin()).address(req.address()).build());
        return SupplierResponse.from(saved);
    }
    @Override @Transactional(readOnly = true)
    public PageResponse<SupplierResponse> search(String search, Pageable pageable) {
        return PageResponse.from(supplierRepository.search(search, pageable).map(SupplierResponse::from));
    }
    @Override @Transactional(readOnly = true)
    public SupplierResponse getById(Long id) { return SupplierResponse.from(find(id)); }
    @Override @Transactional
    public SupplierResponse update(Long id, UpdateSupplierRequest req) {
        Supplier s = find(id);
        s.setName(req.name().trim()); s.setPhone(req.phone()); s.setGstin(req.gstin());
        s.setAddress(req.address()); s.setActive(req.active());
        return SupplierResponse.from(s);
    }
    @Override @Transactional
    public void deactivate(Long id) { find(id).setActive(false); }
    private Supplier find(Long id) {
        return supplierRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id " + id));
    }
}
