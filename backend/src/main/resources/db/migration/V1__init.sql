-- ============================================================
-- SIBMS  |  V1 - Initial schema (MySQL 8.0.16+)
-- ============================================================

-- ---------- Auth & Users ----------
CREATE TABLE users (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role          VARCHAR(20)  NOT NULL,
    is_active     BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN', 'MANAGER', 'CASHIER'))
);

CREATE TABLE refresh_tokens (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    token      VARCHAR(255) NOT NULL UNIQUE,
    user_id    BIGINT       NOT NULL,
    expires_at DATETIME     NOT NULL,
    revoked    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);

-- ---------- Catalog ----------
CREATE TABLE categories (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(100) NOT NULL UNIQUE,
    parent_id BIGINT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id) REFERENCES categories (id)
);

CREATE TABLE products (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    sku             VARCHAR(50)   NOT NULL UNIQUE,
    barcode         VARCHAR(50)   UNIQUE,
    name            VARCHAR(200)  NOT NULL,
    category_id     BIGINT NULL,
    unit            VARCHAR(20)   NOT NULL DEFAULT 'pcs',
    cost_price      DECIMAL(12,2) NOT NULL,
    selling_price   DECIMAL(12,2) NOT NULL,
    gst_percent     DECIMAL(5,2)  NOT NULL DEFAULT 0,
    min_stock       INT           NOT NULL DEFAULT 0,
    expiry_tracking BOOLEAN       NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prod_cat   FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT chk_prod_cost CHECK (cost_price >= 0),
    CONSTRAINT chk_prod_sell CHECK (selling_price >= 0)
);
CREATE INDEX idx_products_name     ON products (name);
CREATE INDEX idx_products_category ON products (category_id);

-- ---------- Inventory ----------
CREATE TABLE stock (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT   NOT NULL UNIQUE,
    quantity   INT      NOT NULL DEFAULT 0,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_stock_prod FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT chk_stock_qty CHECK (quantity >= 0)      -- negative stock kabhi nahi
);

CREATE TABLE stock_ledger (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT       NOT NULL,
    change_qty INT          NOT NULL,
    type       VARCHAR(20)  NOT NULL,
    ref_id     BIGINT NULL,
    reason     VARCHAR(255) NULL,
    user_id    BIGINT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_led_prod  FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT fk_led_user  FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT chk_led_type CHECK (type IN ('SALE', 'PURCHASE', 'ADJUST', 'RETURN'))
);
CREATE INDEX idx_ledger_product ON stock_ledger (product_id, created_at);

-- ---------- Parties ----------
CREATE TABLE customers (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    name                VARCHAR(150)  NOT NULL,
    phone               VARCHAR(20),
    email               VARCHAR(150),
    address             VARCHAR(255),
    gstin               VARCHAR(20),
    outstanding_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    is_active           BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at          DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_customers_phone ON customers (phone);

CREATE TABLE suppliers (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(150)  NOT NULL,
    phone           VARCHAR(20),
    gstin           VARCHAR(20),
    address         VARCHAR(255),
    payable_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ---------- Billing ----------
-- MySQL me SEQUENCE nahi hota. Invoice number Phase 3 me
-- invoice ki auto-increment id se ya counter table se banayenge.

CREATE TABLE invoices (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_no  VARCHAR(30)   NOT NULL UNIQUE,
    customer_id BIGINT NULL,
    user_id     BIGINT        NOT NULL,
    subtotal    DECIMAL(12,2) NOT NULL,
    discount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax         DECIMAL(12,2) NOT NULL DEFAULT 0,
    total       DECIMAL(12,2) NOT NULL,
    status      VARCHAR(20)   NOT NULL DEFAULT 'PAID',
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_cust   FOREIGN KEY (customer_id) REFERENCES customers (id),
    CONSTRAINT fk_inv_user   FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT chk_inv_status CHECK (status IN ('PAID', 'PARTIAL', 'CREDIT', 'RETURNED'))
);
CREATE INDEX idx_invoices_created  ON invoices (created_at);
CREATE INDEX idx_invoices_customer ON invoices (customer_id);

CREATE TABLE invoice_items (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id  BIGINT        NOT NULL,
    product_id  BIGINT        NOT NULL,
    qty         INT           NOT NULL,
    rate        DECIMAL(12,2) NOT NULL,
    discount    DECIMAL(12,2) NOT NULL DEFAULT 0,
    gst_percent DECIMAL(5,2)  NOT NULL DEFAULT 0,
    amount      DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_ii_inv  FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
    CONSTRAINT fk_ii_prod FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT chk_ii_qty CHECK (qty > 0)
);
CREATE INDEX idx_invoice_items_invoice ON invoice_items (invoice_id);

CREATE TABLE payments (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT        NOT NULL,
    mode       VARCHAR(10)   NOT NULL,
    amount     DECIMAL(12,2) NOT NULL,
    paid_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pay_inv   FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE,
    CONSTRAINT chk_pay_mode CHECK (mode IN ('CASH', 'UPI', 'CARD', 'CREDIT'))
);

-- ---------- Purchases ----------
CREATE TABLE purchase_orders (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_no       VARCHAR(30)   NOT NULL UNIQUE,
    supplier_id BIGINT        NOT NULL,
    status      VARCHAR(20)   NOT NULL DEFAULT 'DRAFT',
    total       DECIMAL(12,2) NOT NULL DEFAULT 0,
    created_by  BIGINT NULL,
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    received_at DATETIME NULL,
    CONSTRAINT fk_po_sup     FOREIGN KEY (supplier_id) REFERENCES suppliers (id),
    CONSTRAINT fk_po_user    FOREIGN KEY (created_by) REFERENCES users (id),
    CONSTRAINT chk_po_status CHECK (status IN ('DRAFT', 'ORDERED', 'RECEIVED'))
);

CREATE TABLE purchase_items (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    po_id      BIGINT        NOT NULL,
    product_id BIGINT        NOT NULL,
    qty        INT           NOT NULL,
    cost_price DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_pi_po   FOREIGN KEY (po_id) REFERENCES purchase_orders (id) ON DELETE CASCADE,
    CONSTRAINT fk_pi_prod FOREIGN KEY (product_id) REFERENCES products (id),
    CONSTRAINT chk_pi_qty CHECK (qty > 0)
);

-- ---------- Misc ----------
CREATE TABLE notifications (
    id         BIGINT AUTO_INCREMENT PRIMARY KEY,
    type       VARCHAR(30)  NOT NULL,
    message    VARCHAR(255) NOT NULL,
    is_read    BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE settings (
    setting_key   VARCHAR(100) PRIMARY KEY,
    setting_value TEXT
);

INSERT INTO settings (setting_key, setting_value) VALUES
    ('shop_name', 'My Shop'),
    ('shop_gstin', ''),
    ('invoice_prefix', 'INV'),
    ('invoice_footer', 'Thank you, visit again!');